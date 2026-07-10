import { createHmac } from "crypto";
import { NextRequest } from "next/server";
import { eq, inArray, like } from "drizzle-orm";
import { POST as createParty } from "../src/app/api/admin/parties/route";
import {
  DELETE as dissolveParty,
  PATCH as editParty,
} from "../src/app/api/admin/parties/[id]/route";
import { db } from "../src/lib/db";
import { guests, parties } from "../src/lib/schema";

const PREFIX = "DB Behavior Probe";

type GuestWithParty = typeof guests.$inferSelect & {
  party: typeof parties.$inferSelect;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertDatePresent(value: Date | null, message: string): asserts value is Date {
  assert(value instanceof Date, message);
}

function assertSameTime(actual: Date | null, expected: Date, message: string) {
  assertDatePresent(actual, message);
  assert(actual.getTime() === expected.getTime(), message);
}

function adminCookie() {
  const password = process.env.ADMIN_PASSWORD;
  assert(password, "ADMIN_PASSWORD is required");

  const token = createHmac("sha256", password)
    .update("admin_session")
    .digest("hex");

  return `admin_session=${token}`;
}

async function cleanup() {
  const probeGuests = await db.query.guests.findMany({
    where: like(guests.name, `${PREFIX}%`),
  });

  if (probeGuests.length > 0) {
    await db.delete(guests).where(
      inArray(
        guests.id,
        probeGuests.map((guest) => guest.id),
      ),
    );
  }

  await db.delete(parties).where(like(parties.displayName, `${PREFIX}%`));
}

async function createGroupedParty({
  label,
  recipientIndex,
  sentAt,
  guestEmails,
}: {
  label: string;
  recipientIndex: number | null;
  sentAt: Date | null;
  guestEmails?: (string | null)[];
}) {
  const normalizedLabel = label.toLowerCase().replaceAll(" ", "-");
  const emails = guestEmails ?? [
    `${normalizedLabel}-one@example.com`,
    `${normalizedLabel}-two@example.com`,
  ];
  const saveTheDateToken = crypto.randomUUID();
  const [party] = await db
    .insert(parties)
    .values({
      displayName: `${PREFIX} ${label} Group`,
      saveTheDateToken,
      saveTheDateSentAt: sentAt,
    })
    .returning();

  const createdGuests = await db
    .insert(guests)
    .values(
      emails.map((email, index) => ({
        partyId: party.id,
        name: `${PREFIX} ${label} Guest ${index + 1}`,
        email,
        token: crypto.randomUUID(),
      })),
    )
    .returning();

  const recipientGuest =
    recipientIndex === null ? null : createdGuests[recipientIndex];

  if (recipientGuest) {
    await db
      .update(parties)
      .set({ saveTheDateRecipientGuestId: recipientGuest.id })
      .where(eq(parties.id, party.id));
  }

  return {
    partyId: party.id,
    saveTheDateToken,
    createdGuests,
  };
}

async function callDissolveRouteRaw(partyId: number) {
  const request = new NextRequest(
    `http://localhost/api/admin/parties/${partyId}`,
    {
      method: "DELETE",
      headers: {
        cookie: adminCookie(),
      },
    },
  );

  const response = await dissolveParty(request, {
    params: Promise.resolve({ id: String(partyId) }),
  });
  const body = await response.json().catch(() => null);

  return { response, body };
}

async function callDissolveRoute(partyId: number) {
  const { response, body } = await callDissolveRouteRaw(partyId);

  assert(
    response.ok,
    `Dissolve failed for party ${partyId}: ${JSON.stringify(body)}`,
  );

  return body;
}

async function callCreatePartyRouteRaw(body: unknown) {
  const request = new NextRequest("http://localhost/api/admin/parties", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: adminCookie(),
    },
    body: JSON.stringify(body),
  });

  const response = await createParty(request);
  const responseBody = await response.json().catch(() => null);

  return { response, body: responseBody };
}

async function callCreatePartyRoute(body: unknown) {
  const { response, body: responseBody } = await callCreatePartyRouteRaw(body);

  assert(
    response.ok,
    `Create party failed: ${JSON.stringify(responseBody)}`,
  );

  return responseBody;
}

async function callEditPartyRouteRaw(partyId: number, body: unknown) {
  const request = new NextRequest(
    `http://localhost/api/admin/parties/${partyId}`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie: adminCookie(),
      },
      body: JSON.stringify(body),
    },
  );

  const response = await editParty(request, {
    params: Promise.resolve({ id: String(partyId) }),
  });
  const responseBody = await response.json().catch(() => null);

  return { response, body: responseBody };
}

