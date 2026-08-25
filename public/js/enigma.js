'use strict';
(function () {
  // Rotor wiring data (historical Enigma M3)
  const ROTOR_DATA = [
    { name: 'I', wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
    { name: 'II', wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
    { name: 'III', wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
    { name: 'IV', wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notch: 'J' },
    { name: 'V', wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', notch: 'Z' },
  ];
  const REFLECTOR_B = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';

  function letterToNum(c) {
    return c.toUpperCase().charCodeAt(0) - 65;
  }
  function numToLetter(n) {
    return String.fromCharCode(65 + (((n % 26) + 26) % 26));
  }

  function createPlugboard(pairs) {
    const wiring = {};
    for (const pair of pairs) {
      const a = pair[0].toUpperCase();
      const b = pair[1].toUpperCase();
      wiring[a] = b;
      wiring[b] = a;
    }
    return {
      process(input) {
        const c = numToLetter(input);
        return letterToNum(wiring[c] || c);
      },
    };
  }

  function createRotor(name, ring, position) {
    const cfg = ROTOR_DATA.find((r) => r.name === name);
    if (!cfg) throw new Error('Unknown rotor: ' + name);
    const wiring = cfg.wiring;
    const notch = letterToNum(cfg.notch);
    let pos =
      typeof position === 'number' ? position % 26 : letterToNum(position);
    const ringSetting =
      typeof ring === 'number' ? ring % 26 : letterToNum(ring);
    const initialPos = pos;
    return {
      get position() {
        return pos;
      },
      step() {
        pos = (pos + 1) % 26;
      },
      isAtNotch() {
        return pos === notch;
      },
      process(input, isReverse) {
        const p = pos;
        const r = ringSetting;
        if (!isReverse) {
          const adjusted = (input + p - r + 26) % 26;
          const through = letterToNum(wiring[adjusted]);
          return (through - p + r + 26) % 26;
        } else {
          const adjusted = (input + p - r + 26) % 26;
          const charToFind = numToLetter(adjusted);
          const idx = wiring.indexOf(charToFind);
          return (idx - p + r + 26) % 26;
        }
      },
      reset() {
        pos = initialPos;
      },
    };
  }

  const reflector = {
    wiring: REFLECTOR_B,
    process(input) {
      return letterToNum(this.wiring[input]);
    },
  };

  function createEnigma(settings) {
    const plugboard = createPlugboard(settings.plugboard || []);
    const left = createRotor(
      settings.rotors[0].name,
      settings.rotors[0].ring,
      settings.rotors[0].position
    );
    const middle = createRotor(
      settings.rotors[1].name,
      settings.rotors[1].ring,
      settings.rotors[1].position
    );
    const right = createRotor(
      settings.rotors[2].name,
      settings.rotors[2].ring,
      settings.rotors[2].position
    );
    const initialPositions = [
      settings.rotors[0].position,
      settings.rotors[1].position,
      settings.rotors[2].position,
    ];

    function advanceRotors() {
      if (right.isAtNotch()) {
        middle.step();
        if (middle.isAtNotch()) {
          left.step();
        }
      }
      right.step();
    }

    function processChar(ch) {
      let c = letterToNum(ch);
      c = plugboard.process(c);
      c = right.process(c, false);
      c = middle.process(c, false);
      c = left.process(c, false);
      c = reflector.process(c);
      c = left.process(c, true);
      c = middle.process(c, true);
      c = right.process(c, true);
      c = plugboard.process(c);
      return numToLetter(c);
    }

    function processMessage(msg) {
      let out = '';
      for (const ch of msg) {
        if (/[a-zA-Z]/.test(ch)) {
          advanceRotors();
          out += processChar(ch);
        }
      }
      return out;
    }

    function getPositions() {
      return [left.position, middle.position, right.position];
    }

    function reset() {
      left.reset();
      middle.reset();
      right.reset();
    }

    return {
      left,
      middle,
      right,
      advanceRotors,
      processChar,
      processMessage,
      getPositions,
      reset,
      initialPositions,
    };
  }

  // --- UI ---
  const el = (id) => document.getElementById(id);
  const leftRotorType = el('enigma-left-rotor-type');
  const middleRotorType = el('enigma-middle-rotor-type');
  const rightRotorType = el('enigma-right-rotor-type');
  const leftRotorRing = el('enigma-left-ring');
  const middleRotorRing = el('enigma-middle-ring');
  const rightRotorRing = el('enigma-right-ring');
  const leftRotorPos = el('enigma-left-pos');
  const middleRotorPos = el('enigma-middle-pos');
  const rightRotorPos = el('enigma-right-pos');
  const plugboardInput = el('enigma-plugboard');
  const plugboardError = el('enigma-plugboard-error');
  const inputMessage = el('enigma-input');
  const outputMessage = el('enigma-output');
  const lamps = document.querySelectorAll('.enigma-lamp');

  if (!leftRotorType) return;

  let enigma = null;

  function buildEnigma() {
    const plugPairs = plugboardInput.value
      .trim()
      .split(/\s+/)
      .filter((p) => p.length === 2);
    enigma = createEnigma({
      plugboard: plugPairs,
      rotors: [
        {
          name: leftRotorType.value,
          ring: parseInt(leftRotorRing.value) || 0,
          position: letterToNum(leftRotorPos.textContent),
        },
        {
          name: middleRotorType.value,
          ring: parseInt(middleRotorRing.value) || 0,
          position: letterToNum(middleRotorPos.textContent),
        },
        {
          name: rightRotorType.value,
          ring: parseInt(rightRotorRing.value) || 0,
          position: letterToNum(rightRotorPos.textContent),
        },
      ],
    });
    updateRotorDisplay();
  }

  function updateRotorDisplay() {
    if (!enigma) return;
    leftRotorPos.textContent = numToLetter(enigma.left.position);
    middleRotorPos.textContent = numToLetter(enigma.middle.position);
    rightRotorPos.textContent = numToLetter(enigma.right.position);
  }

  function validatePlugboard() {
    const input = plugboardInput.value.trim();
    const pairs = input.split(/\s+/).filter((p) => p.length > 0);
    if (pairs.length > 10) {
      plugboardError.textContent = 'Max 10 plug pairs';
      return false;
    }
    const used = new Set();
    for (const pair of pairs) {
      if (pair.length !== 2) {
        plugboardError.textContent = 'Invalid pair: ' + pair;
        return false;
      }
      if (!/^[A-Z]{2}$/.test(pair)) {
        plugboardError.textContent = 'Only letters A-Z';
        return false;
      }
      if (pair[0] === pair[1]) {
        plugboardError.textContent = 'Cannot connect a letter to itself';
        return false;
      }
      if (used.has(pair[0]) || used.has(pair[1])) {
        plugboardError.textContent = 'Letter used multiple times';
        return false;
      }
      used.add(pair[0]);
      used.add(pair[1]);
    }
    plugboardError.textContent = '';
    return true;
  }

  function lightLamp(letter) {
    lamps.forEach((lamp) => lamp.classList.remove('active'));
    const lamp = document.querySelector(
      `.enigma-lamp[data-letter="${letter}"]`
    );
    if (lamp) {
      lamp.classList.add('active');
      setTimeout(() => lamp.classList.remove('active'), 400);
    }
  }

  // Physical keyboard
  document.addEventListener('keydown', (e) => {
    const letter = e.key.toUpperCase();
    if (/^[A-Z]$/.test(letter) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const key = document.querySelector(`.enigma-key[data-key="${letter}"]`);
      if (key) key.classList.add('pressed');
      if (!enigma) buildEnigma();
      const result = enigma.processChar(letter);
      enigma.advanceRotors();
      updateRotorDisplay();
      lightLamp(result);
      outputMessage.value += result;
    }
  });

  document.addEventListener('keyup', (e) => {
    const letter = e.key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
      const key = document.querySelector(`.enigma-key[data-key="${letter}"]`);
      if (key) key.classList.remove('pressed');
    }
  });

  // On-screen keyboard
  document.querySelectorAll('.enigma-key').forEach((key) => {
    key.addEventListener('click', () => {
      const letter = key.dataset.key;
      if (!enigma) buildEnigma();
      const result = enigma.processChar(letter);
      enigma.advanceRotors();
      updateRotorDisplay();
      lightLamp(result);
      outputMessage.value += result;
    });
  });

  // Process full message
  el('enigma-process').addEventListener('click', () => {
    if (!validatePlugboard()) return;
    const msg = inputMessage.value.toUpperCase().replace(/[^A-Z]/g, '');
    if (!msg) return;
    buildEnigma();
    enigma.reset();
    updateRotorDisplay();
    outputMessage.value = enigma.processMessage(msg);
  });

  // Reset
  el('enigma-reset').addEventListener('click', () => {
    if (enigma) {
      enigma.reset();
      updateRotorDisplay();
    }
    outputMessage.value = '';
    lamps.forEach((lamp) => lamp.classList.remove('active'));
  });

  // Copy
  el('enigma-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outputMessage.value);
      el('enigma-copy').textContent = 'copied!';
      setTimeout(() => {
        el('enigma-copy').textContent = 'copy';
      }, 1500);
    } catch (e) {
      /* ignore */
    }
  });

  // Plugboard validation
  plugboardInput.addEventListener('input', () => {
    plugboardInput.value = plugboardInput.value.toUpperCase();
    validatePlugboard();
  });

  // Rotor type / ring changes: rebuild on next keypress
  [
    leftRotorType,
    middleRotorType,
    rightRotorType,
    leftRotorRing,
    middleRotorRing,
    rightRotorRing,
  ].forEach((el) => {
    if (el)
      el.addEventListener('change', () => {
        enigma = null;
      });
  });

  // Init default settings
  function loadDefaults() {
    leftRotorType.value = 'IV';
    middleRotorType.value = 'III';
    rightRotorType.value = 'V';
    leftRotorRing.value = '0';
    middleRotorRing.value = '0';
    rightRotorRing.value = '0';
    leftRotorPos.textContent = 'J';
    middleRotorPos.textContent = 'V';
    rightRotorPos.textContent = 'Z';
    plugboardInput.value = 'AZ BY CX TD SW';
    validatePlugboard();
    buildEnigma();
  }

  loadDefaults();
})();
