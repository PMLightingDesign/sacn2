# sACN2 - Improved sACN Transmitter for Node.js



sACN2 is a modern, efficient, and cross-platform streaming ACN (sACN / ESTA E1.31) transmitter built specifically for Node.js applications. It simplifies the process of sending DMX-over-IP data for lighting control, ensuring consistent performance and easy integration.

---

## Features

- **Cross-platform**: Fully supports Windows, Linux, and macOS.
- **Dedicated worker thread**: Maintains stable and responsive UDP transmission independent of your main application.
- **Automatic interface selection**: Intelligently chooses network interface or allows explicit IP binding.
- **Simple API**: Easily integrates into Node.js applications.
- **Efficient packet construction**: Minimal overhead and optimal performance even at high frame rates.

---

## Installation

Install using npm:

```bash
npm install sacn2
```

---

## Basic Usage

Here's a quick example to get you started:

```js
import { createTransmitter } from 'sacn2';

// Initialize transmitter for universes 1-4
const sacn = createTransmitter({
  universes: [1, 2, 3, 4],
  interface: 'auto',        // Automatically select network interface
  appName: 'MyLightingApp',
  priority: 100
});

// Send a DMX frame to universe 1
const dmxData = new Uint8Array(512).fill(255); // Full-on DMX
sacn.send(1, dmxData);

// When finished, terminate cleanly
await sacn.close();
```

---

## Interface Binding Options

The `interface` option supports three modes:

- **Explicit IP address**:

  ```js
  createTransmitter({ interface: '192.168.1.50' });
  ```

- **Automatic selection** (default patterns: 10.101.1.x, 10.101.x.x, 192.168.0.x, 192.168.1.x, 192.168.x.x):

  ```js
  createTransmitter({ interface: 'auto' });
  ```

- **Fallback** (wildcard):

  ```js
  createTransmitter(); // Defaults to '0.0.0.0'
  ```

---

## Running Tests

To see a visual demonstration, run the rainbow test:

```bash
node test/rainbow.js
```

This outputs smooth rainbow gradients across four universes for testing purposes.

---

## Project Structure

```
sacn2/
├─ src/
│  ├─ core/
│  │  ├─ packet.js
│  │  └─ byte.js
│  ├─ worker/
│  │  └─ transmitter.worker.js
│  └─ index.js
├─ test/
│  └─ rainbow.js
├─ package.json
└─ README.md
```

---

## Contributing

Contributions and issues are welcome. Please open an issue or pull request on GitHub:

- [Issues](https://github.com/PMLightingDesign/sacn2/issues)
- [Pull Requests](https://github.com/PMLightingDesign/sacn2/pulls)

---

## License

MIT © [Peter Milo](https://github.com/PMLightingDesign)

---

## Repository

[https://github.com/PMLightingDesign/sacn2](https://github.com/PMLightingDesign/sacn2)