async function callEditPartyRoute(partyId: number, body: unknown) {
  const { response, body: responseBody } = await callEditPartyRouteRaw(
    partyId,
    body,
  );

  assert(
    response.ok,
    `Edit party failed for party ${partyId}: ${JSON.stringify(responseBody)}`,
  );

  return responseBody;
}

async function loadGuests(ids: number[]) {
  const rows = await db.query.guests.findMany({
    where: inArray(guests.id, ids),
    with: { party: true },
  });

  const byId = new Map(rows.map((guest) => [guest.id, guest]));

  return ids.map((id) => {
    const guest = byId.get(id);
    assert(guest, `Expected guest ${id} to exist`);
    return guest as GuestWithParty;
  });
}

async function loadParty(id: number) {
  const party = await db.query.parties.findFirst({
    where: eq(parties.id, id),
    with: { guests: true },
  });
  assert(party, `Expected party ${id} to exist`);
  return party;
}

async function assertPartyDeleted(id: number, message: string) {
  const party = await db.query.parties.findFirst({
    where: eq(parties.id, id),
  });
  assert(!party, message);
}

async function assertSoloDissolveResult({
  setup,
  retainedGuestId,
  expectedRetainedSentAt,
}: {
  setup: Awaited<ReturnType<typeof createGroupedParty>>;
  retainedGuestId: number;
  expectedRetainedSentAt: Date | null;
}) {
  const loaded = await loadGuests(setup.createdGuests.map((guest) => guest.id));
  const byId = new Map(loaded.map((guest) => [guest.id, guest]));
  const retained = byId.get(retainedGuestId);
  assert(retained, "Expected retained guest to exist");

  assert(
    retained.partyId === setup.partyId,
    "Retained guest should keep the original party row",
  );
  assert(
    retained.party.saveTheDateToken === setup.saveTheDateToken,
    "Retained guest should keep the original save-the-date token",
  );
  if (expectedRetainedSentAt) {
    assertSameTime(
      retained.party.saveTheDateSentAt,
      expectedRetainedSentAt,
      "Retained guest should preserve the original sent timestamp exactly",
    );
  } else {
    assert(
      retained.party.saveTheDateSentAt === null,
      "Retained guest should be unsent",
    );
  }
  assert(
    retained.party.displayName === retained.name,
    "Retained solo party should use the guest name",
  );
  assert(
    retained.token ===
      setup.createdGuests.find((guest) => guest.id === retained.id)?.token,
    "Retained guest invite token should not change",
  );

  for (const guest of loaded.filter((item) => item.id !== retainedGuestId)) {
    const original = setup.createdGuests.find((item) => item.id === guest.id);
    assert(original, `Expected original guest ${guest.id}`);
    assert(
      guest.partyId !== setup.partyId,
      "Split guest should move to a new solo party",
    );
    assert(
      guest.party.saveTheDateToken !== setup.saveTheDateToken,
      "Split guest should get a fresh save-the-date token",
    );
    assert(
      guest.party.saveTheDateSentAt === null,
      "Split guest should need a new save-the-date send",
    );
    assert(
      guest.party.displayName === guest.name,
      "Split guest solo party should use the guest name",
    );
    assert(guest.token === original.token, "Guest invite token should not change");
    assert(
      guest.party.saveTheDateRecipientGuestId ===
        (guest.email ? guest.id : null),
      "Split guest solo party recipient should match email availability",
    );
  }
}

