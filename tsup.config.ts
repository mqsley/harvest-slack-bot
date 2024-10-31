import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/slack.ts', 'src/oauth.ts', 'src/remind.ts',],
  format: ['cjs'],
  clean: true,
});