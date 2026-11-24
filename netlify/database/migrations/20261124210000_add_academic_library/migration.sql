CREATE TABLE "academic_resources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "author_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "author_name" text NOT NULL,
  "title" text NOT NULL,
  "summary" text NOT NULL,
  "content" text NOT NULL,
  "country" text NOT NULL,
  "institution" text NOT NULL,
  "field" text NOT NULL,
  "level" text NOT NULL,
  "subject" text NOT NULL,
  "source_type" text NOT NULL DEFAULT 'enseignant',
  "source_url" text,
  "status" text NOT NULL DEFAULT 'pending',
  "verified_official" boolean NOT NULL DEFAULT false,
  "review_note" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "reviewed_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "academic_resources_status_created_idx" ON "academic_resources" USING btree ("status", "created_at");
--> statement-breakpoint
CREATE INDEX "academic_resources_profile_idx" ON "academic_resources" USING btree ("country", "field", "level", "subject");
