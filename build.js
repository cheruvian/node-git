import * as esbuild from 'esbuild';

const bundle = await esbuild.build({
  entryPoints: ['src/cli.js'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  format: 'cjs',
  banner: {
  },
  outfile: 'dist/cli.js',
  minify: true,
  treeShaking: true,
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});

console.log('Build complete');