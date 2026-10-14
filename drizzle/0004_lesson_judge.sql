CREATE TABLE "judge_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brief_id" uuid,
	"kind" text NOT NULL,
	"brief_text" text NOT NULL,
	"content" jsonb NOT NULL,
	"judge_verdict" text NOT NULL,
	"findings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"guide_version" integer NOT NULL,
	"editor_verdict" text NOT NULL,
	"note" text NOT NULL,
	"decided_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "judge_guide" (
	"version" integer PRIMARY KEY NOT NULL,
	"rules" text NOT NULL,
	"status" text NOT NULL,
	"changes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"score" jsonb,
	"created_by" text,
	"approved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "judgment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brief_id" uuid NOT NULL,
	"topic_id" text NOT NULL,
	"kind" text NOT NULL,
	"status" text NOT NULL,
	"findings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"guide_version" integer NOT NULL,
	"model" text NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"decided_by" text,
	"decided_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "judgment_brief_kind" UNIQUE("brief_id","kind")
);
--> statement-breakpoint
ALTER TABLE "judge_feedback" ADD CONSTRAINT "judge_feedback_brief_id_brief_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."brief"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "judge_feedback" ADD CONSTRAINT "judge_feedback_decided_by_user_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "judge_guide" ADD CONSTRAINT "judge_guide_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "judge_guide" ADD CONSTRAINT "judge_guide_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "judgment" ADD CONSTRAINT "judgment_brief_id_brief_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."brief"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "judgment" ADD CONSTRAINT "judgment_topic_id_topic_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "judgment" ADD CONSTRAINT "judgment_decided_by_user_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;