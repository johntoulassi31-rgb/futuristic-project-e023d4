CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"explanation" text DEFAULT '' NOT NULL,
	"quiz" jsonb,
	"attempts" jsonb DEFAULT '[]' NOT NULL,
	"messages" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_spaces" (
	"owner" text PRIMARY KEY,
	"career" text,
	"completed" jsonb DEFAULT '[]' NOT NULL,
	"portfolio" jsonb DEFAULT '[]' NOT NULL,
	"day" text DEFAULT '' NOT NULL
);
