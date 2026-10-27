import { NextResponse } from 'next/server';
import { shoppingLists } from '../data';

export async function POST(request) {
  const { code, itemId, memberName } = await request.json();
  const list = shoppingLists[code];
  if (!list) return NextResponse.json({ error: 'Liste nicht gefunden' }, { status: 404 });
  if (!list.members.includes(memberName)) {
    return NextResponse.json({ error: 'Bitte ein Mitglied der Liste auswählen' }, { status: 403 });
  }
  const item = list.items.find((entry) => entry.id === itemId);
  if (!item) return NextResponse.json({ error: 'Artikel nicht gefunden' }, { status: 404 });
  if (item.completed || (item.reservedBy && item.reservedBy !== memberName)) {
    return NextResponse.json({ error: 'Artikel ist bereits vergeben oder gekauft' }, { status: 409 });
  }
  item.reservedBy = memberName;
  return NextResponse.json({ item });
}
