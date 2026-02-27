document.addEventListener('keydown', e => {
  const v = document.querySelector('video');
  if (!v) return;

  switch (e.keyCode) {
    case 415:
    case 19:
    case 10252:
      e.preventDefault();
      v.paused ? v.play() : v.pause();
      break;
    case 413:
      e.preventDefault();
      v.pause(); v.currentTime = 0;
      break;
    case 417:
      e.preventDefault();
      v.currentTime = Math.min(v.duration, v.currentTime + 30);
      break;
    case 412:
      e.preventDefault();
      v.currentTime = Math.max(0, v.currentTime - 10);
      break;
  }
}, true);