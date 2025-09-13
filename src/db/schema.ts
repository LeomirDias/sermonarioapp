import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Access Tokens
export const accessTokensTable = pgTable("access_tokens", {
  //Cliente
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  token: text("token").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sermonsTable = pgTable("sermons", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  theme: text("theme").notNull(),
  mainVerse: text("main_verse").notNull(),
  objective: text("objective"),
  description: text("description"),
  price_in_cents: integer("price_in_cents").notNull(),
  checkout_url: text("checkout_url"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sermonFilesTable = pgTable("sermon_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  sermon_id: uuid("sermon_id").references(() => sermonsTable.id),
  type: text("type").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const accessSermonsTable = pgTable("access_sermons", {
  id: uuid("id").primaryKey().defaultRandom(),
  client_token: text("client_token").notNull(),
  sermon_id: uuid("sermon_id").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull(),
});
