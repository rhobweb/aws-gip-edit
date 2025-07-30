/**
 * File:        webpack.browser.config.js
 * Description: Webpack configuration to run a browser to serve the static content.
 *
 * Usage:       For local development, from the project directory, run:
 *                IS_OFFLINE=true webpack serve --config webpack.browser.config.js --mode development
 *              For production, to package up the content, run:
 *                webpack --config webpack.browser.config.js --mode production
 */
import path                      from 'node:path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import MiniCssExtractPlugin      from 'mini-css-extract-plugin';
import { StatsWriterPlugin }     from 'webpack-stats-plugin';
import { CleanWebpackPlugin }    from 'clean-webpack-plugin';
import CopyWebpackPlugin         from 'copy-webpack-plugin';
import TsconfigPathsPlugin       from 'tsconfig-paths-webpack-plugin';
import webpack                   from 'webpack';
import { fileURLToPath }         from 'url';

const { ProvidePlugin, DefinePlugin } = webpack;


const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
console.log( `dirname is ${__dirname}` );

const isOffline      = !!process.env.IS_OFFLINE;
const NODE_LOG_LEVEL = process.env.NODE_LOG_LEVEL || 'info';
const AUTH_URI       = process.env.AUTH_URI || 'undefined';
console.log( 'webpack: browser isOffline: ' + isOffline );

export default {
	entry: {
		main: path.join(__dirname, "src/browser/index.tsx"),
	},
	//context: __dirname,
	target: 'web',
	mode: isOffline ? 'development' : 'production',
	devServer: {
		hot: true,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
		},
		watchFiles: {
			paths: ['**/*'],
			options: {
				ignored: ['**/node_modules', '**/dist', '**/.webpack', '**/.serverless'],
			},
		},
		devMiddleware: {
			writeToDisk: (filePath) => {
				// Always write the stats.json to disk, so we can load it in code
				return /\bstats\.json$/.test(filePath);
			},
		},
		port: 8082,
	},
	performance: {
		// Turn off size warnings for entry points
		hints: false,
	},
	optimization: {
		runtimeChunk: 'single',
		splitChunks: {
			cacheGroups: {
				// TODO: Customize code splitting to your needs
				vendor: {
					name: 'vendor',
					test: /[\\/]node_modules[\\/]/,
					chunks: 'all',
				},
				components: {
					name: 'components',
					test: /[\\/]src[\\/]components[\\/]/,
					chunks: 'all',
					minSize: 0,
				},
			},
		},
		//sideEffects: true,
	},
	// React recommends `cheap-module-source-map` for development
	devtool: isOffline ? 'cheap-module-source-map' : 'nosources-source-map',
	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{
					// Copy content from `./public/` folder to our output directory
					context: "./public/",
					from: "**/*",
				},
			],
		}),
		new MiniCssExtractPlugin({
			filename: isOffline ? '[name].css' : '[name].[contenthash:8].css',
		}),
		new StatsWriterPlugin({
			filename: 'stats.json',
			transform(data, _opts) {
				const assets = data.assetsByChunkName;
				const stats = JSON.stringify(
					{
						scripts: Object.entries(assets).flatMap(([_asset, files]) => {
							return files.filter((filename) => filename.endsWith('.js') && !/\.hot-update\./.test(filename));
						}),
						styles: Object.entries(assets).flatMap(([_asset, files]) => {
							return files.filter((filename) => filename.endsWith('.css') && !/\.hot-update\./.test(filename));
						}),
					},
					null,
					2,
				);
				return stats;
			},
		}),
		//isOffline && new HotModuleReplacementPlugin(),
		isOffline && new ReactRefreshWebpackPlugin(),
		new ProvidePlugin( { process: 'process/browser' } ),
		new DefinePlugin( {
			'process.env.NODE_LOG_LEVEL': JSON.stringify(NODE_LOG_LEVEL),
			'process.env.AUTH_URI':       JSON.stringify(AUTH_URI),
		} ),
	].filter(Boolean),
	module: {
		rules: [
			{
				test: /\.(t|j)sx?$/,
				exclude: /node_modules/, // we shouldn't need processing `node_modules`
				use: 'babel-loader',
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/,
				use: [
					{
						loader: 'url-loader',
						options: { limit: 8192 },
					},
				],
			},
		],
	},
	resolve: {
		// TsconfigPathsPlugin applies the path aliases defined in `tsconfig.json`
		plugins: [ new TsconfigPathsPlugin( {
			configFile: './tsconfig.json',
		} ) ],
		extensions: ['.browser.tsx', '.browser.ts', '.browser.jsx', '.browser.js', '.tsx', '.ts', '.jsx', '.js'],
		fallback: {
			'stream':  'stream-browserify',
			'os':      'os-browserify',
			//'process': 'process/browser.js',
		}
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: isOffline ? '[name].js' : '[name].[contenthash:8].js',
		crossOriginLoading: 'anonymous', // enable cross-origin loading of chunks
	},
};
