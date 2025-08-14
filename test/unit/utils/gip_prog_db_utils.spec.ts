/**
 * DESCRIPTION:
 * Unit Tests for utils/gip_prog_db_utils.ts.
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_prog_db_utils.ts';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Imports

import {jest} from '@jest/globals'; // For isolateModulesAsync

//import * as TEST_MODULE from '../../../src/utils/gip_prog_db_utils';
import * as TEST_MODULE from '#utils/gip_prog_db_utils';

////////////////////////////////////////////////////////////////////////////////
// Types

import type {
	Type_dbToProg_args,
	Type_dbToProg_ret,
	Type_progToDb_args,
	Type_progToDb_ret,
	Type_dbToProgArray_args,
	Type_dbToProgArray_ret,
	Type_genProgramEditItem_args,
	Type_genProgramEditItem_ret,
//} from '../../../src/utils/gip_prog_db_utils';
} from '#utils/gip_prog_db_utils';

interface Type_TestModule {
	dbToProg:           (args: Type_dbToProg_args)           => Type_dbToProg_ret,
	progToDb:           (args: Type_progToDb_args)           => Type_progToDb_ret,
	dbToProgArray:      (args: Type_dbToProgArray_args)      => Type_dbToProgArray_ret,
	genProgramEditItem: (args: Type_genProgramEditItem_args) => Type_genProgramEditItem_ret,
};

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

const testModule = TEST_MODULE as unknown as Type_TestModule;

////////////////////////////////////////////////////////////////////////////////
// Test utilities

function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

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

describe(MODULE_NAME + ':dbToProg', () => {
	let testModuleObj  : Type_TestModule;
	let testArgs       : Type_dbToProg_args;
	let actualResult   : Type_dbToProg_ret;
	let expectedResult : Type_dbToProg_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		testArgs = {
			pid:         'test-pid',
			status:      'Pending',
			title:       'Test Title',
			synopsis:    'Test Synopsis',
			image_uri:   'test-image.jpg',
			day_of_week: 'Mon',
			genre:       'Comedy',
			quality:     'Normal',
		};
		expectedResult = {
			pid:         'test-pid',
			status:      'Pending',
			uri:         '',
			title:       'Test Title',
			synopsis:    'Test Synopsis',
			image_uri:   'test-image.jpg',
			day_of_week: 'Mon',
			genre:       'Comedy',
			quality:     'Normal',
			selected:    false,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'All properties specified', () => {
		actualResult   = testModuleObj.dbToProg( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'No day of week', () => {
		testArgs.day_of_week = null;
		expectedResult.day_of_week = 'Any';
		actualResult   = testModuleObj.dbToProg( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':progToDb', () => {
	let testModuleObj  : Type_TestModule;
	let testArgs       : Type_progToDb_args;
	let actualResult   : Type_progToDb_ret;
	let expectedResult : Type_progToDb_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		testArgs = {
			pid:         'test-pid',
			status:      'Pending',
			uri:         'test-uri',
			title:       'Test Title',
			synopsis:    'Test Synopsis',
			image_uri:   'test-image.jpg',
			day_of_week: 'Mon',
			genre:       'Comedy',
			quality:     'Normal',
			selected:    false,
		};
		expectedResult = {
			pid:         'test-pid',
			status:      'Pending',
			title:       'Test Title',
			synopsis:    'Test Synopsis',
			image_uri:   'test-image.jpg',
			day_of_week: 'Mon',
			genre:       'Comedy',
			quality:     'Normal',
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'All properties specified', () => {
		actualResult = testModuleObj.progToDb( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'No day of week', () => {
		testArgs.day_of_week       = 'Any';
		expectedResult.day_of_week = null;
		actualResult = testModuleObj.progToDb( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':dbToProgArray', () => {
	let testModuleObj  : Type_TestModule;
	let testArgs       : Type_dbToProgArray_args;
	let actualResult   : Type_dbToProgArray_ret;
	let expectedResult : Type_dbToProgArray_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		testArgs = [ {
			pid:         'test-pid',
			status:      'Pending',
			title:       'Test Title',
			synopsis:    'Test Synopsis',
			image_uri:   'test-image.jpg',
			day_of_week: 'Mon',
			genre:       'Comedy',
			quality:     'Normal',
		} ];
		expectedResult = [ {
			pid:         'test-pid',
			status:      'Pending',
			uri:         '',
			title:       'Test Title',
			synopsis:    'Test Synopsis',
			image_uri:   'test-image.jpg',
			day_of_week: 'Mon',
			genre:       'Comedy',
			quality:     'Normal',
			selected:    false,
		} ];
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'All properties specified', () => {
		actualResult = testModuleObj.dbToProgArray( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':genProgramEditItem', () => {
	let testModuleObj  : Type_TestModule;
	let testArgs       : Type_genProgramEditItem_args;
	let actualResult   : Type_genProgramEditItem_ret;
	let expectedResult : Type_genProgramEditItem_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		testArgs = {
			pid:         'test-pid',
			status:      'Pending',
			title:       'Test Title',
			synopsis:    'Test Synopsis',
			image_uri:   'test-image.jpg',
			genre:       'Comedy',
			quality:     'Normal',
			day_of_week: 'Mon',
			pos:         1,
			modify_time: '2025-02-28T01:02:03.456Z',
		};
		expectedResult = {
			pid:         'test-pid',
			status:      'Pending',
			title:       'Test Title',
			synopsis:    'Test Synopsis',
			image_uri:   'test-image.jpg',
			genre:       'Comedy',
			quality:     'Normal',
			day_of_week: 'Mon',
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'All properties specified', () => {
		actualResult = testModuleObj.genProgramEditItem( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'No day of week', () => {
		delete testArgs.day_of_week;
		delete expectedResult.day_of_week;
		actualResult = testModuleObj.genProgramEditItem( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});
