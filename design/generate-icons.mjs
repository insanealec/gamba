import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(here, 'icon-source.svg'))
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
