import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/slack.ts', 'src/oauth.ts', 'src/remind.ts',],
  format: ['cjs'],
  dts: true,
  outDir: 'dist',
  sourcemap: true,
});