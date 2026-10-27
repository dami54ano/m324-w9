'use client'
import { useState } from 'react';

export default function AddItem() {
  const [code, setCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [added, setAdded] = useState(false);
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [members, setMembers] = useState([])
  const [memberName, setMemberName] = useState('')
  const [reserving, setReserving] = useState(false)

  const reserveItem = async (itemId) => {
    setReserving(true)
    try {
      const response = await fetch('/api/reserveItem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, itemId, memberName })
      })
      const data = await response.json()
      if (!response.ok) setError(data.error)
      else await loadList()
    } catch {
      setError('Reservierung fehlgeschlagen. Bitte erneut versuchen.')
    } finally {
      setReserving(false)
    }
  }

  const loadList = async () => {
    const response = await fetch(`/api/items?code=${encodeURIComponent(code)}`)
    if (response.ok) {
      const data = await response.json()
      setItems(data.items)
      setMembers(data.members)
      setError('')
    } else {
      setItems([])
      setError('Liste nicht gefunden')
    }
  }

  const addItem = async () => {
    const response = await fetch('/api/addItem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, itemName })
    });
    if (response.ok) {
      setAdded(true);
      setItemName(''); // Eingabefeld leeren
      loadList()
    } else {
      setAdded(false)
      setError('Liste nicht gefunden')
    }
  };

  return (
    <div>
      <h1>Einkaufsliste</h1>
      <input
        type="text"
        placeholder="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={loadList}>Laden</button>
      <label>
        Mitglied
        <select value={memberName} onChange={(e) => setMemberName(e.target.value)}>
          <option value="">Bitte auswählen</option>
          {members.map((member) => <option key={member} value={member}>{member}</option>)}
        </select>
      </label>
      {error && <p role="alert">{error}</p>}

      {items.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Artikel</th>
              <th>Status</th>
              <th>Reserviert von</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.completed ? 'gekauft' : 'offen'}</td>
                <td>{item.reservedBy || 'frei'}</td>
                <td><button disabled={!memberName || reserving || item.completed || !!item.reservedBy} onClick={() => reserveItem(item.id)}>Reservieren</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Artikel hinzufügen</h2>
      <input
        type="text"
        placeholder="Artikelname"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
      />
      <button onClick={addItem}>Hinzufügen</button>
      {added && <p>Artikel hinzugefügt!</p>}
    </div>
  )
}
