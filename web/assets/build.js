const { build } = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");

const args = process.argv.slice(2);
const watch = args.includes("--watch");

let opts = {
  entryPoints: ["js/app.js", "js/playground.js", "js/app-nonlive.js"],
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
    ".eot": "file",
  },
};

if (watch) {
  opts = {
    ...opts,
    watch: {
      onRebuild(error, result) {
        if (error) console.error("watch build failed: ", error);
        else console.log("watch build succeeded: ", result);
      },
    },
  };
}

const promise = build(opts).catch((e) => console.error(e.message));
if (watch) {
  promise.then((_) => {
    process.stdin.on("close", () => {
      process.exit(0);
    });

    process.stdin.resume();
  });
}
