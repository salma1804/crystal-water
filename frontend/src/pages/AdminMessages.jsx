import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { useAdminStats, timeAgo } from '../components/AdminShell.jsx';

export default function AdminMessages() {
  const { token } = useAdmin();
  const { refresh } = useAdminStats();
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
    refresh();
  };

  const unread = messages.filter((m) => !m.read);
  const read = messages.filter((m) => m.read);

  const MessageCard = ({ m }) => (
    <div className={`adm-card ${m.read ? 'dim' : ''}`}>
      <div className="adm-card__top">
        <span className="adm-card__name">{m.name}</span>
        <span className="adm-card__meta" title={new Date(m.created_at).toLocaleString('fr-FR')}>{timeAgo(m.created_at)}</span>
      </div>
      <p style={{ margin: '0 0 6px', color: 'var(--tide)' }} className="adm-num"><a href={`tel:${m.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{m.phone}</a></p>
      <p>{m.message}</p>
      {!m.read && (
        <div className="adm-card__actions">
          <button onClick={() => markRead(m.id)} className="adm-btn adm-btn--ghost">Marquer comme lu</button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="adm-title">Messages</h1>
          <p className="adm-sub">Messages envoyés depuis le formulaire de contact du site.</p>
        </div>
      </div>

      {loading && <p className="adm-loading">Chargement des messages…</p>}

      {!loading && messages.length === 0 && (
        <div className="adm-empty"><b>Aucun message pour l'instant</b>Les messages des clients apparaîtront ici.</div>
      )}

      {!loading && unread.length > 0 && (
        <>
          <div className="adm-section-label">Non lus <span className="adm-chip adm-chip--amber">{unread.length}</span></div>
          <div className="adm-list">{unread.map((m) => <MessageCard key={m.id} m={m} />)}</div>
        </>
      )}

      {!loading && read.length > 0 && (
        <>
          <div className="adm-section-label">Lus <span className="adm-chip adm-chip--mute">{read.length}</span></div>
          <div className="adm-list">{read.map((m) => <MessageCard key={m.id} m={m} />)}</div>
        </>
      )}
    </>
  );
}
