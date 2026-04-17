import { type InferSelectModel } from "drizzle-orm";
import { guests, rsvps } from "./schema";

type GuestWithRsvp = InferSelectModel<typeof guests> & {
  rsvp: InferSelectModel<typeof rsvps> | null;
};

export function serializeGuest(g: GuestWithRsvp) {
  return {
    id: g.id,
    name: g.name,
    email: g.email,
    usedAt: g.usedAt?.toISOString() ?? null,
    sentAt: g.sentAt?.toISOString() ?? null,
    createdAt: g.createdAt.toISOString(),
    rsvp: g.rsvp
      ? {
          id: g.rsvp.id,
          attending: g.rsvp.attending,
          mealPreference: g.rsvp.mealPreference,
          message: g.rsvp.message,
        }
      : null,
  };
}
