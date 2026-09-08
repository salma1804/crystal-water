import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TUNIS_CENTER = [36.8065, 10.1815];

export const TUNISIA_CITIES = {
  'Tunis': [36.8065, 10.1815],
  'Sfax': [34.7406, 10.7603],
  'Sousse': [35.8256, 10.6084],
  'Kairouan': [35.6781, 10.0963],
  'Bizerte': [37.2744, 9.8739],
  'Gabès': [33.8815, 10.0982],
  'Ariana': [36.8625, 10.1956],
  'Gafsa': [34.4250, 8.7842],
  'Monastir': [35.7780, 10.8262],
  'Ben Arous': [36.7533, 10.2189],
  'Nabeul': [36.4561, 10.7376],
  'Médenine': [33.3549, 10.5055],
  'Béja': [36.7256, 9.1817],
  'Jendouba': [36.5011, 8.7803],
  'Le Kef': [36.1826, 8.7148],
  'Mahdia': [35.5047, 11.0622],
  'Sidi Bouzid': [35.0381, 9.4858],
  'Tozeur': [33.9197, 8.1335],
  'Siliana': [36.0844, 9.3708],
  'Zaghouan': [36.4028, 10.1428],
  'Kasserine': [35.1676, 8.8365],
  'Kébili': [33.7044, 8.9690],
  'Tataouine': [32.9297, 10.4518],
  'Manouba': [36.8081, 10.0972],
};

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`,
      { headers: { 'Accept-Language': 'fr' } }
    );
    const data = await res.json();
    const a = data.address || {};
    const parts = [
      a.road || a.pedestrian || a.neighbourhood,
      a.suburb || a.city_district,
      a.city || a.town || a.village || a.municipality,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : data.display_name || null;
  } catch {
    return null;
  }
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function RecenterMap({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, zoom || map.getZoom());
  }, [position]);
  return null;
}

function MapBlock({ position, onPick, height }) {
  return (
    <div className="rounded overflow-hidden border border-ink/15" style={{ height }}>
      <MapContainer center={position || TUNIS_CENTER} zoom={position ? 13 : 7} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onPick} />
        {position && (
          <Marker
            position={position}
            draggable
            eventHandlers={{
              dragend: (e) => onPick([e.target.getLatLng().lat, e.target.getLatLng().lng]),
            }}
          />
        )}
        <RecenterMap position={position} zoom={13} />
      </MapContainer>
    </div>
  );
}

export default function LocationPicker({ value, onChange, onLabelChange, city }) {
  const [position, setPosition] = useState(value || null);
  const [label, setLabel] = useState('');
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handlePick = async (pos) => {
    setPosition(pos);
    onChange(pos);
    setResolving(true);
    setLabel('');
    const resolved = await reverseGeocode(pos[0], pos[1]);
    setLabel(resolved || '');
    onLabelChange?.(resolved || '');
    setResolving(false);
  };

  useEffect(() => {
    if (city && TUNISIA_CITIES[city]) {
      handlePick(TUNISIA_CITIES[city]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handlePick([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold">
          Localisation exacte <span className="font-normal text-ink/40">(optionnel)</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="text-xs font-semibold text-teal hover:underline disabled:opacity-50"
          >
            {locating ? 'Localisation...' : '📍 Ma position'}
          </button>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-xs font-semibold text-ink/50 hover:text-teal transition"
          >
            ⤢ Agrandir
          </button>
        </div>
      </div>

      <MapBlock position={position} onPick={handlePick} height={280} />

      <div className="mt-1.5 min-h-[18px]">
        {resolving && <p className="text-xs text-ink/40">Recherche de l'adresse...</p>}
        {!resolving && label && (
          <p className="text-xs text-teal font-medium">📍 {label}</p>
        )}
        {!resolving && !label && (
          <p className="text-xs text-ink/40">
            Choisissez votre ville ci-dessus, ou cliquez directement sur la carte.
          </p>
        )}
      </div>

      {expanded && (
        <div
          className="fixed inset-0 bg-ink/70 z-[400] flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="bg-white rounded-lg p-4 w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Indiquez votre localisation précise</p>
              <button
                onClick={() => setExpanded(false)}
                className="w-8 h-8 rounded-full border border-ink/15 flex items-center justify-center hover:border-teal transition"
              >
                ✕
              </button>
            </div>
            <MapBlock position={position} onPick={handlePick} height={480} />
            {label && <p className="text-sm text-teal font-medium mt-2">📍 {label}</p>}
            <button
              onClick={() => setExpanded(false)}
              className="w-full mt-3 py-2.5 bg-teal text-white font-semibold rounded hover:bg-tealLight transition text-sm"
            >
              Valider cette position
            </button>
          </div>
        </div>
      )}
    </div>
  );
}