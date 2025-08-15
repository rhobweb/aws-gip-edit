/**
 * File:        webpack.server.config.js
 * Description: Webpack configuration to package the Serverless infrastructure and code.
 *
 * Usage:       In the servlerless.yml file, under the "custom:" section, add:
 *                webpack:
 *                  webpackConfig: "webpack.server.config.js"
 */
import path                   from 'node:path';
import slsw                   from 'serverless-webpack';
import TsconfigPathsPlugin    from 'tsconfig-paths-webpack-plugin';

const __dirname  = import.meta.dirname;

console.log( "webpack.server dirname is: ", __dirname );

const AUTH_URI       = process.env.AUTH_URI || 'undefined';
//console.log( 'webpack: server.config: env: ' + AUTH_URI );
const IS_OFFLINE = process.env.IS_OFFLINE || slsw.lib.webpack.isLocal || 'false';
console.log( 'webpack.server.config: IS_OFFLINE: ', IS_OFFLINE );

export default {
	entry: slsw.lib.entries,
	target: "node",
	mode: slsw.lib.webpack.isLocal ? "development" : "production",
	//mode: IS_OFFLINE ? "development" : "production",
	node: {
		__dirname: true,
		__filename: true,
	},
	optimization: {
		minimize: false, // We don't need to minimize our Lambda code.
		moduleIds: "named",
	},
	performance: {
		// Turn off size warnings for entry points
		hints: false,
	},
	devtool: "nosources-source-map",
	module: {
		rules: [
			{
				test: /\.(c|m)?(j|t)sx?$/,
				exclude: /node_modules/, // we shouldn't need processing `node_modules`
				use: 'babel-loader',
			},
			{
				test: /\.css$/,
				use: "null-loader", // No server-side CSS processing
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
		extensions: [".server.tsx", ".server.ts", ".server.jsx", ".server.js", ".tsx", ".ts", ".jsx", ".js"],
	},
	//plugins: [
	//	new MiniCssExtractPlugin({
	//		filename: IS_OFFLINE ? "[name].css" : "[name].[contenthash:8].css",
	//	}),
		//new StatsWriterPlugin({
		//	filename: '../stats.json',
		//	transform(data, _opts) {
		//		const assets = data.assetsByChunkName;
		//		const stats = JSON.stringify(
		//			{
		//				scripts: Object.entries(assets).flatMap(([_asset, files]) => {
		//					return files.filter((filename) => filename.endsWith('.js') && !/\.hot-update\./.test(filename));
		//				}),
		//				styles: Object.entries(assets).flatMap(([_asset, files]) => {
		//					return files.filter((filename) => filename.endsWith('.css') && !/\.hot-update\./.test(filename));
		//				}),
		//			},
		//			null,
		//			2,
		//		);
		//		return stats;
		//	},
		//}),
	//].filter(Boolean),
	experiments: {
		outputModule: true,
	},
	output: {
		library: {
			//type: 'commonjs2',
			type: 'module',
		},
		path: path.join(__dirname, ".webpack"),
		filename: "[name].js",
		sourceMapFilename: "[file].map",
	},
};
