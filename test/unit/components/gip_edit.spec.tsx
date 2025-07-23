/**
 * File:        components/gip_edit.spec.tsx.
 * Description: Unit Tests for components/gip_edit.tsx
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/components/';
const MODULE_NAME      = 'gip_edit.tsx';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Imports

import React from 'react';

import GipProgramItem      from '../../../src/utils/gip_program_item';
import GipProgramEditInput from '../../../src/utils/gip_program_edit_input';

import {
	render,
	RenderResult,
	createEvent,
	fireEvent,
	act, // See https://testing-library.com/docs/react-testing-library/api/#act
} from '@testing-library/react';

////////////////////////////////////////////////////////////////////////////////
// Types

import type {
	Type_ProgramEditInput,
	Type_ProgramEditOptions,
} from '../../../src/utils/gip_types';

import type {
	Type_processProgramForSaving_args,
	Type_processProgramForSaving_ret,
	Type_loadPrograms_ret,
	Type_savePrograms_args,
	Type_savePrograms_ret,
	Type_processProgram_args,
	Type_processProgram_ret,
	Type_processDrop_args,
	Type_processDrop_ret,
	Type_GipEdit_ret,
} from '../../../src/components/gip_edit';

interface Type_TestModulePrivateDefs {
	processProgramForSaving: (args: Type_processProgramForSaving_args) => Type_processProgramForSaving_ret,
	loadPrograms:            ()                                        => Type_loadPrograms_ret,
	savePrograms:            (args: Type_savePrograms_args)            => Type_savePrograms_ret,
	processProgram:          (args: Type_processProgram_args)          => Type_processProgram_ret,
	processDrop:             (args: Type_processDrop_args)             => Type_processDrop_ret,
};

interface Type_TestModule {
	privateDefs: Type_TestModulePrivateDefs,
	default:     () => Type_GipEdit_ret,
};

//type Type_Ref = React.RefObject<HTMLInputElement|null>;

////////////////////////////////////////////////////////////////////////////////
// Constants

const TEST_PROG_TITLE     = 'My Title';
const TEST_PROG_EPISODE   = 'My episode';
const TEST_PROG_SYNOPSIS  = 'My synopsis.';
const TEST_PROG_IMAGE_URI = 'https://mydom/src/myimg.jpg';

const TEST_PROG_LINK_HTML = `
<a>
	<picture>
		<img src="${TEST_PROG_IMAGE_URI}" width="100" alt="" loading="lazy" class="sw-object-cover">
		<span class="sw-text-primary">${TEST_PROG_TITLE}</span>
	</picture>
	<div class="sw-text-primary">
		<p class="sw-text-long-primer sw-mt-1">${TEST_PROG_EPISODE}</p>
		<p class="sw-text-secondary">${TEST_PROG_SYNOPSIS}</p>
		<span class="sw-text-primary">Programme Website<svg class="sw-ease" aria-hidden="true"></svg></span>
	</div>
</a>
`;


////////////////////////////////////////////////////////////////////////////////
// Definitions

import * as TEST_MODULE from '../../../src/components/gip_edit';
import { Type_DbProgramEditItem } from '../../../src/utils/gip_prog_fields';
import { Type_DisplayProgramItem } from '../../../src/utils/gip_types';
const testModule = TEST_MODULE as unknown as Type_TestModule;

const {
	ErrorWithBody,
} = TEST_MODULE;

////////////////////////////////////////////////////////////////////////////////
// Test utilities

// Set the timeout to allow debugging. Defaults to 5000 ms
const TEST_TIMEOUT_MS = 300 * 1000;
jest.setTimeout( TEST_TIMEOUT_MS );

const fetchMock = jest.fn();
const alertMock = jest.fn();

global.fetch = fetchMock;
window.alert = alertMock;

const testFetchArr = [
	{
		pos:           1,
		pid:           'pid1',
		status:        'Pending',
		title:         'Title1',
		synopsis:      'Synopsis1.',
		image_uri:     'ImageUri1',
		genre:         'Comedy',
		day_of_week:   'Thu',
		quality:       'Normal',
		download_time: '',
		modify_time:   '',
	},
] as Type_DbProgramEditItem[];

type Type_MutableResponse = {
	-readonly [P in keyof Response]+?: Response[P];
};

let testFetchRet : Type_MutableResponse;
let testFetchErr : Error | null;

function initFetchRet( arrProgram : Type_DbProgramEditItem[], ok = true, status = 200, statusText = 'success' ) : void {
	testFetchRet = {
		ok,
		json:       async () => arrProgram,                 // eslint-disable-line @typescript-eslint/require-await
		text:       async () => JSON.stringify(arrProgram), // eslint-disable-line @typescript-eslint/require-await
		status:     status,
		statusText: statusText,
	} as Response;
}

fetchMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
	if ( ! testFetchErr ) {
		return testFetchRet;
	} else {
		throw testFetchErr;
	}
} );

function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
	initFetchRet( testFetchArr );
	testFetchErr = new Error( 'test fetch err' );
}

function commonAfterEach() : void {
	jest.restoreAllMocks();
	jest.resetModules();
}

async function sleep( ms : number ) : Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
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

describe(MODULE_NAME + ':processProgramForSaving', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_processProgramForSaving_ret;
	let expectedResult : Type_processProgramForSaving_ret;
	let testArgs       : Type_processProgramForSaving_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = {
			uri:         'uri1',
			pid:         'pid1',
			status:      'Pending',
			title:       'Title1',
			synopsis:    'Synopsis1',
			image_uri:   'ImageUri1',
			genre:       'Comedy',
			day_of_week: 'Thu',
			quality:     'Normal',
			selected:    false,
		};
		expectedResult = {
			pid:           'pid1',
			status:        'Pending',
			title:         'Title1',
			synopsis:      'Synopsis1.',
			image_uri:     'ImageUri1',
			genre:         'Comedy',
			day_of_week:   'Thu',
			quality:       'Normal',
			pos:           null,
			download_time: '',
			modify_time:   '',
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('OK', () => {
		actualResult = testModuleObj.processProgramForSaving( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':loadPrograms', () => {
	let testModuleObj        : Type_TestModulePrivateDefs;
	let actualResult         : Awaited<Type_loadPrograms_ret>;
	let expectedResult       : Awaited<Type_loadPrograms_ret>;
	let expectedFetchURI     : string;
	let expectedFetchOptions : RequestInit;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		expectedResult = [ {
			uri:           '',
			pid:           'pid1',
			status:        'Pending',
			title:         'Title1',
			synopsis:      'Synopsis1.',
			image_uri:     'ImageUri1',
			genre:         'Comedy',
			day_of_week:   'Thu',
			quality:       'Normal',
			selected:      false,
		} ];
		expectedFetchURI     = 'http://localhost/gip_edit/api/programs?all=true';
		expectedFetchOptions = {
			method: 'GET',
			headers: {},
		};
		testFetchErr = null;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('OK', async () => {
		actualResult = await testModuleObj.loadPrograms();
		expect( actualResult ).toEqual( expectedResult );
		expect( fetchMock ).toHaveBeenCalledWith( expectedFetchURI, expectedFetchOptions );
	});
});

describe(MODULE_NAME + ':savePrograms', () => {
	let testModuleObj        : Type_TestModulePrivateDefs;
	let testArgs             : Type_savePrograms_args;
	let actualResult         : Awaited<Type_savePrograms_ret>;
	let expectedResult       : Awaited<Type_savePrograms_ret>;
	let expectedFetchURI     : string;
	let expectedFetchOptions : RequestInit;
	let expectedFetchRet     : Type_DbProgramEditItem[];
	let expectedFetchBody    : Type_DbProgramEditItem[];
	let expectedAlertMessage : string;

	function genExpectedResult( args: Type_savePrograms_args ) : typeof expectedResult {
		const cookedResult = args.map( el => ({
			pid:           el.pid,
			status:        el.status,
			title:         el.title,
			synopsis:      el.synopsis,
			image_uri:     el.image_uri,
			genre:         el.genre,
			day_of_week:   el.day_of_week,
			quality:       el.quality,
			uri:           '',
			selected:      false,
		}) );
		return cookedResult;
	}

	function genExpectedFetchBody( args: Type_savePrograms_args ) : Type_DbProgramEditItem[] {
		const cookedResult = args.map( el => ({
			pid:           el.pid,
			status:        el.status,
			title:         el.title,
			synopsis:      el.synopsis,
			image_uri:     el.image_uri,
			genre:         el.genre,
			day_of_week:   el.day_of_week,
			quality:       el.quality,
			download_time: '',
			modify_time:   '',
			pos:           null,
		}) );
		return cookedResult;
	}

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = [ {
			uri:           '',
			pid:           'pid1',
			status:        'Pending',
			title:         'Title1',
			synopsis:      'Synopsis1.',
			image_uri:     'ImageUri1',
			genre:         'Comedy',
			day_of_week:   'Thu',
			quality:       'Normal',
			selected:      false,
		} ];
		expectedResult    = genExpectedResult( testArgs );
		expectedFetchURI  = '/gip_edit/api/programs';
		expectedFetchRet  = genExpectedFetchBody( testArgs );
		expectedFetchBody = genExpectedFetchBody( testArgs );
		expectedFetchRet.forEach( el => {
			el.download_time = '2025-06-30T01:02:03.456';
			el.modify_time   = '2025-06-30T01:02:03.456';
		} );
		initFetchRet( expectedFetchRet );
		expectedFetchOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
			},
			body: expect.any(String), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('OK', async () => {
		testFetchErr = null;
		actualResult = await testModuleObj.savePrograms( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		// Stringified JSON cannot be matched directly, so match any string first, then match the stringified JSON
		expect( fetchMock ).toHaveBeenCalledWith( expectedFetchURI, expectedFetchOptions );
		// @ts-expect-error toMatchJSON is an extension matcher
		expect( fetchMock.mock.calls[ 0 ][ 1 ].body ).toMatchJSON( expectedFetchBody ); // eslint-disable-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
	});

	test('Save failed', async () => {
		testFetchErr = null;
		initFetchRet( expectedFetchRet, false, 418, "I'm a teapot" );
		delete testFetchRet.text; // Delete the function that returns the text
		expectedAlertMessage = `saveFailed! response.text is not a function`;
		expectedResult  = JSON.parse( JSON.stringify( testArgs ) ) as Type_DisplayProgramItem[]; // No change
		actualResult = await testModuleObj.savePrograms( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( fetchMock ).toHaveBeenCalledWith( expectedFetchURI, expectedFetchOptions );
		expect( alertMock ).toHaveBeenCalledWith( expectedAlertMessage );
	});

	test('Fetch error with body', async () => {
		expectedAlertMessage = `saveFailed! test fetch err`;
		expectedResult = JSON.parse( JSON.stringify( testArgs ) ) as Type_DisplayProgramItem[]; // No change
		actualResult   = await testModuleObj.savePrograms( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( fetchMock ).toHaveBeenCalledWith( expectedFetchURI, expectedFetchOptions );
		expect( alertMock ).toHaveBeenCalledWith( expectedAlertMessage );
	});

	test('Fetch error with body message', async () => {
		testFetchErr = new ErrorWithBody( 'error with body message', { message: 'error fetch body message' } );
		expectedAlertMessage = `saveFailed! error fetch body message`;
		expectedResult = JSON.parse( JSON.stringify( testArgs ) ) as Type_DisplayProgramItem[]; // No change
		actualResult   = await testModuleObj.savePrograms( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( fetchMock ).toHaveBeenCalledWith( expectedFetchURI, expectedFetchOptions );
		expect( alertMock ).toHaveBeenCalledWith( expectedAlertMessage );
	});
});

describe(MODULE_NAME + ':processProgram', () => {
	let testModuleObj          : Type_TestModulePrivateDefs;
	let testArgs               : Type_processProgram_args;
	let testProgramEditInput   : Type_ProgramEditInput;
	let testProgramEditOptions : Type_ProgramEditOptions;
	let testPrograms           : Type_DisplayProgramItem[];
	let actualResult           : Awaited<Type_processProgram_ret>;
	let expectedResult         : Awaited<Type_processProgram_ret>;
	let expectedAlertMessage   : string;
	let testNewProgramItem     : GipProgramItem;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testProgramEditInput = {
			uri:        'test/pid2',
			title:      'test title',
			synopsis:   'test synopsis',
			image_uri:  'test image URI',
		};
		testProgramEditOptions = {
			genre:       'Comedy',
			day_of_week: 'Any',
			quality:     'Normal',
		};
		testPrograms = [ {
			uri:           '',
			pid:           'pid1',
			status:        'Pending',
			title:         'Title1',
			synopsis:      'Synopsis1.',
			image_uri:     'ImageUri1',
			genre:         'Comedy',
			day_of_week:   'Thu',
			quality:       'Normal',
			selected:      false,
		} ];
		testArgs = {
			programEditInput:   testProgramEditInput,
			programEditOptions: testProgramEditOptions,
			programs:           testPrograms,
		};
		expectedResult = JSON.parse( JSON.stringify( testPrograms ) ) as typeof expectedResult;
		testNewProgramItem = new GipProgramItem( { inputItem: testProgramEditInput, inputOptions: testProgramEditOptions } );
		testNewProgramItem.status      = 'Pending';
		testNewProgramItem.uri         = '';
		testNewProgramItem.pid         = 'pid2';
		testNewProgramItem.title       = 'test title';
		testNewProgramItem.synopsis    = 'test synopsis';
		testNewProgramItem.image_uri   = 'test image URI';
		testNewProgramItem.genre       = 'Comedy';
		testNewProgramItem.day_of_week = 'Any';
		testNewProgramItem.quality     = 'Normal';
		testNewProgramItem.selected    = false;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('New program', () => {
		expectedResult!.push( testNewProgramItem ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		actualResult = testModuleObj.processProgram( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Existing program', () => {
		testProgramEditInput.uri = 'test/pid1';
		testNewProgramItem.pid   = 'pid1';
		Object.assign( testPrograms[0], testNewProgramItem );
		testPrograms[0].uri = 'pid1';
		Object.assign( expectedResult![0], testNewProgramItem ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		actualResult = testModuleObj.processProgram( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Incomplete program', () => {
		testProgramEditInput.title = '';
		expectedAlertMessage       = 'Incomplete program info';
		expectedResult = null;
		actualResult   = testModuleObj.processProgram( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( alertMock ).toHaveBeenCalledWith( expectedAlertMessage );
	});
});

describe(MODULE_NAME + ':processDrop', () => {
	let testModuleObj       : Type_TestModulePrivateDefs;
	let testArgs            : Type_processDrop_args;
	let testURI             : string;
	let testHTML            : string;
	let actualResult        : Type_processDrop_ret;
	let expectedResult      : Type_processDrop_ret;
	let testProgramEditItem : GipProgramEditInput;
	let getDataMock         : jest.Mock;
	let getDataRetArr       : string[];

	const getDataExpectedArgsHtml  = 'text/html';
	const getDataExpectedArgsPlain = 'text/plain';

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj       = testModule.privateDefs;
		getDataMock = jest.fn();
		testArgs = {
			// @ts-expect-error only define the required properties
			dataTransfer: {
				getData: getDataMock,
			},
		};
		getDataMock.mockImplementation( () => {
			return getDataRetArr.shift();
		} );
		testURI  = 'test/pid';
		testHTML = TEST_PROG_LINK_HTML;
		testProgramEditItem           = new GipProgramEditInput();
		testProgramEditItem.uri       = testURI;
		testProgramEditItem.title     = 'MyTitle-MyEpisode';
		testProgramEditItem.synopsis  = `${TEST_PROG_EPISODE}.\n${TEST_PROG_SYNOPSIS}`;
		testProgramEditItem.image_uri = TEST_PROG_IMAGE_URI;
		expectedResult = {
			programEditInput: testProgramEditItem,
		};
		getDataRetArr = [
			testHTML,
			testURI,
		];
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Event is not a drop event', () => {
		// @ts-expect-error delete the drop event property for test purposes
		delete testArgs.dataTransfer;
		expectedResult = null;
		actualResult = testModuleObj.processDrop( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( getDataMock ).toHaveBeenCalledTimes( 0 );
	});

	test('Event does not contain link', () => {
		getDataRetArr[0] = '';
		expectedResult = null;
		actualResult = testModuleObj.processDrop( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( getDataMock ).toHaveBeenCalledTimes( 1 );
		expect( getDataMock ).toHaveBeenCalledWith( getDataExpectedArgsHtml );
	});

	test('Event contains valid link', () => {
		actualResult = testModuleObj.processDrop( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( getDataMock ).toHaveBeenCalledTimes( 2 );
		expect( getDataMock ).toHaveBeenCalledWith( getDataExpectedArgsHtml );
		expect( getDataMock ).toHaveBeenCalledWith( getDataExpectedArgsPlain );
	});
});

describe(MODULE_NAME + ':GipEdit', () => {
	let testModuleObj : Type_TestModule;
	let GipEdit       : Type_TestModule['default'];
	let component     : RenderResult | null;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		GipEdit = testModuleObj.default;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered OK', async () => {
		testFetchErr = null; // Return dummy program data
		await act( async () => {
			component = render( <GipEdit/> );
			await sleep( 1000 ); // useEffect asynchronously loads the programs, so need to wait for the focus to be set
		} );
		const containerElement = component!.container; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		expect(containerElement).not.toBeFalsy();
	});
});

describe(MODULE_NAME + ':GipEdit, setFocus', () => {
	let testModuleObj     : Type_TestModule;
	let GipEdit           : Type_TestModule['default'];
	let component         : RenderResult | null;
	let expectedElementID : string;

	beforeEach( async () => {
		commonBeforeEach();
		testModuleObj = testModule;
		GipEdit       = testModuleObj.default;
		testFetchErr  = null;  // Return dummy program data
		await act( async () => {
			component = render( <GipEdit/> );
			await sleep( 1000 ); // useEffect asynchronously loads the programs, so need to wait for the focus to be set
		} );
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('setFocus, setInitialFocus', () => {
		expect(component).not.toBeFalsy();
		expectedElementID = 'uri'; // The URI/PID input field
		expect( document.activeElement!.id ).toEqual( expectedElementID ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
	});

	test('setFocus already focussed', () => {
		expect(component).not.toBeFalsy();
		expectedElementID = 'uri'; // The URI/PID input field
		expect( document.activeElement!.id ).toEqual( expectedElementID ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		fireEvent.keyDown( document.activeElement!, { key: 'Escape', code: 'Escape' } ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		expect( document.activeElement!.id ).toEqual( expectedElementID ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
	});
});

describe(MODULE_NAME + ':GipEdit, clearProgramInput', () => {
	let testModuleObj : Type_TestModule;
	let GipEdit       : Type_TestModule['default'];
	let component     : RenderResult | null;
	let expectedValue : string;
	let uriElement    : HTMLInputElement;

	beforeEach( async () => {
		commonBeforeEach();
		testModuleObj = testModule;
		GipEdit       = testModuleObj.default;
		testFetchErr  = null;  // Return dummy program data
		await act( async () => {
			component = render( <GipEdit/> );
			await sleep( 1000 ); // useEffect asynchronously loads the programs, so need to wait for the focus to be set
		} );
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('URI/PID field initialised empty', () => {
		expectedValue = '';
		expect(component).not.toBeFalsy();
		uriElement = document.getElementById( 'uri' ) as HTMLInputElement;
		expect( uriElement.value ).toEqual( expectedValue );
	});

	// input element does not get updated, may need to use user-event, see https://testing-library.com/docs/user-event/intro/
	//test('URI/PID field populated by key press', async () => {
	//	expectedValue = 'a';
	//	expect(component).not.toBeFalsy();
	//	uriElement = document.getElementById( 'uri' ) as HTMLInputElement;
	//	await act( async () => {
	//		const event = createEvent.keyPress( uriElement, { key: 'a', code: 'KeyA' } );
	//		fireEvent.keyPress( uriElement, event );
	//		await sleep( 1000 ); // useEffect asynchronously loads the programs, so need to wait for the focus to be set
	//	} );
	//	expect( uriElement.value ).toEqual( expectedValue );
	//});
});
