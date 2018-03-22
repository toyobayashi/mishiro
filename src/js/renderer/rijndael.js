
/**
 * Authors: 
 *   Bram Cohen - main author
 *   Trevor Perrin - minor changes for Python compatibility
 *   Toyobayashi - Translated Python code to JavaScript
 * 
 * Usage: 
 * const { Rijndael } = require('/path/to/this-file')
 * let r = new Rijndael(key, block_size = 16)
 * let ciphertext = r.encrypt(plaintext)
 * let plaintext = r.decrypt(ciphertext)
 */

/***
A pure python (slow) implementation of rijndael with a decent interface
To include -
from rijndael import rijndael
To do a key setup -
r = rijndael(key, block_size = 16)
key must be a string of length 16, 24, or 32
blocksize must be 16, 24, or 32. Default is 16
To use -
ciphertext = r.encrypt(plaintext)
plaintext = r.decrypt(ciphertext)
If any strings are of the wrong length a ValueError is thrown
***/

// ported from the Java reference code by Bram Cohen, April 2001
// this code is public domain, unless someone makes 
// an intellectual property claim against the reference 
// code, in which case it can be made public domain by 
// deleting all the comments and renaming all the variable

let shifts = [[[0, 0], [1, 3], [2, 2], [3, 1]],
          [[0, 0], [1, 5], [2, 4], [3, 3]],
          [[0, 0], [1, 7], [3, 5], [4, 4]]]

// [keysize][block_size]
let num_rounds = {16: {16: 10, 24: 12, 32: 14}, 24: {16: 12, 24: 12, 32: 14}, 32: {16: 14, 24: 14, 32: 14}}

let A = [
  [1, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 1, 1],
  [1, 1, 0, 0, 0, 1, 1, 1],
  [1, 1, 1, 0, 0, 0, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 1]
]

// produce log and alog tables, needed for multiplying in the
// field GF(2^m) (generator = 3)
let alog = [1]

for (let i = 0; i < 255; i++) {
  let n = alog[alog.length - 1]
  let j = (n << 1) ^ n
  if ((j & 0x100) != 0) {
    j = j ^ 0x11b
  }
  alog.push(j)
}

let log = Array.from({ length: 256 }, () => 0)

for (let i = 1; i < 255; i++) {
  log[alog[i]] = i
}

// multiply two elements of GF(2^m)
function mul (a, b) {
  if (a == 0 || b == 0) return 0
  return alog[(log[a & 0xFF] + log[b & 0xFF]) % 255]
}

let box = Array.from({ length: 256 }, () => [0, 0, 0, 0, 0, 0, 0, 0])
box[1][7] = 1
for (let i = 2; i < 256; i++) {
  let j = alog[255 - log[i]]
  for (let t = 0; t < 8; t++) {
    box[i][t] = (j >> (7 - t)) & 0x01
  }
}

let B = [0, 1, 1, 0, 0, 0, 1, 1]

// affine transform:  box[i] <- B + A*box[i]
let cox = Array.from({ length: 256 }, () => [0, 0, 0, 0, 0, 0, 0, 0])
for (let i = 0; i < 256; i++) {
  for (let t = 0; t < 8; t++) {
    cox[i][t] = B[t]
    for (let j = 0; j < 8; j++) {
      cox[i][t] ^= A[t][j] * box[i][j]
    }
  }
}

// S-boxes and inverse S-boxes
let S = Array.from({ length: 256 }, () => 0)
let Si = Array.from({ length: 256 }, () => 0)

for (let i = 0; i < 256; i++) {
  S[i] = cox[i][0] << 7
  for (let t = 1; t < 8; t++) {
    S[i] ^= cox[i][t] << (7 - t)
  }
  Si[S[i] & 0xFF] = i
}

let G = [
  [2, 1, 1, 3],
  [3, 2, 1, 1],
  [1, 3, 2, 1],
  [1, 1, 3, 2]
]

let AA = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]]
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    AA[i][j] = G[i][j]
    AA[i][i + 4] = 1
  }
}

for (let i = 0; i < 4; i++) {
  let pivot = AA[i][i]
  if (pivot == 0) {
    let t = i + 1
    while (AA[t][i] == 0 && t < 4) {
      t += 1
      if (t == 4) throw new Error('G matrix must be invertible')
      for (let j = 0; j < 8; j++) {
        let tmp = AA[i][j]
        AA[i][j] = AA[t][j]
        AA[t][j] = tmp
      }
      pivot = AA[i][i]
    }
  }
  for (let j = 0; j < 8; j++) {
    if (AA[i][j] != 0) {
      AA[i][j] = alog[(255 + log[AA[i][j] & 0xFF] - log[pivot & 0xFF]) % 255]
    }
  }
  for (let t = 0; t < 4; t++) {
    if (i != t) {
      for (let j = i + 1; j < 8; j++) {
        AA[t][j] ^= mul(AA[i][j], AA[t][i])
      }
      AA[t][i] = 0
    }
  }
}

