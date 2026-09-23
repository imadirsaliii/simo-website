// Header shadow on scroll
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 8) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mobilePanel = document.getElementById('mobilePanel');
if (navToggle && mobilePanel) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobilePanel.classList.toggle('open');
    document.body.style.overflow = mobilePanel.classList.contains('open') ? 'hidden' : '';
  });
  mobilePanel.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      navToggle.classList.remove('active');
      mobilePanel.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Contact form: POST to our own endpoint, fallback mailto
// Endpoint of ps_webhook.py behind nginx (deploy/nginx_api.simo-facility.de.conf).
const FORM_ENDPOINT = 'https://api.simo-facility.de/formular/anfrage';
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = contactForm.querySelector('#name').value.trim();
    const email = contactForm.querySelector('#email').value.trim();
    const leistung = contactForm.querySelector('#leistung').value;
    const nachricht = contactForm.querySelector('#nachricht').value.trim();
    const honey = contactForm.querySelector('#xtrafld');
    const subject = 'Anfrage über simo-facility.de – ' + leistung;
    const btn = contactForm.querySelector('button[type="submit"]');
    const hint = contactForm.querySelector('.form-hint');
    btn.disabled = true;
    btn.textContent = 'Wird gesendet…';
    try {
      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(), 6000);
      // Own endpoint on our server (replaces Web3Forms, 22.09.2026) - no third-party form service.
      const r = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          leistung: leistung,
          nachricht: nachricht,
          website: honey ? honey.value : ''
        })
      });
      clearTimeout(timeoutId);
      const j = await r.json().catch(() => null);
      if (!r.ok || !j || j.status !== 'ok') throw new Error('send failed');
      contactForm.querySelectorAll('input, select, textarea').forEach((el) => { el.value = ''; el.disabled = true; });
      btn.textContent = 'Anfrage gesendet ✓';
      if (hint) hint.textContent = 'Vielen Dank! Wir melden uns innerhalb von 24 Stunden. Tipp: Fotos vom Objekt gerne per WhatsApp – das macht Ihr Angebot noch präziser.';
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Anfrage senden';
      const body = 'Name: ' + name + '\nE-Mail: ' + email + '\nGewünschte Leistung: ' + leistung + '\n\nNachricht:\n' + nachricht;
      window.location.href = 'mailto:info@simo-facility.de?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }
  });
}

// Only one FAQ item open at a time
document.querySelectorAll('.faq-item').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      document.querySelectorAll('.faq-item').forEach((other) => {
        if (other !== item) other.open = false;
      });
    }
  });
});
