import { useEffect } from 'react';

const SITE_NAME = 'Crystal Water';

function setMeta(name, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setOgMeta(property, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Composant invisible : place-le en haut de chaque page pour définir
 * son titre et sa description dans les résultats Google et les partages sociaux.
 *
 * Usage : <Seo title="Osmoseurs — Crystal Water" description="..." />
 */
export default function Seo({ title, description, image }) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    setMeta('description', description);
    setOgMeta('og:title', fullTitle);
    setOgMeta('og:description', description);
    setOgMeta('og:type', 'website');
    if (image) setOgMeta('og:image', image);
  }, [title, description, image]);

  return null;
}