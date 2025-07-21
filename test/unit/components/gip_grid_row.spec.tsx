/**
 * File:        components/gip_grid_row.spec.tsx.
 * Description: Unit Tests for components/gip_grid_row.tsx
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/components/';
const MODULE_NAME      = 'gip_grid_row.tsx';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Imports

import React, { ReactElement } from 'react';

import {
	render,
	RenderResult,
} from '@testing-library/react';

////////////////////////////////////////////////////////////////////////////////
// Types

import type {
	Type_GipGridRow_args,
	Type_GipGridRow_ret,
} from '../../../src/components/gip_grid_row';

interface Type_TestModule {
	GipGridRow: (args: Type_GipGridRow_args) => Type_GipGridRow_ret,
};

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

import * as TEST_MODULE from '../../../src/components/gip_grid_row';
const testModule = TEST_MODULE as unknown as Type_TestModule;

////////////////////////////////////////////////////////////////////////////////
// Test utilities

function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

function commonAfterEach() : void {
	jest.restoreAllMocks();
	jest.resetModules();
}

function TestReactElement() : ReactElement {
	return (
		<>
			<input type="button" className="test-react-element" name="test-react-element" value="Test Element"/>
		</>
	);
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

describe(MODULE_NAME + ':GipGridRow', () => {
	let testModuleObj  : Type_TestModule;
	let actualResult   : HTMLElement;
	let expectedJSX    : React.JSX.Element;
	let expectedResult : HTMLElement;
	let testArgs       : Type_GipGridRow_args;
	let GipGridRow     : (args: Type_GipGridRow_args) => Type_GipGridRow_ret;
	let component      : RenderResult | null;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		GipGridRow = testModuleObj.GipGridRow;
		testArgs = {
			paramName:            'test-param',
			labelText:            'test-label-text',
			gipComponent:         TestReactElement,
			additionalClassNames: [ 'test-class-name1', 'test-class-name2' ],
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered', () => {
		component = render( <GipGridRow { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});

	test('Rendered correctly, paramName', () => {
		expectedJSX = (
			<div className="row">
				<div className="col-md-1 gip-col gip-label"><label htmlFor="test-param">test-label-text</label></div>
				<div className="col-md-11 gip-col test-class-name1 test-class-name2">
					<>
						<input type="button" className="test-react-element" name="test-react-element" value="Test Element"/>
					</>
				</div>
			</div>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <GipGridRow { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Rendered correctly, no paramName', () => {
		delete testArgs.paramName;
		expectedJSX = (
			<div className="row">
				<div className="col-md-1 gip-col gip-label"><label>test-label-text</label></div>
				<div className="col-md-11 gip-col test-class-name1 test-class-name2">
					<>
						<input type="button" className="test-react-element" name="test-react-element" value="Test Element"/>
					</>
				</div>
			</div>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <GipGridRow { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});
});
