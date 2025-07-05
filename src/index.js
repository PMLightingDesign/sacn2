// File: src/index.js
// SPDX-License-Identifier: MIT

import { Worker } from 'node:worker_threads';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULTS = { universes: [1], priority: 100, cid: null, appName: 'Node-sACN' };

export function createTransmitter(options = {}) {
  const opts = { ...DEFAULTS, ...options };

  const worker = new Worker(
    path.join(path.dirname(fileURLToPath(import.meta.url)), 'worker', 'transmitter.worker.js'),
    { workerData: opts }
  );

  return {
    send(universe, dmx) {
      if (!(dmx instanceof Uint8Array || Buffer.isBuffer(dmx))) throw new TypeError('DMX data must be Buffer or Uint8Array');
      if (dmx.length === 0 || dmx.length > 512) throw new RangeError('DMX length must be 1–512 bytes');
      worker.postMessage({ universe, dmx }, [dmx.buffer]);
    },
    close() { return worker.terminate(); }
  };
}
