---
title: Simulating the Enigma Machine with JavaScript
slug: javascript-enigma-machine
publishDate: "2025-07-29"
description: "A deep dive into the Enigma machine and how to simulate its complex cryptographic processes using JavaScript."
categories: ["Software Development"]
tags: ["cryptography", "enigma machine", "javascript"]
author: Andrew
comments_enabled: true
featured: true
---

The Enigma machine, a cipher device used extensively by Nazi Germany during World War II, represents a fascinating piece of cryptographic history. Its complex system of rotors, reflectors, and a plugboard made it a formidable challenge for the Allied codebreakers at Bletchley Park.

Inspired by this history, I decided to build my own Enigma machine simulator using JavaScript. This project, available on GitHub, is a web-based application that allows you to encrypt and decrypt messages using a simulated Enigma machine.

### How the Enigma Machine Works

The Enigma was an electro-mechanical device that used a polyalphabetic substitution cipher. Its strength came from the fact that the substitution alphabet changed with every key press. The main components were:

*   **Plugboard (Steckerbrett):** A plugboard that swapped pairs of letters before and after the main rotor scrambling. This was the first and last step in the encryption process.
*   **Rotors (Walzen):** A set of rotating wheels, each with 26 electrical contacts on each side. The internal wiring of each rotor performed a simple substitution cipher. The military Enigma used a set of three rotors chosen from a box of five.
*   **Rotor Stepping:** With each key press, the rightmost rotor would advance one position. When a rotor completed a full rotation, it would trigger the next rotor to its left to advance, similar to an odometer. This is what changed the substitution for each letter.
*   **Reflector (Umkehrwalze):** A static rotor that sent the electrical signal back through the rotors via a different path. A key feature of the reflector was that it ensured no letter could be encrypted as itself, a crucial flaw that was later exploited by codebreakers.

### The Mathematics of the Enigma

The encryption process of the Enigma can be represented as a series of permutations. Let's denote the plugboard permutation as `P`, the rotor permutations as `R1`, `R2`, and `R3`, and the reflector permutation as `U`. The encryption of a single letter `L` can be represented as:

`Ciphertext = P * R1 * R2 * R3 * U * R3^-1 * R2^-1 * R1^-1 * P^-1 * L`

Where `R^-1` is the inverse permutation of `R`. Since the plugboard swaps pairs of letters, it is its own inverse (`P = P^-1`).

### Emulating the Enigma in JavaScript

To simulate the Enigma machine in JavaScript, we can represent each component as an object or class. The rotors, for example, can be represented as objects with a `wiring` property that maps each letter to its substitution.

```javascript
const rotors = {
  'I': {
    wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
    turnover: 'Q'
  },
  'II': {
    wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
    turnover: 'E'
  },
  // ... and so on for the other rotors
};
```

The `turnover` property indicates the letter at which the rotor will trigger the next rotor to step.

The encryption process can then be implemented as a function that passes the input letter through each component in the correct order.

```javascript
function encrypt(letter) {
  // 1. Plugboard
  let encryptedLetter = plugboard.process(letter);

  // 2. Rotors (right to left)
  encryptedLetter = rotor3.forward(encryptedLetter);
  encryptedLetter = rotor2.forward(encryptedLetter);
  encryptedLetter = rotor1.forward(encryptedLetter);

  // 3. Reflector
  encryptedLetter = reflector.process(encryptedLetter);

  // 4. Rotors (left to right)
  encryptedLetter = rotor1.backward(encryptedLetter);
  encryptedLetter = rotor2.backward(encryptedLetter);
  encryptedLetter = rotor3.backward(encryptedLetter);

  // 5. Plugboard again
  encryptedLetter = plugboard.process(encryptedLetter);

  // 6. Advance rotors for the next letter
  advanceRotors();

  return encryptedLetter;
}
```

The `advanceRotors` function would handle the stepping mechanism, checking the `turnover` points of each rotor.

This project was a fascinating exercise in understanding the inner workings of the Enigma machine. It's a great way to get a hands-on understanding of how this iconic cipher machine worked and to appreciate the incredible intellectual achievement of the codebreakers who cracked its code. You can try out the simulator for yourself on the project's GitHub page.

Here is the equation for the number of possible keys on a Wehrmacht Enigma:

$
N = 5 \times 4 \times 3 \times (26 \times 26 \times 26) \times \frac{26!}{2^{10} \times 10! \times 6!} \approx 1.59 \times 10^{20}
$

