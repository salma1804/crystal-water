import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, useAdminStats, timeAgo } from '../components/AdminShell.jsx';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function plural(n, one, many) {
  return n > 1 ? many : one;
}

export default function AdminDashboard() {
  const { loading, orders, pendingOrders, outOfStock, reminders, messages, reviews } = useAdminStats();

  const pending = orders.filter((o) => !o.delivered);
  const oldest = pending.length
    ? pending.reduce((a, b) => (new Date(a.created_at) < new Date(b.created_at) ? a : b))
    : null;

  const todo = [
    {
      to: '/admin/commandes',
      n: pendingOrders,
      title: pendingOrders ? `${pendingOrders} ${plural(pendingOrders, 'commande à livrer', 'commandes à livrer')}` : 'Aucune commande à livrer',
      note: oldest ? `La plus ancienne a été passée ${timeAgo(oldest.created_at)}.` : 'Tout est livré.',
      alert: false,
    },
    {
      to: '/admin/produits',
      n: outOfStock,
      title: outOfStock ? `${outOfStock} ${plural(outOfStock, 'produit en rupture', 'produits en rupture')}` : 'Aucune rupture de stock',
      note: outOfStock ? 'Réapprovisionnez ou masquez-les depuis la liste des produits.' : 'Le catalogue est entièrement disponible.',
      alert: outOfStock > 0,
    },
    {
      to: '/admin/rappels',
      n: reminders,
      title: reminders ? `${reminders} ${plural(reminders, 'rappel de filtres à envoyer', 'rappels de filtres à envoyer')}` : 'Aucun rappel à envoyer',
      note: reminders ? 'Ces clients sont prêts à changer leurs cartouches.' : 'Aucun client à relancer pour le moment.',
    },
    {
      to: '/admin/messages',
      n: messages,
      title: messages ? `${messages} ${plural(messages, 'message non lu', 'messages non lus')}` : 'Aucun message non lu',
      note: messages ? 'Des clients vous ont écrit depuis le formulaire de contact.' : 'Votre boîte est à jour.',
    },
    {
      to: '/admin/avis',
      n: reviews,
      title: reviews ? `${reviews} ${plural(reviews, 'avis à modérer', 'avis à modérer')}` : 'Aucun avis à modérer',
      note: reviews ? 'Approuvez-les pour les publier sur le site.' : 'Tous les avis sont traités.',
    },
  ];

  const recent = orders.slice(0, 5);
  const rawToday = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const today = rawToday.charAt(0).toUpperCase() + rawToday.slice(1);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="adm-title">{greeting()}.</h1>
          <p className="adm-sub">{today}</p>
        </div>
      </div>

      <h2 className="adm-h2">À traiter</h2>
      <div className="adm-panel adm-todo" style={{ marginBottom: 32 }}>
        {todo.map((t) => (
          <Link key={t.to} to={t.to}>
            <span className={`adm-todo__n ${!t.n ? 'zero' : ''} ${t.alert ? 'alert' : ''}`}>
              {loading && t.n == null ? '·' : t.n ?? '–'}
            </span>
            <span>
              <b>{t.title}</b>
              <small>{t.note}</small>
            </span>
            <span className="go"><Icon name="arrow" size={18} /></span>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 className="adm-h2">Dernières commandes</h2>
        <Link to="/admin/commandes" className="adm-linkbtn" style={{ fontSize: 13.5 }}>Voir toutes</Link>
      </div>
      {recent.length === 0 ? (
        <div className="adm-empty">
          <b>Pas encore de commande</b>
          Les commandes passées sur le site apparaîtront ici.
        </div>
      ) : (
        <div className="adm-panel">
          {recent.map((o) => (
            <div key={o.id} className="adm-recent">
              <div className="adm-recent__who">
                <b>{o.customer_name}</b>
                <small>{o.city || 'Ville non précisée'} · {timeAgo(o.created_at)}</small>
              </div>
              <span className="adm-num" style={{ fontWeight: 600 }}>{o.total} د.ت</span>
              <span className={`adm-chip ${o.delivered ? 'adm-chip--kelp' : 'adm-chip--amber'}`}>
                {o.delivered ? 'Livrée' : 'À livrer'}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