let iG = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    iG[i][j] = AA[i][j + 4]
  }
}

function mul4 (a, bs) {
  if (a == 0) return 0
  let r = 0
  for (let b of bs) {
    // r <<= 8
    r = LEFT(r, 8)
    if (b != 0) r = OR(r, mul(a, b))
  }
  return r
}

let T1 = []
let T2 = []
let T3 = []
let T4 = []
let T5 = []
let T6 = []
let T7 = []
let T8 = []
let U1 = []
let U2 = []
let U3 = []
let U4 = []

for (let t = 0; t < 256; t++) {
  let s = S[t]
  T1.push(mul4(s, G[0]))
  T2.push(mul4(s, G[1]))
  T3.push(mul4(s, G[2]))
  T4.push(mul4(s, G[3]))

  s = Si[t]
  T5.push(mul4(s, iG[0]))
  T6.push(mul4(s, iG[1]))
  T7.push(mul4(s, iG[2]))
  T8.push(mul4(s, iG[3]))

  U1.push(mul4(t, iG[0]))
  U2.push(mul4(t, iG[1]))
  U3.push(mul4(t, iG[2]))
  U4.push(mul4(t, iG[3]))
}

let rcon = [1]
let r = 1
for (let t = 1; t < 30; t++) {
  r = mul(2, r)
  rcon.push(r)
}

class Rijndael {
  constructor (key, block_size = 16) {
    if (block_size != 16 && block_size != 24 && block_size != 32) throw new Error(`Invalid block size: ${block_size}`)
    if (key.length != 16 && key.length != 24 && key.length != 32) throw new Error(`Invalid key size: ${key.length}`)
    this.block_size = block_size

    const ROUNDS = num_rounds[key.length][block_size]
    const BC = DIV(block_size, 4)
    // encryption round keys
    let Ke = []
    // decryption round keys
    let Kd = []
    for (let i = 0; i < ROUNDS + 1; i++) {
      Ke.push(Array.from({ length: BC }, () => 0))
      Kd.push(Array.from({ length: BC }, () => 0))
    }
    const ROUND_KEY_COUNT = (ROUNDS + 1) * BC
    const KC = DIV(key.length, 4)

    // copy user material bytes into temporary ints
    let tk = []
    for (let i = 0; i < KC; i++) {
      tk.push(OR(
                OR(
                  OR(
                    LEFT(ord(key[i * 4]), 24),
                    LEFT(ord(key[i * 4 + 1]), 16)
                  ),
                  LEFT(ord(key[i * 4 + 2]), 8)
                ),
                ord(key[i * 4 + 3])
              ))
    }

    // copy values into round key arrays
    let t = 0
    let j = 0
    while (j < KC && t < ROUND_KEY_COUNT) {
      Ke[DIV(t, BC)][t % BC] = tk[j]
      Kd[ROUNDS - DIV(t, BC)][t % BC] = tk[j]
      j += 1
      t += 1
    }
    let tt = 0
    let rconpointer = 0
    while (t < ROUND_KEY_COUNT) {
      tt = tk[KC - 1]
      tk[0] = XOR(
                tk[0],
                XOR(
                  XOR(
                    XOR(
                      XOR(
                        LEFT(AND(S[AND(RIGHT(tt, 16), 0xFF)], 0xFF), 24),
                        LEFT(AND(S[AND(RIGHT(tt, 8), 0xFF)], 0xFF), 16)
                      ),
                      LEFT(AND(S[AND(tt, 0xFF)], 0xFF), 8)
                    ),
                    AND(S[AND(RIGHT(tt, 24), 0xFF)], 0xFF)
                  ),
                  LEFT(AND(rcon[rconpointer], 0xFF), 24)
                )
              )
      rconpointer += 1
      if (KC != 8) {
        for (let i = 1; i < KC; i++) {
          tk[i] = XOR(tk[i], tk[i - 1])
        }
      } else {
        for (let i = 1; i < DIV(KC, 2); i++) {
          tk[i] = XOR(tk[i], tk[i - 1])
        }
        tt = tk[DIV(KC, 2) - 1]
        tk[DIV(KC, 2)] = XOR(
                           tk[DIV(KC, 2)],
                           XOR(
                             XOR(
                               XOR(
                                 AND(S[AND(tt, 0xFF)], 0xFF),
                                 LEFT(AND(S[AND(RIGHT(tt, 8), 0xFF)], 0xFF), 8)
                               ),
                               LEFT(AND(S[AND(RIGHT(tt, 16), 0xFF)], 0xFF), 16)
                             ),
                             LEFT(AND(S[AND(RIGHT(tt, 24), 0xFF)], 0xFF), 24)
                           )
                         )
        for (let i = DIV(KC, 2) + 1; i < KC; i++) {
          tk[i] = XOR(tk[i], tk[i - 1])
        }
      }
      j = 0
      while (j < KC && t < ROUND_KEY_COUNT) {
        Ke[DIV(t, BC)][t % BC] = tk[j]
        Kd[ROUNDS - DIV(t, BC)][t % BC] = tk[j]
        j += 1
        t += 1
      }
    }
    // inverse MixColumn where needed
    for (let r = 1; r < ROUNDS; r++) {
      for (let j = 0; j < BC; j++) {
        tt = Kd[r][j]
        Kd[r][j] = XOR(
                     XOR(
                       XOR(
                         U1[AND(RIGHT(tt, 24), 0xFF)],
                         U2[AND(RIGHT(tt, 16), 0xFF)]
                       ),
                       U3[AND(RIGHT(tt, 8), 0xFF)]
                     ),
                     U4[AND(tt, 0xFF)]
                   )
      }
    }
    this.Ke = Ke
    this.Kd = Kd
  }

