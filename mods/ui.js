import styles from './ui.css';

const tag = document.createElement('style');
tag.textContent = styles;
document.head.appendChild(tag);

export function toast(msg, duration = 2000) {
  let el = document.querySelector('.adn-toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'adn-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}