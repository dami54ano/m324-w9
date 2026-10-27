'use client'
import { useRef, useState } from 'react';

export default function ShoppingList() {
  const [code, setCode] = useState('');
  const [loadedCode, setLoadedCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberName, setMemberName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const version = useRef(0);

  const changeCode = (value) => {
    version.current += 1;
    setCode(value);
    setLoadedCode('');
    setItems([]);
    setMembers([]);
    setMemberName('');
    setError('');
    setMessage('');
    setBusy(false);
  };

  const fetchList = async (listCode) => {
    const response = await fetch(`/api/items?code=${encodeURIComponent(listCode)}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error('Liste nicht gefunden');
    return data;
  };

  const loadList = async () => {
    const current = ++version.current;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const data = await fetchList(code);
      if (current !== version.current) return;
      setItems(data.items);
      setMembers(data.members);
      setMemberName((selected) => data.members.includes(selected) ? selected : '');
      setLoadedCode(code);
    } catch (failure) {
      if (current !== version.current) return;
      setItems([]);
      setMembers([]);
      setMemberName('');
      setLoadedCode('');
      setError(failure instanceof TypeError ? 'Verbindung fehlgeschlagen. Bitte erneut laden.' : failure.message);
    } finally {
      if (current === version.current) setBusy(false);
    }
  };

  const mutate = async (url, payload, successMessage) => {
    const current = ++version.current;
    const listCode = loadedCode;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: listCode, ...payload })
      });
      const result = await response.json();
      if (current !== version.current) return;
      if (!response.ok) {
        if (response.status === 409) {
          const data = await fetchList(listCode);
          if (current !== version.current) return;
          setItems(data.items);
        }
        throw new Error(result.error || 'Aktion fehlgeschlagen');
      }
      const data = await fetchList(listCode);
      if (current !== version.current) return;
      setItems(data.items);
      setMembers(data.members);
      setMessage(successMessage);
      if (url === '/api/addItem') setItemName('');
    } catch (failure) {
      if (current === version.current) {
        setError(failure instanceof TypeError ? 'Verbindung fehlgeschlagen. Bitte Liste neu laden und erneut versuchen.' : failure.message);
      }
    } finally {
      if (current === version.current) setBusy(false);
    }
  };

  return (
    <div>
      <h1>Einkaufsliste</h1>
      <input aria-label="Code" placeholder="Code" value={code} onChange={(event) => changeCode(event.target.value)} />
      <button disabled={busy || !code.trim()} onClick={loadList}>Laden</button>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {busy && <p role="status">Wird verarbeitet …</p>}
      {loadedCode && <>
        <label>Mitglied
          <select value={memberName} disabled={busy} onChange={(event) => setMemberName(event.target.value)}>
            <option value="">Bitte auswählen</option>
            {members.map((member) => <option key={member} value={member}>{member}</option>)}
          </select>
        </label>
        <table>
          <thead><tr><th>Artikel</th><th>Status</th><th>Reserviert von</th><th>Aktion</th></tr></thead>
          <tbody>{items.map((item) => <tr key={item.id}>
            <td>{item.name}</td><td>{item.completed ? 'gekauft' : 'offen'}</td><td>{item.reservedBy || 'frei'}</td>
            <td>{item.reservedBy === memberName && memberName
              ? <button disabled={busy} onClick={() => mutate('/api/reserveItem', { itemId: item.id, memberName, action: 'release' }, 'Reservierung freigegeben')}>Freigeben</button>
              : <button disabled={busy || !memberName || item.completed || item.reservedBy !== null} onClick={() => mutate('/api/reserveItem', { itemId: item.id, memberName, action: 'reserve' }, 'Artikel reserviert')}>Reservieren</button>}
            </td>
          </tr>)}</tbody>
        </table>
        <h2>Artikel hinzufügen</h2>
        <input aria-label="Artikelname" placeholder="Artikelname" value={itemName} onChange={(event) => setItemName(event.target.value)} />
        <button disabled={busy || !itemName.trim()} onClick={() => mutate('/api/addItem', { itemName }, 'Artikel hinzugefügt!')}>Hinzufügen</button>
      </>}
    </div>
  );
}
