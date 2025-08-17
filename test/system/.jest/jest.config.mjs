/**
 * Jest configuration file for the system tests
 */

import parentConfigFn from '../../jest.common.config.mjs'

const REL_TEST_DIR = `../../../test/system/`; // Path from the .jest directory to the directory containing the system tests
const REL_ROOT_DIR = `../../../`;             // Path from the .jest directory to the project root directory
const REL_COVERAGE_DIR = `../../output/`;

import path from 'node:path';
const __dirname = import.meta.dirname;
const ENV_FILE       = `${__dirname}/jest.setEnvVars.mjs`;
const TEST_DIR       = path.resolve( `${__dirname}/${REL_TEST_DIR}` );
const ROOT_DIR       = path.resolve(  `${__dirname}/${REL_ROOT_DIR}` );
const TEST_PATH_DIRS = [ TEST_DIR ];
const TEST_REGEX     = '.spec.ts';

export default async () => {
	const parentConfig = await parentConfigFn();
	const config = {
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

		transform: {
			...parentConfig.transform,
			'\\.tsx?$': [ 'ts-jest',
				{
					tsconfig: './tsconfig-test.json',
					preserveTsModule: true,
				},
			],
		},
	};
	return config;
}
