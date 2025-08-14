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

//import GipProgramEditInput from '../../../src/utils/gip_program_edit_input';
import GipProgramEditInput from '#utils/gip_program_edit_input';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_DisplayProgramItem,
	Type_ProgramEditInput,
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

describe(MODULE_NAME + ':GipProgramEditInput', () => {
	let testObj          : GipProgramEditInput;
	let expectedUri      : string;
	let expectedTitle    : string;
	let expectedSynopsis : string;
	let expectedImageUri : string;

	const testEditObject : Type_ProgramEditInput = {
		uri:       'myedit-uri',
		title:     'myedit-title',
		synopsis:  'myedit-synopsis',
		image_uri: 'myedit-imageuri',
	};
	const testProgramItem  : Type_DisplayProgramItem = {
		pid:         'myitem-pid',
		uri:         'myitem-uri',
		title:       'myitem-title',
		synopsis:    'myitem-synopsis',
		image_uri:   'myitem-imageuri',
		genre:       'Comedy',
		status:      'pending',
		quality:     'normal',
		day_of_week: 'Any',
		selected:    false,
	};

	beforeEach( () => {
		commonBeforeEach();
		testObj = new GipProgramEditInput();
		expectedUri      = '';
		expectedTitle    = '';
		expectedSynopsis = '';
		expectedImageUri = '';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Initialised OK', () => {
		expect( testObj.uri ).toEqual( expectedUri );
		expect( testObj.title ).toEqual( expectedTitle );
		expect( testObj.synopsis ).toEqual( expectedSynopsis );
		expect( testObj.image_uri ).toEqual( expectedImageUri );
	});

	test( 'setField uri', () => {
		testObj.setField( 'uri', 'myuri' );
		expectedUri = 'myuri';
		expect( testObj.uri ).toEqual( expectedUri );
		expect( testObj.title ).toEqual( expectedTitle );
		expect( testObj.synopsis ).toEqual( expectedSynopsis );
		expect( testObj.image_uri ).toEqual( expectedImageUri );
	});

	test( 'setField title', () => {
		testObj.setField( 'title', 'mytitle' );
		expectedTitle = 'mytitle';
		expect( testObj.uri ).toEqual( expectedUri );
		expect( testObj.title ).toEqual( expectedTitle );
		expect( testObj.synopsis ).toEqual( expectedSynopsis );
		expect( testObj.image_uri ).toEqual( expectedImageUri );
	});

	test( 'setField synopsis', () => {
		testObj.setField( 'synopsis', 'mysynopsis' );
		expectedSynopsis = 'mysynopsis';
		expect( testObj.uri ).toEqual( expectedUri );
		expect( testObj.title ).toEqual( expectedTitle );
		expect( testObj.synopsis ).toEqual( expectedSynopsis );
		expect( testObj.image_uri ).toEqual( expectedImageUri );
	});

	test( 'setField image_uri', () => {
		testObj.setField( 'image_uri', 'myimageuri' );
		expectedImageUri = 'myimageuri';
		expect( testObj.uri ).toEqual( expectedUri );
		expect( testObj.title ).toEqual( expectedTitle );
		expect( testObj.synopsis ).toEqual( expectedSynopsis );
		expect( testObj.image_uri ).toEqual( expectedImageUri );
	});

	test( 'setField unknown field', () => {
		testObj.setField( 'unknown', 'myunknown' );
		expect( testObj.uri ).toEqual( expectedUri );
		expect( testObj.title ).toEqual( expectedTitle );
		expect( testObj.synopsis ).toEqual( expectedSynopsis );
		expect( testObj.image_uri ).toEqual( expectedImageUri );
	});

	test( 'assign', () => {
		expectedUri      = testEditObject.uri;
		expectedTitle    = testEditObject.title;
		expectedSynopsis = testEditObject.synopsis;
		expectedImageUri = testEditObject.image_uri;
		testObj.assign( testEditObject );
		expect( testObj.uri ).toEqual( expectedUri );
		expect( testObj.title ).toEqual( expectedTitle );
		expect( testObj.synopsis ).toEqual( expectedSynopsis );
		expect( testObj.image_uri ).toEqual( expectedImageUri );
	});

	test( 'assignFromProgram', () => {
		expectedUri      = testProgramItem.pid;
		expectedTitle    = testProgramItem.title;
		expectedSynopsis = testProgramItem.synopsis;
		expectedImageUri = testProgramItem.image_uri;
		testObj.assignFromProgram( testProgramItem );
		expect( testObj.uri ).toEqual( expectedUri );
		expect( testObj.title ).toEqual( expectedTitle );
		expect( testObj.synopsis ).toEqual( expectedSynopsis );
		expect( testObj.image_uri ).toEqual( expectedImageUri );
	});
});
