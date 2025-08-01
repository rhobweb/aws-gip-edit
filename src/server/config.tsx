/**
 * File:        server/config.tsx
 * Description: Configuration settings for the application.
 */

////////////////////////////////////////////////////////////////////////////////
// Imports

import manifest from '../../public/manifest.json'; // with { type: 'json' };
import process  from 'process';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

////////////////////////////////////////
// Exported and local types

////////////////////////////////////////////////////////////////////////////////
// Constants

/** Whether we're running on a local desktop or on AWS Lambda */
const isLocal = process.env.IS_LOCAL ?? process.env.IS_OFFLINE;

/**
 * Configuration Options
 *
 * IMPORTANT:
 * The config is injected into the client (browser) and accessible through the {@link useConfig}
 * hook. However, due to this behavior, it is important NOT to expose any sensitive information
 * such as passwords or tokens through the config.
 */
const LOCAL_APIGATEWAY_URL = 'http://0.0.0.0:8082';

const config = {
	/** Application Config */
	app: {
		/** Name of the app is loaded from the `manifest.json` */
		TITLE: manifest.short_name,
		/** Theme is also loaded from the `manifest.json` */
		THEME_COLOR: manifest.theme_color,
		/** URL to our public API Gateway endpoint */
		URL: isLocal ? LOCAL_APIGATEWAY_URL : String(process.env.APIGATEWAY_URL),
		/** Where the bundled distribution files (`main.js`, `main.css`) are hosted */
		DIST_URL: isLocal ? LOCAL_APIGATEWAY_URL : String(process.env.APP_DIST_URL),
		/** Where the contents of the `public` folder are hosted (might be the same as `config.app.DIST_URL`) */
		PUBLIC_URL: isLocal ? LOCAL_APIGATEWAY_URL : String(process.env.APP_PUBLIC_URL),
	},
};

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

////////////////////////////////////////
// Exported definitions

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions

export type Config = typeof config;
export default config;
