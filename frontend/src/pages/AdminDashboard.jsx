import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext.jsx';

const sections = [
  { to: '/admin/produits', icon: '📦', title: 'Produits', desc: 'Prix, remises, stock, ajouter des articles' },
  { to: '/admin/commandes', icon: '🧾', title: 'Commandes', desc: 'Voir toutes les commandes reçues' },
  { to: '/admin/rappels', icon: '🔔', title: 'Rappels filtres', desc: 'Clients à recontacter sur WhatsApp' },
  { to: '/admin/avis', icon: '⭐', title: 'Avis clients', desc: 'Modérer les avis avant publication' },
  { to: '/admin/messages', icon: '📩', title: 'Messages', desc: 'Messages reçus via le formulaire de contact' },
];

export default function AdminDashboard() {
  const { logout } = useAdmin();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <button
          onClick={logout}
          className="text-sm text-ink/50 hover:text-red-500 transition"
        >
          Se déconnecter
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="bg-white border border-ink/10 rounded-lg p-6 hover:shadow-lg hover:-translate-y-0.5 transition"
          >
            <div className="text-3xl mb-3">{s.icon}</div>
            <div className="font-bold mb-1">{s.title}</div>
            <div className="text-xs text-ink/60">{s.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}