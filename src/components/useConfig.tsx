/**
 * File:        components/useConfig.tsx
 * Description: Hook to read application configuration settings.
 */

////////////////////////////////////////////////////////////////////////////////
// Imports
import { useContext } from 'react';

import { Config }    from '../server/config';
import ConfigContext from './ConfigContext';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

////////////////////////////////////////
// Exported and local types

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

////////////////////////////////////////
// Exported definitions

/**
 * @description Hook to read application configuration settings
 * @returns React context object.
 * @exception if the context object cannot be created.
 */
export default function useConfig(): Config {
	const config = useContext(ConfigContext);
	if (!config) {
		throw new Error('Configuration context not initialized!');
	}
	return config;
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions
