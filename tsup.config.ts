import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/remind.ts'],
  format: ['cjs'],
  dts: true,
  outDir: 'dist',
  sourcemap: true,
});