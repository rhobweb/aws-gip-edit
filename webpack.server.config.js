import path                   from 'node:path';
//import { copyFileSync }       from 'node:fs';
import slsw                   from 'serverless-webpack';
import TsconfigPathsPlugin    from 'tsconfig-paths-webpack-plugin';
//import MiniCssExtractPlugin   from 'mini-css-extract-plugin';
//import { StatsWriterPlugin }  from 'webpack-stats-plugin';

const __dirname  = import.meta.dirname;
//const __filename = import.meta.filename;

console.log( "webpack.server dirname is: ", __dirname );

//function copyFiles() {
//	const arrFileToCopy = [
//		//{ from: path.resolve(__dirname, "./main.cjs"), to: path.resolve(__dirname, "./dist/main.cjs") },
//		//{ from: path.resolve(__dirname, "./progs.cjs"), to: path.resolve(__dirname, "./dist/src/api/progs.cjs") },
//		//{ from: path.resolve(__dirname, "./src/api/progs.cjs"), to: path.resolve(__dirname, "./dist/src/api/progs.cjs") },
//	];
//
//	for ( const fileToCopy of arrFileToCopy ) {
//		try {
//			copyFileSync( fileToCopy.from, fileToCopy.to );
//		}
//		catch ( err ) {
//			console.log( `Failed to copy: ${fileToCopy.from}` );
//			throw err;
//		}
//	}
//}

const AUTH_URI       = process.env.AUTH_URI || 'undefined';
//console.log( 'webpack: server.config: env: ' + AUTH_URI );
const IS_OFFLINE = process.env.IS_OFFLINE || slsw.lib.webpack.isLocal || 'false';
console.log( 'webpack.server.config: IS_OFFLINE: ', IS_OFFLINE );

//copyFiles();

export default {
	entry: slsw.lib.entries,
	//entry: Object.assign( slsw.lib.entries, {
	//	"main":     path.join(__dirname, "dist/handler.js"),
	//	//"programs": path.join(__dirname, "dist/src/api/progs.cjs" ),
	//} ),
	//entry: {
	//	"handler":  path.join(__dirname, "dist/handler.js"),
	//	"programs": path.join(__dirname, "dist/src/api/programs.js" ),
	//},
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
				//test: /\.tsx?$/,
				test: /\.(c|m)?(j|t)sx?$/,
				//test: /\.(c|m)?jsx?$/,
				exclude: /node_modules/, // we shouldn't need processing `node_modules`
				use: "babel-loader",
			},
			//{
			//	test: /\.tsx?$/,
			//	exclude: [
			//		/node_modules/, // we shouldn't need processing `node_modules`
			//		path.resolve(__dirname, '.webpack'),
			//		path.resolve(__dirname, '.serverless'),
			//	],
			//	loader: "ts-loader",
			//	// https://www.npmjs.com/package/ts-loader#options
			//	options: {
			//		// Disable type checking, this will lead to improved build times
			//		transpileOnly: true,
			//		// Enable file caching, can be quite useful when running offline
			//		experimentalFileCaching: true,
			//	},
			//},
			{
				test: /\.css$/,
				use: "null-loader", // No server-side CSS processing
			},
			{
				test: /\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/,
				use: "url-loader",
			},
		],
	},
	resolve: {
		// TsconfigPathsPlugin applies the path aliases defined in `tsconfig.json`
		plugins: [
			new TsconfigPathsPlugin( {
				/*configFile: "./tsconfig.json" */
			} ),
		],
		extensions: [".server.tsx", ".server.ts", ".server.jsx", ".server.js", ".tsx", ".ts", ".jsx", ".js"],
	},
	output: {
		libraryTarget: "commonjs2",
		path: path.join(__dirname, ".webpack"),
		filename: "[name].js",
		sourceMapFilename: "[file].map",
	},
};
