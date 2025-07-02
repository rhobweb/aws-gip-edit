/**
 * File:        utils/gip_prog_title_utils.spec.ts.
 * Description: Unit Tests for utils/gip_prog_title_utils.ts.
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_prog_title_utils.ts';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_convertKnownTitle_args,
	Type_convertKnownTitle_ret,
} from '../../../src/utils/gip_prog_title_utils.ts';

////////////////////////////////////////
// Test module types

interface Type_TestModule {
	convertKnownTitle: (args: Type_convertKnownTitle_args)  => Type_convertKnownTitle_ret,
};

////////////////////////////////////////////////////////////////////////////////
// Imports

import * as TEST_MODULE from '../../../src/utils/gip_prog_title_utils';

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////
// The module under test

const testModule = TEST_MODULE as unknown as Type_TestModule;

////////////////////////////////////////////////////////////////////////////////
// Local test functions

/**
 * Actions to be performed before every test
 */
function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

/**
 * Actions to be performed after every test
 */
function commonAfterEach() : void {
	jest.restoreAllMocks();
	jest.resetModules();
}

////////////////////////////////////////////////////////////////////////////////
// Tests

describe(MODULE_NAME + ':module can be loaded', () => {
	let testModuleObj : Type_TestModule;

	beforeEach( () => {
		commonBeforeEach();
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('module initialises OK', async () => {
		await jest.isolateModulesAsync(async () => { // Load another instance of the module. This allows configuring a different environment
			testModuleObj = await import( TEST_MODULE_PATH ) as Type_TestModule;
		});
		expect( testModuleObj ).toBeDefined();
	});
});

describe(MODULE_NAME + ':convertKnownTitle', () => {
	let testModuleObj  : Type_TestModule;
	let actualResult   : Type_convertKnownTitle_ret;
	let expectedResult : Type_convertKnownTitle_ret;
	let testArgs       : Type_convertKnownTitle_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj  = testModule;
		testArgs       = '';
		expectedResult = '';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Unknown title', () => {
		testArgs       = 'NotMyFavouriteProg';
		expectedResult = testArgs;
		actualResult   = testModuleObj.convertKnownTitle( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Archers omnibus with date', () => {
		testArgs       = 'TheArchersOmnibus-31/06/2025';
		expectedResult = 'ArchersOmnibus-2025-06-31';
		actualResult   = testModuleObj.convertKnownTitle( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Archers omnibus with unexpected date format', () => {
		testArgs       = 'TheArchersOmnibus-31/06/25';
		expectedResult = 'ArchersOmnibus-31/06/25';
		actualResult   = testModuleObj.convertKnownTitle( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Archers with date', () => {
		testArgs       = 'TheArchers-31/06/2025';
		expectedResult = 'Archers-2025-06-31';
		actualResult   = testModuleObj.convertKnownTitle( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Archers with unexpected date format', () => {
		testArgs       = 'TheArchers-31/06/25';
		expectedResult = 'Archers-31/06/25';
		actualResult   = testModuleObj.convertKnownTitle( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'DesertIslandDiscsRevisited-Fred', () => {
		testArgs       = 'DesertIslandDiscsRevisited-Fred';
		expectedResult = 'DID-Fred';
		actualResult   = testModuleObj.convertKnownTitle( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'DesertIslandDiscs-Fred', () => {
		testArgs       = 'DesertIslandDiscs-Fred';
		expectedResult = 'DID-Fred';
		actualResult   = testModuleObj.convertKnownTitle( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Sorry I Havent a Clue', () => {
		testArgs       = 'ImSorryIHaventAClue-S5321E01';
		expectedResult = 'ClueS5321E01';
		actualResult   = testModuleObj.convertKnownTitle( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Just a Minute', () => {
		testArgs       = 'JustAMinute-S5321E01';
		expectedResult = 'Just-S5321E01';
		actualResult   = testModuleObj.convertKnownTitle( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});
