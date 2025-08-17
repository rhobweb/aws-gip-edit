/**
 * File:        components/gip_program_options.spec.tsx.
 * Description: Unit Tests for components/gip_program_options.tsx
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/components/';
const MODULE_NAME      = 'gip_program_options.tsx';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Imports

import {jest} from '@jest/globals'; // For isolateModulesAsync

import React from 'react';

import {
	render,
	RenderResult,
	fireEvent,
} from '@testing-library/react';

import * as TEST_MODULE from '#components/gip_program_options';

////////////////////////////////////////////////////////////////////////////////
// Types

import type {
	Type_ProgramOptionsSelect_args,
	Type_ProgramOptionsSelect_ret,
	Type_GipProgramOptions_args,
	Type_GipProgramOptions_ret,
} from '#components/gip_program_options';

interface Type_TestModulePrivateDefs {
	ProgramOptionSelect: (args: Type_ProgramOptionsSelect_args) => Type_ProgramOptionsSelect_ret,
};

interface Type_TestModule {
	privateDefs:       Type_TestModulePrivateDefs,
	GipProgramOptions: (args?: Type_GipProgramOptions_args) => Type_GipProgramOptions_ret,
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

// Set the timeout to allow debugging. Defaults to 5000 ms
//const TEST_TIMEOUT_MS = 300 * 1000;
//jest.setTimeout( TEST_TIMEOUT_MS );

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

describe(MODULE_NAME + ':ProgramOptionSelect', () => {
	let testModuleObj       : Type_TestModulePrivateDefs;
	let actualResult        : HTMLElement;
	let expectedResult      : HTMLElement;
	let expectedJSX         : React.JSX.Element;
	let testArgs            : Type_ProgramOptionsSelect_args;
	let ProgramOptionSelect : (args: Type_ProgramOptionsSelect_args) => Type_ProgramOptionsSelect_ret;
	let onChangeMock	      : jest.Mock;
	let onKeyDownMock	      : jest.Mock;
	let testGenre	          : string;
	let testQuality	        : string;
	let testDayOfWeek       : string;
	let component           : RenderResult;
	let expectedRendered    : RenderResult;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		ProgramOptionSelect = testModuleObj.ProgramOptionSelect;
		onChangeMock  = jest.fn();
		onKeyDownMock = jest.fn();
		testGenre     = 'comedy';
		testQuality   = 'high';
		testDayOfWeek = 'wed';
		testArgs = {
			fieldName:	  'genre',
			optionFields: {
				genre:       testGenre,
				quality:     testQuality,
				day_of_week: testDayOfWeek
			},
			onChange:  onChangeMock,
			onKeyDown: onKeyDownMock,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Genre', () => {
		expectedJSX = (
			<select
				className={ `gip-prog-option-field gip-prog-option-field-genre` }
				id={ `select-genre` }
				onChange={ () => { expect.any(Function); } }
				onKeyDown={ onKeyDownMock }
				value={ testGenre }
			>
				<option value={ 'Books & Spoken' }>{ 'Books&Spoken' }</option>
				<option value={ 'Comedy' }>{ 'Comedy' }</option>
			</select>
		);
		expectedRendered = render( expectedJSX );
		expectedResult   = expectedRendered.container;
		component        = render( <ProgramOptionSelect { ...testArgs } /> );
		actualResult     = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Quality', () => {
		testArgs.fieldName = 'quality';
		expectedJSX = (
			<select
				className={ `gip-prog-option-field gip-prog-option-field-quality` }
				id={ `select-quality` }
				onChange={ () => { expect.any(Function); } }
				onKeyDown={ onKeyDownMock }
				value={ testQuality }
			>
				<option value={ 'Normal' }>{ 'Normal' }</option>
				<option value={ 'High' }>{ 'HIGH' }</option>
			</select>
		);
		expectedRendered = render( expectedJSX );
		expectedResult   = expectedRendered.container;
		component        = render( <ProgramOptionSelect { ...testArgs } /> );
		actualResult     = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Day of week', () => {
		testArgs.fieldName = 'day_of_week';
		expectedJSX = (
			<select
				className={ `gip-prog-option-field gip-prog-option-field-day_of_week` }
				id={ `select-day_of_week` }
				onChange={ () => { expect.any(Function); } }
				onKeyDown={ onKeyDownMock }
				value={ testDayOfWeek }
			>
				<option value={ 'Any' }>{ 'ANY' }</option>
				<option value={ 'Mon' }>{ 'Mon' }</option>
				<option value={ 'Tue' }>{ 'Tue' }</option>
				<option value={ 'Wed' }>{ 'Wed' }</option>
				<option value={ 'Thu' }>{ 'Thu' }</option>
				<option value={ 'Fri' }>{ 'Fri' }</option>
				<option value={ 'Sat' }>{ 'Sat' }</option>
				<option value={ 'Sun' }>{ 'Sun' }</option>
			</select>
		);
		expectedRendered = render( expectedJSX );
		expectedResult   = expectedRendered.container;
		component        = render( <ProgramOptionSelect { ...testArgs } /> );
		actualResult     = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':GipProgramOptions', () => {
	let testModuleObj       : Type_TestModule;
	let testArgs            : Type_GipProgramOptions_args;
	let GipProgramOptions   : Type_TestModule['GipProgramOptions'];
	let onChangeMock	      : jest.Mock;
	let testGenre	          : string;
	let testQuality	        : string;
	let testDayOfWeek       : string;
	let component           : RenderResult | null;
	let element             : HTMLSelectElement | null;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj     = testModule;
		GipProgramOptions = testModuleObj.GipProgramOptions;
		onChangeMock  = jest.fn();
		testGenre     = 'comedy';
		testQuality   = 'high';
		testDayOfWeek = 'wed';
		testArgs = {
			optionFields: {
				genre:       testGenre,
				quality:     testQuality,
				day_of_week: testDayOfWeek
			},
			onChange:  onChangeMock,
			onKeyDown: jest.fn(),
		};
		onChangeMock.mockImplementation( ( /* event: React.UIEvent<HTMLOptionElement> */ ) => {
			//const arrIgnore = [ 'stateNode' ];
			//const arrProp = Object.keys( event ).filter( k => !arrIgnore.includes( k ) );
			//console.log( 'onChangeMock', JSON.stringify( event, arrProp ) );
		});
	});

	afterEach( () => {
		commonAfterEach();
		if ( component ) {
			component.unmount(); // Clean up the rendered component
			component = null; // Reset the component variable
		}
	});

	test('Rendered OK', () => {
		component = render( <GipProgramOptions { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});

	test('genre rendered OK', () => {
		component = render( <GipProgramOptions { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-prog-option-field-genre' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLSelectElement;
		expect( element.children.length ).toEqual( 2 );
		expect( (element.children[0] as HTMLOptionElement).value ).toEqual( 'Books & Spoken' );
		expect( (element.children[1] as HTMLOptionElement).value ).toEqual( 'Comedy' );
	});

	test('quality rendered OK', () => {
		component = render( <GipProgramOptions { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-prog-option-field-quality' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLSelectElement;
		expect( element.children.length ).toEqual( 2 );
		expect( (element.children[0] as HTMLOptionElement).value ).toEqual( 'Normal' );
		expect( (element.children[1] as HTMLOptionElement).value ).toEqual( 'High' );
	});

	test('day rendered OK', () => {
		component = render( <GipProgramOptions { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-prog-option-field-day_of_week' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLSelectElement;
		expect( element.children.length ).toEqual( 8 );
		expect( (element.children[0] as HTMLOptionElement).value ).toEqual( 'Any' );
		expect( (element.children[1] as HTMLOptionElement).value ).toEqual( 'Mon' );
		expect( (element.children[2] as HTMLOptionElement).value ).toEqual( 'Tue' );
		expect( (element.children[3] as HTMLOptionElement).value ).toEqual( 'Wed' );
		expect( (element.children[4] as HTMLOptionElement).value ).toEqual( 'Thu' );
		expect( (element.children[5] as HTMLOptionElement).value ).toEqual( 'Fri' );
		expect( (element.children[6] as HTMLOptionElement).value ).toEqual( 'Sat' );
		expect( (element.children[7] as HTMLOptionElement).value ).toEqual( 'Sun' );
	});

	test('quality changed OK', () => {
		component = render( <GipProgramOptions { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-prog-option-field-quality' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLSelectElement;
		fireEvent.change( element, { target: { value: 'Comedy' } } );
		expect( onChangeMock ).toHaveBeenCalled();
	});
});
