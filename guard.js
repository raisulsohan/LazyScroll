"use strict";

(() => {
  const origVol = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');
  let lockedVol = null;

  Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
    get() { return origVol.get.call(this); },
    set(v) {
      // ওয়েবসাইট ভলিউম পরিবর্তন করতে চাইলে আমরা আমাদের সেভ করা ভলিউমটাই জোর করে বসিয়ে দেব
      if (lockedVol !== null) {
        // ...তবে সাইট কোন ভলিউম চেয়েছিল সেটা মনে রাখি, লক ছাড়ার সময় ফেরত দিতে হবে
        this._qsSiteVol = v;
        origVol.set.call(this, lockedVol);
      } else {
        origVol.set.call(this, v);
      }
    }
  });

  // ---- Web Audio ----
  // Pages that play sound through an AudioContext (canvas animations, games,
  // players that decode their own audio) have no <video>/<audio> element, so
  // the volume lock above never reaches them. Every node a live AudioContext
  // connects to its destination is routed through one master GainNode per
  // context instead, and that gain carries the locked volume.
  // OfflineAudioContext is left alone: it renders files, it doesn't play.
  const masters = new WeakMap();   // AudioContext -> master GainNode
  const liveMasters = new Set();
  const origConnect = AudioNode.prototype.connect;
  const origDisconnect = AudioNode.prototype.disconnect;

  function masterFor(dest) {
    if (!(dest instanceof AudioDestinationNode)) return null;
    const ctx = dest.context;
    if (typeof AudioContext === 'undefined' || !(ctx instanceof AudioContext)) return null;
    let g = masters.get(ctx);
    if (!g) {
      g = ctx.createGain();
      g.gain.value = lockedVol === null ? 1 : lockedVol;
      origConnect.call(g, dest);
      masters.set(ctx, g);
      liveMasters.add(g);
      ctx.addEventListener('statechange', () => {
        if (ctx.state === 'closed') liveMasters.delete(g);
      });
      // tells the isolated-world content script there is sound to control
      document.documentElement && document.documentElement.setAttribute('data-qs-webaudio', '1');
    }
    return g;
  }

  AudioNode.prototype.connect = function (target, ...rest) {
    const g = target instanceof AudioNode && this !== masters.get(target.context) ? masterFor(target) : null;
    if (g) { origConnect.call(this, g, ...rest); return target; }
    return origConnect.call(this, target, ...rest);
  };
  AudioNode.prototype.disconnect = function (target, ...rest) {
    const g = target instanceof AudioNode && this !== masters.get(target.context) ? masterFor(target) : null;
    return g ? origDisconnect.call(this, g, ...rest) : origDisconnect.apply(this, arguments);
  };

  function setMasters(v) {
    liveMasters.forEach(g => { try { g.gain.value = v; } catch (err) {} });
  }

  window.addEventListener('qs-set-vol', (e) => {
    const next = e.detail;
    const was = lockedVol;
    lockedVol = next;
    setMasters(next === null ? 1 : next);

    if (next !== null) {
      document.querySelectorAll('video, audio').forEach(m => {
        try {
          // লক শুরুর মুহূর্তে সাইটের নিজের ভলিউমটা স্ন্যাপশট করে রাখি
          if (was === null && m._qsSiteVol === undefined) m._qsSiteVol = origVol.get.call(m);
          origVol.set.call(m, next);
        } catch(err){}
      });
    } else if (was !== null) {
      // লক ছাড়া হলো (যেমন Night mode বন্ধ) — সাইট যে ভলিউম চেয়েছিল সেটাই ফিরিয়ে দিই।
      // কিছু মনে না থাকলে ব্রাউজারের ডিফল্ট ১০০%, কারণ ওখান থেকেই শুরু হয়েছিল।
      document.querySelectorAll('video, audio').forEach(m => {
        try {
          const back = m._qsSiteVol;
          delete m._qsSiteVol;
          origVol.set.call(m, back === undefined ? 1 : back);
        } catch(err){}
      });
    }
  });
})();
