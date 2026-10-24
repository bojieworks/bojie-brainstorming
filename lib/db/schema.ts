import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const statusEnum = pgEnum("status", ["idea", "forming", "active", "done", "parked"]);
export const levelEnum = pgEnum("interest_level", ["curious", "serious"]);
export const interestStatusEnum = pgEnum("interest_status", ["new", "contacted", "spam"]);
export const updateKindEnum = pgEnum("update_kind", ["manual", "system"]);

export type ProjectLink = { label: string; url: string };

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
  count: integer("count").notNull().default(0),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  color: text("color").notNull(),
  sort: integer("sort").notNull().default(0),
});

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    emoji: text("emoji").notNull().default("💭"),
    title: text("title").notNull(),
    tagline: text("tagline").notNull().default(""),
    why: text("why").notNull().default(""),
    category: text("category").notNull().default("life").references(() => categories.key),
    status: statusEnum("status").notNull().default("idea"),
    openToJoin: boolean("open_to_join").notNull().default(true),
    effort: text("effort").notNull().default("flexible"),
    timeHint: text("time_hint").notNull().default(""),
    startDate: date("start_date"),
    endDate: date("end_date"),
    location: text("location").notNull().default(""),
    // 舊欄位，已由 sizeMin / sizeMax 取代；先留著讓舊版部署回滾時還讀得到
    idealSize: text("ideal_size"),
    // 兩個都空 = 不限；相同 = 固定人數；不同 = 區間
    sizeMin: integer("size_min"),
    sizeMax: integer("size_max"),
    fitFor: text("fit_for").notNull().default(""),
    coverUrl: text("cover_url"),
    links: jsonb("links").$type<ProjectLink[]>().notNull().default([]),
    groupUrl: text("group_url").notNull().default(""),
    retro: text("retro").notNull().default(""),
    retroPhotos: jsonb("retro_photos").$type<string[]>().notNull().default([]),
    wentWith: text("went_with").notNull().default(""),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("projects_slug_idx").on(t.slug)],
);

export const updates = pgTable(
  "updates",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    photoUrl: text("photo_url"),
    kind: updateKindEnum("kind").notNull().default("manual"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("updates_project_idx").on(t.projectId)],
);

export const friends = pgTable(
  "friends",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("friends_token_idx").on(t.token)],
);

export const interests = pgTable(
  "interests",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    friendId: integer("friend_id").references(() => friends.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    level: levelEnum("level").notNull(),
    note: text("note").notNull().default(""),
    contact: text("contact").notNull().default(""),
    showName: boolean("show_name").notNull().default(false),
    status: interestStatusEnum("status").notNull().default("new"),
    clientKey: text("client_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  },
  (t) => [index("interests_project_idx").on(t.projectId), index("interests_client_idx").on(t.clientKey)],
);

export const stamps = pgTable(
  "stamps",
  {
    id: serial("id").primaryKey(),
    friendId: integer("friend_id").notNull().references(() => friends.id, { onDelete: "cascade" }),
    projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
    label: text("label").notNull(),
    emoji: text("emoji").notNull().default("✅"),
    date: date("date").notNull(),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("stamps_friend_idx").on(t.friendId)],
);

export const rewardItems = pgTable("reward_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  active: boolean("active").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

export const redemptions = pgTable(
  "redemptions",
  {
    id: serial("id").primaryKey(),
    friendId: integer("friend_id").notNull().references(() => friends.id, { onDelete: "cascade" }),
    rewardItemId: integer("reward_item_id").notNull().references(() => rewardItems.id),
    couponIndex: integer("coupon_index").notNull(),
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
    fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("redemptions_friend_coupon_idx").on(t.friendId, t.couponIndex)],
);

export const projectsRelations = relations(projects, ({ many }) => ({
  updates: many(updates),
  interests: many(interests),
}));
export const updatesRelations = relations(updates, ({ one }) => ({
  project: one(projects, { fields: [updates.projectId], references: [projects.id] }),
}));
export const interestsRelations = relations(interests, ({ one }) => ({
  project: one(projects, { fields: [interests.projectId], references: [projects.id] }),
  friend: one(friends, { fields: [interests.friendId], references: [friends.id] }),
}));
export const friendsRelations = relations(friends, ({ many }) => ({
  stamps: many(stamps),
  redemptions: many(redemptions),
  interests: many(interests),
}));
export const stampsRelations = relations(stamps, ({ one }) => ({
  friend: one(friends, { fields: [stamps.friendId], references: [friends.id] }),
  project: one(projects, { fields: [stamps.projectId], references: [projects.id] }),
}));
export const redemptionsRelations = relations(redemptions, ({ one }) => ({
  friend: one(friends, { fields: [redemptions.friendId], references: [friends.id] }),
  item: one(rewardItems, { fields: [redemptions.rewardItemId], references: [rewardItems.id] }),
}));

export type Category = typeof categories.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Update = typeof updates.$inferSelect;
export type Interest = typeof interests.$inferSelect;
export type Friend = typeof friends.$inferSelect;
export type Stamp = typeof stamps.$inferSelect;
export type RewardItem = typeof rewardItems.$inferSelect;
export type Redemption = typeof redemptions.$inferSelect;
