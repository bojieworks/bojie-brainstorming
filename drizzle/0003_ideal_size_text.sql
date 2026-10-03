ALTER TABLE "projects" ALTER COLUMN "ideal_size" SET DATA TYPE text USING "ideal_size"::text;--> statement-breakpoint
UPDATE "projects" SET "ideal_size" = 'six_ten' WHERE "ideal_size" = 'many';--> statement-breakpoint
DROP TYPE "public"."ideal_size";
