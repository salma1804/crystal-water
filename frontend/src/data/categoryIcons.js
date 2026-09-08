// Regroupe toutes les icônes de src/assets/category-icons/ dans un objet
// { "slug-de-categorie": "url-vers-image" } utilisable partout dans l'app.
const modules = import.meta.glob('../assets/category-icons/*.png', { eager: true, import: 'default' });

export const categoryIcons = {};
Object.entries(modules).forEach(([path, url]) => {
  const slug = path.split('/').pop().replace('.png', '');
  categoryIcons[slug] = url;
});
