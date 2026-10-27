import { NextResponse } from 'next/server';
import { shoppingLists } from '../data';

export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Ungültiges JSON' }, { status: 400 }); }
  const { code, itemId, memberName, action } = body || {};
  const fail = (error, status) => NextResponse.json({ error }, { status });
  if (typeof code !== 'string' || !code.trim() || !Number.isSafeInteger(itemId) ||
      typeof memberName !== 'string' || !memberName.trim() ||
      !['reserve', 'release'].includes(action)) {
    return fail('Code, Artikel, Mitglied und gültige Aktion sind erforderlich', 400);
  }
  const list = Object.hasOwn(shoppingLists, code) ? shoppingLists[code] : null;
  if (!list) return fail('Liste nicht gefunden', 404);
  const item = list.items.find((entry) => entry.id === itemId);
  if (!item) return fail('Artikel nicht gefunden', 404);
  if (!list.members.includes(memberName)) return fail('Mitglied gehört nicht zur Liste', 403);

  // Ohne await zwischen Prüfung und Mutation: exklusiv im bestehenden Einzelprozess-Speicher.
  if (action === 'reserve') {
    if (item.completed) return fail('Gekaufte Artikel können nicht reserviert werden', 409);
    if (item.reservedBy !== null && item.reservedBy !== memberName) {
      return fail('Artikel wurde bereits von einem anderen Mitglied reserviert', 409);
    }
    item.reservedBy = memberName;
  } else {
    if (item.reservedBy !== memberName) return fail('Nur eigene Reservierungen können freigegeben werden', 409);
    item.reservedBy = null;
  }
  return NextResponse.json({ item });
}
