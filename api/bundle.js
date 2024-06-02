const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/serverless.ts'],
  outfile: 'dist/serverless.js',
  bundle: true,
  minify: false,
  alias: {
    'tsoa': require.resolve('tsoa'),
  },
  platform: 'node',
  target: 'node20',
  external: [
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-presigned-post',
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/lib-dynamodb',
  ],
}).catch(() => process.exit(1));