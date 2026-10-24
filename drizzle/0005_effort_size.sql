ALTER TABLE "projects" ALTER COLUMN "effort" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "effort" SET DATA TYPE text USING "effort"::text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "effort" SET DEFAULT 'flexible';--> statement-breakpoint
UPDATE "projects" SET "effort" = 'multi_day' WHERE "effort" IN ('weekend', 'week_plus');--> statement-breakpoint
DROP TYPE "public"."effort";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "size_min" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "size_max" integer;--> statement-breakpoint
UPDATE "projects" SET "size_min" = 1, "size_max" = 2 WHERE "ideal_size" = 'one_two';--> statement-breakpoint
UPDATE "projects" SET "size_min" = 3, "size_max" = 5 WHERE "ideal_size" = 'three_five';--> statement-breakpoint
UPDATE "projects" SET "size_min" = 6, "size_max" = 10 WHERE "ideal_size" = 'six_ten';