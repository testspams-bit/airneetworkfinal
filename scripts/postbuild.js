import fs from 'node:fs';

try {
  fs.mkdirSync('dist/public', { recursive: true });
  if (fs.existsSync('dist/index.html')) {
    fs.copyFileSync('dist/index.html', 'dist/public/index.html');
  }
  if (fs.existsSync('dist/assets')) {
    fs.cpSync('dist/assets', 'dist/public/assets', { recursive: true });
  }
  if (fs.existsSync('dist/_redirects')) {
    fs.copyFileSync('dist/_redirects', 'dist/public/_redirects');
  }

  // Also support environments expecting build/
  fs.cpSync('dist', 'build', { recursive: true });
} catch (err) {
  console.warn('Postbuild mirroring note:', err);
}
