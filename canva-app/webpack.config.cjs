const path = require("node:path");
const { optimize } = require("webpack");

module.exports = (_env, argv) => {
  const production = argv.mode === "production";

  return {
    mode: production ? "production" : "development",
    context: __dirname,
    target: "web",
    entry: {
      app: path.resolve(__dirname, "src/index.tsx"),
    },
    output: {
      filename: "app.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".css"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
            options: {
              transpileOnly: false,
            },
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ],
    devtool: production ? false : "source-map",
    devServer: {
      host: "localhost",
      port: 8080,
      allowedHosts: ["localhost"],
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Private-Network": "true",
      },
      historyApiFallback: {
        rewrites: [{ from: /^\/$/, to: "/app.js" }],
      },
      devMiddleware: {
        publicPath: "/",
      },
      client: {
        logging: "warn",
      },
      webSocketServer: false,
    },
  };
};
