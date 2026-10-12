import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { can } from '@/lib/permissions';
import { getSession } from '@/lib/session';

const allowedPlanTypes = ['application/pdf', 'text/markdown', 'text/x-markdown', 'text/plain', 'application/json'];
const MAX_BYTES = 10 * 1024 * 1024;

/** Issues a short-lived token so the browser can upload a plan straight to private Blob storage. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.isAnonymous) return NextResponse.json({ error: 'Log in to upload plans.' }, { status: 401 });
  if (!can(session.user.role, 'upload')) return NextResponse.json({ error: 'Your role can’t upload plans.' }, { status: 403 });

  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async pathname => {
        if (!pathname.startsWith('plans/')) throw new Error('Invalid upload path.');
        return { allowedContentTypes: allowedPlanTypes, maximumSizeInBytes: MAX_BYTES, addRandomSuffix: true };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed.' }, { status: 400 });
  }
}