  encrypt (plaintext) {
    if (plaintext.length != this.block_size) throw new Error(`wrong block length, expected ${this.block_size} got ${plaintext.length}`)
    let Ke = this.Ke
    const BC = DIV(this.block_size, 4)
    const ROUNDS = Ke.length - 1
    let SC
    if (BC == 4) SC = 0
    else if (BC == 6) SC = 1
    else SC = 2
    let s1 = shifts[SC][1][0]
    let s2 = shifts[SC][2][0]
    let s3 = shifts[SC][3][0]
    let a = Array.from({length: BC}, () => 0)
    let t = []
    for (let i = 0; i < BC; i++) {
      t.push(
        XOR(
          OR(
            OR(
              OR(
                LEFT(ord(plaintext[i * 4]), 24),
                LEFT(ord(plaintext[i * 4 + 1]), 16)
              ),
              LEFT(ord(plaintext[i * 4 + 2]), 8)
            ),
            ord(plaintext[i * 4 + 3])
          ),
          Ke[0][i]
        )
      )
    }
    for (let r = 1; r < ROUNDS; r++) {
      for (let i = 0; i < BC; i++) {
        a[i] = XOR(
          XOR(
            XOR(
              XOR(
                T1[AND(RIGHT(t[i], 24), 0xFF)],
                T2[AND(RIGHT(t[(i + s1) % BC], 16), 0xFF)]
              ),
              T3[AND(RIGHT(t[(i + s2) % BC], 8), 0xFF)]
            ),
            T4[AND(t[(i + s3) % BC], 0xFF)]
          ),
          Ke[r][i]
        )
      }
      t = copy(a)
    }
    let result = []
    for (let i = 0; i < BC; i++) {
      let tt = Ke[ROUNDS][i]
      result.push(AND(XOR(S[AND(RIGHT(t[i], 24), 0xFF)], RIGHT(tt, 24)), 0xFF))
      result.push(AND(XOR(S[AND(RIGHT(t[(i + s1) % BC], 16), 0xFF)], RIGHT(tt, 16)), 0xFF))
      result.push(AND(XOR(S[AND(RIGHT(t[(i + s2) % BC], 8), 0xFF)], RIGHT(tt, 8)), 0xFF))
      result.push(AND(XOR(S[AND(t[(i + s3) % BC], 0xFF)], tt), 0xFF))
    }
    return result.map(v => chr(v)).join('')
  }

