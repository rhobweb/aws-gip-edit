/**
 * File:        components/gip_action_buttons.spec.tsx.
 * Description: Unit Tests for components/gip_action_buttons.tsx
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/components/';
const MODULE_NAME      = 'gip_action_buttons.tsx';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Imports

import React from 'react';

import {
	render,
	RenderResult,
	fireEvent,
} from '@testing-library/react';

////////////////////////////////////////////////////////////////////////////////
// Types

import type {
	Type_DisplayProgramItem,
} from '../../../src/utils/gip_types';

import type {
	Type_ActionButtons_args,
	Type_ActionButtons_ret,
	Type_GipActionButtons_args,
	Type_GipActionButtons_ret,
} from '../../../src/components/gip_action_buttons';

interface Type_TestModulePrivateDefs {
	ActionButtons: (args: Type_ActionButtons_args) => Type_ActionButtons_ret,
};

interface Type_TestModule {
	privateDefs:      Type_TestModulePrivateDefs,
	GipActionButtons: (args?: Type_GipActionButtons_args) => Type_GipActionButtons_ret,
};

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

import * as TEST_MODULE from '../../../src/components/gip_action_buttons';
const testModule = TEST_MODULE as unknown as Type_TestModule;

const alertMock   = jest.fn();
const confirmMock = jest.fn();

window.alert   = alertMock;
window.confirm = confirmMock;

////////////////////////////////////////////////////////////////////////////////
// Test utilities

function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

function commonAfterEach() : void {
	jest.restoreAllMocks();
	jest.resetModules();
}

// Set the timeout to allow debugging. Defaults to 5000 ms
//const TEST_TIMEOUT_MS = 300 * 1000;
//jest.setTimeout( TEST_TIMEOUT_MS );

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

describe(MODULE_NAME + ':ActionButtons', () => {
	let testModuleObj       : Type_TestModulePrivateDefs;
	let actualResult        : HTMLElement;
	let expectedJSX         : React.JSX.Element;
	let expectedResult      : HTMLElement;
	let testArgs            : Type_ActionButtons_args;
	let testPrograms        : Type_DisplayProgramItem[];
	let onProgramChangeMock : jest.Mock;
	let programsSavedMock   : jest.Mock;
	let saveProgramsMock    : jest.Mock;
	let ActionButtons       : (args: Type_ActionButtons_args) => Type_ActionButtons_ret;
	let component           : RenderResult | null;
	let element             : HTMLButtonElement;
	let saveProgramsErr     : Error | null;
	let saveProgramsRet     : Type_DisplayProgramItem[];


	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		ActionButtons = testModuleObj.ActionButtons;
		testPrograms = [
			{
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
			},
			{
				uri:         'uri2',
				pid:         'pid2',
				status:      'Error',
				title:       'Title2',
				synopsis:    'Synopsis2',
				image_uri:   'ImageUri2',
				genre:       'Comedy',
				day_of_week: 'Any',
				quality:     'Normal',
				selected:    false,
			},
			{
				uri:         'uri3',
				pid:         'pid3',
				status:      'Already',
				title:       'Title3',
				synopsis:    'Synopsis3',
				image_uri:   'ImageUri3',
				genre:       'Comedy',
				day_of_week: 'Fri',
				quality:     'HIGH',
				selected:    false,
			},
			{
				uri:         'uri4',
				pid:         'pid4',
				status:      'Success',
				title:       'Title4',
				synopsis:    'Synopsis4',
				image_uri:   'ImageUri4',
				genre:       'Comedy',
				day_of_week: 'Any',
				quality:     'Normal',
				selected:    false,
			},
		];
		onProgramChangeMock = jest.fn();
		programsSavedMock   = jest.fn();
		saveProgramsMock    = jest.fn();
		testArgs = {
			programs:        testPrograms,
			onProgramChange: onProgramChangeMock,
			programsSaved:   programsSavedMock,
			savePrograms:    saveProgramsMock,
		};
		saveProgramsMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
			if ( ! saveProgramsErr ) {
				return saveProgramsRet;
			} else {
				throw saveProgramsErr;
			}
		} );
		saveProgramsRet = [ testPrograms[ 1 ] ];
		saveProgramsErr = new Error( 'savePrograms err' );
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered', () => {
		component = render( <ActionButtons { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});

	test('Rendered correctly', () => {
		expectedJSX = (
			<>
				<input type="button" className="gip-action-button gip-action-button-reset-errors"    name="resetErrors"    value="Reset Errors"    onClick={ () => { expect.any(Function); } }/>
				<input type="button" className="gip-action-button gip-action-button-clear-days"      name="clearDays"      value="Clear Days"      onClick={ () => { expect.any(Function); } }/>
				<input type="button" className="gip-action-button gip-action-button-select-ok"       name="selectOK"       value="Select OK"       onClick={ () => { expect.any(Function); } }/>
				<input type="button" className="gip-action-button gip-action-button-delete-selected" name="deleteSelected" value="Delete Selected" onClick={ () => { expect.any(Function); } }/>
				<input type="button" className="gip-action-button gip-action-button-save-progs"      name="saveProgs"      value="Save"            onClick={ saveProgramsMock }/>
			</>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <ActionButtons { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});

	test('reset errors', () => {
		component = render( <ActionButtons { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-action-button-reset-errors' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLButtonElement;
		fireEvent.click( element );
		expect( testPrograms[ 0 ].status ).toEqual( 'Pending' );
		expect( testPrograms[ 1 ].status ).toEqual( 'Pending' );
		expect( testPrograms[ 2 ].status ).toEqual( 'Already' );
		expect( testPrograms[ 3 ].status ).toEqual( 'Success' );
		expect( onProgramChangeMock ).toHaveBeenCalledWith( testPrograms );
	});

	test('clear days', () => {
		component = render( <ActionButtons { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-action-button-clear-days' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLButtonElement;
		fireEvent.click( element );
		expect( testPrograms[ 0 ].day_of_week ).toEqual( 'Any' );
		expect( testPrograms[ 1 ].day_of_week ).toEqual( 'Any' );
		expect( testPrograms[ 2 ].day_of_week ).toEqual( 'Any' );
		expect( testPrograms[ 3 ].day_of_week ).toEqual( 'Any' );
	});

	test('select OK', () => {
		const expectedPrograms = JSON.parse( JSON.stringify( testPrograms ) ) as unknown as Type_DisplayProgramItem[];
		expectedPrograms[ 3 ].selected = true;
		component = render( <ActionButtons { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-action-button-select-ok' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLButtonElement;
		fireEvent.click( element );
		expect( onProgramChangeMock ).toHaveBeenCalledWith( expectedPrograms );
		expect( testPrograms[ 0 ].selected ).toEqual( false );
		expect( testPrograms[ 1 ].selected ).toEqual( false );
		expect( testPrograms[ 2 ].selected ).toEqual( false );
		expect( testPrograms[ 3 ].selected ).toEqual( false ); // no change to existing programs
	});

	test('select OK, no programs', () => {
		testArgs.programs = [];
		component = render( <ActionButtons { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-action-button-select-ok' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLButtonElement;
		fireEvent.click( element );
		expect( onProgramChangeMock ).not.toHaveBeenCalled();
		expect( alertMock ).toHaveBeenCalledWith( 'No programs' );
	});

	test('delete selected', () => {
		confirmMock.mockImplementation( () => true );
		testPrograms[ 3 ].selected = true;
		const expectedPrograms = JSON.parse( JSON.stringify( testPrograms ) ) as unknown as Type_DisplayProgramItem[];
		expectedPrograms.splice( 3 );
		component = render( <ActionButtons { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-action-button-delete-selected' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLButtonElement;
		fireEvent.click( element );
		expect( confirmMock ).toHaveBeenCalledWith( 'Delete selected programs?' );
		expect( onProgramChangeMock ).toHaveBeenCalledWith( expectedPrograms );
	});

	test('delete selected, none selected', () => {
		component = render( <ActionButtons { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-action-button-delete-selected' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLButtonElement;
		fireEvent.click( element );
		expect( alertMock ).toHaveBeenCalledWith( 'No programs selected' );
		expect( confirmMock ).not.toHaveBeenCalled();
		expect( onProgramChangeMock ).not.toHaveBeenCalled();
	});

	test('save programs', async () => {
		saveProgramsErr = null;
		component = render( <ActionButtons { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-action-button-save-progs' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLButtonElement;
		fireEvent.click( element );
		await sleep( 500 ); // As the processing is asynchronous, need to wait for it to complete. As the the functions are stubbed 500ms is fine.
		expect( saveProgramsMock ).toHaveBeenCalledWith( testPrograms );
		expect( onProgramChangeMock ).toHaveBeenCalledWith( saveProgramsRet );
		expect( programsSavedMock ).toHaveBeenCalledWith();
	});

	test('save programs error', async () => {
		component = render( <ActionButtons { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-action-button-save-progs' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLButtonElement;
		fireEvent.click( element );
		await sleep( 500 ); // As the processing is asynchronous, need to wait for it to complete. As the the functions are stubbed 500ms is fine.
		expect( saveProgramsMock ).toHaveBeenCalledWith( testPrograms );
		expect( onProgramChangeMock ).not.toHaveBeenCalled();
		expect( programsSavedMock ).not.toHaveBeenCalled();
		expect( alertMock ).toHaveBeenCalledWith( `Error saving programs: ${saveProgramsErr!.message}` ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
	});
});

describe(MODULE_NAME + ':GipActionButtons', () => {
	let testModuleObj       : Type_TestModule;
	let actualResult        : HTMLElement;
	let expectedJSX         : React.JSX.Element;
	let expectedResult      : HTMLElement;
	let testArgs            : Type_GipActionButtons_args;
	let testPrograms        : Type_DisplayProgramItem[];
	let GipActionButtons    : (args: Type_GipActionButtons_args) => Type_GipActionButtons_ret;
	let onProgramChangeMock : jest.Mock;
	let programsSavedMock   : jest.Mock;
	let saveProgramsMock    : jest.Mock;
	let component           : RenderResult | null;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		GipActionButtons = testModuleObj.GipActionButtons;
		testPrograms = [
			{
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
			},
			{
				uri:         'uri2',
				pid:         'pid2',
				status:      'Error',
				title:       'Title2',
				synopsis:    'Synopsis2',
				image_uri:   'ImageUri2',
				genre:       'Comedy',
				day_of_week: 'Any',
				quality:     'Normal',
				selected:    false,
			},
			{
				uri:         'uri3',
				pid:         'pid3',
				status:      'Already',
				title:       'Title3',
				synopsis:    'Synopsis3',
				image_uri:   'ImageUri3',
				genre:       'Comedy',
				day_of_week: 'Fri',
				quality:     'HIGH',
				selected:    false,
			},
			{
				uri:         'uri4',
				pid:         'pid4',
				status:      'Success',
				title:       'Title4',
				synopsis:    'Synopsis4',
				image_uri:   'ImageUri4',
				genre:       'Comedy',
				day_of_week: 'Any',
				quality:     'Normal',
				selected:    false,
			},
		];
		onProgramChangeMock = jest.fn();
		programsSavedMock   = jest.fn();
		saveProgramsMock    = jest.fn();
		testArgs = {
			programs:        testPrograms,
			onProgramChange: onProgramChangeMock,
			programsSaved:   programsSavedMock,
			savePrograms:    saveProgramsMock,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered', () => {
		component = render( <GipActionButtons { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});
	test('Rendered correctly', () => {
		expectedJSX = (
			<div className="row">
				<div className="col-md-1 gip-col gip-label"><label>Actions</label></div>
				<div className="col-md-11 gip-col gip-col-buttons">
					<input type="button" className="gip-action-button gip-action-button-reset-errors"    name="resetErrors"    value="Reset Errors"    onClick={ () => { expect.any(Function); } }/>
					<input type="button" className="gip-action-button gip-action-button-clear-days"      name="clearDays"      value="Clear Days"      onClick={ () => { expect.any(Function); } }/>
					<input type="button" className="gip-action-button gip-action-button-select-ok"       name="selectOK"       value="Select OK"       onClick={ () => { expect.any(Function); } }/>
					<input type="button" className="gip-action-button gip-action-button-delete-selected" name="deleteSelected" value="Delete Selected" onClick={ () => { expect.any(Function); } }/>
					<input type="button" className="gip-action-button gip-action-button-save-progs"      name="saveProgs"      value="Save"            onClick={ saveProgramsMock }/>
				</div>
			</div>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <GipActionButtons { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});
});
