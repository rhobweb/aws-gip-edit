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

import React     from 'react';
import userEvent from '@testing-library/user-event';

import GipProgramItem      from '../../../src/utils/gip_program_item';
import GipProgramEditInput from '../../../src/utils/gip_program_edit_input';
import {
	REVERSE_FIELD_MAP_COLLECTION,
} from '../../../src/utils/gip_prog_fields';

import {
	render,
	RenderResult,
	//createEvent,
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

import type { UserEvent } from '@testing-library/user-event';


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
interface Type_programItemElement {
	pid      : HTMLInputElement,
	title    : HTMLInputElement,
	day      : HTMLInputElement,
	quality  : HTMLInputElement,
	genre    : HTMLInputElement,
	synopsis : HTMLInputElement,
}

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

const TEST_FETCH_ARR_DEFAULT = [
	{
		pos:           1,
		pid:           'pid1',
		status:        'Pending',
		title:         'Title1',
		synopsis:      'Synopsis1.',
		image_uri:     'ImageUri1',
		genre:         'Books & Spoken',
		day_of_week:   'Thu',
		quality:       'High',
		download_time: '',
		modify_time:   '',
	},
	{
		pos:           2,
		pid:           'pid2',
		status:        'Success',
		title:         'Title2',
		synopsis:      'Synopsis2.',
		image_uri:     'ImageUri2',
		genre:         'Comedy',
		day_of_week:   'Any',
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
let testFetchArr = TEST_FETCH_ARR_DEFAULT;

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
	testFetchArr = TEST_FETCH_ARR_DEFAULT; // Re-initialise to the default value
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

interface Type_setupUserEvent_ret extends RenderResult {
	user: UserEvent,
};

/**
 * @param {React.JSX.Element} jsx : the JSX element to render.
 * @returns an object containing the RenderResult and the additional property:
 *           - user: the @testing-library/user-event object used for sending in events.
 */
function setupUserEvent( jsx : React.JSX.Element ) : Type_setupUserEvent_ret {
	return {
		user: userEvent.setup(),
		// Import `render` from the framework library of your choice.
		// See https://testing-library.com/docs/dom-testing-library/install#wrappers
		...render(jsx),
	};
}

/**
 * @param {number} iPos : the position of the program item, indexed from 1.
 * @returns an object containing the input elements for each program item field:
 *           - pid, title, day, quality, genre, synopsis
 */
function getProgElement( iPos : number ) : Type_programItemElement {
	/* eslint-disable @typescript-eslint/restrict-template-expressions */
	return {
		pid:      document.getElementById( `prog-field-${iPos}-2` ) as HTMLInputElement,
		title:    document.getElementById( `prog-field-${iPos}-3` ) as HTMLInputElement,
		day:      document.getElementById( `prog-field-${iPos}-4` ) as HTMLInputElement,
		quality:  document.getElementById( `prog-field-${iPos}-5` ) as HTMLInputElement,
		genre:    document.getElementById( `prog-field-${iPos}-6` ) as HTMLInputElement,
		synopsis: document.getElementById( `prog-field-${iPos}-7` ) as HTMLInputElement,
	};
	/* eslint-enable @typescript-eslint/restrict-template-expressions */
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
		expectedResult = [
			{
				uri:           '',
				pid:           'pid1',
				status:        'Pending',
				title:         'Title1',
				synopsis:      'Synopsis1.',
				image_uri:     'ImageUri1',
				genre:         'Books & Spoken',
				day_of_week:   'Thu',
				quality:       'High',
				selected:      false,
			},
			{
				uri:           '',
				pid:           'pid2',
				status:        'Success',
				title:         'Title2',
				synopsis:      'Synopsis2.',
				image_uri:     'ImageUri2',
				genre:         'Comedy',
				day_of_week:   'Any',
				quality:       'Normal',
				selected:      false,
			},
		];
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
		// @ts-expect-error toMatchJSON is an extension
		expect( fetchMock.mock.calls[ 0 ][ 1 ].body ).toMatchJSON( expectedFetchBody ); // eslint-disable-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
	});

	test('Save failed', async () => {
		testFetchErr = null;
		initFetchRet( expectedFetchRet, false, 418, "I'm a teapot" );
		delete testFetchRet.text; // Delete the function that returns the text
		expectedAlertMessage = `saveFailed! response.text is not a function`;
		expectedResult = JSON.parse( JSON.stringify( testArgs ) ) as Type_DisplayProgramItem[]; // No change
		actualResult   = await testModuleObj.savePrograms( testArgs );
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

	test('Fetch error with body without message', async () => {
		// @ts-expect-error body is only expecting 'message' property
		testFetchErr = new ErrorWithBody( 'error with body message', { notmessage: 'error fetch body property' } );
		expectedAlertMessage = `saveFailed! {"notmessage":"error fetch body property"}`;
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
		GipEdit       = testModuleObj.default;
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

	test('Load programs failed', async () => {
		await act( async () => {
			component = render( <GipEdit/> );
			await sleep( 1000 ); // useEffect asynchronously loads the programs, so need to wait for the focus to be set
		} );
		const containerElement = component!.container; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		expect(containerElement).not.toBeFalsy();
		const progElements = getProgElement( 1 );
		expect( progElements.pid ).toEqual( null );
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

// fireEvent does not propagate to the input element, use user-event instead, see https://testing-library.com/docs/user-event/intro/
describe(MODULE_NAME + ':GipEdit, clearProgramInput', () => {
	let testModuleObj : Type_TestModule;
	let GipEdit       : Type_TestModule['default'];
	let component     : Type_setupUserEvent_ret;
	let expectedValue : string;
	let uriElement    : HTMLInputElement;

	beforeEach( async () => {
		commonBeforeEach();
		testModuleObj = testModule;
		GipEdit       = testModuleObj.default;
		testFetchErr  = null;  // Return dummy program data
		await act( async () => {
			component = setupUserEvent( <GipEdit/> );
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

	test('URI/PID field populated by key press', async () => {
		expectedValue = 'a';
		expect(component).not.toBeFalsy();
		uriElement = document.getElementById( 'uri' ) as HTMLInputElement;
		// No need to focus as this element should be in focus
		await component.user.keyboard( 'a' );
		expect( uriElement.value ).toEqual( expectedValue );
	});

	test('URI/PID field cleared by Esc key press', async () => {
		expectedValue = 'a';
		expect(component).not.toBeFalsy();
		uriElement = document.getElementById( 'uri' ) as HTMLInputElement;
		// No need to focus as this element should be in focus
		await component.user.keyboard( 'a' );
		expect( uriElement.value ).toEqual( expectedValue );
		expectedValue = '';
		await component.user.keyboard( '[Escape]' );
		expect( uriElement.value ).toEqual( expectedValue );
	});

	test('Title/Name field initialised empty', () => {
		expectedValue = '';
		expect(component).not.toBeFalsy();
		uriElement = document.getElementById( 'title' ) as HTMLInputElement;
		expect( uriElement.value ).toEqual( expectedValue );
	});

	test('Title/Name field populated by key press', async () => {
		expectedValue = 'a';
		expect(component).not.toBeFalsy();
		uriElement = document.getElementById( 'title' ) as HTMLInputElement;
		uriElement.focus();
		await component.user.keyboard( 'a' );
		expect( uriElement.value ).toEqual( expectedValue );
	});

	test('Title/Name field cleared by Esc key press', async () => {
		expectedValue = 'a';
		expect(component).not.toBeFalsy();
		uriElement = document.getElementById( 'title' ) as HTMLInputElement;
		uriElement.focus();
		await component.user.keyboard( 'a' );
		expect( uriElement.value ).toEqual( expectedValue );
		expectedValue = '';
		await component.user.keyboard( '[Escape]' );
		expect( uriElement.value ).toEqual( expectedValue );
	});
});

// onInputChange is covered by clearProgramInput

describe(MODULE_NAME + ':GipEdit, setInputToSelected,setInputFieldsFromProgram', () => {
	let testModuleObj       : Type_TestModule;
	let GipEdit             : Type_TestModule['default'];
	let component           : Type_setupUserEvent_ret;
	let elementURI          : HTMLInputElement;
	let elementTitle        : HTMLInputElement;
	let elementDay          : HTMLSelectElement;
	let elementQuality      : HTMLSelectElement;
	let elementGenre        : HTMLSelectElement;
	let elementSynopsis     : HTMLInputElement;
	let progElements        : Type_programItemElement;
	let expectedQuality     : string;
	let expectedGenre       : string;
	let expectedDay         : string;

	beforeEach( async () => {
		commonBeforeEach();
		testModuleObj = testModule;
		GipEdit       = testModuleObj.default;
		testFetchErr  = null;  // Return dummy program data
		await act( async () => {
			component = setupUserEvent( <GipEdit/> );
			await sleep( 1000 ); // useEffect asynchronously loads the programs, so need to wait for the focus to be set
		} );
		elementURI      = document.getElementById( 'uri' )                as HTMLInputElement;
		elementTitle    = document.getElementById( 'title' )              as HTMLInputElement;
		elementSynopsis = document.getElementById( 'synopsis' )           as HTMLInputElement;
		elementDay      = document.getElementById( 'select-day_of_week' ) as HTMLSelectElement;
		elementGenre    = document.getElementById( 'select-genre' )       as HTMLSelectElement;
		elementQuality  = document.getElementById( 'select-quality' )     as HTMLSelectElement;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Select first program in list', async () => {
		expect(component).not.toBeFalsy();
		expect( elementURI.value ).toEqual( '' );
		expect( elementTitle.value ).toEqual( '' );
		expect( elementDay.value ).toEqual( 'Any' );
		expect( elementQuality.value ).toEqual( 'Normal' );
		expect( elementGenre.value ).toEqual( 'Comedy' );
		expectedQuality = REVERSE_FIELD_MAP_COLLECTION.quality[ 'HIGH' ]!;       // eslint-disable-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/dot-notation
		expectedGenre   = REVERSE_FIELD_MAP_COLLECTION.genre[ 'Books&Spoken' ]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		expectedDay     = REVERSE_FIELD_MAP_COLLECTION.day_of_week[ 'Thu' ]!;    // eslint-disable-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/dot-notation
		progElements    = getProgElement( 1 );
		await component.user.pointer( { target: progElements.pid, keys: '[MouseLeft]' } );
		expect( elementURI.value ).toEqual( progElements.pid.value );
		expect( elementTitle.value ).toEqual( progElements.title.value );
		expect( elementDay.value ).toEqual( expectedDay );
		expect( elementQuality.value ).toEqual( expectedQuality );
		expect( elementGenre.value ).toEqual( expectedGenre );
		expect( elementSynopsis.value ).toEqual( progElements.synopsis.value );
	});

	test('Select second program in list', async () => {
		expect(component).not.toBeFalsy();
		expectedQuality = REVERSE_FIELD_MAP_COLLECTION.quality[ 'Normal' ]!;  // eslint-disable-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/dot-notation
		expectedGenre   = REVERSE_FIELD_MAP_COLLECTION.genre[ 'Comedy' ]!;    // eslint-disable-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/dot-notation
		expectedDay     = REVERSE_FIELD_MAP_COLLECTION.day_of_week[ 'ANY' ]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/dot-notation
		progElements    = getProgElement( 2 );
		await component.user.click( progElements.pid );
		expect( elementURI.value ).toEqual( progElements.pid.value );
		expect( elementTitle.value ).toEqual( progElements.title.value );
		expect( elementDay.value ).toEqual( expectedDay );
		expect( elementQuality.value ).toEqual( expectedQuality );
		expect( elementGenre.value ).toEqual( expectedGenre );
		expect( elementSynopsis.value ).toEqual( progElements.synopsis.value );
	});

	test('Select both programs in list', async () => {
		expect(component).not.toBeFalsy();
		progElements = getProgElement( 2 );
		await component.user.click( progElements.pid );
		progElements = getProgElement( 1 );
		await component.user.keyboard( '{Control>}' );
		await component.user.click( progElements.pid );
		await component.user.keyboard( '{/Control}' );
		expect( elementURI.value ).toEqual( '' );
		expect( elementTitle.value ).toEqual( '' );
		expect( elementDay.value ).toEqual( 'Any' );
		expect( elementQuality.value ).toEqual( 'Normal' );
		expect( elementGenre.value ).toEqual( 'Comedy' );
		expect( elementSynopsis.value ).toEqual( '' );
	});
});

describe(MODULE_NAME + ':GipEdit, onOptionChange', () => {
	let testModuleObj   : Type_TestModule;
	let GipEdit         : Type_TestModule['default'];
	let component       : Type_setupUserEvent_ret;
	let elementURI      : HTMLInputElement;
	let elementQuality  : HTMLSelectElement;
	let progElements    : Type_programItemElement;
	let expectedQuality : string;

	beforeEach( async () => {
		commonBeforeEach();
		testModuleObj = testModule;
		GipEdit       = testModuleObj.default;
		testFetchErr  = null;  // Return dummy program data
		await act( async () => {
			component = setupUserEvent( <GipEdit/> );
			await sleep( 1000 ); // useEffect asynchronously loads the programs, so need to wait for the focus to be set
		} );
		elementURI      = document.getElementById( 'uri' )                as HTMLInputElement;
		elementQuality  = document.getElementById( 'select-quality' )     as HTMLSelectElement;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Change program quality', async () => {
		expect(component).not.toBeFalsy();
		expectedQuality = REVERSE_FIELD_MAP_COLLECTION.quality[ 'Normal' ]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/dot-notation
		progElements    = getProgElement( 2 );
		await component.user.click( progElements.pid );
		expect( elementURI.value ).toEqual( progElements.pid.value );
		expect( elementQuality.value ).toEqual( expectedQuality );
		expectedQuality = REVERSE_FIELD_MAP_COLLECTION.quality[ 'HIGH' ]!;   // eslint-disable-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/dot-notation
		// The user library does not appear to handle changing the select option using key presses, so just update the element directly
		await component.user.selectOptions( elementQuality, 'High' );
		expect( elementQuality.value ).toEqual( expectedQuality );
	});
});

describe(MODULE_NAME + ':GipEdit, onKeyDown, edit program', () => {
	let testModuleObj   : Type_TestModule;
	let GipEdit         : Type_TestModule['default'];
	let component       : Type_setupUserEvent_ret;
	let progElements    : Type_programItemElement;
	let elementQuality  : HTMLSelectElement;
	let expectedQuality : string;
	let elementPID      : HTMLInputElement;
	let expectedPID     : string;

	beforeEach( async () => {
		commonBeforeEach();
		testModuleObj = testModule;
		GipEdit       = testModuleObj.default;
		testFetchErr  = null;  // Return dummy program data
		await act( async () => {
			component = setupUserEvent( <GipEdit/> );
			await sleep( 1000 ); // useEffect asynchronously loads the programs, so need to wait for the focus to be set
		} );
		elementQuality = document.getElementById( 'select-quality' ) as HTMLSelectElement;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Select a program, change the quality and update it', async () => {
		expect(component).not.toBeFalsy();
		progElements = getProgElement( 1 );
		await component.user.click( progElements.quality );
		expectedQuality = 'High';
		expect( elementQuality.value ).toEqual( expectedQuality ); // Confirm the current value
		await component.user.selectOptions( elementQuality, 'Normal' );
		expectedQuality = 'Normal';
		await component.user.keyboard( '{Enter}' );                           // Update the program
		expect( progElements.quality.value ).toEqual( expectedQuality );      // Confirm that the program table has been updated
		expect( elementQuality.value ).toEqual( progElements.quality.value ); // Confirm that the input select retains the same value
	});

	test('Select a program, update the PID, new program added', async () => {
		expect(component).not.toBeFalsy();
		progElements = getProgElement( 1 );
		await component.user.click( progElements.pid );
		elementPID  = document.getElementById( 'uri' ) as HTMLInputElement;
		expectedPID = `${progElements.pid.value}a`;
		await component.user.click( elementPID );
		await component.user.keyboard( '{A}' );                  // Update the program PID
		await component.user.keyboard( '{Enter}' );              // Update the program PID
		await sleep( 1000 );
		progElements = getProgElement( 3 );                      // Get the new program from the program table
		expect( progElements.pid.value ).toEqual( expectedPID ); // Confirm that the program table has been updated
	});
});

describe(MODULE_NAME + ':GipEdit, onKeyDown, no programs', () => {
	let testModuleObj        : Type_TestModule;
	let GipEdit              : Type_TestModule['default'];
	let component            : Type_setupUserEvent_ret;
	let elementQuality       : HTMLSelectElement;
	let expectedAlertMessage : string;

	beforeEach( async () => {
		testFetchArr = [];
		commonBeforeEach();
		testModuleObj = testModule;
		GipEdit       = testModuleObj.default;
		testFetchErr  = null;  // Return dummy program data
		await act( async () => {
			component = setupUserEvent( <GipEdit/> );
			await sleep( 1000 ); // useEffect asynchronously loads the programs, so need to wait for the focus to be set
		} );
		elementQuality = document.getElementById( 'select-quality' ) as HTMLSelectElement;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Incomplete program info', async () => {
		expect(component).not.toBeFalsy();
		expectedAlertMessage = 'Incomplete program info';
		await component.user.click( elementQuality );
		await component.user.keyboard( '{Enter}' );
		expect( alertMock ).toHaveBeenCalledWith( expectedAlertMessage );
	});
});

describe(MODULE_NAME + ':GipEdit, onProgramTableKeyDown', () => {
	let testModuleObj : Type_TestModule;
	let GipEdit       : Type_TestModule['default'];
	let component     : Type_setupUserEvent_ret;
	let progElements  : Type_programItemElement;
	let elementURI    : HTMLInputElement;

	beforeEach( async () => {
		commonBeforeEach();
		testModuleObj = testModule;
		GipEdit       = testModuleObj.default;
		testFetchErr  = null;  // Return dummy program data
		await act( async () => {
			component = setupUserEvent( <GipEdit/> );
			await sleep( 1000 ); // useEffect asynchronously loads the programs, so need to wait for the focus to be set
		} );
		elementURI = document.getElementById( 'uri' ) as HTMLInputElement;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Select a program, press Escape to unselect it', async () => {
		expect(component).not.toBeFalsy();
		progElements = getProgElement( 1 );
		await component.user.click( progElements.pid );
		expect( elementURI.value ).toEqual( progElements.pid.value );
		await component.user.keyboard( '{Escape}' );
		expect( elementURI.value ).toEqual( '' );
	});
});

describe(MODULE_NAME + ':GipEdit, drag and drop', () => {
	let testModuleObj    : Type_TestModule;
	let GipEdit          : Type_TestModule['default'];
	let component        : Type_setupUserEvent_ret;
	let elementGrid      : HTMLElement;
	let draggableElement : HTMLElement;
	let elementURI       : HTMLInputElement;
	let elementTitle     : HTMLInputElement;
	let elementDay       : HTMLSelectElement;
	let elementQuality   : HTMLSelectElement;
	let elementGenre     : HTMLSelectElement;
	let elementSynopsis  : HTMLInputElement;
	let elementImageURI  : HTMLImageElement;

	function DraggableComponent() : React.JSX.Element {

		return (
			<div
				id="draggable-component"
				className="center-vh"
				draggable={true}
			>
				Drag Me to the component
			</div>
		);
	}

	beforeEach( async () => {
		commonBeforeEach();
		testModuleObj = testModule;
		GipEdit       = testModuleObj.default;
		testFetchErr  = null;  // Return dummy program data
		render( <DraggableComponent/> );
		draggableElement = document.getElementById( 'draggable-component' )!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		await act( async () => {
			component = setupUserEvent( <GipEdit/> );
			await sleep( 1000 ); // useEffect asynchronously loads the programs, so need to wait for the focus to be set
		} );
		elementGrid     = document.getElementsByClassName( 'gip-grid' )[0] as HTMLElement;
		elementURI      = document.getElementById( 'uri' )                 as HTMLInputElement;
		elementTitle    = document.getElementById( 'title' )               as HTMLInputElement;
		elementSynopsis = document.getElementById( 'synopsis' )            as HTMLInputElement;
		elementImageURI = document.getElementById( 'image' )               as HTMLImageElement;
		elementDay      = document.getElementById( 'select-day_of_week' )  as HTMLSelectElement;
		elementGenre    = document.getElementById( 'select-genre' )        as HTMLSelectElement;
		elementQuality  = document.getElementById( 'select-quality' )      as HTMLSelectElement;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Drag and drop over the PID element', () => {
		expect(component).not.toBeFalsy();
		fireEvent.dragStart( draggableElement );
		fireEvent.dragOver( elementGrid );
		const getData = ( format : string ) : string => {
			if ( format === 'text/html' ) {
				return TEST_PROG_LINK_HTML;
			} else {
				return 'test/pid';
			}
		};
		fireEvent.drop( elementGrid, { dataTransfer: { getData } } );
		expect( elementURI.value ).toEqual( 'test/pid' );
		expect( elementTitle.value ).toEqual( 'MyTitle-MyEpisode' );
		expect( elementDay.value ).toEqual( 'Any' );
		expect( elementQuality.value ).toEqual( 'Normal' );
		expect( elementGenre.value ).toEqual( 'Comedy' );
		expect( elementSynopsis.value ).toEqual( `${TEST_PROG_EPISODE}.\n${TEST_PROG_SYNOPSIS}` );
		expect( elementImageURI.src ).toEqual( TEST_PROG_IMAGE_URI );
	});
});

describe(MODULE_NAME + ':GipEdit, select OK', () => {
	let testModuleObj      : Type_TestModule;
	let GipEdit            : Type_TestModule['default'];
	let component          : RenderResult | null;
	let elementSelectOK    : HTMLButtonElement;
	let progElements       : Type_programItemElement;
	let expectedBackground : string;

	beforeEach( async () => {
		commonBeforeEach();
		testModuleObj = testModule;
		GipEdit       = testModuleObj.default;
		testFetchErr  = null;  // Return dummy program data
		await act( async () => {
			component = render( <GipEdit/> );
			await sleep( 1000 ); // useEffect asynchronously loads the programs, so need to wait for the focus to be set
		} );
		elementSelectOK = document.getElementsByClassName( 'gip-action-button-select-ok' )[0] as HTMLButtonElement;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('select OK', () => {
		expect(component).not.toBeFalsy();
		fireEvent.click( elementSelectOK );
		progElements = getProgElement( 2 );
		expectedBackground = 'rgb(100, 210, 255)';
		expect( progElements.pid.style.background ).toEqual( expectedBackground );
		progElements = getProgElement( 1 );
		expectedBackground = '';
		expect( progElements.pid.style.background ).toEqual( expectedBackground );
	});
});

describe(MODULE_NAME + ':GipEdit, save programs', () => {
	let testModuleObj        : Type_TestModule;
	let GipEdit              : Type_TestModule['default'];
	let component            : RenderResult | null;
	let elementSavePrograms  : HTMLButtonElement;
	let expectedAlertMessage : string;

	beforeEach( async () => {
		commonBeforeEach();
		testModuleObj = testModule;
		GipEdit       = testModuleObj.default;
		testFetchErr  = null;  // Return dummy program data
		await act( async () => {
			component = render( <GipEdit/> );
			await sleep( 1000 ); // useEffect asynchronously loads the programs, so need to wait for the focus to be set
		} );
		elementSavePrograms = document.getElementsByClassName( 'gip-action-button-save-progs' )[0] as HTMLButtonElement;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('save programs', async () => {
		expectedAlertMessage = 'saveFailed! Save error';
		expect(component).not.toBeFalsy();
		testFetchErr = new Error( 'Save error' );
		await act( async () => {
			fireEvent.click( elementSavePrograms );
			await sleep( 300 );
			expect( alertMock ).toHaveBeenCalledWith( expectedAlertMessage );
		});
	});
});
