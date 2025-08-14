/**
 * File:        utils/gip_program_edit_input.spec.ts.
 * Description: Unit Tests for utils/gip_program_edit_input.ts.
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_program_edit_input.ts';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Imports

import {jest} from '@jest/globals'; // For isolateModulesAsync

//import GipProgramEditOptions from '../../../src/utils/gip_program_edit_options';
import GipProgramEditOptions from '#utils/gip_program_edit_options';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_DisplayProgramItem,
	Type_ProgramEditOptions,
//} from '../../../src/utils/gip_types.ts';
} from '#utils/gip_types';

////////////////////////////////////////
// Test module types

////////////////////////////////////////////////////////////////////////////////
// Constants

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

describe(MODULE_NAME + ':GipProgramEditOptions', () => {
	let testObj           : GipProgramEditOptions;
	let expectedGenre     : string;
	let expectedDayOfWeek : string;
	let expectedQuality   : string;

	const testEditOptions : Type_ProgramEditOptions = {
		genre:       'Books & Spoken',
		day_of_week: 'Fri',
		quality:     'High',
	};
	const testDisplayProgramItem : Type_DisplayProgramItem = {
		pid:         'myitem-pid',
		uri:         'myitem-uri',
		title:       'myitem-title',
		synopsis:    'myitem-synopsis',
		image_uri:   'myitem-imageuri',
		genre:       'Comedy',
		status:      'pending',
		quality:     'Normal',
		day_of_week: 'Mon',
		selected:    false,
	};

	beforeEach( () => {
		commonBeforeEach();
		testObj           = new GipProgramEditOptions();
		expectedGenre     = '';
		expectedDayOfWeek = '';
		expectedQuality   = '';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Initialised with defaults', () => {
		expectedGenre     = 'Comedy';
		expectedDayOfWeek = 'Any';
		expectedQuality   = 'Normal';
		testObj = new GipProgramEditOptions();
		expect( testObj.genre ).toEqual( expectedGenre );
		expect( testObj.day_of_week ).toEqual( expectedDayOfWeek );
		expect( testObj.quality ).toEqual( expectedQuality );
	});

	test( 'Initialised with object', () => {
		expectedGenre     = testEditOptions.genre;
		expectedDayOfWeek = testEditOptions.day_of_week;
		expectedQuality   = testEditOptions.quality;
		testObj = new GipProgramEditOptions( testEditOptions );
		expect( testObj.genre ).toEqual( expectedGenre );
		expect( testObj.day_of_week ).toEqual( expectedDayOfWeek );
		expect( testObj.quality ).toEqual( expectedQuality );
	});

	test( 'Initialised with object, then cleared', () => {
		expectedGenre     = 'Comedy';
		expectedDayOfWeek = 'Any';
		expectedQuality   = 'Normal';
		testObj = new GipProgramEditOptions( testEditOptions );
		testObj.clear();
		expect( testObj.genre ).toEqual( expectedGenre );
		expect( testObj.day_of_week ).toEqual( expectedDayOfWeek );
		expect( testObj.quality ).toEqual( expectedQuality );
	});

	test( 'Assign from object', () => {
		expectedGenre     = testEditOptions.genre;
		expectedDayOfWeek = testEditOptions.day_of_week;
		expectedQuality   = testEditOptions.quality;
		testObj = new GipProgramEditOptions();
		testObj.assign( testEditOptions );
		expect( testObj.genre ).toEqual( expectedGenre );
		expect( testObj.day_of_week ).toEqual( expectedDayOfWeek );
		expect( testObj.quality ).toEqual( expectedQuality );
	});

	test( 'Assign from display program item', () => {
		expectedGenre     = testDisplayProgramItem.genre;
		expectedDayOfWeek = testDisplayProgramItem.day_of_week;
		expectedQuality   = testDisplayProgramItem.quality;
		testObj = new GipProgramEditOptions( testEditOptions );
		testObj.assignFromProgram( testDisplayProgramItem );
		expect( testObj.genre ).toEqual( expectedGenre );
		expect( testObj.day_of_week ).toEqual( expectedDayOfWeek );
		expect( testObj.quality ).toEqual( expectedQuality );
	});
});
