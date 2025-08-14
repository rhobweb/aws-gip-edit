export default (api) => {
	// caller.target will be the same as the target option from webpack
	const isNode   = api.caller((caller) => caller && caller.target === "node");
	const isOffline = process.env.IS_OFFLINE;
	return {
		presets: [
			"@babel/preset-env",
			//[
			//	"@babel/preset-env",
			//	{
	 		//		targets: {
			//			node: 'current',
			//		}
			//	}
			//],
			//[
			//  "@babel/preset-env",
			//  {
			//    useBuiltIns: "entry",
			//    corejs: "3.42",
			//    targets: isNode ? { node: "22" } : { browsers: "last 2 versions" },
			//  },
			//],
			"@babel/preset-typescript",
			['@babel/preset-react', {runtime: 'automatic'}],
			//"@babel/preset-react",
		],
		plugins: [
			!isNode && isOffline && "react-refresh/babel",
			// TODO: Add your own Babel plugins here
		].filter(Boolean),
	};
};
