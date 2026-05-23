/* ============================================================================
   Lorelei's Workshop — small JS helpers
   Auto-mounts wave dividers + mini-waves into elements that have the right
   class. No frameworks, no build step.
   ============================================================================ */

(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  /**
   * Build a sine-wave path string.
   * @param {number} width   path width in SVG units
   * @param {number} amp     amplitude
   * @param {number} phase   phase offset (radians)
   * @param {number} baseY   y baseline
   * @param {number} freq    visual "frequency" — how many full waves across
   */
  function buildWavePath(width, amp, phase, baseY, freq) {
    const steps = freq * 16;
    const step = width / steps;
    let d = `M 0 ${baseY}`;
    for (let i = 0; i <= steps; i++) {
      const x = i * step;
      const y = baseY + amp * Math.sin((i / 16) * Math.PI * 2 * (freq / 4) + phase);
      d += ` L ${x.toFixed(1)} ${y.toFixed(2)}`;
    }
    return d;
  }

  /**
   * Build the major wave divider SVG.
   * @param {object} o
   * @param {number} o.width
   * @param {number} o.height
   * @param {boolean} o.ornament   draw the center ring+dot
   * @param {boolean} o.slim       smaller amplitudes, thinner strokes
   */
  function buildWaveSvg(o) {
    const opts = Object.assign({ width: 1160, height: 36, ornament: true, slim: false }, o || {});
    const w = opts.width;
    const h = opts.height;
    const mid = h / 2;

    const ampPrimary = opts.slim ? 4 : 7;
    const ampSecondary = opts.slim ? 3 : 5;
    const strokePrimary = opts.slim ? 1.1 : 1.6;
    const strokeSecondary = opts.slim ? 0.8 : 1.1;

    const styles = getComputedStyle(document.documentElement);
    const color = (styles.getPropertyValue('--ll-accent') || '#9dd9cb').trim();
    const color2 = (styles.getPropertyValue('--ll-accent-2') || '#e8b6c6').trim();
    const bgDeep = (styles.getPropertyValue('--ll-bg') || '#10202c').trim();

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', h);

    const p1 = document.createElementNS(NS, 'path');
    p1.setAttribute('d', buildWavePath(w, ampPrimary, 0, mid - 4, 4));
    p1.setAttribute('stroke', color);
    p1.setAttribute('stroke-width', String(strokePrimary));
    p1.setAttribute('fill', 'none');
    p1.setAttribute('stroke-linecap', 'round');
    p1.setAttribute('opacity', '0.9');
    svg.appendChild(p1);

    const p2 = document.createElementNS(NS, 'path');
    p2.setAttribute('d', buildWavePath(w, ampSecondary, Math.PI / 2, mid + 6, 4));
    p2.setAttribute('stroke', color);
    p2.setAttribute('stroke-width', String(strokeSecondary));
    p2.setAttribute('fill', 'none');
    p2.setAttribute('stroke-linecap', 'round');
    p2.setAttribute('opacity', '0.55');
    svg.appendChild(p2);

    if (opts.ornament) {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `translate(${w / 2}, ${mid})`);

      // gap behind the ornament so the waves don't run through it
      const gap = document.createElementNS(NS, 'rect');
      gap.setAttribute('x', '-26');
      gap.setAttribute('y', String(-mid));
      gap.setAttribute('width', '52');
      gap.setAttribute('height', String(h));
      gap.setAttribute('fill', bgDeep);
      g.appendChild(gap);

      const ring = document.createElementNS(NS, 'circle');
      ring.setAttribute('cx', '0');
      ring.setAttribute('cy', '0');
      ring.setAttribute('r', '9');
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', color);
      ring.setAttribute('stroke-width', '1.2');
      g.appendChild(ring);

      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', '0');
      dot.setAttribute('cy', '0');
      dot.setAttribute('r', '3.2');
      dot.setAttribute('fill', color2);
      g.appendChild(dot);

      svg.appendChild(g);
    }

    return svg;
  }

  /** Build the mini-wave used inside cards as a flourish. */
  function buildMiniWaveSvg(width) {
    const w = width || 84;
    const styles = getComputedStyle(document.documentElement);
    const color = (styles.getPropertyValue('--ll-accent-dim') || 'rgba(157,217,203,0.4)').trim();

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${w} 10`);
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', '10');

    const path = document.createElementNS(NS, 'path');
    path.setAttribute(
      'd',
      `M 0 5 Q ${w / 8} 1 ${w / 4} 5 T ${w / 2} 5 T ${(3 * w) / 4} 5 T ${w} 5`
    );
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '1.2');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);
    return svg;
  }

  /** Mount a wave into every .ll-wave-divider in the document. */
  function mountWaves() {
    document.querySelectorAll('.ll-wave-divider').forEach((el) => {
      if (el.dataset.llMounted) return;
      const slim = el.classList.contains('ll-wave-divider--slim');
      const noOrnament = el.dataset.ornament === 'false';
      const svg = buildWaveSvg({
        width: 1160,
        height: slim ? 18 : 36,
        ornament: !slim && !noOrnament,
        slim: slim,
      });
      el.innerHTML = '';
      el.appendChild(svg);
      el.dataset.llMounted = 'true';
    });

    document.querySelectorAll('.ll-mini-wave').forEach((el) => {
      if (el.dataset.llMounted) return;
      const w = parseInt(el.dataset.width || '84', 10);
      el.innerHTML = '';
      el.appendChild(buildMiniWaveSvg(w));
      el.dataset.llMounted = 'true';
    });
  }

  /** Public API (small) — useful if you want to mount imperatively. */
  window.LL = {
    wave:     buildWaveSvg,
    miniWave: buildMiniWaveSvg,
    mount:    mountWaves,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWaves);
  } else {
    mountWaves();
  }
})();