async function testSentRecipientKeepsTokenAndSentState() {
  const sentAt = new Date("2026-07-10T12:00:00.000Z");
  const setup = await createGroupedParty({
    label: "Sent",
    recipientIndex: 0,
    sentAt,
  });

  await callDissolveRoute(setup.partyId);

  const [recipient, other] = await loadGuests([
    setup.createdGuests[0].id,
    setup.createdGuests[1].id,
  ]);

  assert(
    recipient.partyId === setup.partyId,
    "Original recipient should keep the original party row",
  );
  assert(
    recipient.party.saveTheDateToken === setup.saveTheDateToken,
    "Original recipient should keep the emailed save-the-date token",
  );
  assertDatePresent(
    recipient.party.saveTheDateSentAt,
    "Original recipient should remain marked as save-the-date sent",
  );
  assertSameTime(
    recipient.party.saveTheDateSentAt,
    sentAt,
    "Original recipient should preserve the original sent timestamp exactly",
  );
  assert(
    recipient.party.saveTheDateRecipientGuestId === recipient.id,
    "Original recipient solo party should point at that guest",
  );
  assert(
    recipient.party.displayName === recipient.name,
    "Original recipient solo party should use the guest name",
  );

  assert(
    other.partyId !== setup.partyId,
    "Other guest should move to a new solo party",
  );
  assert(
    other.party.saveTheDateToken !== setup.saveTheDateToken,
    "Other guest should get a fresh save-the-date token",
  );
  assert(
    other.party.saveTheDateSentAt === null,
    "Other guest should need a new save-the-date send",
  );
  assert(
    other.party.saveTheDateRecipientGuestId === other.id,
    "Other guest solo party should point at that guest when email exists",
  );
  assert(
    recipient.token === setup.createdGuests[0].token,
    "Original recipient invite token should not change",
  );
  assert(
    other.token === setup.createdGuests[1].token,
    "Other guest invite token should not change",
  );

  const tokenLookup = await db.query.parties.findFirst({
    where: eq(parties.saveTheDateToken, setup.saveTheDateToken),
  });
  assert(
    tokenLookup?.id === recipient.partyId,
    "Original token should still resolve to the recipient solo party",
  );
}

async function testSecondGuestRecipientKeepsTokenAndSentState() {
  const sentAt = new Date("2026-07-10T12:30:00.000Z");
  const setup = await createGroupedParty({
    label: "Second Recipient",
    recipientIndex: 1,
    sentAt,
  });

  await callDissolveRoute(setup.partyId);

  await assertSoloDissolveResult({
    setup,
    retainedGuestId: setup.createdGuests[1].id,
    expectedRetainedSentAt: sentAt,
  });
}

async function testUnsentPartyDissolveCreatesUnsentSoloParties() {
  const setup = await createGroupedParty({
    label: "Unsent",
    recipientIndex: 0,
    sentAt: null,
  });

  await callDissolveRoute(setup.partyId);

  await assertSoloDissolveResult({
    setup,
    retainedGuestId: setup.createdGuests[0].id,
    expectedRetainedSentAt: null,
  });
}

async function testThreeGuestPartyDissolve() {
  const sentAt = new Date("2026-07-10T13:00:00.000Z");
  const setup = await createGroupedParty({
    label: "Three Guest",
    recipientIndex: 2,
    sentAt,
    guestEmails: [
      "three-guest-one@example.com",
      "three-guest-two@example.com",
      "three-guest-three@example.com",
    ],
  });

  await callDissolveRoute(setup.partyId);

  await assertSoloDissolveResult({
    setup,
    retainedGuestId: setup.createdGuests[2].id,
    expectedRetainedSentAt: sentAt,
  });
}

async function testInvalidRecipientClearsMisleadingSentState() {
  const setup = await createGroupedParty({
    label: "Invalid Recipient",
    recipientIndex: null,
    sentAt: new Date("2026-07-10T12:00:00.000Z"),
    guestEmails: ["invalid-recipient-one@example.com", null],
  });

  await callDissolveRoute(setup.partyId);

  const [firstGuest, secondGuest] = await loadGuests([
    setup.createdGuests[0].id,
    setup.createdGuests[1].id,
  ]);

  assert(
    firstGuest.partyId === setup.partyId,
    "First guest should keep the original party row when no valid recipient exists",
  );
  assert(
    firstGuest.party.saveTheDateToken === setup.saveTheDateToken,
    "Original token should remain attached to the retained solo party",
  );
  assert(
    firstGuest.party.saveTheDateSentAt === null,
    "Retained solo party should clear sent state when there was no valid recipient",
  );
  assert(
    firstGuest.party.saveTheDateRecipientGuestId === firstGuest.id,
    "Retained solo party should use the first guest as recipient when they have email",
  );

  assert(
    secondGuest.partyId !== setup.partyId,
    "Second guest should move to a new solo party",
  );
  assert(
    secondGuest.party.saveTheDateSentAt === null,
    "Second guest solo party should be unsent",
  );
  assert(
    secondGuest.party.saveTheDateRecipientGuestId === null,
    "Second guest solo party should have no recipient when they have no email",
  );
}

