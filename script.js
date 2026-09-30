const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

function placeholderImg(img, label) {
  img.style.display = 'none';
  const parent = img.parentElement;
  parent.classList.add('placeholder');
  if (!parent.querySelector('.placeholder-label')) {
    const div = document.createElement('div');
    div.className = 'placeholder-label';
    div.textContent = label;
    parent.appendChild(div);
  }
}
window.placeholderImg = placeholderImg;

// Reveal au scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Parallax léger
const parallaxItems = document.querySelectorAll('[data-parallax]');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  parallaxItems.forEach(el => {
    const speed = Number(el.dataset.parallax || 0.1);
    el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
  });
}, { passive: true });

// Cartes qui suivent légèrement la souris
function addTilt(el) {
  el.addEventListener('pointermove', e => {
    if (el.dataset.dragging === 'true') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 4).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 5).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${x * 12}px`);
    el.style.setProperty('--my', `${y * 12}px`);
  });
  el.addEventListener('pointerleave', () => {
    el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px');
  });
}
document.querySelectorAll('.tilt-card').forEach(addTilt);

// Déplacement libre des cartes sur desktop : cliquer-glisser
let drag = null;
document.querySelectorAll('.draggable-card').forEach(card => {
  card.addEventListener('pointerdown', e => {
    if (e.button !== 0 || window.innerWidth < 800) return;
    const r = card.getBoundingClientRect();
    drag = { card, startX: e.clientX, startY: e.clientY, x: 0, y: 0, left: r.left, top: r.top };
    card.dataset.dragging = 'true';
    card.setPointerCapture?.(e.pointerId);
    card.style.zIndex = 20;
    card.classList.add('is-dragging');
  });
});
window.addEventListener('pointermove', e => {
  if (!drag) return;
  drag.x = e.clientX - drag.startX;
  drag.y = e.clientY - drag.startY;
  drag.card.style.translate = `${drag.x}px ${drag.y}px`;
});
window.addEventListener('pointerup', () => {
  if (!drag) return;
  drag.card.dataset.dragging = 'false';
  drag.card.classList.remove('is-dragging');
  setTimeout(() => { drag.card.style.translate = ''; drag.card.style.zIndex = ''; }, 450);
  drag = null;
});

// Galerie horizontale avec drag
const scrollers = document.querySelectorAll('[data-drag-scroll]');
scrollers.forEach(scroller => {
  let down = false, start = 0, left = 0;
  scroller.addEventListener('pointerdown', e => { down = true; start = e.clientX; left = scroller.scrollLeft; scroller.classList.add('grabbing'); });
  scroller.addEventListener('pointermove', e => { if (down) scroller.scrollLeft = left - (e.clientX - start) * 1.2; });
  ['pointerup','pointerleave'].forEach(type => scroller.addEventListener(type, () => { down = false; scroller.classList.remove('grabbing'); }));
});

// Filtre galerie
const filters = document.querySelectorAll('.filter');
const tiles = document.querySelectorAll('.gallery-tile');
filters.forEach(btn => btn.addEventListener('click', () => {
  filters.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filter = btn.dataset.filter;
  tiles.forEach(tile => {
    const show = filter === 'all' || tile.dataset.category === filter;
    tile.hidden = !show;
  });
}));

// Lightbox
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxCaption = document.querySelector('#lightboxCaption');
document.querySelectorAll('.gallery-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    const img = tile.querySelector('img');
    if (!img || img.style.display === 'none') return;
    lightboxImage.src = tile.dataset.image;
    lightboxImage.alt = img.alt;
    lightboxCaption.textContent = tile.querySelector('span')?.textContent || '';
    const meta = document.createElement('small');
    meta.textContent = tile.dataset.name || 'NOM DE LA CRÉATION · Année · Matière / technique';
    lightboxCaption.appendChild(meta);
    // lightbox.showModal();
  });
});
document.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });

// Upload local temporaire : pratique pour tester les photos avant de les placer dans assets/images
const loader = document.querySelector('#imageLoader');
const preview = document.querySelector('#livePreview');
loader?.addEventListener('change', e => {
  preview.innerHTML = '';
  [...e.target.files].forEach((file, i) => {
    const url = URL.createObjectURL(file);
    const figure = document.createElement('figure');
    figure.style.setProperty('--i', i);
    figure.innerHTML = `<img src="${url}" alt="Aperçu ${file.name.replaceAll('"','')}"><figcaption>${file.name}</figcaption>`;
    preview.appendChild(figure);
  });
});

// Curseur décoratif
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
window.addEventListener('pointermove', e => {
  dot.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  ring.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
});
document.querySelectorAll('a,button,label').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});
