/**
 * Provide configuration settings
 */
import { createContext } from 'react';

import { Config } from '../server/config.js';

const ConfigContext = createContext<Config | undefined>(undefined);

export default ConfigContext;
