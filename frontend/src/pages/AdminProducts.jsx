import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { useProductsAdmin } from '../context/ProductsContext.jsx';
import { categories } from '../i18n/translations.js';
import { subcategories } from '../data/subcategories.js';

function EditRow({ product, onSaved, token }) {
  const [price, setPrice] = useState(product.price);
  const [oldPrice, setOldPrice] = useState(product.old);
  const [discount, setDiscount] = useState(product.discount);
  const [inStock, setInStock] = useState(product.inStock);
  const [saving, setSaving] = useState(false);

  const isCustom = product.isCustom;
  const realId = isCustom ? product.id.replace('custom-', '') : product.id;
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const save = async () => {
    setSaving(true);
    try {
      if (isCustom) {
        await fetch(`/api/products/custom/${realId}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            name: product.name, cat: product.cat, subcat: product.subcat,
            description: product.description, image: product.image, has_real_photo: product.hasRealPhoto,
            price, old_price: oldPrice, discount, in_stock: inStock, specs: product.specs,
          }),
        });
      } else {
        await fetch(`/api/products/overrides/${realId}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ price, old_price: oldPrice, discount, in_stock: inStock }),
        });
      }
      onSaved();
    } catch (err) {
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!isCustom) return;
    if (!confirm(`Supprimer "${product.name}" définitivement ?`)) return;
    await fetch(`/api/products/custom/${realId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    onSaved();
  };

  return (
    <tr className={`border-t border-ink/10 ${!inStock ? 'bg-red-50/40' : ''}`}>
      <td className="py-2 px-3 text-sm max-w-[220px] truncate" title={product.name}>
        {!inStock && <span className="mr-1.5">⚠️</span>}
        {product.name} {isCustom && <span className="text-[10px] bg-gold/30 text-ink px-1.5 py-0.5 rounded ml-1">créé</span>}
      </td>
      <td className="py-2 px-3">
        <input type="number" value={oldPrice} onChange={(e) => setOldPrice(Number(e.target.value))} className="w-20 px-2 py-1 border border-ink/15 rounded text-sm" />
      </td>
      <td className="py-2 px-3">
        <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-20 px-2 py-1 border border-ink/15 rounded text-sm" />
      </td>
      <td className="py-2 px-3">
        <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-16 px-2 py-1 border border-ink/15 rounded text-sm" />%
      </td>
      <td className="py-2 px-3">
        <label className="flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-teal" />
          {inStock ? 'Disponible' : 'Rupture'}
        </label>
      </td>
      <td className="py-2 px-3 flex gap-1.5">
        <button onClick={save} disabled={saving} className="px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded hover:bg-tealLight transition disabled:opacity-50">
          {saving ? '...' : 'Enregistrer'}
        </button>
        {isCustom && (
          <button onClick={remove} className="px-3 py-1.5 border border-red-300 text-red-500 text-xs font-semibold rounded hover:bg-red-50 transition">
            Suppr.
          </button>
        )}
      </td>
    </tr>
  );
}

function AddProductForm({ onAdded, token }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', cat: categories[0]?.value || '', subcat: '', description: '',
    price: '', old_price: '', discount: 0, in_stock: true,
  });
  const [imagePath, setImagePath] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const catSubcats = subcategories.filter((s) => s.cat === form.cat);

  const update = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => {
      if (key === 'cat') return { ...f, cat: val, subcat: '' };
      return { ...f, [key]: val };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'envoi de l'image.");
      setImagePath(data.path);
    } catch (err) {
      setError(err.message);
      setImagePath('');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      setError('Nom et prix sont obligatoires.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/products/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          old_price: Number(form.old_price || form.price),
          discount: Number(form.discount),
          image: imagePath,
          has_real_photo: !!imagePath,
          specs: [],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Impossible d'ajouter le produit.");
      }
      setForm({ name: '', cat: categories[0]?.value || '', subcat: '', description: '', price: '', old_price: '', discount: 0, in_stock: true });
      setImagePath('');
      setImagePreview('');
      setOpen(false);
      onAdded();
    } catch (err) {
      setError(err.message || "Impossible d'ajouter le produit.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 px-5 py-2.5 bg-teal text-white text-sm font-semibold rounded hover:bg-tealLight transition"
      >
        + Ajouter un nouveau produit
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-ink/10 rounded-lg p-5 mb-8">
      <h3 className="text-sm font-bold mb-4">Nouveau produit</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold mb-1">Nom *</label>
          <input value={form.name} onChange={update('name')} className="w-full px-3 py-2 border border-ink/15 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Catégorie *</label>
          <select value={form.cat} onChange={update('cat')} className="w-full px-3 py-2 border border-ink/15 rounded text-sm bg-white">
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.fr}</option>
            ))}
          </select>
        </div>

        {catSubcats.length > 0 && (
          <div className="col-span-2">
            <label className="block text-xs font-semibold mb-1">Sous-catégorie</label>
            <select value={form.subcat} onChange={update('subcat')} className="w-full px-3 py-2 border border-ink/15 rounded text-sm bg-white">
              <option value="">— Aucune —</option>
              {catSubcats.map((s) => (
                <option key={s.value} value={s.value}>{s.fr}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold mb-1">Prix actuel (د.ت) *</label>
          <input type="number" value={form.price} onChange={update('price')} className="w-full px-3 py-2 border border-ink/15 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Prix barré (د.ت)</label>
          <input type="number" value={form.old_price} onChange={update('old_price')} placeholder="= prix actuel si vide" className="w-full px-3 py-2 border border-ink/15 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Remise (%)</label>
          <input type="number" value={form.discount} onChange={update('discount')} className="w-full px-3 py-2 border border-ink/15 rounded text-sm" />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Photo du produit</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs" />
          {uploading && <p className="text-xs text-ink/50 mt-1">Envoi en cours...</p>}
          {imagePreview && (
            <img src={imagePreview} alt="Aperçu" className="w-16 h-16 object-cover rounded mt-2 border border-ink/10" />
          )}
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1">Description</label>
        <textarea value={form.description} onChange={update('description')} rows={2} className="w-full px-3 py-2 border border-ink/15 rounded text-sm resize-none" />
      </div>
      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving || uploading} className="px-5 py-2 bg-teal text-white text-sm font-semibold rounded hover:bg-tealLight transition disabled:opacity-50">
          {saving ? 'Ajout...' : 'Ajouter le produit'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-5 py-2 border border-ink/15 text-sm font-semibold rounded hover:border-teal transition">
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function AdminProducts() {
  const { token } = useAdmin();
  const { products, loading, refresh } = useProductsAdmin();
  const [search, setSearch] = useState('');
  const [onlyOutOfStock, setOnlyOutOfStock] = useState(false);

  const outOfStockCount = products.filter((p) => !p.inStock).length;

  let filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (onlyOutOfStock) {
    filtered = filtered.filter((p) => !p.inStock);
  } else {
    // Regroupe les ruptures de stock en premier, pour une vue d'ensemble rapide
    filtered = [...filtered].sort((a, b) => Number(a.inStock) - Number(b.inStock));
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-2">Gestion des produits</h1>
      <p className="text-sm text-ink/60 mb-6">
        Modifie les prix, remises et le stock des produits existants, ou ajoute de nouveaux articles.
      </p>

      <AddProductForm onAdded={refresh} token={token} />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full max-w-sm px-4 py-2.5 border border-ink/15 rounded-full text-sm"
        />
        <button
          onClick={() => setOnlyOutOfStock((v) => !v)}
          className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
            onlyOutOfStock
              ? 'bg-red-500 text-white border-red-500'
              : 'border-ink/15 text-ink/70 hover:border-red-300'
          }`}
        >
          ⚠️ Ruptures de stock ({outOfStockCount})
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Chargement...</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-ink/10 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-mineral2 text-left text-xs font-semibold text-ink/60 uppercase tracking-wide">
                <th className="py-2.5 px-3">Produit</th>
                <th className="py-2.5 px-3">Prix barré</th>
                <th className="py-2.5 px-3">Prix</th>
                <th className="py-2.5 px-3">Remise</th>
                <th className="py-2.5 px-3">Stock</th>
                <th className="py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((p) => (
                <EditRow key={p.id} product={p} onSaved={refresh} token={token} />
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-sm text-ink/40 p-6 text-center">Aucun produit en rupture de stock. 🎉</p>
          )}
          {filtered.length > 200 && (
            <p className="text-xs text-ink/40 p-3">Affinez la recherche — {filtered.length} résultats, 200 affichés.</p>
          )}
        </div>
      )}
    </div>
  );
}
