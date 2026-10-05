/*
 * Embed loader. Partners paste:
 *   <script src="https://whenismyebtdeposit.org/embed.js" data-state="CA" async></script>
 * or, where scripts get moved (tag managers), also <div data-ebtcalc></div>
 * at the spot the calculator should go.
 *
 * Partners never update their snippet, so this file's URL, the data-ebtcalc /
 * data-state / data-partner attributes, and window.ebtcalc.init() must never
 * change. Everything else is free to change here.
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;
  var origin = new URL(script.src).origin;

  var MAX_WIDTH = 440; // the widget card's own max width
  var INITIAL_HEIGHT = 400;

  // Must match the /embed/{state} pages that get built.
  var STATES =
    ' al ak az ar ca co ct dc de fl ga hi ia id il in ks ky la ma md me mi mn mo ms mt' +
    ' nc nd ne nh nj nm nv ny oh ok or pa ri sc sd tn tx ut va vt wa wi wv wy ';

  function cleanState(v) {
    v = (v || '').trim().toLowerCase();
    return /^[a-z]{2}$/.test(v) && STATES.indexOf(' ' + v + ' ') !== -1 ? v : '';
  }

  function cleanPartner(v) {
    return (v || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 100);
  }

  // Hosting site, for analytics. Domain only: page URLs can carry personal info.
  var host = location.hostname.replace(/^www\./, '');

  function mount(target, state, partner) {
    var query = [];
    if (partner) query.push('partner=' + partner);
    if (host) query.push('host=' + encodeURIComponent(host));
    var frame = document.createElement('iframe');
    frame.src = origin + '/embed/' + (state ? state + '/' : '') + (query.length ? '?' + query.join('&') : '');
    frame.title = 'When is my next EBT deposit?';
    frame.setAttribute('scrolling', 'no');
    frame.setAttribute('loading', 'lazy');
    frame.style.cssText =
      'display:block;width:100%;border:0;overflow:hidden;height:' + INITIAL_HEIGHT + 'px';

    target.setAttribute('data-ebtcalc-ready', '');
    target.style.maxWidth = MAX_WIDTH + 'px';
    target.innerHTML = '';
    target.appendChild(frame);
    frames.push(frame);
  }

  var g = (window.ebtcalc = window.ebtcalc || {});
  var frames = (g.frames = g.frames || []);
  if (!g.listening) {
    g.listening = true;
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (!d || d.type !== 'ebtcalc:embed-height' || typeof d.height !== 'number') return;
      for (var i = 0; i < frames.length; i++) {
        var f = frames[i];
        if (f.contentWindow !== e.source) continue;
        if (e.origin !== new URL(f.src).origin) return;
        f.style.height = Math.max(100, Math.min(Math.ceil(d.height), 4000)) + 'px';
        return;
      }
    });
  }

  function attr(el, name) {
    return el.getAttribute(name) || script.getAttribute(name) || '';
  }

  function init() {
    var spots = document.querySelectorAll('[data-ebtcalc]:not([data-ebtcalc-ready])');
    for (var i = 0; i < spots.length; i++) {
      mount(spots[i], cleanState(attr(spots[i], 'data-state')), cleanPartner(attr(spots[i], 'data-partner')));
    }
  }
  g.init = init;

  // If the page has any placeholders, embeds go only into those; otherwise
  // the calculator renders right after this script tag.
  function run() {
    init();
    if (document.querySelector('[data-ebtcalc]') || !script.parentNode) return;
    if (script.parentNode === document.head) {
      console.warn('[ebtcalc] embed.js is in <head>; add <div data-ebtcalc></div> where the calculator should go.');
      return;
    }
    var spot = document.createElement('div');
    script.parentNode.insertBefore(spot, script.nextSibling);
    mount(spot, cleanState(attr(script, 'data-state')), cleanPartner(attr(script, 'data-partner')));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
