const { build } = require('esbuild');
const { sassPlugin } = require('esbuild-sass-plugin');

build({
  entryPoints: ['js/app.js',
    'js/playground.js',
  ],
  bundle: true,
  target: "es2016",
  outdir: "../priv/static/assets",
  plugins: [sassPlugin()],
  sourcemap: process.env.NODE_ENV === "development",
  minify: true,
  loader: {
    ".ttf": "file",
    ".otf": "file",
    ".svg": "file",
    ".woff": "file",
    ".woff2": "file",
    ".eot": "file"
  }
}).catch((e) => console.error(e.message))
