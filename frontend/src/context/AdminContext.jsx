import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext(null);
const TOKEN_KEY = 'crystalwater_admin_token';

export function AdminProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [checked, setChecked] = useState(false);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!token) {
      setChecked(true);
      return;
    }
    fetch('/api/auth/check', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const ok = !!(data.valid ?? data.ok);
        setValid(ok);
        if (!ok) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      })
      .catch(() => setValid(false))
      .finally(() => setChecked(true));
  }, [token]);

  // login(password, code) : lance { mfaRequired: true } si le serveur demande le code
  const login = async (password, code) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, code: code || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Erreur de connexion.');
      err.mfaRequired = !!data.mfaRequired;
      throw err;
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setValid(true);
    return true;
  };

  const logout = async () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setValid(false);
  };

  return (
    <AdminContext.Provider value={{ token, checked, valid, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin doit être utilisé à l'intérieur de <AdminProvider>");
  return ctx;
}

export function AdminGate({ children }) {
  const { checked, valid, login } = useAdmin();
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needCode, setNeedCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(password, code);
    } catch (err) {
      if (err.mfaRequired) setNeedCode(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!checked) {
    return <div className="max-w-sm mx-auto px-6 py-24 text-center text-sm text-ink/50">Vérification...</div>;
  }

  if (!valid) {
    return (
      <div className="max-w-sm mx-auto px-6 py-24">
        <h1 className="text-xl font-bold mb-2 text-center">Accès administrateur</h1>
        <p className="text-sm text-ink/60 mb-6 text-center">
          {needCode ? "Entrez le code à 6 chiffres de votre application d'authentification." : 'Entrez le mot de passe pour continuer.'}
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full px-4 py-3 border border-ink/15 rounded text-sm mb-3"
            autoFocus={!needCode}
          />
          {needCode && (
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Code à 6 chiffres"
              className="w-full px-4 py-3 border border-ink/15 rounded text-sm mb-3 tracking-widest text-center"
              autoFocus
            />
          )}
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal text-white font-semibold rounded hover:bg-tealLight transition disabled:opacity-50"
          >
            {loading ? '...' : 'Se connecter'}
          </button>
        </form>
      </div>
    );
  }

  return children;
}