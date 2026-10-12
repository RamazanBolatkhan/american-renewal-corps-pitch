'use server';

import { head } from '@vercel/blob';
import { and, eq, max } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { brief, briefFact, curriculumModule, importJob, topic } from '@/db/schema';
import { runExtraction } from '@/lib/content/extract';
import { ApprovablePlan, checkAgainstSource, ExtractedPlan, slugify } from '@/lib/content/plan';
import { can } from '@/lib/permissions';
import { requireStaff } from '@/lib/session';

async function requireCan(action: 'upload' | 'edit' | 'publish') {
  const session = await requireStaff('/admin/imports');
  if (!can(session.user.role, action)) throw new Error('Your role can’t do this.');
  return session;
}

const typeFromName = (name: string, given: string) =>
  given || (name.endsWith('.md') ? 'text/markdown' : name.endsWith('.json') ? 'application/json' : name.endsWith('.pdf') ? 'application/pdf' : 'text/plain');

/** Called after the browser finishes the Blob upload. Extraction continues after the response. */
export async function createImportJob(input: { pathname: string; fileName: string }) {
  const session = await requireCan('upload');
  if (!input.pathname.startsWith('plans/')) throw new Error('Invalid upload.');
  const blob = await head(input.pathname); // confirms the file really is in our store
  const [job] = await db
    .insert(importJob)
    .values({
      fileName: input.fileName.slice(0, 200),
      blobPathname: blob.pathname,
      contentType: typeFromName(input.fileName.toLowerCase(), blob.contentType.split(';')[0]),
      size: blob.size,
      uploadedBy: session.user.id,
      status: 'extracting',
    })
    .returning({ id: importJob.id });
  after(() => runExtraction(job.id));
  revalidatePath('/admin/imports');
  return job.id;
}

export async function retryImport(formData: FormData) {
  await requireCan('upload');
  const id = String(formData.get('id'));
  await db.update(importJob).set({ status: 'extracting', error: null }).where(eq(importJob.id, id));
  after(() => runExtraction(id));
  redirect(`/admin/imports/${id}`);
}

/** Applies the review form's edits to the stored draft. Keys and source quotes are not editable. */
function applyEdits(draft: ExtractedPlan, form: FormData): ExtractedPlan {
  const field = (name: string, fallback: string) => {
    const value = form.get(name);
    return typeof value === 'string' ? value.trim() : fallback;
  };
  return {
    module: {
      title: field('module.title', draft.module.title),
      program: field('module.program', draft.module.program),
      labTask: field('module.labTask', draft.module.labTask),
      skills: field('module.skills', draft.module.skills.join('\n')).split('\n').map(s => s.trim()).filter(Boolean),
    },
    topics: draft.topics.map((t, i) => ({
      ...t,
      title: field(`topics.${i}.title`, t.title),
      objective: field(`topics.${i}.objective`, t.objective),
      commonMistake: field(`topics.${i}.commonMistake`, t.commonMistake),
      facts: t.facts.map((f, j) => ({ ...f, text: field(`topics.${i}.facts.${j}.text`, f.text) })).filter(f => f.text),
    })),
    issues: draft.issues,
  };
}

async function loadReviewable(id: string) {
  const job = await db.query.importJob.findFirst({ where: eq(importJob.id, id) });
  if (!job || job.status !== 'needs_review') throw new Error('This import is not waiting for review.');
  return { job, draft: ExtractedPlan.parse(job.draft) };
}

export async function saveDraft(formData: FormData) {
  await requireCan('edit');
  const id = String(formData.get('id'));
  const { job, draft } = await loadReviewable(id);
  const edited = applyEdits(draft, formData);
  const issues = [...edited.issues, ...checkAgainstSource(edited, job.sourceText ?? '')];
  await db.update(importJob).set({ draft: edited, issues }).where(eq(importJob.id, id));
  revalidatePath(`/admin/imports/${id}`);
}

/** Saves edits, then writes the module, topics and a new brief version per topic in one transaction. */
export async function approveImport(formData: FormData) {
  const session = await requireCan('publish');
  const id = String(formData.get('id'));
  const { draft } = await loadReviewable(id);
  const parsed = ApprovablePlan.safeParse(applyEdits(draft, formData));
  if (!parsed.success) throw new Error(parsed.error.issues.map(i => i.message).join(' '));
  const plan = parsed.data;
  const moduleId = slugify(plan.module.title);

  await db.transaction(async tx => {
    await tx
      .insert(curriculumModule)
      .values({ id: moduleId, title: plan.module.title, program: plan.module.program || null, labTask: plan.module.labTask, skills: plan.module.skills })
      .onConflictDoUpdate({ target: curriculumModule.id, set: { title: plan.module.title, program: plan.module.program || null, labTask: plan.module.labTask, skills: plan.module.skills } });

    for (const [position, t] of plan.topics.entries()) {
      const topicId = `${moduleId}--${slugify(t.title)}`;
      await tx.insert(topic).values({ id: topicId, moduleId, title: t.title, position }).onConflictDoUpdate({ target: topic.id, set: { title: t.title, position } });
      const [{ latest }] = await tx.select({ latest: max(brief.version) }).from(brief).where(eq(brief.topicId, topicId));
      const [created] = await tx
        .insert(brief)
        .values({ topicId, version: (latest ?? 0) + 1, objective: t.objective, commonMistake: t.commonMistake, importJobId: id, createdBy: session.user.id })
        .returning({ id: brief.id });
      await tx.insert(briefFact).values(t.facts.map((f, i) => ({ briefId: created.id, key: f.key, text: f.text, sourceQuote: f.sourceQuote, position: i })));
    }

    await tx
      .update(importJob)
      .set({ status: 'approved', draft: plan, moduleId, approvedBy: session.user.id, approvedAt: new Date() })
      .where(and(eq(importJob.id, id), eq(importJob.status, 'needs_review')));
  });

  revalidatePath('/admin/imports');
  revalidatePath('/admin/content');
  redirect(`/admin/imports/${id}`);
}
