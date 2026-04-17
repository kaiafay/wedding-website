import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  name: text("name"),
  email: text("email"),
  usedAt: timestamp("used_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rsvps = pgTable("rsvps", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id")
    .references(() => guests.id)
    .notNull(),
  attending: boolean("attending").notNull(),
  mealPreference: text("meal_preference"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const guestsRelations = relations(guests, ({ one }) => ({
  rsvp: one(rsvps, { fields: [guests.id], references: [rsvps.guestId] }),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  guest: one(guests, { fields: [rsvps.guestId], references: [guests.id] }),
}));
