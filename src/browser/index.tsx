/**
 * File:        browser/index.tsx
 * Description: React element to display the application.
 */

////////////////////////////////////////////////////////////////////////////////
// Imports

// Load polyfills (once, on the top of our web app)
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import './index.css';

// Frontend code running in browser
import * as React from 'react';
//import { hydrate } from 'react-dom';
import { hydrateRoot } from 'react-dom/client';

import ConfigContext from '#components/ConfigContext';
import { Config } from '#server/config';
import App from '#App';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

////////////////////////////////////////
// Exported and local types

////////////////////////////////////////////////////////////////////////////////
// Constants

// TODO: Fix types
const config = (window as any).__CONFIG__ as Config; // eslint-disable-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
delete (window as any).__CONFIG__; // eslint-disable-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

////////////////////////////////////////
// Exported definitions

/** Components added here will _only_ be loaded in the web browser, never for server-side rendering */

/**
 * @description render the application.
 */
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

// Execute the render
render();

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions
