import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateSession } from "@/lib/auth";
import { serializeGuest } from "@/lib/serializers";
import { sql } from "drizzle-orm";

type CreatedGuestRow = {
  guestId: number;
  partyId: number;
  guestToken: string;
  name: string | null;
  email: string | null;
  usedAt: Date | string | null;
  sentAt: Date | string | null;
  guestCreatedAt: Date | string;
  displayName: string;
  saveTheDateRecipientGuestId: number | null;
  saveTheDateToken: string;
  saveTheDateSentAt: Date | string | null;
  partyCreatedAt: Date | string;
};

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function toNullableDate(value: Date | string | null): Date | null {
  return value === null ? null : toDate(value);
}

export async function POST(request: NextRequest) {
  if (!validateSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email } = await request.json();

  const guestName = String(name ?? "").trim();
  const guestEmail = String(email ?? "").trim() || null;

  if (!guestName) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 },
    );
  }

  if (guestName.length > 200) {
    return NextResponse.json({ error: "Name exceeds 200 characters" }, { status: 400 });
  }

  if (guestEmail !== null && guestEmail.length > 320) {
    return NextResponse.json({ error: "Email exceeds 320 characters" }, { status: 400 });
  }

  const saveTheDateToken = crypto.randomUUID();
  const guestToken = crypto.randomUUID();

  try {
    const result = await db.execute<CreatedGuestRow>(sql`
      WITH ids AS (
        SELECT
          nextval(pg_get_serial_sequence('parties', 'id'))::integer AS party_id,
          nextval(pg_get_serial_sequence('guests', 'id'))::integer AS guest_id
      ),
      inserted_party AS (
        INSERT INTO parties (
          id,
          display_name,
          save_the_date_recipient_guest_id,
          save_the_date_token
        )
        SELECT
          ids.party_id,
          ${guestName},
          CASE
            WHEN ${guestEmail}::text IS NULL THEN NULL
            ELSE ids.guest_id
          END,
          ${saveTheDateToken}
        FROM ids
        RETURNING
          id,
          display_name,
          save_the_date_recipient_guest_id,
          save_the_date_token,
          save_the_date_sent_at,
          created_at
      ),
      inserted_guest AS (
        INSERT INTO guests (id, party_id, name, email, token)
        SELECT ids.guest_id, ids.party_id, ${guestName}, ${guestEmail}, ${guestToken}
        FROM ids
        RETURNING
          id,
          party_id,
          token,
          name,
          email,
          used_at,
          sent_at,
          created_at
      )
      SELECT
        inserted_guest.id AS "guestId",
        inserted_guest.party_id AS "partyId",
        inserted_guest.token AS "guestToken",
        inserted_guest.name,
        inserted_guest.email,
        inserted_guest.used_at AS "usedAt",
        inserted_guest.sent_at AS "sentAt",
        inserted_guest.created_at AS "guestCreatedAt",
        inserted_party.display_name AS "displayName",
        inserted_party.save_the_date_recipient_guest_id AS "saveTheDateRecipientGuestId",
        inserted_party.save_the_date_token AS "saveTheDateToken",
        inserted_party.save_the_date_sent_at AS "saveTheDateSentAt",
        inserted_party.created_at AS "partyCreatedAt"
      FROM inserted_guest
      INNER JOIN inserted_party ON inserted_party.id = inserted_guest.party_id
    `);

    const created = result.rows[0];

    if (!created) {
      throw new Error("Create guest statement returned no rows");
    }

    return NextResponse.json({
      guest: serializeGuest({
        id: created.guestId,
        partyId: created.partyId,
        token: created.guestToken,
        name: created.name,
        email: created.email,
        usedAt: toNullableDate(created.usedAt),
        sentAt: toNullableDate(created.sentAt),
        createdAt: toDate(created.guestCreatedAt),
        party: {
          id: created.partyId,
          displayName: created.displayName,
          saveTheDateRecipientGuestId: created.saveTheDateRecipientGuestId,
          saveTheDateToken: created.saveTheDateToken,
          saveTheDateSentAt: toNullableDate(created.saveTheDateSentAt),
          createdAt: toDate(created.partyCreatedAt),
        },
        rsvp: null,
      }),
    });
  } catch (err) {
    console.error("Failed to create party:", err);
    return NextResponse.json({ error: "Failed to create party" }, { status: 500 });
  }
}
