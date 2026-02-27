try {
  tizen.tvinputdevice.registerKey('MediaPlayPause');
  tizen.tvinputdevice.registerKey('MediaPlay');
  tizen.tvinputdevice.registerKey('MediaPause');
  tizen.tvinputdevice.registerKey('MediaStop');
  tizen.tvinputdevice.registerKey('MediaFastForward');
  tizen.tvinputdevice.registerKey('MediaRewind');
  tizen.tvinputdevice.registerKey('MediaTrackNext');
  tizen.tvinputdevice.registerKey('MediaTrackPrevious');
  tizen.tvinputdevice.registerKey('Back');
} catch (e) {}

try {
  tizen.power.request('SCREEN', 'SCREEN_NORMAL');
} catch (e) {}