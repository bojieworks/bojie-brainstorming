CREATE TYPE "public"."category" AS ENUM('outdoor', 'travel', 'create', 'learn', 'project', 'life');--> statement-breakpoint
CREATE TYPE "public"."effort" AS ENUM('afternoon', 'weekend', 'week_plus', 'ongoing');--> statement-breakpoint
CREATE TYPE "public"."interest_status" AS ENUM('new', 'contacted', 'spam');--> statement-breakpoint
CREATE TYPE "public"."interest_level" AS ENUM('curious', 'serious');--> statement-breakpoint
CREATE TYPE "public"."ideal_size" AS ENUM('one_two', 'three_five', 'many');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('idea', 'forming', 'active', 'done', 'parked');--> statement-breakpoint
CREATE TYPE "public"."update_kind" AS ENUM('manual', 'system');--> statement-breakpoint
CREATE TABLE "friends" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"friend_id" integer,
	"name" text NOT NULL,
	"level" "interest_level" NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"contact" text DEFAULT '' NOT NULL,
	"show_name" boolean DEFAULT false NOT NULL,
	"status" "interest_status" DEFAULT 'new' NOT NULL,
	"client_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"emoji" text DEFAULT '💭' NOT NULL,
	"title" text NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"why" text DEFAULT '' NOT NULL,
	"category" "category" DEFAULT 'life' NOT NULL,
	"status" "status" DEFAULT 'idea' NOT NULL,
	"open_to_join" boolean DEFAULT true NOT NULL,
	"effort" "effort" DEFAULT 'afternoon' NOT NULL,
	"time_hint" text DEFAULT '' NOT NULL,
	"start_date" date,
	"end_date" date,
	"location" text DEFAULT '' NOT NULL,
	"ideal_size" "ideal_size",
	"fit_for" text DEFAULT '' NOT NULL,
	"cover_url" text,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"group_url" text DEFAULT '' NOT NULL,
	"retro" text DEFAULT '' NOT NULL,
	"retro_photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"went_with" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redemptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"friend_id" integer NOT NULL,
	"reward_item_id" integer NOT NULL,
	"coupon_index" integer NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"fulfilled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reward_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stamps" (
	"id" serial PRIMARY KEY NOT NULL,
	"friend_id" integer NOT NULL,
	"project_id" integer,
	"label" text NOT NULL,
	"emoji" text DEFAULT '✅' NOT NULL,
	"date" date NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"body" text NOT NULL,
	"photo_url" text,
	"kind" "update_kind" DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interests" ADD CONSTRAINT "interests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interests" ADD CONSTRAINT "interests_friend_id_friends_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."friends"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_friend_id_friends_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."friends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_reward_item_id_reward_items_id_fk" FOREIGN KEY ("reward_item_id") REFERENCES "public"."reward_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stamps" ADD CONSTRAINT "stamps_friend_id_friends_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."friends"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stamps" ADD CONSTRAINT "stamps_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "updates" ADD CONSTRAINT "updates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "friends_token_idx" ON "friends" USING btree ("token");--> statement-breakpoint
CREATE INDEX "interests_project_idx" ON "interests" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "interests_client_idx" ON "interests" USING btree ("client_key");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "redemptions_friend_coupon_idx" ON "redemptions" USING btree ("friend_id","coupon_index");--> statement-breakpoint
CREATE INDEX "stamps_friend_idx" ON "stamps" USING btree ("friend_id");--> statement-breakpoint
CREATE INDEX "updates_project_idx" ON "updates" USING btree ("project_id");