  decrypt (ciphertext) {
    if (ciphertext.length != this.block_size) throw new Error(`wrong block length, expected ${this.block_size} got ${plaintext.length}`)
    let Kd = this.Kd
    const BC = DIV(this.block_size, 4)
    const ROUNDS = Kd.length - 1
    let SC
    if (BC == 4) SC = 0
    else if (BC == 6) SC = 1
    else SC = 2
    let s1 = shifts[SC][1][1]
    let s2 = shifts[SC][2][1]
    let s3 = shifts[SC][3][1]
    let a = Array.from({ length: BC }, () => 0)
    let t = Array.from({ length: BC }, () => 0)
    for (let i = 0; i < BC; i++) {
      t[i] = (
        XOR(
          OR(
            OR(
              OR(
                LEFT(ord(ciphertext[i * 4]), 24),
                LEFT(ord(ciphertext[i * 4 + 1]), 16)
              ),
              LEFT(ord(ciphertext[i * 4 + 2]), 8)
            ),
            ord(ciphertext[i * 4 + 3])
          ),
          Kd[0][i]
        )
      )
    }
    for (let r = 1; r < ROUNDS; r++) {
      for (let i = 0; i < BC; i++) {
        a[i] = XOR(
          XOR(
            XOR(
              XOR(
                T5[AND(RIGHT(t[i], 24), 0xFF)],
                T6[AND(RIGHT(t[(i + s1) % BC], 16), 0xFF)]
              ),
              T7[AND(RIGHT(t[(i + s2) % BC], 8), 0xFF)]
            ),
            T8[AND(t[(i + s3) % BC], 0xFF)]
          ),
          Kd[r][i]
        )
      }
      t = copy(a)
    }
    let result = []
    for (let i = 0; i < BC; i++) {
      let tt = Kd[ROUNDS][i]
      result.push(AND(XOR(Si[AND(RIGHT(t[i], 24), 0xFF)], RIGHT(tt, 24)), 0xFF))
      result.push(AND(XOR(Si[AND(RIGHT(t[(i + s1) % BC], 16), 0xFF)], RIGHT(tt, 16)), 0xFF))
      result.push(AND(XOR(Si[AND(RIGHT(t[(i + s2) % BC], 8), 0xFF)], RIGHT(tt, 8)), 0xFF))
      result.push(AND(XOR(Si[AND(t[(i + s3) % BC], 0xFF)], tt), 0xFF))
    }
    return result.map(v => chr(v)).join('')
  }
}

function copy (arr) {
  let o = []
  for (let i = 0; i < arr.length; i++) {
    o[i] = arr[i]
  }
  return o
}

function chr (code) {
  return String.fromCharCode(code)
}

function ord (str) {
  return str.charCodeAt()
}

function OR (a, b) {
  let x = a.toString(2)
  let y = b.toString(2)
  let d = Math.abs(x.length - y.length)
  let l = 0
  if (x.length < y.length) {
    x = Array.from({ length: d }, () => 0).join('') + x
    l = x.length
  } else {
    y = Array.from({ length: d }, () => 0).join('') + y
    l = y.length
  }

  let s = ''
  for (let i = 0; i < l; i++) {
    if (x[i] == 1 || y[i] == 1) s += '1'
    else s += '0'
  }
  return parseInt(s, 2)
}

function AND (a, b) {
  let x = a.toString(2)
  let y = b.toString(2)
  let d = Math.abs(x.length - y.length)
  let l = 0
  if (x.length < y.length) {
    x = Array.from({ length: d }, () => 0).join('') + x
    l = x.length
  } else {
    y = Array.from({ length: d }, () => 0).join('') + y
    l = y.length
  }

  let s = ''
  for (let i = 0; i < l; i++) {
    if (x[i] == 0 || y[i] == 0) s += '0'
    else s += '1'
  }
  return parseInt(s, 2)
}

function LEFT (a, b) {
  return a * Math.pow(2, b)
}
function RIGHT (a, b) {
  return Math.floor(a * Math.pow(2, -b))
}
function XOR (a, b) {
  let x = a.toString(2)
  let y = b.toString(2)
  let d = Math.abs(x.length - y.length)
  let l = 0
  if (x.length < y.length) {
    x = Array.from({ length: d }, () => 0).join('') + x
    l = x.length
  } else {
    y = Array.from({ length: d }, () => 0).join('') + y
    l = y.length
  }

  let s = ''
  for (let i = 0; i < l; i++) {
    if (x[i] != y[i]) s += '1'
    else s += '0'
  }
  return parseInt(s, 2)
}
function DIV (a, b) {
  return Math.floor(a / b)
}

// module.exports = Rijndael

/*module.exports = */ export default {
  Rijndael,
  encrypt (key, block) {
    let r = new Rijndael(key, block.length)
    return r.encrypt(block)
  },
  decrypt (key, block) {
    let r = new Rijndael(key, block.length)
    return r.decrypt(block)
  }
}

/* function test () {
  function t (kl, bl) {
    b = Array.from({length: bl}, () => 'b').join('')
    r = new Rijndael(Array.from({ length: kl }, () => 'a').join(''), bl)
    // let n = r.encrypt(b)
    // for (let i = 0; i < n.length; i++) {
    //   console.log(ord(n[i]))
    // }
    console.log(r.decrypt(r.encrypt(b)) === b)
  }
  t(16, 16)
  t(16, 24)
  t(16, 32)
  t(24, 16)
  t(24, 24)
  t(24, 32)
  t(32, 16)
  t(32, 24)
  t(32, 32)
}
test() */
