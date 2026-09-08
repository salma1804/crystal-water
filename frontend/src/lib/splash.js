export function triggerSplash(x, y, count = 6, maxDistance = 55) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const distance = maxDistance * 0.55 + Math.random() * (maxDistance * 0.45);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 15;

    const drop = document.createElement('div');
    drop.className = 'droplet';
    drop.style.left = `${x}px`;
    drop.style.top = `${y}px`;
    drop.style.setProperty('--dx', `${dx}px`);
    drop.style.setProperty('--dy', `${dy}px`);

    document.body.appendChild(drop);
    setTimeout(() => drop.remove(), 600);
  }
}