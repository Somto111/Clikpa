// Pure-JS ISO/IEC 18004 QR Code Matrix Generator (Versions 1-5, Error Correction Level L, Byte Mode)
const VERSIONS = [
  null,
  { size: 21, dataBytes: 19, ecBytes: 7, align: [] },
  { size: 25, dataBytes: 34, ecBytes: 10, align: [6, 18] },
  { size: 29, dataBytes: 55, ecBytes: 15, align: [6, 22] },
  { size: 33, dataBytes: 80, ecBytes: 20, align: [6, 26] },
  { size: 37, dataBytes: 108, ecBytes: 26, align: [6, 30] },
]

// Precomputed 15-bit BCH format info for Level L (01) with mask 0 (000) XOR 0x5412 => 0x77C4
const FORMAT_BITS_L_MASK0 = 0x77c4

const GF_EXP = new Uint8Array(512)
const GF_LOG = new Uint8Array(256)
;(function initGaloisField() {
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x
    GF_LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255]
  }
})()

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0
  return GF_EXP[GF_LOG[a] + GF_LOG[b]]
}

function rsGeneratorPoly(degree) {
  let poly = new Uint8Array([1])
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1)
    const root = GF_EXP[i]
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j]
      next[j + 1] ^= gfMul(poly[j], root)
    }
    poly = next
  }
  return poly
}

function rsEncode(data, ecLen) {
  const gen = rsGeneratorPoly(ecLen)
  const rem = new Uint8Array(ecLen)
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ rem[0]
    for (let j = 0; j < ecLen - 1; j++) {
      rem[j] = rem[j + 1] ^ gfMul(gen[j + 1], factor)
    }
    rem[ecLen - 1] = gfMul(gen[ecLen], factor)
  }
  return rem
}

export function generateQrMatrix(text) {
  const rawBytes = new TextEncoder().encode(String(text || '').slice(0, 104))
  let version = 1
  while (version < 5 && rawBytes.length + 2 > VERSIONS[version].dataBytes) {
    version++
  }
  const spec = VERSIONS[version]
  const size = spec.size

  // Encode Byte mode stream: 4-bit mode (0100) + 8-bit length + bytes + terminator + pad
  const bits = []
  const pushBits = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1)
  }
  pushBits(0b0100, 4)
  pushBits(rawBytes.length, 8)
  for (const b of rawBytes) pushBits(b, 8)

  const maxDataBits = spec.dataBytes * 8
  const term = Math.min(4, maxDataBits - bits.length)
  pushBits(0, term)
  while (bits.length % 8 !== 0) bits.push(0)

  const dataCodewords = new Uint8Array(spec.dataBytes)
  for (let i = 0; i < bits.length / 8; i++) {
    let byte = 0
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i * 8 + b]
    dataCodewords[i] = byte
  }
  const pads = [0xec, 0x11]
  for (let i = bits.length / 8, p = 0; i < spec.dataBytes; i++, p++) {
    dataCodewords[i] = pads[p % 2]
  }

  const ecCodewords = rsEncode(dataCodewords, spec.ecBytes)
  const allCodewords = new Uint8Array(spec.dataBytes + spec.ecBytes)
  allCodewords.set(dataCodewords, 0)
  allCodewords.set(ecCodewords, spec.dataBytes)

  const modules = Array.from({ length: size }, () => new Array(size).fill(false))
  const isFunction = Array.from({ length: size }, () => new Array(size).fill(false))

  const setFunction = (r, c, dark) => {
    if (r < 0 || r >= size || c < 0 || c >= size) return
    modules[r][c] = Boolean(dark)
    isFunction[r][c] = true
  }

  const drawFinder = (topR, leftC) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const dist = Math.max(Math.abs(dr - 3), Math.abs(dc - 3))
        const dark = dist !== 2 && dist !== 4
        setFunction(topR + dr, leftC + dc, dark)
      }
    }
  }

  drawFinder(0, 0)
  drawFinder(0, size - 7)
  drawFinder(size - 7, 0)

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setFunction(6, i, i % 2 === 0)
    setFunction(i, 6, i % 2 === 0)
  }

  // Alignment patterns
  for (const ar of spec.align) {
    for (const ac of spec.align) {
      if ((ar === 6 && ac === 6) || (ar === 6 && ac === size - 7) || (ar === size - 7 && ac === 6)) {
        continue
      }
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          setFunction(ar + dr, ac + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1)
        }
      }
    }
  }

  // Dark module + reserve format info strips
  setFunction(size - 8, 8, true)
  for (let i = 0; i < 9; i++) {
    if (!isFunction[8][i]) setFunction(8, i, false)
    if (!isFunction[i][8]) setFunction(i, 8, false)
  }
  for (let i = 0; i < 8; i++) {
    setFunction(8, size - 1 - i, false)
    setFunction(size - 1 - i, 8, false)
  }

  // Place data bits in upward/downward 2-column zig-zag with Mask 0 ((r + c) % 2 === 0)
  let bitIdx = 0
  const totalBits = allCodewords.length * 8
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    const upward = ((right + 1) & 2) === 0
    for (let vert = 0; vert < size; vert++) {
      const r = upward ? size - 1 - vert : vert
      for (let j = 0; j < 2; j++) {
        const c = right - j
        if (!isFunction[r][c]) {
          let dark = false
          if (bitIdx < totalBits) {
            dark = ((allCodewords[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1) === 1
            bitIdx++
          }
          if ((r + c) % 2 === 0) dark = !dark
          modules[r][c] = dark
        }
      }
    }
  }

  // Write 15-bit format bits for Level L, Mask 0
  const f = FORMAT_BITS_L_MASK0
  for (let i = 0; i <= 5; i++) setFunction(8, i, ((f >> i) & 1) === 1)
  setFunction(8, 7, ((f >> 6) & 1) === 1)
  setFunction(8, 8, ((f >> 7) & 1) === 1)
  setFunction(7, 8, ((f >> 8) & 1) === 1)
  for (let i = 9; i < 15; i++) setFunction(14 - i, 8, ((f >> i) & 1) === 1)

  for (let i = 0; i < 8; i++) setFunction(8, size - 1 - i, ((f >> i) & 1) === 1)
  for (let i = 8; i < 15; i++) setFunction(size - 15 + i, 8, ((f >> i) & 1) === 1)

  return modules
}
