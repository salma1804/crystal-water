export function attachRipple() {
  document.addEventListener('mousedown', (e) => {
    const btn = e.target.closest('.btn-primary, .btn-ghost, button');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const dot = document.createElement('span');
    dot.className = 'ripple-dot';
    dot.style.width = dot.style.height = `${size}px`;
    dot.style.left = `${e.clientX - rect.left - size / 2}px`;
    dot.style.top = `${e.clientY - rect.top - size / 2}px`;

    const computedPosition = getComputedStyle(btn).position;
    if (computedPosition === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.appendChild(dot);
    setTimeout(() => dot.remove(), 650);
  });
}