// const path = require('path');
// const { merge } = require("webpack-merge");
// const common = require("./webpack.common.js");
// const { stylePaths } = require("./stylePaths");
// const HOST = process.env.HOST || "localhost";
// const PORT = process.env.PORT || "9000";

// module.exports = merge(common('development'), {
//   mode: "development",
//   devtool: "eval-source-map",
//   devServer: {
//     contentBase: "./dist",
//     host: HOST,
//     port: PORT,
//     compress: true,
//     inline: true,
//     historyApiFallback: true,
//     overlay: true,
//     open: true
//   },
//   module: {
//     rules: [
//       {
//         test: /\.css$/,
//         include: [
//           ...stylePaths
//         ],
//         use: ["style-loader", "css-loader"]
//       },
//       {test: /.md$/,
//       use: [
//         {
//           loader: 'html-loader',
//         },
//         ],
//         }

//     ]
//   }
// });
const path = require('path');
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const { stylePaths } = require("./stylePaths");

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || "9000";
const OPTIMIZER_URL = process.env.OPTIMIZER_URL || `http://localhost:${process.env.OPTIMIZER_PORT || '8080'}`;

module.exports = merge(common('development'), {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    contentBase: "./dist",
    host: HOST,
    port: PORT,
    compress: true,
    inline: true,
    historyApiFallback: true,
    overlay: true,
    open: true,
    proxy: {
      '/optimizer-api': {
        target: OPTIMIZER_URL,
        pathRewrite: { '^/optimizer-api': '' },
        secure: false,
        changeOrigin: true
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [
          ...stylePaths
        ],
        use: ["style-loader", "css-loader"]
      },
      {
        test: /.md$/,
        use: [
          {
            loader: 'html-loader',
          },
          // {
          //   loader: 'markdown-loader',
          // },
        ],
      }

    ]
  }
});
