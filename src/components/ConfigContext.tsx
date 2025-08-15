/**
 * File:        components/ConfigContext.tsx
 * Description: Provides a context for configuration settings.
 */

/**
 * Provide configuration settings
 */
import { createContext } from 'react';

import type { Config } from '#server/config';

const ConfigContext = createContext<Config | undefined>(undefined);

export default ConfigContext;
