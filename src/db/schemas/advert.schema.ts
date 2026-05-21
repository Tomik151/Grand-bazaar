import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const advert = sqliteTable("advert", {
  id: integer().primaryKey({ autoIncrement: true }),
  titul: text().notNull(),
  popis: text().notNull(),
  cena: integer().notNull(),
  kategorie: text().notNull(),
  status: text().notNull(),
  obrazek: text(),
  kontaktJmeno: text().notNull(),
  kontaktEmail: text().notNull(),
});

export type Advert = typeof advert.$inferSelect;
