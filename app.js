// Бургер
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => { burger.classList.toggle('active'); nav.classList.toggle('open'); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('active'); nav.classList.remove('open'); }));

// Header scroll
const header = document.getElementById('header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 60));

// Активная ссылка
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { const top = s.offsetTop - 150; if (window.scrollY >= top) current = s.getAttribute('id'); });
  navLinks.forEach(l => { l.classList.remove('active-link'); if (l.getAttribute('href') === '#' + current) l.classList.add('active-link'); });
});

// Reveal
const revObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// Счётчики
const cntObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = parseInt(el.getAttribute('data-target'));
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 45));
      const int = setInterval(() => { cur += step; if (cur >= target) { cur = target; clearInterval(int); } el.textContent = cur.toLocaleString('ru-RU'); }, 22);
      cntObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(c => cntObs.observe(c));

// Таймер
const timerEl = document.getElementById('timer');
const deadline = new Date(timerEl.dataset.deadline || '2026-07-01T12:00:00+03:00').getTime();
function updateTimer() {
  const diff = deadline - Date.now();
  if (diff <= 0) { ['days','hours','minutes','seconds'].forEach(id => document.getElementById(id).textContent = '00'); return; }
  document.getElementById('days').textContent    = String(Math.floor(diff / 86400000)).padStart(2,'0');
  document.getElementById('hours').textContent   = String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0');
  document.getElementById('minutes').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0');
  document.getElementById('seconds').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2,'0');
}
updateTimer();
setInterval(updateTimer, 1000);

// Переключатель контакта
const toggleBtns = document.querySelectorAll('.toggle button');
const ci = document.getElementById('formContact');
toggleBtns.forEach(b => b.addEventListener('click', () => {
  toggleBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  ci.placeholder = { telegram: '@username', phone: '+7 (999) 123-45-67' }[b.dataset.type] || '@username';
}));

// Скролл-топ
const st = document.getElementById('scrollTop');
window.addEventListener('scroll', () => st.classList.toggle('visible', window.scrollY > 500));
st.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Тема
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
document.getElementById('themeToggle').addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Соло — показать/скрыть поля
document.querySelectorAll('input[name="role"]').forEach(el => {
  el.addEventListener('change', () => {
    const isSolo = document.querySelector('input[name="role"]:checked').value === 'solo';
    document.getElementById('soloHint').style.display = isSolo ? 'block' : 'none';
    document.getElementById('captainFields').style.display = isSolo ? 'none' : 'block';
    document.getElementById('soloFields').style.display = isSolo ? 'block' : 'none';
  });
});

// Карусель спонсоров — дублируем для бесшовной прокрутки
const track = document.getElementById('sponsorTrack');
if (track) {
  const items = track.innerHTML;
  track.innerHTML = items + items;
}

// FAQ аккордеон
document.querySelectorAll('.faq-q').forEach(q => q.addEventListener('click', () => {
  const item = q.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}));

// Модал
const modal = document.getElementById('modalOverlay');
document.getElementById('modalClose').addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

function showModal(text) {
  document.querySelector('.modal-text').textContent = text;
  modal.classList.add('open');
}

// Поделиться
document.getElementById('shareBtn').addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({ title: 'DIVISION BATTLES', url: window.location.href });
  } else {
    navigator.clipboard.writeText(window.location.href);
    showModal('Ссылка скопирована в буфер обмена!');
  }
});

// Форма
const FORM_WEBHOOK_URL = "send.php";

function clearErrors() {
  document.querySelectorAll('.fg.error').forEach(el => el.classList.remove('error'));
}

function setError(id, msg) {
  const fg = document.getElementById(id).closest('.fg');
  fg.classList.add('error');
  fg.querySelector('.error-text').textContent = msg;
}

