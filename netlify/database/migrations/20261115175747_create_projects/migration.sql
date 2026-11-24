CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner" text NOT NULL,
	"title" text NOT NULL,
	"domain" text NOT NULL,
	"description" text NOT NULL,
	"role" text NOT NULL,
	"steps" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
