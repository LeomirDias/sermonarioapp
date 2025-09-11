import {
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Access Tokens
export const accessTokensTable = pgTable("access_tokens", {
  //Cliente
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  token: text("token").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});



