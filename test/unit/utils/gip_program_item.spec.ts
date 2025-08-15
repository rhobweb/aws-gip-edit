/**
 * File:        utils/gip_program_item.spec.ts.
 * Description: Unit Tests for utils/gip_program_item.ts.
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_program_item.ts';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Imports

import {jest} from '@jest/globals'; // For isolateModulesAsync

import GipProgramItem from '#utils/gip_program_item';
import * as TEST_MODULE from '#utils/gip_program_item';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_getTrimmedField_args,
	Type_getTrimmedField_ret,
	Type_extractPID_args,
	Type_extractPID_ret,
} from '#utils/gip_program_item';

import type {
	Type_DisplayProgramItem,
	Type_ProgramEditInput,
	Type_ProgramEditOptions,
} from '#utils/gip_types';

////////////////////////////////////////
// Test module types

interface Type_TestModulePrivateDefs {
	getTrimmedField: (args?: Type_getTrimmedField_args) => Type_getTrimmedField_ret,
	extractPID:      (args:  Type_extractPID_args)      => Type_extractPID_ret,
};

interface Type_TestModule {
	privateDefs: Type_TestModulePrivateDefs,
};

////////////////////////////////////////////////////////////////////////////////
// Constants

const testModule = TEST_MODULE as unknown as Type_TestModule;

////////////////////////////////////////////////////////////////////////////////
// Test utilities

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
	let testModuleObj : unknown;

	beforeEach( () => {
		commonBeforeEach();
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('module initialises OK', async () => {
		await jest.isolateModulesAsync(async () => { // Load another instance of the module. This allows configuring a different environment
			testModuleObj = await import( TEST_MODULE_PATH ) as unknown;
		});
		expect( testModuleObj ).toBeDefined();
	});
});

describe(MODULE_NAME + ':getTrimmedField', () => {
	const testModuleObj = testModule.privateDefs;
	let testArgs       : string | null;
	let actualResult   : string;
	let expectedResult : string;

	beforeEach( () => {
		commonBeforeEach();
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Undefined', () => {
		expectedResult = '';
		actualResult = testModuleObj.getTrimmedField();
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Null', () => {
		testArgs       = null;
		expectedResult = '';
		actualResult = testModuleObj.getTrimmedField( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Leading and trailing whitespce', () => {
		testArgs       = '	 Some untrimmed text	 ';
		expectedResult = 'Some untrimmed text';
		actualResult = testModuleObj.getTrimmedField( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Leading whitespce', () => {
		testArgs       = '             Some untrimmed text';
		expectedResult = 'Some untrimmed text';
		actualResult = testModuleObj.getTrimmedField( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Trailing whitespce', () => {
		testArgs       = 'Some untrimmed text						';
		expectedResult = 'Some untrimmed text';
		actualResult = testModuleObj.getTrimmedField( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':extractPid', () => {
	const testModuleObj = testModule.privateDefs;
	let testArgs       : string;
	let actualResult   : string;
	let expectedResult : string;

	beforeEach( () => {
		commonBeforeEach();
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK', () => {
		testArgs       = 'http://mydom/mysub/mypath/mypid';
		expectedResult = 'mypid';
		actualResult = testModuleObj.extractPID( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':GipProgramItem', () => {
	let testObj        : GipProgramItem;
	let expectedResult : Type_DisplayProgramItem;

	const testEditObject : Type_ProgramEditInput = {
		uri:       'http://mydom/mysub/myedit-pid',
		title:     'myedit-title',
		synopsis:  'myedit-synopsis',
		image_uri: 'myedit-imageuri',
	};

	const testEditOptions : Type_ProgramEditOptions = {
		genre:       'Books & Spoken',
		day_of_week: 'Fri',
		quality:     'High',
	};

	beforeEach( () => {
		commonBeforeEach();
		expectedResult = {
			pid:         'myedit-pid',
			title:       'myedit-title',
			synopsis:    'myedit-synopsis',
			image_uri:   'myedit-imageuri',
			genre:       'Books & Spoken',
			status:      'Pending',
			quality:     'High',
			day_of_week: 'Fri',
			selected:    false,
			uri:         '',
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Initialised with defaults', () => {
		testObj = new GipProgramItem( { inputItem: testEditObject, inputOptions: testEditOptions } );
		expect( testObj ).toEqual( expectedResult );
	});
});
