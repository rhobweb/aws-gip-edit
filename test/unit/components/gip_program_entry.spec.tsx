/**
 * File:        components/gip_program_entry.spec.tsx.
 * Description: Unit Tests for components/gip_program_entry.tsx
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/components/';
const MODULE_NAME      = 'gip_program_entry.tsx';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Imports

import React, { createRef } from 'react';

import {
	render,
	RenderResult,
	fireEvent,
} from '@testing-library/react';

// @ts-expect-error will moan about the PNG file
import DEFAULT_PROGRAM_IMAGE_URI from '../../../public/program_image_placeholder.png';

import {
	Type_ProgramEditInput,
	Type_ProgramEditOptions,
} from '../../../src/utils/gip_types';

////////////////////////////////////////////////////////////////////////////////
// Types

import type {
	Type_RowProgramInput_args,
	Type_RowProgramInput_ret,
	Type_ProgramSynopsis_args,
	Type_ProgramSynopsis_ret,
	Type_ProgramImage_args,
	Type_ProgramImage_ret,
	Type_RowProgramInfo_args,
	Type_RowProgramInfo_ret,
	Type_RowProgramOptions_args,
	Type_RowProgramOptions_ret,
	Type_GipProgramEntry_args,
	Type_GipProgramEntry_ret,
	Type_UriAndTitleRefs,
} from '../../../src/components/gip_program_entry';

interface Type_TestModulePrivateDefs {
	RowProgramInput:   (args: Type_RowProgramInput_args)   => Type_RowProgramInput_ret,
	ProgramSynopsis:   (args: Type_ProgramSynopsis_args)   => Type_ProgramSynopsis_ret,
	ProgramImage:      (args: Type_ProgramImage_args)      => Type_ProgramImage_ret,
	RowProgramInfo:    (args: Type_RowProgramInfo_args)    => Type_RowProgramInfo_ret,
	RowProgramOptions: (args: Type_RowProgramOptions_args) => Type_RowProgramOptions_ret;
};

interface Type_TestModule {
	privateDefs:     Type_TestModulePrivateDefs,
	GipProgramEntry: (args?: Type_GipProgramEntry_args) => Type_GipProgramEntry_ret,
};

type Type_Ref = React.RefObject<HTMLInputElement|null>;

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

import * as TEST_MODULE from '../../../src/components/gip_program_entry';
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

describe(MODULE_NAME + ':RowProgramInput', () => {
	let testModuleObj        : Type_TestModulePrivateDefs;
	let actualResult         : HTMLElement;
	let expectedJSX          : React.JSX.Element;
	let expectedResult       : HTMLElement;
	let testArgs             : Type_RowProgramInput_args;
	let RowProgramInput      : (args: Type_RowProgramInput_args) => Type_RowProgramInput_ret;
	let onChangeMock	       : jest.Mock;
	let expectedOnChangeArgs : Record<string,unknown>;
	let onKeyDownMock	       : jest.Mock;
	let testParamName        : string;
	let testLabelText        : string;
	let testValue            : string;
	let testRef              : Type_Ref;
	let component            : RenderResult | null;
	let element              : HTMLInputElement;
	let testNewValue         : string;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		RowProgramInput = testModuleObj.RowProgramInput;
		onChangeMock  = jest.fn();
		onKeyDownMock = jest.fn();
		testParamName = 'prog_id';
		testLabelText = 'Program ID';
		testValue     = 'test value';
		testRef       = createRef();

		testArgs = {
			paramName: testParamName,
			labelText: testLabelText,
			value:     testValue,
			ref:       testRef,
			onChange:  onChangeMock,
			onKeyDown: onKeyDownMock,
		};
		testNewValue = 'new text';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered', () => {
		component = render( <RowProgramInput { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});

	test('Rendered correctly', () => {
		expectedJSX = (
			<div className="row">
				<div className="col-md-1 gip-col gip-label"><label htmlFor={ testParamName }>{ testLabelText }</label></div>
				<div className="col-md-11 gip-col">
					<input type="text" id={testParamName} className="gip-program-entry-text-input" spellCheck="false"
						value={ testValue }
						onKeyDown={ onKeyDownMock }
						onInput={ onChangeMock }
						ref={ testRef }
					/>
				</div>
			</div>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <RowProgramInput { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});

	test('onChange', () => {
		component = render( <RowProgramInput { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-program-entry-text-input' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLInputElement;
		expectedOnChangeArgs = { paramName: testParamName, newValue: testNewValue };
		fireEvent.input( element, { target: { value: testNewValue } } );
		expect( onChangeMock ).toHaveBeenCalledWith( expectedOnChangeArgs );
	});

	test('onKeyDown', () => {
		component = render( <RowProgramInput { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-program-entry-text-input' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLInputElement;
		fireEvent.keyDown( element, { key: 'A', code: 'KeyA' } );
		expect( onKeyDownMock ).toHaveBeenCalledWith( expect.objectContaining( { code : 'KeyA' } ) );
	});
});

describe(MODULE_NAME + ':ProgramSynopsis', () => {
	let testModuleObj   : Type_TestModulePrivateDefs;
	let actualResult    : HTMLElement;
	let expectedJSX     : React.JSX.Element;
	let expectedResult  : HTMLElement;
	let testArgs        : Type_ProgramSynopsis_args;
	let ProgramSynopsis : (args: Type_ProgramSynopsis_args) => Type_ProgramSynopsis_ret;
	let onKeyDownMock	  : jest.Mock;
	let testValue       : string;
	let component       : RenderResult | null;
	let element         : HTMLInputElement;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj   = testModule.privateDefs;
		ProgramSynopsis = testModuleObj.ProgramSynopsis;
		onKeyDownMock   = jest.fn();
		testValue       = 'test value';

		testArgs = {
			value:     testValue,
			onKeyDown: onKeyDownMock,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered', () => {
		component = render( <ProgramSynopsis { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});

	test('Rendered correctly', () => {
		expectedJSX = (
			<div className="gip-program-entry-synopsis-div">
				<textarea disabled id="synopsis" className="gip-program-entry-synopsis"
					value={ testValue }
					onKeyDown={ event => { onKeyDownMock( event ); } }
				/>
			</div>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <ProgramSynopsis { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});

	test('onKeyDown', () => {
		component = render( <ProgramSynopsis { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-program-entry-synopsis' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLInputElement;
		fireEvent.keyDown( element, { key: 'A', code: 'KeyA' } );
		expect( onKeyDownMock ).toHaveBeenCalledWith( expect.objectContaining( { code : 'KeyA' } ) );
	});
});

describe(MODULE_NAME + ':ProgramImage', () => {
	let testModuleObj   : Type_TestModulePrivateDefs;
	let actualResult    : HTMLElement;
	let expectedJSX     : React.JSX.Element;
	let expectedResult  : HTMLElement;
	let testArgs        : Type_ProgramImage_args;
	let ProgramImage : (args: Type_ProgramImage_args) => Type_ProgramImage_ret;
	let onKeyDownMock	  : jest.Mock;
	let testValue       : string;
	let component       : RenderResult | null;
	let element         : HTMLInputElement;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		ProgramImage  = testModuleObj.ProgramImage;
		onKeyDownMock = jest.fn();
		testValue     = 'test value';
		testArgs = {
			value:     testValue,
			onKeyDown: onKeyDownMock,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered', () => {
		component = render( <ProgramImage { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});

	test('Rendered correctly', () => {
		expectedJSX = (
			<div className="gip-program-entry-image-div">
				<img
					src={ testValue }
					alt="Program Image"
					className="gip-program-entry-image"
					id="image"
					width="160"
					height="160"
					onKeyDown={ event => { onKeyDownMock( event ); } }>
				</img>
			</div>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <ProgramImage { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Rendered correctly, default value', () => {
		delete testArgs.value;
		expectedJSX = (
			<div className="gip-program-entry-image-div">
				<img
					src={ DEFAULT_PROGRAM_IMAGE_URI }
					alt="Program Image"
					className="gip-program-entry-image"
					id="image"
					width="160"
					height="160"
					onKeyDown={ event => { onKeyDownMock( event ); } }>
				</img>
			</div>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <ProgramImage { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});

	test('onKeyDown', () => {
		component = render( <ProgramImage { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-program-entry-image' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLInputElement;
		fireEvent.keyDown( element, { key: 'A', code: 'KeyA' } );
		expect( onKeyDownMock ).toHaveBeenCalledWith( expect.objectContaining( { code : 'KeyA' } ) );
	});
});

describe(MODULE_NAME + ':RowProgramInfo', () => {
	let testModuleObj   : Type_TestModulePrivateDefs;
	let actualResult    : HTMLElement;
	let expectedJSX     : React.JSX.Element;
	let expectedResult  : HTMLElement;
	let testArgs        : Type_RowProgramInfo_args;
	let RowProgramInfo : (args: Type_RowProgramInfo_args) => Type_RowProgramInfo_ret;
	let onKeyDownMock	  : jest.Mock;
	let testSynopsis    : string;
	let testImageURI    : string;
	let component       : RenderResult | null;
	let element         : HTMLInputElement;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		RowProgramInfo  = testModuleObj.RowProgramInfo;
		onKeyDownMock = jest.fn();
		testSynopsis  = 'Test synopsis';
		testImageURI  = 'Test image URI';
		testArgs = {
			synopsis:  testSynopsis,
			image_uri: testImageURI,
			onKeyDown: onKeyDownMock,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered', () => {
		component = render( <RowProgramInfo { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});

	test('Rendered correctly', () => {
		expectedJSX = (
			<div className="row">
				<div className="col-md-1 gip-col gip-label"><label htmlFor="synopsis">Program Info</label></div>
				<div className="col-md-11 gip-col">
					<div className="gip-program-entry-info">
						<div className="gip-program-entry-image-div">
							<img
								src={ testImageURI }
								alt="Program Image"
								className="gip-program-entry-image"
								id="image"
								width="160"
								height="160"
								onKeyDown={ event => { onKeyDownMock( event ); } }>
							</img>
						</div>
						<div className="gip-program-entry-synopsis-div">
							<textarea disabled id="synopsis" className="gip-program-entry-synopsis"
								value={ testSynopsis }
								onKeyDown={ event => { onKeyDownMock( event ); } }
							/>
						</div>
					</div>
				</div>
			</div>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <RowProgramInfo { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});

	test('onKeyDown', () => {
		component = render( <RowProgramInfo { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-program-entry-synopsis' );
		expect( arrElement.length ).toBe( 1 );
		element = arrElement[0] as HTMLInputElement;
		fireEvent.keyDown( element, { key: 'A', code: 'KeyA' } );
		expect( onKeyDownMock ).toHaveBeenCalledWith( expect.objectContaining( { code : 'KeyA' } ) );
	});
});

describe(MODULE_NAME + ':RowProgramOptions', () => {
	let testModuleObj     : Type_TestModulePrivateDefs;
	let testArgs          : Type_RowProgramOptions_args;
	let RowProgramOptions : (args: Type_RowProgramOptions_args) => Type_RowProgramOptions_ret;
	let onKeyDownMock	    : jest.Mock;
	let onChangeMock	    : jest.Mock;
	let testOptionFields  : Type_ProgramEditOptions;
	let component         : RenderResult | null;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj     = testModule.privateDefs;
		RowProgramOptions = testModuleObj.RowProgramOptions;
		onKeyDownMock     = jest.fn();
		onChangeMock      = jest.fn();
		testOptionFields = {
			day_of_week: 'Mon',
			quality:     'Normal',
			genre:       'Comedy',
		};
		testArgs = {
			optionFields: testOptionFields,
			onKeyDown:    onKeyDownMock,
			onChange:     onChangeMock,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered', () => {
		component = render( <RowProgramOptions { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});

	// Sub-components are tested elsewhere
});

describe(MODULE_NAME + ':GipProgramEntry', () => {
	let testModuleObj          : Type_TestModule;
	let testArgs               : Type_GipProgramEntry_args;
	let GipProgramEntry        : (args: Type_GipProgramEntry_args) => Type_GipProgramEntry_ret;
	let onKeyDownMock	         : jest.Mock;
	let onInputChangeMock	     : jest.Mock;
	let onOptionChangeMock     : jest.Mock;
	let testProgramEditInput   : Type_ProgramEditInput;
	let testProgramEditOptions : Type_ProgramEditOptions;
	let component              : RenderResult | null;
	let testRefs               : Type_UriAndTitleRefs;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj      = testModule;
		GipProgramEntry    = testModuleObj.GipProgramEntry;
		onKeyDownMock      = jest.fn();
		onInputChangeMock  = jest.fn();
		onOptionChangeMock = jest.fn();
		testProgramEditInput = {
			uri:       'test uri',
			title:     'test title',
			synopsis:  'test synopsis',
			image_uri: 'test image_uri',
		};
		testProgramEditOptions = {
			day_of_week: 'Mon',
			quality:     'Normal',
			genre:       'Comedy',
		};
		testRefs = {
			uri:   createRef(),
			title: createRef(),
		};
		testArgs = {
			programEditInput:   testProgramEditInput,
			programEditOptions: testProgramEditOptions,
			onKeyDown:          onKeyDownMock,
			onInputChange:      onInputChangeMock,
			onOptionChange:     onOptionChangeMock,
			refs:               testRefs,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered', () => {
		component = render( <GipProgramEntry { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});
});
