// transmitter.worker.js – dedicated sACN transmitter worker
// SPDX-License-Identifier: MIT

import { parentPort, workerData } from 'node:worker_threads';
import dgram from 'dgram';
import { buildPacket } from '../core/packet.js';
import os from 'os';

// Preference list for 'auto' interface selection
const IP_ORDER = [
  '10.101.1',
  '10.101',
  '192.168.0',
  '192.168.1',
  '192.168'
];

// Unpack options passed from index.js
const { universes, priority, cid, appName, interface: ifaceOption } = workerData;
const PORT = 5568;

// Determine bind address based on option
function chooseBindAddress() {
  if (typeof ifaceOption === 'string' && ifaceOption !== 'auto') {
    // explicit IP
    return ifaceOption;
  }
  if (ifaceOption === 'auto') {
    const nets = os.networkInterfaces();
    for (const pattern of IP_ORDER) {
      for (const [name, addrs] of Object.entries(nets)) {
        for (const addr of addrs) {
          if (addr.family === 'IPv4' && !addr.internal && addr.address.startsWith(pattern)) {
            return addr.address;
          }
        }
      }
    }
  }
  // fallback: wildcard address
  return '0.0.0.0';
}

const bindAddress = chooseBindAddress();

// Create UDP socket with reuseAddr to allow multiple binds
const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

socket.on('error', (err) => {
  console.error('sACN socket error', err);
  socket.close();
});

socket.bind(PORT, bindAddress, () => {
  console.log(`sACN transmitter bound on ${bindAddress}:${PORT}`);

  // If we also need to listen for incoming multicast on certain universes
  if (workerData.inputUniverses) {
    for (const u of workerData.inputUniverses) {
      const mcast = `239.255.0.${u}`;
      socket.addMembership(mcast, bindAddress);
      console.log(`Listening for sACN input on ${mcast}`);
    }
  }

  // Listen for requests from main thread
  parentPort.on('message', ({ universe, dmx }) => {
    try {
      const packet = buildPacket(universe, new Uint8Array(dmx), { priority, cid, appName });
      socket.send(packet, PORT, `239.255.${universe >> 8}.${universe & 0xff}`, err => {
        if (err) console.error('UDP Send Error:', err);
      });
    } catch (err) {
      console.error('Error building/sending sACN packet', err);
    }
  });
});

// Clean up on exit
parentPort.on('close', () => socket.close());
