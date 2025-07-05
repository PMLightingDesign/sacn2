// test/rainbow.js – simple rainbow output across 4 universes
// Run with: node test/rainbow.js

import { createTransmitter } from '../src/index.js';
import { monitorEventLoopDelay } from 'perf_hooks';

// HSL to RGB helper (h in [0,1], s,l in [0,1])
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

let h;
const enableMonitor = process.argv.includes('--monitor-delay');
if (enableMonitor) {
  h = monitorEventLoopDelay();
  h.enable();
}

(async () => {
  // Create transmitter for universes 1-4 on auto interface
  const universes = [1, 2, 3, 4];
  const sacn = createTransmitter({ universes, interface: 'auto', appName: 'RainbowTest' });
  console.log('Rainbow test started. Press Ctrl+C to exit.');

  let phase = 0;
  const fps = 44;
  const interval = 1000 / fps;

  const sendFrame = () => {
    phase = (phase + 1) % 360;
    universes.forEach((u) => {
      const dmx = new Uint8Array(512);
      const pixels = Math.floor(512 / 3);
      for (let i = 0; i < pixels; i++) {
        const hue = ((i / pixels) + phase / 360) % 1;
        const [r, g, b] = hslToRgb(hue, 1, 0.5);
        dmx[i * 3] = r;
        dmx[i * 3 + 1] = g;
        dmx[i * 3 + 2] = b;
      }
      sacn.send(u, dmx);
    });
  };

  const timer = setInterval(() => {
    if (enableMonitor) {
      console.log('Mean loop delay:', h.mean / 1e6, 'ms');
      h.reset();
    }
    sendFrame();
  }, interval);

  process.on('SIGINT', async () => {
    clearInterval(timer);
    console.log('\nStopping transmitter...');
    await sacn.close();
    process.exit(0);
  });
})();
