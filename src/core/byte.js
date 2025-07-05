// byte.util.js – byte-level utilities for sACN library
// SPDX-License-Identifier: MIT

/**
 * Read a single bit from an array at the given byte index and bit position.
 * @param {Uint8Array|Buffer} array 
 * @param {number} index 
 * @param {number} bit 
 * @returns {0|1}
 */
export function readBit(array, index, bit) {
  return (array[index] >> bit) & 1;
}

/**
 * Read a two-bit value (crumb) from the array.
 * @param {Uint8Array|Buffer} array 
 * @param {number} index 
 * @param {number} crumb 
 * @returns {0–3}
 */
export function readCrumb(array, index, crumb) {
  return (readBit(array, index, crumb + 1) << 1) | readBit(array, index, crumb);
}

/**
 * Write a single bit in a buffer at the given byte index and bit position.
 * @param {Uint8Array|Buffer} buffer 
 * @param {number} index 
 * @param {number} bit 
 * @param {0|1} value 
 */
export function writeBit(buffer, index, bit, value = 1) {
  if (value === 0) {
    buffer[index] &= ~(1 << bit);
  } else {
    buffer[index] |= 1 << bit;
  }
}

/**
 * Concatenate multiple Uint8Array or Buffer instances into a single Uint8Array.
 * @param {Array<Uint8Array|Buffer>} arrays 
 * @returns {Uint8Array}
 */
export function concatUint8Array(arrays) {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Read unsigned integer values from array.
 */
export function getUint8(array, index) {
  return array[index];
}

export function getUint16(array, index) {
  return (array[index] << 8) | array[index + 1];
}

export function getUint24(array, index) {
  return (array[index] << 16) | (array[index + 1] << 8) | array[index + 2];
}

export function getUint32(array, index) {
  return (array[index] << 24) | (array[index + 1] << 16) | (array[index + 2] << 8) | array[index + 3];
}

/**
 * Read multiple unsigned integer values from array.
 */
export function getMultipleUint8(array, index, length) {
  return Array.from(array.slice(index, index + length));
}

export function getMultipleUint16(array, index, length) {
  return Array.from({ length }, (_, i) => getUint16(array, index + i * 2));
}

export function getMultipleUint24(array, index, length) {
  return Array.from({ length }, (_, i) => getUint24(array, index + i * 3));
}

export function getMultipleUint32(array, index, length) {
  return Array.from({ length }, (_, i) => getUint32(array, index + i * 4));
}

/**
 * Write unsigned integer values to array.
 */
export function writeUint16(array, index, value) {
  array[index] = (value >> 8) & 0xff;
  array[index + 1] = value & 0xff;
}

export function writeUint24(array, index, value) {
  array[index] = (value >> 16) & 0xff;
  array[index + 1] = (value >> 8) & 0xff;
  array[index + 2] = value & 0xff;
}

export function writeUint32(array, index, value) {
  array[index] = (value >> 24) & 0xff;
  array[index + 1] = (value >> 16) & 0xff;
  array[index + 2] = (value >> 8) & 0xff;
  array[index + 3] = value & 0xff;
}

/**
 * Write multiple unsigned integer values to array.
 */
export function writeMultipleUint16(array, index, values) {
  values.forEach((val, i) => writeUint16(array, index + i * 2, val));
}

export function writeMultipleUint24(array, index, values) {
  values.forEach((val, i) => writeUint24(array, index + i * 3, val));
}

export function writeMultipleUint32(array, index, values) {
  values.forEach((val, i) => writeUint32(array, index + i * 4, val));
}

/**
 * Create new Uint8Array for a single unsigned integer value.
 */
export function newUint16(value) {
  const arr = new Uint8Array(2);
  writeUint16(arr, 0, value);
  return arr;
}

export function newUint24(value) {
  const arr = new Uint8Array(3);
  writeUint24(arr, 0, value);
  return arr;
}

export function newUint32(value) {
  const arr = new Uint8Array(4);
  writeUint32(arr, 0, value);
  return arr;
}

/**
 * Write an ASCII string into buffer, padded or truncated to a fixed length.
 * @param {Uint8Array|Buffer} buffer 
 * @param {number} offset 
 * @param {number} length 
 * @param {string} str 
 */
export function writeAscii(buffer, offset, length, str) {
  const strBuf = Buffer.from(str, 'ascii');
  buffer.set(strBuf.slice(0, length), offset);
  for (let i = strBuf.length; i < length; i++) {
    buffer[offset + i] = 0x00;
  }
}