async function testRecipientWithoutEmailClearsMisleadingSentState() {
  const setup = await createGroupedParty({
    label: "Recipient Without Email",
    recipientIndex: 0,
    sentAt: new Date("2026-07-10T14:00:00.000Z"),
    guestEmails: [null, "recipient-without-email-two@example.com"],
  });

  await callDissolveRoute(setup.partyId);

  await assertSoloDissolveResult({
    setup,
    retainedGuestId: setup.createdGuests[0].id,
    expectedRetainedSentAt: null,
  });

  const [firstGuest] = await loadGuests([setup.createdGuests[0].id]);
  assert(
    firstGuest.party.saveTheDateRecipientGuestId === null,
    "Retained guest without email should not remain party recipient",
  );
}

async function testSoloPartyDissolveRejected() {
  const setup = await createGroupedParty({
    label: "Solo Reject",
    recipientIndex: 0,
    sentAt: null,
    guestEmails: ["solo-reject@example.com"],
  });

  const { response, body } = await callDissolveRouteRaw(setup.partyId);
  assert(response.status === 400, "Solo party dissolve should return 400");
  assert(
    body?.error === "Only grouped parties can be dissolved",
    "Solo party dissolve should return the expected error message",
  );

  const [guest] = await loadGuests([setup.createdGuests[0].id]);
  assert(
    guest.partyId === setup.partyId,
    "Rejected solo dissolve should leave guest on original party",
  );
}

async function testCreatePartyGroupsExistingSoloGuests() {
  const soloOne = await createGroupedParty({
    label: "Create Solo One",
    recipientIndex: 0,
    sentAt: null,
    guestEmails: ["create-solo-one@example.com"],
  });
  const soloTwo = await createGroupedParty({
    label: "Create Solo Two",
    recipientIndex: 0,
    sentAt: null,
    guestEmails: ["create-solo-two@example.com"],
  });
  const oldPartyIds = [soloOne.partyId, soloTwo.partyId];
  const displayName = `${PREFIX} Created Group`;

  await callCreatePartyRoute({
    displayName,
    guestIds: [soloOne.createdGuests[0].id, soloTwo.createdGuests[0].id],
    saveTheDateRecipientGuestId: soloTwo.createdGuests[0].id,
  });

  const [guestOne, guestTwo] = await loadGuests([
    soloOne.createdGuests[0].id,
    soloTwo.createdGuests[0].id,
  ]);

  assert(
    guestOne.partyId === guestTwo.partyId,
    "Created party should move both guests into the same party",
  );
  assert(
    guestOne.party.displayName === displayName,
    "Created party should use submitted display name",
  );
  assert(
    guestOne.party.saveTheDateRecipientGuestId === soloTwo.createdGuests[0].id,
    "Created party should use submitted recipient",
  );
  assert(
    guestOne.party.saveTheDateSentAt === null,
    "Created party should start unsent",
  );

  for (const oldPartyId of oldPartyIds) {
    await assertPartyDeleted(
      oldPartyId,
      "Old empty solo parties should be deleted after grouping",
    );
  }
}

async function testCreatePartyValidation() {
  const soloOne = await createGroupedParty({
    label: "Create Validation One",
    recipientIndex: 0,
    sentAt: null,
    guestEmails: ["create-validation-one@example.com"],
  });
  const soloTwo = await createGroupedParty({
    label: "Create Validation Two",
    recipientIndex: 0,
    sentAt: null,
    guestEmails: [null],
  });

  const tooFew = await callCreatePartyRouteRaw({
    displayName: `${PREFIX} Invalid Too Few`,
    guestIds: [soloOne.createdGuests[0].id],
    saveTheDateRecipientGuestId: soloOne.createdGuests[0].id,
  });
  assert(tooFew.response.status === 400, "Create should reject fewer than two guests");
  assert(
    tooFew.body?.error === "Select at least two guests",
    "Create too-few-guests error should be stable",
  );

  const recipientOutsideParty = await callCreatePartyRouteRaw({
    displayName: `${PREFIX} Invalid Recipient Outside`,
    guestIds: [soloOne.createdGuests[0].id, soloTwo.createdGuests[0].id],
    saveTheDateRecipientGuestId: 999_999_999,
  });
  assert(
    recipientOutsideParty.response.status === 400,
    "Create should reject recipient outside selected guests",
  );
  assert(
    recipientOutsideParty.body?.error === "Select a save-the-date recipient",
    "Create recipient-outside-party error should be stable",
  );

  const recipientWithoutEmail = await callCreatePartyRouteRaw({
    displayName: `${PREFIX} Invalid Recipient No Email`,
    guestIds: [soloOne.createdGuests[0].id, soloTwo.createdGuests[0].id],
    saveTheDateRecipientGuestId: soloTwo.createdGuests[0].id,
  });
  assert(
    recipientWithoutEmail.response.status === 400,
    "Create should reject recipient without email",
  );
  assert(
    recipientWithoutEmail.body?.error === "Recipient must have an email",
    "Create recipient-without-email error should be stable",
  );
}

