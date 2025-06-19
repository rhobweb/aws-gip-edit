// Load polyfills (once, on the top of our web app)
import 'core-js/stable';
import 'regenerator-runtime/runtime.js';

import './index.css';

/**
 * Frontend code running in browser
 */
import * as React from 'react';
//import { hydrate } from 'react-dom';
import { hydrateRoot } from 'react-dom/client';

import ConfigContext from '../components/ConfigContext.js';
import { Config } from '../server/config.js';
import App from '../App.js';

interface Type_Window {
	__CONFIG__?: Config;
};

const config = (window as unknown as Type_Window).__CONFIG__;
delete (window as Type_Window).__CONFIG__;

/** Components added here will _only_ be loaded in the web browser, never for server-side rendering */
const render = () : void => {
	const container = (document.getElementById('root') as Element);
	hydrateRoot(
		container,
		<>
			{/* The configuration is the outmost component. This allows us to read the configuration even in the theme */}
			<ConfigContext.Provider value={config}>
				<App />
			</ConfigContext.Provider>
		</>
	);
};

render();
