import React, { createContext, useContext, useState, useEffect } from 'react';
import AdminLogin from '../components/AdminLogin.jsx';
import AdminShell from '../components/AdminShell.jsx';

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

  // login(password, code) : l'erreur porte mfaRequired = true si le serveur demande le code
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
    try { sessionStorage.removeItem('cw_admin_intro'); } catch { /* ignore */ }
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
  const { checked, valid, login, logout, token } = useAdmin();

  if (!checked) {
    return <div className="adm-splash"><i /></div>;
  }
  if (!valid) {
    return <AdminLogin onSubmit={login} />;
  }
  return <AdminShell token={token} onLogout={logout}>{children}</AdminShell>;
}