async function testEditPartyRenamesAndChangesRecipient() {
  const setup = await createGroupedParty({
    label: "Patch Rename",
    recipientIndex: 0,
    sentAt: null,
  });
  const displayName = `${PREFIX} Patched Rename`;

  await callEditPartyRoute(setup.partyId, {
    displayName,
    guestIds: setup.createdGuests.map((guest) => guest.id),
    saveTheDateRecipientGuestId: setup.createdGuests[1].id,
  });

  const party = await loadParty(setup.partyId);
  assert(party.displayName === displayName, "PATCH should rename party");
  assert(
    party.saveTheDateRecipientGuestId === setup.createdGuests[1].id,
    "PATCH should change save-the-date recipient",
  );
  assert(
    party.guests.length === 2,
    "PATCH rename/recipient change should keep both guests",
  );
}

async function testEditPartyRemovesGuestToFreshSoloParty() {
  const sentAt = new Date("2026-07-10T15:00:00.000Z");
  const setup = await createGroupedParty({
    label: "Patch Remove",
    recipientIndex: 1,
    sentAt,
  });
  const originalToken = setup.saveTheDateToken;
  const removedGuest = setup.createdGuests[0];
  const remainingGuest = setup.createdGuests[1];

  await callEditPartyRoute(setup.partyId, {
    displayName: `${PREFIX} Patch Remove Remaining`,
    guestIds: [remainingGuest.id],
    saveTheDateRecipientGuestId: remainingGuest.id,
  });

  const [removed, remaining] = await loadGuests([
    removedGuest.id,
    remainingGuest.id,
  ]);

  assert(
    remaining.partyId === setup.partyId,
    "PATCH should keep remaining guest on original party",
  );
  assert(
    remaining.party.saveTheDateToken === originalToken,
    "PATCH should leave original token with the edited party",
  );
  assertSameTime(
    remaining.party.saveTheDateSentAt,
    sentAt,
    "PATCH should leave original sent timestamp with the edited party",
  );
  assert(
    remaining.party.displayName === remaining.name,
    "PATCH down to one guest should normalize remaining party to guest name",
  );
  assert(
    remaining.party.saveTheDateRecipientGuestId === remaining.id,
    "PATCH down to one guest should use remaining guest as recipient",
  );

  assert(
    removed.partyId !== setup.partyId,
    "PATCH should move removed guest to a fresh solo party",
  );
  assert(
    removed.party.saveTheDateToken !== originalToken,
    "PATCH removed guest should get a fresh save-the-date token",
  );
  assert(
    removed.party.saveTheDateSentAt === null,
    "PATCH removed guest should become unsent",
  );
  assert(
    removed.party.saveTheDateRecipientGuestId === removed.id,
    "PATCH removed guest solo party should point at that guest when email exists",
  );
}

