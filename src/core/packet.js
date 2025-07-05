// packet.js – constructs sACN E1.31 packets from raw DMX data
// SPDX-License-Identifier: MIT

import crypto from 'crypto';
import { writeUint16, writeAscii } from './byte.js';

let _sequence = 0;
const cidCache = new Map();

/**
 * buildPacket – assemble a full sACN packet (638 bytes) given a DMX payload
 * @param {number} universe   Universe number (1–63999)
 * @param {Uint8Array} dmx    Raw DMX data (1–512 bytes)
 * @param {Object} opts       { priority, cid, appName }
 * @returns {Buffer}          Complete sACN packet ready to send
 */
export function buildPacket(universe, dmx, opts) {
  if (dmx.length === 0 || dmx.length > 512) {
    throw new RangeError('DMX payload must be 1–512 bytes');
  }

  const { priority = 100, cid, appName = 'nodejs_sacn' } = opts;
  const sourceName = `${appName}-${universe}`;
  const propertyValueCount = dmx.length + 1; // start‑code + data

  const buf = Buffer.alloc(638);

  // --- Root Layer ---------------------------------------------------------
  buf.set([0x00, 0x10], 0); // Preamble Size
  buf.set([0x00, 0x00], 2); // Post‑amble Size
  buf.set(
    [0x41, 0x53, 0x43, 0x2d, 0x45, 0x31, 0x2e, 0x31, 0x37, 0x00, 0x00, 0x00],
    4
  ); // ACN Packet Identifier
  writeUint16(buf, 16, (0x7 << 12) | (638 - 16)); // Flags & Length
  buf.set([0x00, 0x00, 0x00, 0x04], 18); // Vector (E1.31 data)
  buf.set(getCachedCID(cid), 22); // CID (16 bytes)

  // --- Framing Layer ------------------------------------------------------
  writeUint16(buf, 38, (0x7 << 12) | (638 - 38)); // Flags & Length
  buf.set([0x00, 0x00, 0x00, 0x02], 40); // Vector (Data Packet)
  writeAscii(buf, 44, 64, sourceName); // Source Name (ASCII, null‑padded)
  buf[108] = priority;                // Priority
  writeUint16(buf, 109, 0);           // Sync Address (0 = none)

  _sequence = (_sequence + 1) & 0xff; // 0–255 roll‑over
  buf[111] = _sequence;               // Sequence Number
  buf[112] = 0x00;                    // Options flags
  writeUint16(buf, 113, universe);    // Universe

  // --- DMP Layer ----------------------------------------------------------
  writeUint16(buf, 115, (0x7 << 12) | (propertyValueCount + 10)); // Flags & Length
  buf[117] = 0x02;                    // Vector (DMP Set Property)
  buf[118] = 0xa1;                    // Address & Data Type
  writeUint16(buf, 119, 0);           // First Property Address
  writeUint16(buf, 121, 1);           // Address Increment
  writeUint16(buf, 123, propertyValueCount); // Property value count

  // Property values --------------------------------------------------------
  buf[125] = 0x00;                    // Start Code (0 = DMX512‑A)
  buf.set(dmx, 126);                  // DMX payload

  return buf;
}

// -------------------------------------------------------------------------
// Helper – 16‑byte CID cache
// -------------------------------------------------------------------------
function getCachedCID(input) {
  const key = Buffer.isBuffer(input) && input.length === 16
    ? input.toString('hex')
    : typeof input === 'string'
      ? input
      : '__random__';

  if (cidCache.has(key)) return cidCache.get(key);

  let cidBuf;
  if (Buffer.isBuffer(input) && input.length === 16) {
    cidBuf = Buffer.from(input);
  } else if (typeof input === 'string') {
    cidBuf = Buffer.alloc(16);
    const parts = input.split(':');
    for (let i = 0; i < 16; i++) {
      cidBuf[i] = i < parts.length ? parseInt(parts[i], 16) : i;
    }
  } else {
    cidBuf = crypto.randomBytes(16);
  }

  cidCache.set(key, cidBuf);
  return cidBuf;
}
