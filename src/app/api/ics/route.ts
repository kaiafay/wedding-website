export async function GET() {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kaia & Richard Wedding//EN",
    "BEGIN:VEVENT",
    "DTSTART:20270710T210000Z",
    "DTEND:20270711T020000Z",
    "SUMMARY:Kaia & Richard's Wedding",
    "LOCATION:Bellingham\\, Washington",
    "DESCRIPTION:Ceremony at 2pm. Formal address to follow.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kaia-richard-wedding.ics"',
    },
  });
}
