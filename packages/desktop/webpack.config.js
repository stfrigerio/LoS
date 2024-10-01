const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: {
    index: './src/electron/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (chunkData) => chunkData.chunk.name === 'preload' ? 'preload.js' : '[name].bundle.js',
    publicPath: './'
  },
  target: 'electron-renderer',
  externals: {
    fs: 'commonjs fs'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
            plugins: ['@babel/plugin-syntax-dynamic-import']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext][query]'
        }
      },
      {
        test: /\.ttf$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext][query]'
        }
      },
    ]
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    hot: true,
    port: 3000
  },
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      fs: false
    },
    alias: {
      'react-native$': 'react-native-web',
      'react-native-svg': 'react-native-svg-web',
      '@react-native-community/datetimepicker': 'react-datepicker',
    },
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.json', '.web.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', 
      filename: 'index.html',
      chunks: ['index'] 
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
      '__DEV__': JSON.stringify(isDev),
      'Platform.OS': JSON.stringify('web'),
    }),
  ]
};