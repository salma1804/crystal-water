import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Waves } from './AdminShell.jsx';
import '../admin.css';

export default function AdminLogin({ onSubmit }) {
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('password'); // 'password' | 'code'
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(password, step === 'code' ? code : undefined);
    } catch (err) {
      if (err.mfaRequired) {
        // Premier passage : le serveur demande le code. Pas une erreur à afficher.
        if (step === 'password') setStep('code');
        else { setError(err.message); setCode(''); }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-login">
      <section className="adm-login__side">
        <div className="adm-login__brand">
          <img src="/favicon.png" alt="" />
          <b>Crystal Water</b>
        </div>
        <p className="adm-login__pitch">
          Commandes, stock et clients, au même endroit.
          <span>Espace réservé à la gestion de la boutique.</span>
        </p>
        <Waves colors={['#2bb7d6', '#15677f', '#0c3a4a']} />
      </section>

      <section className="adm-login__main">
        <form className="adm-login__form" onSubmit={handleSubmit}>
          {step === 'password' ? (
            <>
              <h1>Connexion</h1>
              <p className="lead">Entrez le mot de passe de l'administration.</p>
              <div className="adm-field">
                <label htmlFor="adm-pw">Mot de passe</label>
                <input
                  id="adm-pw"
                  className="adm-input"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
                <button type="button" className="adm-eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                  <Icon name={show ? 'eyeoff' : 'eye'} size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <h1>Code de vérification</h1>
              <p className="lead">Ouvrez votre application d'authentification et saisissez le code à 6 chiffres.</p>
              <div className="adm-field">
                <label htmlFor="adm-code">Code à 6 chiffres</label>
                <input
                  id="adm-code"
                  className="adm-input adm-input--code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                />
              </div>
            </>
          )}

          {error && (
            <div className="adm-error" role="alert">
              <Icon name="alert" size={18} /> <span>{error}</span>
            </div>
          )}

          <button className="adm-btn adm-btn--primary adm-btn--block" type="submit" disabled={loading || (step === 'code' && code.length < 6)}>
            {loading ? 'Vérification…' : step === 'code' ? 'Valider le code' : 'Continuer'}
          </button>

          {step === 'code' && (
            <div className="adm-login__back">
              <button type="button" className="adm-linkbtn" onClick={() => { setStep('password'); setCode(''); setError(''); }}>
                Changer le mot de passe
              </button>
            </div>
          )}

          <div className="adm-login__secure">
            <Icon name="shield" size={16} /> Connexion protégée, session limitée à 12 heures.
          </div>
          <div className="adm-login__back"><Link to="/">Retour au site</Link></div>
        </form>
      </section>
    </div>
  );
}