async function testEditPartyRemovesSentRecipientTransfersOriginalParty() {
  const sentAt = new Date("2026-07-10T15:30:00.000Z");
  const setup = await createGroupedParty({
    label: "Patch Remove Sent Recipient",
    recipientIndex: 0,
    sentAt,
  });
  const originalToken = setup.saveTheDateToken;
  const removedRecipient = setup.createdGuests[0];
  const remainingGuest = setup.createdGuests[1];

  await callEditPartyRoute(setup.partyId, {
    displayName: `${PREFIX} Patch Remove Sent Recipient Remaining`,
    guestIds: [remainingGuest.id],
    saveTheDateRecipientGuestId: remainingGuest.id,
  });

  const [removed, remaining] = await loadGuests([
    removedRecipient.id,
    remainingGuest.id,
  ]);

  assert(
    removed.partyId === setup.partyId,
    "PATCH should keep original party row with removed sent recipient",
  );
  assert(
    removed.party.saveTheDateToken === originalToken,
    "PATCH should keep original token with removed sent recipient",
  );
  assertSameTime(
    removed.party.saveTheDateSentAt,
    sentAt,
    "PATCH should keep original sent timestamp with removed sent recipient",
  );
  assert(
    removed.party.displayName === removed.name,
    "PATCH should normalize removed sent recipient party to guest name",
  );
  assert(
    removed.party.saveTheDateRecipientGuestId === removed.id,
    "PATCH should keep removed sent recipient as recipient on original party",
  );

  assert(
    remaining.partyId !== setup.partyId,
    "PATCH should move remaining party members to a fresh party",
  );
  assert(
    remaining.party.saveTheDateToken !== originalToken,
    "PATCH should give remaining party members a fresh save-the-date token",
  );
  assert(
    remaining.party.saveTheDateSentAt === null,
    "PATCH should make remaining party members need a new save-the-date send",
  );
  assert(
    remaining.party.displayName === remaining.name,
    "PATCH down to one remaining guest should normalize new party to guest name",
  );
  assert(
    remaining.party.saveTheDateRecipientGuestId === remaining.id,
    "PATCH should use submitted remaining recipient on the fresh party",
  );
}

async function testEditPartyRemovesUnsentRecipientToFreshSoloParty() {
  const setup = await createGroupedParty({
    label: "Patch Remove Unsent Recipient",
    recipientIndex: 0,
    sentAt: null,
  });
  const originalToken = setup.saveTheDateToken;
  const removedRecipient = setup.createdGuests[0];
  const remainingGuest = setup.createdGuests[1];

  await callEditPartyRoute(setup.partyId, {
    displayName: `${PREFIX} Patch Remove Unsent Remaining`,
    guestIds: [remainingGuest.id],
    saveTheDateRecipientGuestId: remainingGuest.id,
  });

  const [removed, remaining] = await loadGuests([
    removedRecipient.id,
    remainingGuest.id,
  ]);

  assert(
    remaining.partyId === setup.partyId,
    "PATCH should keep original unsent party with remaining guest",
  );
  assert(
    remaining.party.saveTheDateToken === originalToken,
    "PATCH should keep original unsent token with remaining party",
  );
  assert(
    remaining.party.saveTheDateSentAt === null,
    "PATCH should keep remaining party unsent",
  );

  assert(
    removed.partyId !== setup.partyId,
    "PATCH should move removed unsent recipient to a fresh solo party",
  );
  assert(
    removed.party.saveTheDateToken !== originalToken,
    "PATCH should give removed unsent recipient a fresh token",
  );
  assert(
    removed.party.saveTheDateSentAt === null,
    "PATCH should keep removed unsent recipient unsent",
  );
}

async function testEditPartyClearsInvalidSentState() {
  const setup = await createGroupedParty({
    label: "Patch Invalid Sent State",
    recipientIndex: null,
    sentAt: new Date("2026-07-10T16:00:00.000Z"),
  });
  const originalToken = setup.saveTheDateToken;

  await callEditPartyRoute(setup.partyId, {
    displayName: `${PREFIX} Patch Invalid Sent State Updated`,
    guestIds: setup.createdGuests.map((guest) => guest.id),
    saveTheDateRecipientGuestId: setup.createdGuests[0].id,
  });

  const party = await loadParty(setup.partyId);
  assert(
    party.saveTheDateToken === originalToken,
    "PATCH invalid sent state cleanup should keep the original token",
  );
  assert(
    party.saveTheDateSentAt === null,
    "PATCH should clear sent state when no valid sent recipient exists",
  );
  assert(
    party.saveTheDateRecipientGuestId === setup.createdGuests[0].id,
    "PATCH should still apply the submitted valid recipient",
  );
}

async function testEditPartyAddsSoloGuestAndDeletesOldSoloParty() {
  const grouped = await createGroupedParty({
    label: "Patch Add Group",
    recipientIndex: 0,
    sentAt: null,
  });
  const solo = await createGroupedParty({
    label: "Patch Add Solo",
    recipientIndex: 0,
    sentAt: null,
    guestEmails: ["patch-add-solo@example.com"],
  });
  const oldSoloPartyId = solo.partyId;
  const allGuestIds = [
    ...grouped.createdGuests.map((guest) => guest.id),
    solo.createdGuests[0].id,
  ];

  await callEditPartyRoute(grouped.partyId, {
    displayName: `${PREFIX} Patch Added Solo`,
    guestIds: allGuestIds,
    saveTheDateRecipientGuestId: solo.createdGuests[0].id,
  });

  const loaded = await loadGuests(allGuestIds);
  for (const guest of loaded) {
    assert(
      guest.partyId === grouped.partyId,
      "PATCH should move added solo guest into existing group",
    );
  }
  assert(
    loaded[0].party.saveTheDateRecipientGuestId === solo.createdGuests[0].id,
    "PATCH should accept added guest as recipient",
  );
  await assertPartyDeleted(
    oldSoloPartyId,
    "PATCH should delete old empty solo party after moving guest into group",
  );
}

