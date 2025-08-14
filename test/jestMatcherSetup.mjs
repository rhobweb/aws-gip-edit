/**
 * Additional Jest matchers that are available to all tests.
 * 
 * Add this to the Jest config file with:
 *   ...
 *   setupFilesAfterEnv: [ '<rootDir>/test/jestMatcherSetup.mjs' ],
 *   ...
 * see https://jestjs.io/docs/configuration#setupfilesafterenv-array
 */
import matchers from 'jest-json';

expect.extend( matchers );
