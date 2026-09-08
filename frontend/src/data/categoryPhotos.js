const modulesJpg = import.meta.glob('../assets/category-photos/*.jpg', { eager: true, import: 'default' });
const modulesPng = import.meta.glob('../assets/category-photos/*.png', { eager: true, import: 'default' });

export const categoryPhotos = {};
[...Object.entries(modulesJpg), ...Object.entries(modulesPng)].forEach(([path, url]) => {
  const slug = path.split('/').pop().replace(/\.(jpg|png)$/, '');
  categoryPhotos[slug] = url;
});