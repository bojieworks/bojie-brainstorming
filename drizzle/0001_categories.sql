CREATE TABLE "categories" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"color" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO "categories" ("key", "label", "color", "sort") VALUES
	('outdoor', '戶外', '#9dbf9e', 0),
	('travel', '旅行', '#9bb8d3', 1),
	('create', '創作', '#d9a5b5', 2),
	('learn', '學習', '#c9b88a', 3),
	('project', '專案', '#a8a4c8', 4),
	('life', '生活', '#d8b48f', 5);
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "category" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "category" SET DATA TYPE text USING "category"::text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "category" SET DEFAULT 'life';--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_categories_key_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."category";
