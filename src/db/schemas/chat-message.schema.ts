import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { advert } from "./advert.schema";

export const chatMessage = sqliteTable("chat_message", {
  id: integer().primaryKey({ autoIncrement: true }),
  advertId: integer()
    .notNull()
    .references(() => advert.id, { onDelete: "cascade" }),
  buyerEmail: text().notNull(),
  buyerName: text().notNull(),
  senderEmail: text().notNull(),
  text: text().notNull(),
  createdAt: integer().notNull(),
});

export type ChatMessage = typeof chatMessage.$inferSelect;
export type NewChatMessage = typeof chatMessage.$inferInsert;
