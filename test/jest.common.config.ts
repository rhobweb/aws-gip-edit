/**
 * Common Jest config for all tests.
 * This file is pulled in by the unit test jest config.
 */
import type { JestConfigWithTsJest } from 'ts-jest/dist/types'
//import { defaults as tsjPreset } from 'ts-jest/presets'
//import { jsWithTs as tsjPreset } from 'ts-jest/presets'
//import { jsWithBabel as tsjPreset } from 'ts-jest/presets'
import { createJsWithBabelPreset as createPreset } from 'ts-jest';
//import { createJsWithBabelEsmPreset as createPreset } from 'ts-jest';
//import { createJsWithTsPreset as createPreset } from 'ts-jest';
//import type {Config} from 'jest';
//import { createDefaultPreset as createPreset } from 'ts-jest';

const defaultPreset = createPreset();
//const tsJestTransformCfg = createPreset().transform;
import jestModuleNameMapper from 'jest-module-name-mapper';

export default async (): Promise<JestConfigWithTsJest> => ({
	...defaultPreset,
	// If using Babel, add transformIgnorePatterns to allow ESM in node_modules:
	transformIgnorePatterns: [
		//"/node_modules/(?!query-string)",
		'/node_modules/(?!query-string).+\\.js$'
		//'/node_modules/(?!query-string/.*)'
	],
	//preset: "ts-jest",
	//preset: 'ts-jest/presets/js-with-babel',
	//testEnvironment: 'node',

	verbose: true,
	testEnvironment: "jsdom", // need access to DOM
	roots: ['<rootDir>'],

		// An array of regexp pattern strings used to skip coverage collection
		// coveragePathIgnorePatterns: [
		//   "/node_modules/"
		// ],

		// Indicates which provider should be used to instrument code for coverage
		coverageProvider: "v8",

		// A list of reporter names that Jest uses when writing coverage reports
		// coverageReporters: [
		//   "json",
		//   "text",
		//   "lcov",
		//   "clover"
		// ],

	// Indicates whether the coverage information should be collected while executing the test
	collectCoverage: false,

	collectCoverageFrom: [
    "./src/**/*.{tsx,ts}"
  ],

	// The directory where Jest should output its coverage files
	coverageDirectory: "<rootDir>/output",
	//projects: ['<rootDir>/test/unit/'],
	// TODO: Add custom setup file - setupFiles: ['./setupJest.js'],
	// TODO: Add JEST extended library - setupFilesAfterEnv: ["jest-extended"],
	//moduleNameMapper: {
	//	// Mock static files
	//	"\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
	//		"<rootDir>/__mocks__/fileMock.ts",
	//	"\\.(css|less|sass)$": "identity-obj-proxy",
	//	// Load `tsconfig.json` path mapping
	//	...jestModuleNameMapper,
	//},
//	transform: {
//		...defaultPreset.transform,
//		//...tsJestTransformCfg,
//		//"^.+\\.js[x]$": "babel-jest",
//		//"^.+\\.js[x]?$": [
//		//	"babel-jest",
//		//	{ rootMode: 'upward' },
//		//],
//		'^.+\\.ts[x]?$': [
//			'ts-jest',
//			{
//				tsconfig: './tsconfig-unittest.json',
//				preserveTsModule: true,
//			},
//		],
//	},
//	// If using Babel, add transformIgnorePatterns to allow ESM in node_modules:
//	transformIgnorePatterns: [
//		//"/node_modules/(?!query-string)",
//		'/node_modules/(?!query-string).+\\.js$'
//		//'/node_modules/(?!query-string/.*)'
//	],
	// See https://www.npmjs.com/package/identity-obj-proxy
	//moduleNameMapper: {
	//	'\\.(jpg|jpeg|png)$': 'identity-obj-proxy',
	//},
	modulePathIgnorePatterns: [
		'<rootDir>/dist',
	],
	reporters: [
		'default',
		[ 'jest-junit', {
			outputDirectory: '<rootDir>/output',
			outputName:      'build-test-result.xml',
		} ]
	],
	setupFilesAfterEnv: [ '<rootDir>/test/jestMatcherSetup.mjs' ],
	transform: {
		'\\.tsx?$':           'ts-jest',
		'\\.(jpg|jpeg|png)$': '<rootDir>/test/jestFileTransform.mjs',
	},
});
