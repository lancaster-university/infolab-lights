const path = require("path");
const glob = require("glob");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, options) => {
  // const devMode = options.mode !== "production";

  return {
    resolve: {
      modules: ["node_modules"],
    },
    optimization: {
      minimizer: ["...", new CssMinimizerPlugin(), new TerserPlugin()],
    },
    entry: {
      app: glob.sync("./vendor/**/*.js").concat(["./js/app.js"]),
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "../priv/static/js"),
      publicPath: "/js/",
    },
    // devtool: devMode ? "source-map" : undefined,
    module: {
      rules: [
        {
          test: /\.[s]?css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: "../css/app.css" }),
      new CopyPlugin({
        patterns: [{ from: "static/", to: "../" }],
      }),
    ],
  };
};
