import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const parties = pgTable("parties", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  saveTheDateToken: text("save_the_date_token").notNull().unique(),
  saveTheDateSentAt: timestamp("save_the_date_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id")
    .references(() => parties.id)
    .notNull(),
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
  allergies: text("allergies"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const partiesRelations = relations(parties, ({ many }) => ({
  guests: many(guests),
}));

export const guestsRelations = relations(guests, ({ one }) => ({
  party: one(parties, { fields: [guests.partyId], references: [parties.id] }),
  rsvp: one(rsvps, { fields: [guests.id], references: [rsvps.guestId] }),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  guest: one(guests, { fields: [rsvps.guestId], references: [guests.id] }),
}));

export const wishes = pgTable("wishes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  message: text("message").notNull(),
  hidden: boolean("hidden").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wishPostAttempts = pgTable("wish_post_attempts", {
  id: serial("id").primaryKey(),
  ipHash: text("ip_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
