import fs from 'fs';
import path from 'path';

const destDir = path.join(process.cwd(), 'public', 'bts');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Verified Wikimedia Commons filenames (Dispatch White Day Special series, CC BY 3.0)
const fileNames = [
  { local: 'rm.jpg', wiki: 'RM for Dispatch White Day Special, 27 February 2019 01.jpg' },
  { local: 'jin.jpg', wiki: 'Jin for Dispatch White Day Special, 27 February 2019 01.jpg' },
  { local: 'suga.jpg', wiki: 'Suga for Dispatch White Day Special, 27 February 2019 03.jpg' },
  { local: 'jhope.jpg', wiki: 'J-Hope for Dispatch White Day Special, 27 February 2019 02.jpg' },
  { local: 'jimin.jpg', wiki: 'Park Ji-min for Dispatch White Day Special, 27 February 2019 07.jpg' },
  { local: 'v.jpg', wiki: 'V for Dispatch White Day Special, 27 February 2019 05.jpg' },
  { local: 'jungkook.jpg', wiki: 'Jungkook for Dispatch White Day Special, 27 February 2019 01.jpg' },
];

async function resolveAndDownload(item) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(item.wiki)}&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json&origin=*`;
  
  console.log(`Resolving ${item.wiki}...`);
  try {
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'ChatIgloo/1.0 (https://chatingloo.com; contact@chatingloo.com)'
      }
    });
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pageId === '-1') {
      console.log(`  NOT FOUND: ${item.wiki}`);
      return false;
    }
    
    const imageInfo = pages[pageId].imageinfo[0];
    const thumbUrl = imageInfo.thumburl || imageInfo.url;
    console.log(`  URL: ${thumbUrl}`);
    
    const imgRes = await fetch(thumbUrl, {
      headers: {
        'User-Agent': 'ChatIgloo/1.0 (https://chatingloo.com; contact@chatingloo.com)'
      }
    });
    
    if (!imgRes.ok) {
      console.log(`  Download failed: ${imgRes.status}`);
      return false;
    }
    
    const buffer = await imgRes.arrayBuffer();
    const destPath = path.join(destDir, item.local);
    fs.writeFileSync(destPath, Buffer.from(buffer));
    console.log(`  Saved ${item.local} (${Math.round(buffer.byteLength / 1024)} KB)`);
    return true;
  } catch (err) {
    console.log(`  Error: ${err.message}`);
    return false;
  }
}

async function main() {
  let successCount = 0;
  for (const item of fileNames) {
    const ok = await resolveAndDownload(item);
    if (ok) successCount++;
  }
  console.log(`\nDone! ${successCount}/${fileNames.length} images downloaded.`);
}

main();
