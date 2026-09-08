import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';

export default function AdminMessages() {
  const { token } = useAdmin();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/contact', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const markRead = async (id) => {
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, read: true } : m)));
    await fetch(`/api/contact/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const unread = messages.filter((m) => !m.read);
  const read = messages.filter((m) => m.read);

  const MessageCard = ({ m }) => (
    <div className={`bg-white border rounded-lg p-4 ${m.read ? 'border-ink/5 opacity-60' : 'border-ink/10'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">{m.name} — {m.phone}</div>
        <div className="text-xs text-ink/40">{new Date(m.created_at).toLocaleString('fr-FR')}</div>
      </div>
      <p className="text-sm text-ink/70 whitespace-pre-wrap mb-3">{m.message}</p>
      {!m.read && (
        <button
          onClick={() => markRead(m.id)}
          className="px-4 py-1.5 border border-ink/15 text-xs font-semibold rounded hover:border-teal transition"
        >
          Marquer comme lu
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-6">Messages de contact</h1>

      {loading && <p className="text-sm text-ink/50">Chargement...</p>}

      {!loading && messages.length === 0 && (
        <div className="bg-mineral2 rounded-lg p-8 text-center text-sm text-ink/50">
          Aucun message pour l'instant.
        </div>
      )}

      {!loading && unread.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-ink/70 uppercase tracking-wide mb-3">
            Non lus ({unread.length})
          </h2>
          <div className="space-y-3 mb-8">
            {unread.map((m) => <MessageCard key={m.id} m={m} />)}
          </div>
        </>
      )}

      {!loading && read.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-ink/50 uppercase tracking-wide mb-3">
            Lus ({read.length})
          </h2>
          <div className="space-y-3">
            {read.map((m) => <MessageCard key={m.id} m={m} />)}
          </div>
        </>
      )}
    </div>
  );
}