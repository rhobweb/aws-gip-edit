
import parentConfigFn from '../../../jest.config'

/**
 * Jest configuration file for the unit tests
 */
import type { JestConfigWithTsJest } from 'ts-jest/dist/types'

import { createJsWithBabelPreset as createPreset } from 'ts-jest';

const defaultPreset = createPreset();
//const tsJestTransformCfg = createPreset().transform;
import jestModuleNameMapper from 'jest-module-name-mapper';


import type {Config} from 'jest';

const REL_TEST_DIR     : string = `../../../test/unit/`; // Path from the .jest directory to the directory containing the unit tests
//const REL_SRC_DIR      : string = `../../../src/`;       // Path from the .jest directory to the directory containing the source files
const REL_ROOT_DIR      : string = `../../../`;       // Path from the .jest directory to the project root directory
const REL_COVERAGE_DIR : string = `../../output/`;

import path from 'node:path';
const ENV_FILE       = `${__dirname}/jest.setEnvVars.ts`;
const TEST_DIR       = path.resolve( `${__dirname}/${REL_TEST_DIR}` );
//const SRC_DIR        = path.resolve( `${__dirname}/${REL_SRC_DIR}` );
const ROOT_DIR       = path.resolve(  `${__dirname}/${REL_ROOT_DIR}` );
console.log( __dirname );
const TEST_PATH_DIRS = [ TEST_DIR ];
const TEST_REGEX     = '.spec.ts';

export default async (): Promise<JestConfigWithTsJest> => {
	const parentConfig = await parentConfigFn();
	const config : JestConfigWithTsJest = {
		...parentConfig,

		// The root directory that Jest should scan for tests and modules within
		rootDir: ROOT_DIR,

		// A list of paths to directories that Jest should use to search for files in
		roots: TEST_PATH_DIRS,

		// An array of file extensions your modules use
		moduleFileExtensions: [
			"js",
			"ts",
		  "mjs",
		//   "cjs",
		//   "jsx",
		   "tsx",
		//   "json",
		//   "node"
		],

		// The paths to modules that run some code to configure or set up the testing environment before each test
		setupFiles: [ ENV_FILE ],

		// The regexp pattern or array of patterns that Jest uses to detect test files
		testRegex: TEST_REGEX,

		//collectCoverage: true,
		coverageDirectory: REL_COVERAGE_DIR,
	};

	return config;
}
