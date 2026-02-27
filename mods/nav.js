const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  '[role="button"]',
  '.slider-item',
  '.media-card',
  '.catalog-item',
  '.episode-list-item',
  '.btn',
  'input',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

let elements = [];
let index = 0;

export function refresh() {
  elements = Array.from(document.querySelectorAll(FOCUSABLE)).filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
}

export function focusEl(i) {
  document.querySelectorAll('.__adn_focus').forEach(el => {
    el.classList.remove('.__adn_focus');
  });
  if (!elements[i]) return;
  index = i;
  const el = elements[i];
  el.classList.add('__adn_focus');
  el.focus({ preventScroll: false });
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
}

function nearest(dir) {
  const cur = elements[index];
  if (!cur) return index;
  const cr = cur.getBoundingClientRect();
  const cx = cr.left + cr.width / 2;
  const cy = cr.top + cr.height / 2;

  let best = index;
  let bestScore = Infinity;

  elements.forEach((el, i) => {
    if (i === index) return;
    const r = el.getBoundingClientRect();
    const ex = r.left + r.width / 2;
    const ey = r.top + r.height / 2;
    const dx = ex - cx;
    const dy = ey - cy;

    let ok = false;
    if (dir === 'UP')    ok = dy < -10;
    if (dir === 'DOWN')  ok = dy > 10;
    if (dir === 'LEFT')  ok = dx < -10;
    if (dir === 'RIGHT') ok = dx > 10;
    if (!ok) return;

    const primary   = (dir === 'UP' || dir === 'DOWN') ? Math.abs(dy) : Math.abs(dx);
    const secondary = (dir === 'UP' || dir === 'DOWN') ? Math.abs(dx) : Math.abs(dy);
    const score = primary + secondary * 2;

    if (score < bestScore) { bestScore = score; best = i; }
  });
  return best;
}

function killCookiePopup() {
  const selectors = [
    '.sd-cmp-gpI1s',
    '.sd-cmp-cWOb7',
    '.sd-cmp-FzC1t',
    '.sd-cmp-hk3jy',
    '.sd-cmp-MtHO2',
    '#__abconsent-cmp',
    '#sd-cmp'
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.remove());
  });
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.position = '';
  document.documentElement.style.position = '';
}

function showTokenPopup() {
  if (document.querySelector('#__adn_token_popup')) return;

  const overlay = document.createElement('div');
  overlay.id = '__adn_token_popup';
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.85);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 20px;
    font-family: Helvetica, sans-serif;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: #04121a;
    border: 2px solid #0095ff;
    border-radius: 16px;
    padding: 40px;
    width: 600px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
  `;

  const title = document.createElement('div');
  title.textContent = 'Connexion ADN';
  title.style.cssText = `color: #fff; font-size: 28px; font-weight: bold;`;

  const subtitle = document.createElement('div');
  subtitle.textContent = 'Entrez votre token d\'authentification';
  subtitle.style.cssText = `color: #999; font-size: 16px;`;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Token...';
  input.id = '__adn_token_input';
  input.style.cssText = `
    width: 100%;
    padding: 14px 18px;
    font-size: 18px;
    border-radius: 10px;
    border: 2px solid #0095ff;
    background: #0a1f2e;
    color: #fff;
    outline: none;
    box-sizing: border-box;
  `;

  const btn = document.createElement('button');
  btn.textContent = 'Valider';
  btn.id = '__adn_token_btn';
  btn.style.cssText = `
    padding: 14px 40px;
    font-size: 20px;
    background: #0095ff;
    color: #fff;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
  `;

  const hint = document.createElement('div');
  hint.textContent = '↓ Bouton • OK Valider';
  hint.style.cssText = `color: #555; font-size: 14px;`;

  function validate() {
    const token = input.value.trim();
    if (!token) return;
    localStorage.setItem('token', token);
    overlay.remove();
    window.location.href = '/';
  }

  btn.addEventListener('click', validate);

  box.appendChild(title);
  box.appendChild(subtitle);
  box.appendChild(input);
  box.appendChild(btn);
  box.appendChild(hint);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  setTimeout(() => input.focus(), 100);
}

function checkLoginPage() {
  if (window.location.pathname === '/login' || window.location.pathname.startsWith('/login')) {
    showTokenPopup();
  }
}

killCookiePopup();

const popupObserver = new MutationObserver(() => {
  if (
    document.querySelector('#__abconsent-cmp') ||
    document.querySelector('.sd-cmp-MtHO2') ||
    document.querySelector('.sd-cmp-hk3jy')
  ) {
    killCookiePopup();
  }
});
popupObserver.observe(document.body, { childList: true, subtree: true });

checkLoginPage();

const _pushState = history.pushState.bind(history);
history.pushState = function(...args) {
  _pushState(...args);
  checkLoginPage();
};
window.addEventListener('popstate', checkLoginPage);

document.addEventListener('keydown', e => {
  const popup = document.querySelector('#__adn_token_popup');
  
  if (popup) {
    const input = document.querySelector('#__adn_token_input');
    const btn = document.querySelector('#__adn_token_btn');
    const focused = document.activeElement;
    
    switch (e.keyCode) {
      case 13:
        e.preventDefault();
        e.stopPropagation();
        if (focused === btn) {
          const token = input.value.trim();
          if (token) {
            localStorage.setItem('token', token);
            popup.remove();
            window.location.href = '/';
          }
        } else {
          btn.focus();
        }
        break;
      case 40:
        e.preventDefault();
        e.stopPropagation();
        if (focused === input) {
          btn.focus();
        }
        break;
      case 38:
        e.preventDefault();
        e.stopPropagation();
        if (focused === btn) {
          input.focus();
        }
        break;
      case 10009:
      case 10182:
        e.preventDefault();
        e.stopPropagation();
        popup.remove();
        break;
    }
    return;
  }

  refresh();
  switch (e.keyCode) {
    case 38: e.preventDefault(); focusEl(nearest('UP'));    break;
    case 40: e.preventDefault(); focusEl(nearest('DOWN'));  break;
    case 37: e.preventDefault(); focusEl(nearest('LEFT'));  break;
    case 39: e.preventDefault(); focusEl(nearest('RIGHT')); break;
    case 13:
      if (elements[index]) { e.preventDefault(); elements[index].click(); }
      break;
    case 10009:
    case 10182:
      e.preventDefault();
      const v = document.querySelector('video');
      if (v && !v.paused) { v.pause(); } else { history.back(); }
      break;
  }
}, true);

new MutationObserver(() => setTimeout(refresh, 400))
  .observe(document.body, { childList: true, subtree: true });

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { killCookiePopup(); refresh(); focusEl(0); checkLoginPage(); });
} else {
  refresh(); focusEl(0);
}