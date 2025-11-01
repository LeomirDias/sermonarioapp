import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Access Tokens
export const accessTokensTable = pgTable("access_tokens", {
  //Cliente
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  token: text("token").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sermonsTable = pgTable("sermons", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => accessTokensTable.id),
  title: text("title").notNull(),
  theme: text("theme").notNull(),
  main_verse: text("main_verse").notNull(),
  verse_text: text("verse_text").notNull(),
  objective: text("objective").notNull(),
  date: text("date"), // Data da pregação (opcional)
  // JSON completo da resposta da OpenAI
  sermon_json: text("sermon_json").notNull(), // Armazena como JSON string
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de log para rastrear criação de sermões
export const sermonLogsTable = pgTable("sermon_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => accessTokensTable.id),
  sermon_id: uuid("sermon_id").references(() => sermonsTable.id),
  title: text("title").notNull(),
  action: text("action").notNull().default("created"),
  prompt_tokens: integer("prompt_tokens"), // Tokens de entrada
  completion_tokens: integer("completion_tokens"), // Tokens de saída
  total_tokens: integer("total_tokens"), // Total de tokens
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
