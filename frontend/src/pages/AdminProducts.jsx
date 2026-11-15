import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext.jsx';
import { useProductsAdmin } from '../context/ProductsContext.jsx';
import { categories } from '../i18n/translations.js';
import { subcategories } from '../data/subcategories.js';
import { Icon } from '../components/AdminShell.jsx';

function EditRow({ product, onSaved, token }) {
  const [price, setPrice] = useState(product.price);
  const [oldPrice, setOldPrice] = useState(product.old);
  const [discount, setDiscount] = useState(product.discount);
  const [inStock, setInStock] = useState(product.inStock);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isCustom = product.isCustom;
  const realId = isCustom ? product.id.replace('custom-', '') : product.id;
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const save = async () => {
    setSaving(true);
    try {
      let res;
      if (isCustom) {
        res = await fetch(`/api/products/custom/${realId}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            name: product.name, cat: product.cat, subcat: product.subcat,
            description: product.description, image: product.image, has_real_photo: product.hasRealPhoto,
            price, old_price: oldPrice, discount, in_stock: inStock, specs: product.specs,
          }),
        });
      } else {
        res = await fetch(`/api/products/overrides/${realId}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ price, old_price: oldPrice, discount, in_stock: inStock }),
        });
      }
      if (res.status === 401) {
        alert('Votre session a expiré. Reconnectez-vous, puis réessayez.');
        return;
      }
      if (!res.ok) {
        alert('Le produit n\'a pas pu être enregistré (code ' + res.status + ').');
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      onSaved();
    } catch (err) {
      alert('Le serveur ne répond pas. Réessayez dans un instant.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!isCustom) return;
    if (!confirm(`Supprimer « ${product.name} » définitivement ?`)) return;
    const res = await fetch(`/api/products/custom/${realId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      alert(res.status === 401 ? 'Votre session a expiré. Reconnectez-vous.' : 'Suppression impossible (code ' + res.status + ').');
      return;
    }
    onSaved();
  };

  return (
    <tr className={!inStock ? 'out' : ''}>
      <td className="adm-pname" title={product.name}>
        {product.name}{isCustom && <small>ajouté</small>}
      </td>
      <td><input type="number" className="adm-cell-input" value={oldPrice} onChange={(e) => setOldPrice(Number(e.target.value))} aria-label="Prix barré" /></td>
      <td><input type="number" className="adm-cell-input" value={price} onChange={(e) => setPrice(Number(e.target.value))} aria-label="Prix" /></td>
      <td><input type="number" className="adm-cell-input narrow" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} aria-label="Remise en pourcentage" /> %</td>
      <td>
        <label className="adm-switch">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          <i />
          {inStock ? 'Disponible' : 'Rupture'}
        </label>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={save} disabled={saving} className={`adm-btn adm-btn--sm ${saved ? 'adm-btn--ok' : 'adm-btn--primary'}`}>
            {saving ? 'Envoi…' : saved ? 'Enregistré' : 'Enregistrer'}
          </button>
          {isCustom && <button onClick={remove} className="adm-btn adm-btn--sm adm-btn--danger">Supprimer</button>}
        </div>
      </td>
    </tr>
  );
}

function AddProductForm({ onAdded, token, onClose }) {
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
    setForm((f) => (key === 'cat' ? { ...f, cat: val, subcat: '' } : { ...f, [key]: val }));
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
      if (!res.ok) throw new Error(data.error || "La photo n'a pas pu être envoyée.");
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
      setError('Le nom et le prix sont obligatoires.');
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
        throw new Error(data.error || "Le produit n'a pas pu être ajouté.");
      }
      onAdded();
      onClose();
    } catch (err) {
      setError(err.message || "Le produit n'a pas pu être ajouté.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="adm-panel adm-form">
      <h2 className="adm-h2">Nouveau produit</h2>
      <div className="adm-form__grid">
        <div className="adm-field full">
          <label>Nom *</label>
          <input className="adm-input" value={form.name} onChange={update('name')} />
        </div>
        <div className="adm-field">
          <label>Catégorie *</label>
          <select className="adm-input" value={form.cat} onChange={update('cat')}>
            {categories.map((c) => <option key={c.value} value={c.value}>{c.fr}</option>)}
          </select>
        </div>
        {catSubcats.length > 0 ? (
          <div className="adm-field">
            <label>Sous-catégorie</label>
            <select className="adm-input" value={form.subcat} onChange={update('subcat')}>
              <option value="">Aucune</option>
              {catSubcats.map((s) => <option key={s.value} value={s.value}>{s.fr}</option>)}
            </select>
          </div>
        ) : <div />}
        <div className="adm-field">
          <label>Prix actuel (د.ت) *</label>
          <input type="number" className="adm-input" value={form.price} onChange={update('price')} />
        </div>
        <div className="adm-field">
          <label>Prix barré (د.ت)</label>
          <input type="number" className="adm-input" value={form.old_price} onChange={update('old_price')} placeholder="Identique au prix actuel si vide" />
        </div>
        <div className="adm-field">
          <label>Remise (%)</label>
          <input type="number" className="adm-input" value={form.discount} onChange={update('discount')} />
        </div>
        <div className="adm-field">
          <label>Photo du produit</label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: 13 }} />
          {uploading && <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '6px 0 0' }}>Envoi de la photo…</p>}
          {imagePreview && <img src={imagePreview} alt="Aperçu" className="adm-preview" />}
        </div>
        <div className="adm-field full">
          <label>Description</label>
          <textarea className="adm-input" rows={3} value={form.description} onChange={update('description')} />
        </div>
      </div>

      {error && <div className="adm-error" role="alert" style={{ marginTop: 14 }}><Icon name="alert" size={18} /> <span>{error}</span></div>}

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button type="submit" disabled={saving || uploading} className="adm-btn adm-btn--primary">
          {saving ? 'Ajout…' : 'Ajouter le produit'}
        </button>
        <button type="button" onClick={onClose} className="adm-btn adm-btn--ghost">Annuler</button>
      </div>
    </form>
  );
}

export default function AdminProducts() {
  const { token } = useAdmin();
  const { products, loading, refresh } = useProductsAdmin();
  const [search, setSearch] = useState('');
  const [onlyOut, setOnlyOut] = useState(false);
  const [adding, setAdding] = useState(false);

  const outCount = products.filter((p) => p.inStock === false).length;

  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !onlyOut || p.inStock === false)
    .sort((a, b) => (a.inStock === false ? 0 : 1) - (b.inStock === false ? 0 : 1));

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="adm-title">Produits</h1>
          <p className="adm-sub">Modifiez les prix, les remises et la disponibilité. Chaque ligne s'enregistre séparément.</p>
        </div>
        {!adding && (
          <button className="adm-btn adm-btn--primary" onClick={() => setAdding(true)}>
            <Icon name="plus" size={16} /> Ajouter un produit
          </button>
        )}
      </div>

      {adding && <AddProductForm onAdded={refresh} token={token} onClose={() => setAdding(false)} />}

      <div className="adm-toolbar">
        <div className="adm-searchbox">
          <Icon name="search" size={16} />
          <input className="adm-input" placeholder="Rechercher un produit" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button
          onClick={() => setOnlyOut((v) => !v)}
          className={`adm-btn ${onlyOut ? 'adm-btn--solid-danger' : 'adm-btn--danger'}`}
          aria-pressed={onlyOut}
        >
          <Icon name="alert" size={16} /> Ruptures de stock ({outCount})
        </button>
      </div>

      {loading ? (
        <p className="adm-loading">Chargement du catalogue…</p>
      ) : filtered.length === 0 ? (
        <div className="adm-empty">
          <b>Aucun produit trouvé</b>
          {onlyOut ? 'Aucun produit n\'est en rupture de stock.' : 'Essayez un autre mot-clé.'}
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Produit</th><th>Prix barré</th><th>Prix</th><th>Remise</th><th>Stock</th><th />
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((p) => (
                <EditRow key={p.id} product={p} onSaved={refresh} token={token} />
              ))}
            </tbody>
          </table>
          {filtered.length > 200 && (
            <p style={{ padding: 14, fontSize: 13, color: 'var(--muted)', margin: 0 }}>
              {filtered.length} résultats, 200 affichés. Affinez la recherche pour voir les autres.
            </p>
          )}
        </div>
      )}
    </>
  );
}
