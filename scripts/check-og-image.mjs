import { readdir, readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const metadataPath = resolve('config/meta.tsx');
const metadataSource = await readFile(metadataPath, 'utf8');
const metadataBase = metadataSource.match(
  /metadataBase:\s*new URL\(['"]([^'"]+)['"]\)/
);
const openGraphImage = metadataSource.match(
  /openGraph:\s*\{[\s\S]*?images:\s*\[\s*\{\s*url:\s*['"]([^'"]+)['"],\s*width:\s*(\d+),\s*height:\s*(\d+)/
);
const twitterImage = metadataSource.match(
  /twitter:\s*\{[\s\S]*?images:\s*\[\s*['"]([^'"]+)['"]\s*\]/
);

if (!metadataBase || !openGraphImage || !twitterImage) {
  throw new Error(
    'Could not find the metadata base and social image metadata in config/meta.tsx'
  );
}

const [, imageUrl, widthText, heightText] = openGraphImage;
const [, twitterImageUrl] = twitterImage;
if (imageUrl !== twitterImageUrl) {
  throw new Error(
    `Open Graph image (${imageUrl}) and Twitter image (${twitterImageUrl}) differ`
  );
}

const imagePath = resolve('public', imageUrl.replace(/^\//, ''));
const image = await readFile(imagePath);
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
if (
  !image.subarray(0, 8).equals(pngSignature) ||
  image.toString('ascii', 12, 16) !== 'IHDR'
) {
  throw new Error(`${imagePath} is not a valid PNG image`);
}

const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);
const declaredWidth = Number(widthText);
const declaredHeight = Number(heightText);
if (width !== declaredWidth || height !== declaredHeight) {
  throw new Error(
    `Image dimensions are ${width}x${height}, but metadata declares ${declaredWidth}x${declaredHeight}`
  );
}
if (width < 1200 || height < 630) {
  throw new Error(
    `Image dimensions ${width}x${height} are below the 1200x630 social-image minimum`
  );
}

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await htmlFiles(path)));
    } else if (extname(entry.name) === '.html') {
      files.push(path);
    }
  }

  return files;
}

const expectedImageUrl = new URL(imageUrl, metadataBase[1]).href;
const generatedPages = [
  resolve('.next/server/app/index.html'),
  ...(await htmlFiles(resolve('.next/server/app/docs'))),
];
for (const pagePath of generatedPages) {
  const html = await readFile(pagePath, 'utf8');
  if (
    !html.includes(`<meta property="og:image" content="${expectedImageUrl}"`)
  ) {
    throw new Error(
      `${pagePath} does not contain the configured Open Graph image`
    );
  }
  if (
    !html.includes(`<meta name="twitter:image" content="${expectedImageUrl}"`)
  ) {
    throw new Error(
      `${pagePath} does not contain the configured Twitter image`
    );
  }
}

console.log(
  `Open Graph image is valid: ${imageUrl} (${width}x${height}); emitted on ${generatedPages.length} pages.`
);
