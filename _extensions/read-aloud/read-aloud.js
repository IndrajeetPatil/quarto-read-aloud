/* SPDX-License-Identifier: MIT */
window.RevealReadAloud = function () {
  let cleanup = () => {};
  return {
    id: 'RevealReadAloud',
    init(deck) {
      const options = deck.getConfig().readAloud || {};
      const labels = {
        read: 'Read aloud', stop: 'Stop reading', empty: 'No speaker notes',
        unsupported: 'Speech synthesis unavailable', error: 'Unable to read notes. Try again.',
        ...options.labels,
      };
      const synth = window.speechSynthesis;
      const supported = !!synth && typeof window.SpeechSynthesisUtterance === 'function';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'read-aloud-button';
      const icon = document.createElement('span');
      icon.className = 'read-aloud-icon';
      icon.setAttribute('aria-hidden', 'true');
      button.append(icon);
      button.setAttribute('aria-pressed', 'false');
      const status = document.createElement('span');
      status.className = 'read-aloud-status';
      status.setAttribute('role', 'status');
      deck.getRevealElement().append(button, status);
      let utterance = null;
      const notes = () => {
        const slide = deck.getCurrentSlide();
        if (!slide) return '';
        const aside = [...slide.querySelectorAll('aside.notes')]
          .find(node => node.closest('section') === slide);
        if (!aside) return (slide.getAttribute('data-notes') || '').trim();
        const copy = aside.cloneNode(true);
        copy.querySelectorAll('script, style, [aria-hidden="true"]').forEach(node => node.remove());
        copy.querySelectorAll('p, li, br, h1, h2, h3, h4, h5, h6').forEach(node => node.append(' '));
        return copy.textContent.replace(/\s+/g, ' ').trim();
      };
      const update = () => {
        button.disabled = !supported || !notes();
        const label = !supported ? labels.unsupported : !notes() ? labels.empty : utterance ? labels.stop : labels.read;
        button.setAttribute('aria-label', label);
        button.title = label;
        icon.classList.toggle('read-aloud-icon-stop', !!utterance);
        button.setAttribute('aria-pressed', String(!!utterance));
      };
      const stop = () => {
        if (utterance) {
          utterance.onend = utterance.onerror = null;
          utterance = null;
          synth.cancel();
        }
        update();
      };
      const click = event => {
        event.stopPropagation();
        if (utterance) return stop();
        const text = notes();
        if (!supported || !text) return;
        status.textContent = '';
        utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || deck.getCurrentSlide().closest('[lang]')?.lang || document.documentElement.lang || 'en';
        const rate = options.rate ?? 1;
        utterance.rate = typeof rate === 'number' && Number.isFinite(rate) ? Math.min(10, Math.max(0.1, rate)) : 1;
        // Query at click time: voices may load asynchronously after initialisation.
        const voice = synth.getVoices().find(item => item.name === options.voice);
        if (voice) utterance.voice = voice;
        const current = utterance;
        current.onend = () => {
          if (utterance !== current) return;
          utterance = null;
          update();
        };
        current.onerror = () => {
          if (utterance !== current) return;
          utterance = null;
          status.textContent = labels.error;
          update();
        };
        update();
        try { synth.speak(current); } catch { current.onerror(); }
      };
      const visibility = () => { if (document.hidden) stop(); };
      button.addEventListener('click', click);
      // Keep native button activation without triggering Reveal's navigation keys.
      button.addEventListener('keydown', event => {
        if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
      });
      const events = ['slidechanged', 'overviewshown', 'paused'];
      events.forEach(event => deck.on(event, stop));
      deck.on('ready', update);
      document.addEventListener('visibilitychange', visibility);
      window.addEventListener('pagehide', stop);
      update();
      cleanup = () => {
        stop();
        events.forEach(event => deck.off(event, stop));
        deck.off('ready', update);
        document.removeEventListener('visibilitychange', visibility);
        window.removeEventListener('pagehide', stop);
        button.remove();
        status.remove();
      };
    },
    destroy() { cleanup(); },
  };
};
