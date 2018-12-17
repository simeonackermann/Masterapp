const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      }
      // ,
      // {
      //   test: /\.css$/,
      //   use: ["style-loader", "css-loader"]
      // }
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve(__dirname, "/"),
    publicPath: "/",
    filename: "bundle.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "public/"),
    port: 8081,
    host: '0.0.0.0',
    // publicPath: "http://0.0.0.0:3000/",
    // hot: true,
    headers: { "Access-Control-Allow-Origin": "*" }
  }
  ,
  plugins: [new webpack.HotModuleReplacementPlugin()]
};