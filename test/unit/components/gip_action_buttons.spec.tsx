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
	ActionButtons: (args: Type_ActionButtons_args)       => Type_ActionButtons_ret,
};

interface Type_TestModule {
	privateDefs:      Type_TestModulePrivateDefs,
	GipActionButtons: (args?: Type_GipActionButtons_args) => Type_GipActionButtons_ret,
};

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

import * as TEST_MODULE from '../../../src/components/gip_program_table';
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
const TEST_TIMEOUT_MS = 300 * 1000;
jest.setTimeout( TEST_TIMEOUT_MS );

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
/*
describe(MODULE_NAME + ':ActionButtons', () => {
	let testModuleObj        : Type_TestModulePrivateDefs;
	let actualResult         : HTMLElement;
	let expectedJSX          : React.JSX.Element;
	let expectedResult       : HTMLElement;
	let testArgs             : Type_ActionButtons_args;
	let testArrFieldOrder    : string[];
	let testHeaderDisplayMap : Record<string,string>;
	let ActionButtons          : (args: Type_ActionButtons_args) => Type_ActionButtons_ret;
	let component            : RenderResult | null;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		ActionButtons = testModuleObj.ActionButtons;
		testArrFieldOrder = [ 'f1', 'f2', 'f3' ];
		testHeaderDisplayMap = {
			f1: 'Field 1',
			f2: 'Field 2',
			f3: 'Field 3',
		};
		testArgs = {
			arrFieldOrder:    testArrFieldOrder,
			headerDisplayMap: testHeaderDisplayMap,
		};
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
			<div className="gip-prog-item-row gip-prog-item-header-row" id="program-header">
				<div key="head-0" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-f1">Field 1</div>
				<div key="head-1" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-f2">Field 2</div>
				<div key="head-2" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-f3">Field 3</div>
			</div>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <ActionButtons { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});
});
*/
