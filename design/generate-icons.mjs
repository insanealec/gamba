import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// Packs PNG buffers into a single .ico (the "Vista-style" format: each
// frame is just an embedded PNG, not a raw bitmap — every browser back to
// IE11 supports this, and it avoids pulling in an ICO-encoding dependency
// for what's otherwise a ~40-line binary format).
function packIco(pngBuffers) {
  const headerSize = 6
  const dirEntrySize = 16
  const dirSize = dirEntrySize * pngBuffers.length
  let offset = headerSize + dirSize

  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(pngBuffers.length, 4)

  const dirEntries = []
  for (const { size, data } of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize)
    entry.writeUInt8(size >= 256 ? 0 : size, 0) // width (0 means 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1) // height
    entry.writeUInt8(0, 2) // color count
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // planes
    entry.writeUInt16LE(32, 6) // bit depth
    entry.writeUInt32LE(data.length, 8) // byte size
    entry.writeUInt32LE(offset, 12) // offset
    dirEntries.push(entry)
    offset += data.length
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((p) => p.data)])
}

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(here, 'icon-source.svg'))
const faviconSource = readFileSync(resolve(here, '../public/favicon.svg'))
const outDir = resolve(here, '../public')

const targets = [
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
  { file: 'pwa-maskable-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
]

for (const { file, size } of targets) {
  await sharp(source, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(`${outDir}/${file}`)
  console.log(`wrote ${file} (${size}x${size})`)
}

const ogSource = readFileSync(resolve(here, 'og-image-source.svg'))
await sharp(ogSource, { density: 192 })
  .resize(1200, 630)
  .png()
  .toFile(`${outDir}/og-image.png`)
console.log('wrote og-image.png (1200x630)')

// Traditional favicon fallbacks — the SVG favicon covers modern browsers,
// but plenty of RSS readers, link-preview crawlers, and older browsers only
// look for /favicon.ico or a PNG <link rel="icon">.
const faviconSizes = [16, 32, 48]
const faviconPngs = []
for (const size of faviconSizes) {
  const data = await sharp(faviconSource, { density: 384 }).resize(size, size).png().toBuffer()
  faviconPngs.push({ size, data })
  if (size === 16 || size === 32) {
    writeFileSync(`${outDir}/favicon-${size}x${size}.png`, data)
    console.log(`wrote favicon-${size}x${size}.png`)
  }
}
writeFileSync(`${outDir}/favicon.ico`, packIco(faviconPngs))
console.log('wrote favicon.ico (16/32/48)')
