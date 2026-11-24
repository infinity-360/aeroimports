import { defineConfig } from 'vite';
import { rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Os conjuntos -hd (?hd, para gravar vídeo da página) ficam fora do dist/.
const dropHd = () => ({
  name: 'drop-hd-frames',
  apply: 'build',
  closeBundle() {
    const dir = join('dist', 'frames');
    try {
      for (const d of readdirSync(dir)) if (d.endsWith('-hd')) rmSync(join(dir, d), { recursive: true, force: true });
    } catch {}
  },
});

export default defineConfig({
  base: process.env.BASE || '/',
  plugins: [dropHd()],
});
