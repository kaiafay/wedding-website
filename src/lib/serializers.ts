import { type InferSelectModel } from "drizzle-orm";
import { guests, parties, rsvps } from "./schema";

type GuestWithRsvp = InferSelectModel<typeof guests> & {
  party: InferSelectModel<typeof parties>;
  rsvp: InferSelectModel<typeof rsvps> | null;
};

export function serializeGuest(g: GuestWithRsvp) {
  return {
    id: g.id,
    partyId: g.partyId,
    name: g.name,
    email: g.email,
    usedAt: g.usedAt?.toISOString() ?? null,
    sentAt: g.sentAt?.toISOString() ?? null,
    createdAt: g.createdAt.toISOString(),
    party: {
      id: g.party.id,
      displayName: g.party.displayName,
      email: g.party.email,
      saveTheDateSentAt: g.party.saveTheDateSentAt?.toISOString() ?? null,
      hasSaveTheDateToken: g.party.saveTheDateToken !== null,
      createdAt: g.party.createdAt.toISOString(),
    },
    rsvp: g.rsvp
      ? {
          id: g.rsvp.id,
          attending: g.rsvp.attending,
          mealPreference: g.rsvp.mealPreference,
          allergies: g.rsvp.allergies,
          message: g.rsvp.message,
        }
      : null,
  };
}