document.getElementById('formSubmit').addEventListener('click', async function () {
  clearErrors();
  const btn = this;
  const name = document.getElementById('formName').value.trim();
  const contact = document.getElementById('formContact').value.trim();
  const isSolo = document.querySelector('input[name="role"]:checked').value === 'solo';
  const brand = isSolo ? '' : document.getElementById('formBrand').value.trim();
  const roster = isSolo ? '' : document.getElementById('formRoster').value.trim();
  const soloRole = isSolo ? document.getElementById('formRole').value : '';
  const soloRating = isSolo ? document.getElementById('formRating').value : '';
  const about = document.getElementById('formAbout').value.trim();
  const teamRating = isSolo ? '' : document.getElementById('formTeamRating').value;
  const captainRole = isSolo ? 'solo' : 'captain';
  const agree = document.getElementById('formAgree').checked;

  let valid = true;
  if (!name) { setError('formName', 'Введите имя'); valid = false; }
  if (!contact) { setError('formContact', 'Укажите контакт'); valid = false; }
  if (!isSolo && !brand) { setError('formBrand', 'Укажите название команды'); valid = false; }
  if (!agree) { setError('formAgree', 'Необходимо согласие на обработку данных'); valid = false; }
  if (!valid) return;

  const contactType = document.querySelector('.toggle button.active')?.dataset.type || 'telegram';

  const formData = { name, contact, contactType, brand, roster, role: captainRole, soloRole, soloRating, about, teamRating, time: new Date().toLocaleString('ru-RU') };

  btn.classList.add('btn-loading');
  btn.querySelector('i').className = 'fa-solid fa-spinner';
  btn.disabled = true;

  try {
    const res = await fetch(FORM_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('Send failed');
    showModal('✅ Заявка принята! Мы свяжемся с вами.');
    document.getElementById('formName').value = '';
    document.getElementById('formContact').value = '';
    document.getElementById('formBrand').value = '';
    document.getElementById('formRoster').value = '';
    document.getElementById('formRole').value = '';
    document.getElementById('formRating').value = '';
    document.getElementById('formAbout').value = '';
    clearErrors();
  } catch (e) {
    showModal('❌ Ошибка отправки. Попробуйте позже или напишите в Telegram.');
  } finally {
    btn.classList.remove('btn-loading');
    btn.querySelector('i').className = 'fa-solid fa-rocket';
    btn.disabled = false;
  }
});

// PWA — регистрация Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

// === PARTICLES ===
const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);

  const particles = [];
  const COUNT = 60;
  let mouse = { x: W / 2, y: H / 2 };

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2 + 1, a: Math.random() * 0.5 + 0.1
    });
  }

  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('touchmove', e => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; });

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) { p.vx += dx * 0.00008; p.vy += dy * 0.00008; }

      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;

      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 158, 11, ${p.a})`;
      ctx.fill();
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

// === TYPEWRITER ===
const twEl = document.querySelector('.hero-sub');
if (twEl) {
  const text = twEl.textContent;
  twEl.textContent = '';
  twEl.classList.add('typewriter-cursor');
  let i = 0;
  function typeNext() {
    if (i < text.length) {
      twEl.textContent += text[i];
      i++;
      setTimeout(typeNext, 40 + Math.random() * 40);
    } else {
      twEl.classList.remove('typewriter-cursor');
    }
  }
  const twObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { typeNext(); twObs.unobserve(twEl); }
  }, { threshold: 0.3 });
  twObs.observe(twEl);
}

// === SCROLL PROGRESS BAR ===
const progressBar = document.getElementById('progressBar');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    progressBar.style.width = (window.scrollY / (h.scrollHeight - h.clientHeight)) * 100 + '%';
  });
}

// === CUSTOM CURSOR - отключён ===

// === BUTTON RIPPLE ===
document.querySelectorAll('.btn, .nav-cta, .tg-btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const r = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(r.width, r.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
});

// === LAZY BLUR ===
document.querySelectorAll('img').forEach(img => {
  if (img.complete) img.classList.add('loaded');
  else img.addEventListener('load', () => img.classList.add('loaded'));
  img.addEventListener('error', () => img.classList.add('loaded'));
});

// === PROGRESS BARS ===
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const bar = e.target;
      bar.style.width = bar.dataset.pct + '%';
      barObs.unobserve(bar);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-bar-fill').forEach(b => barObs.observe(b));

// === COST TYPEWRITER ===
const costBlock = document.getElementById('costBlock');
if (costBlock) {
  const costLines = costBlock.querySelectorAll('[data-text]');
  costLines.forEach(el => { el.textContent = ''; });
  let lineIdx = 0;
  function typeCostLine() {
    if (lineIdx >= costLines.length) return;
    const el = costLines[lineIdx];
    const text = el.dataset.text;
    let i = 0;
    el.classList.add('typewriter-cursor');
    function typeCh() {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        setTimeout(typeCh, 30 + Math.random() * 30);
      } else {
        el.classList.remove('typewriter-cursor');
        lineIdx++;
        if (lineIdx === 2) {
          const arcs = costBlock.querySelectorAll('.cost-arc');
          const glow = costBlock.querySelector('.cost-glow');
          arcs.forEach(a => a.classList.add('active'));
          if (glow) setTimeout(() => glow.classList.add('active'), 100);
        }
        setTimeout(typeCostLine, 400);
      }
    }
    typeCh();
  }
  const costObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setTimeout(typeCostLine, 300);
      costObs.unobserve(costBlock);
    }
  }, { threshold: 0.3 });
  costObs.observe(costBlock);
}

// Scroll to top
const scrollBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollBtn.classList.toggle('visible', window.scrollY > 500);
});
scrollBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