async function testEditPartyValidation() {
  const setup = await createGroupedParty({
    label: "Patch Validation",
    recipientIndex: 0,
    sentAt: null,
    guestEmails: ["patch-validation-one@example.com", null],
  });

  const emptyGuestList = await callEditPartyRouteRaw(setup.partyId, {
    displayName: `${PREFIX} Patch Invalid Empty`,
    guestIds: [],
    saveTheDateRecipientGuestId: null,
  });
  assert(emptyGuestList.response.status === 400, "PATCH should reject empty guest list");
  assert(
    emptyGuestList.body?.error === "Select at least one guest",
    "PATCH empty guest list error should be stable",
  );

  const recipientOutsideParty = await callEditPartyRouteRaw(setup.partyId, {
    displayName: `${PREFIX} Patch Invalid Recipient Outside`,
    guestIds: [setup.createdGuests[0].id],
    saveTheDateRecipientGuestId: setup.createdGuests[1].id,
  });
  assert(
    recipientOutsideParty.response.status === 400,
    "PATCH should reject recipient outside remaining party",
  );
  assert(
    recipientOutsideParty.body?.error === "Recipient must be in the party",
    "PATCH recipient-outside-party error should be stable",
  );

  const recipientWithoutEmail = await callEditPartyRouteRaw(setup.partyId, {
    displayName: `${PREFIX} Patch Invalid Recipient No Email`,
    guestIds: setup.createdGuests.map((guest) => guest.id),
    saveTheDateRecipientGuestId: setup.createdGuests[1].id,
  });
  assert(
    recipientWithoutEmail.response.status === 400,
    "PATCH should reject recipient without email",
  );
  assert(
    recipientWithoutEmail.body?.error === "Recipient must have an email",
    "PATCH recipient-without-email error should be stable",
  );
}

async function main() {
  console.log("Cleaning old probe rows...");
  await cleanup();

  try {
    console.log("Testing sent recipient token preservation...");
    await testSentRecipientKeepsTokenAndSentState();

    console.log("Testing second guest recipient token preservation...");
    await testSecondGuestRecipientKeepsTokenAndSentState();

    console.log("Testing unsent party dissolve...");
    await testUnsentPartyDissolveCreatesUnsentSoloParties();

    console.log("Testing three-guest party dissolve...");
    await testThreeGuestPartyDissolve();

    console.log("Testing invalid recipient sent-state cleanup...");
    await testInvalidRecipientClearsMisleadingSentState();

    console.log("Testing recipient-without-email sent-state cleanup...");
    await testRecipientWithoutEmailClearsMisleadingSentState();

    console.log("Testing solo party dissolve rejection...");
    await testSoloPartyDissolveRejected();

    console.log("Testing party creation from solo guests...");
    await testCreatePartyGroupsExistingSoloGuests();

    console.log("Testing party creation validation...");
    await testCreatePartyValidation();

    console.log("Testing party edit rename and recipient change...");
    await testEditPartyRenamesAndChangesRecipient();

    console.log("Testing party edit guest removal semantics...");
    await testEditPartyRemovesGuestToFreshSoloParty();

    console.log("Testing party edit sent recipient removal transfer...");
    await testEditPartyRemovesSentRecipientTransfersOriginalParty();

    console.log("Testing party edit unsent recipient removal...");
    await testEditPartyRemovesUnsentRecipientToFreshSoloParty();

    console.log("Testing party edit invalid sent-state cleanup...");
    await testEditPartyClearsInvalidSentState();

    console.log("Testing party edit adding a solo guest...");
    await testEditPartyAddsSoloGuestAndDeletesOldSoloParty();

    console.log("Testing party edit validation...");
    await testEditPartyValidation();

    console.log("Party DB behavior checks passed.");
  } finally {
    await cleanup();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
