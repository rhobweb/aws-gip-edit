/**
 * File:        components/gip_program_table.spec.tsx.
 * Description: Unit Tests for components/gip_program_table.tsx
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/components/';
const MODULE_NAME      = 'gip_program_table.tsx';
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

////////////////////////////////////////////////////////////////////////////////
// Types

import type {
	Type_DisplayProgramItem,
//} from '../../../src/utils/gip_types';
} from '#utils/gip_types';

import type {
	Type_genSelectedStyle_args,
	Type_genSelectedStyle_ret,
	Type_ProgHeaders_args,
	Type_ProgHeaders_ret,
	Type_progToDisplayValue_args,
	Type_progToDisplayValue_ret,
	Type_GipProgramTable_args,
	Type_GipProgramTable_ret,
	Type_ProgInputField_args,
	Type_ProgInputField_ret,
	Type_ProgInputFields_args,
	Type_ProgInputFields_ret,
	Type_ProgramTable_args,
	Type_ProgramTable_ret,
} from '#components/gip_program_table';

interface Type_TestModulePrivateDefs {
	genSelectedStyle:   (args: Type_genSelectedStyle_args)   => Type_genSelectedStyle_ret,
	ProgHeaders:        (args: Type_ProgHeaders_args)        => Type_ProgHeaders_ret,
	progToDisplayValue: (args: Type_progToDisplayValue_args) => Type_progToDisplayValue_ret,
	ProgInputField:     (args: Type_ProgInputField_args)     => Type_ProgInputField_ret,
	ProgInputFields:    (args: Type_ProgInputFields_args)    => Type_ProgInputFields_ret,
	ProgramTable:       (args: Type_ProgramTable_args)       => Type_ProgramTable_ret,
};

interface Type_TestModule {
	privateDefs:     Type_TestModulePrivateDefs,
	GipProgramTable: (args?: Type_GipProgramTable_args) => Type_GipProgramTable_ret,
};

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

//import * as TEST_MODULE from '../../../src/components/gip_program_table';
import * as TEST_MODULE from '#components/gip_program_table';
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

describe(MODULE_NAME + ':genSelectedStyle', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_genSelectedStyle_ret;
	let expectedResult : Type_genSelectedStyle_ret;
	let testArgs       : Type_genSelectedStyle_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Not selected', () => {
		testArgs       = false;
		expectedResult = {};
		actualResult   = testModuleObj.genSelectedStyle( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Selected', () => {
		testArgs       = true;
		expectedResult = {
			background: 'rgb(100, 210, 255)',
		};
		actualResult = testModuleObj.genSelectedStyle( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':ProgHeaders', () => {
	let testModuleObj        : Type_TestModulePrivateDefs;
	let actualResult         : HTMLElement;
	let expectedJSX          : React.JSX.Element;
	let expectedResult       : HTMLElement;
	let testArgs             : Type_ProgHeaders_args;
	let testArrFieldOrder    : string[];
	let testHeaderDisplayMap : Record<string,string>;
	let ProgHeaders          : (args: Type_ProgHeaders_args) => Type_ProgHeaders_ret;
	let component            : RenderResult | null;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		ProgHeaders = testModuleObj.ProgHeaders;
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
		component = render( <ProgHeaders { ...testArgs } /> );
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
		component      = render( <ProgHeaders { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':progToDisplayValue unknown field', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_progToDisplayValue_ret;
	let expectedResult : Type_progToDisplayValue_ret;
	let testArgs       : Type_progToDisplayValue_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = {
			fieldName:  'unknown_field',
			fieldValue: null,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Unknown field with null value', () => {
		testArgs.fieldValue = null;
		expectedResult = '';
		actualResult = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Unknown field', () => {
		testArgs.fieldValue = 'the unknown field value';
		expectedResult      = 'the unknown field value';
		actualResult   = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':progToDisplayValue status', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_progToDisplayValue_ret;
	let expectedResult : Type_progToDisplayValue_ret;
	let testArgs       : Type_progToDisplayValue_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = {
			fieldName:  'status',
			fieldValue: null,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Known value', () => {
		testArgs.fieldValue = 'Success';
		expectedResult      = 'OK';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Unknown value', () => {
		testArgs.fieldValue = 'Unknown';
		expectedResult      = 'Unknown';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Default value', () => {
		testArgs.fieldValue = 'default';
		expectedResult      = 'Pending';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Null value', () => {
		testArgs.fieldValue = null;
		expectedResult      = '';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':progToDisplayValue day_of_week', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_progToDisplayValue_ret;
	let expectedResult : Type_progToDisplayValue_ret;
	let testArgs       : Type_progToDisplayValue_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = {
			fieldName:  'day_of_week',
			fieldValue: null,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Known value', () => {
		testArgs.fieldValue = 'Mon';
		expectedResult      = 'Mon';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Unknown value', () => {
		testArgs.fieldValue = 'Unknown';
		expectedResult      = 'Unknown';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Default value', () => {
		testArgs.fieldValue = 'default';
		expectedResult      = 'ANY';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Null value', () => {
		testArgs.fieldValue = null;
		expectedResult      = '';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':progToDisplayValue genre', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_progToDisplayValue_ret;
	let expectedResult : Type_progToDisplayValue_ret;
	let testArgs       : Type_progToDisplayValue_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = {
			fieldName:  'genre',
			fieldValue: null,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Known value', () => {
		testArgs.fieldValue = 'Books & Spoken';
		expectedResult      = 'Books&Spoken';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Unknown value', () => {
		testArgs.fieldValue = 'Unknown';
		expectedResult      = 'Unknown';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Default value', () => {
		testArgs.fieldValue = 'default';
		expectedResult      = 'Comedy';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Null value', () => {
		testArgs.fieldValue = null;
		expectedResult      = '';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':progToDisplayValue quality', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_progToDisplayValue_ret;
	let expectedResult : Type_progToDisplayValue_ret;
	let testArgs       : Type_progToDisplayValue_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = {
			fieldName:  'quality',
			fieldValue: null,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Known value', () => {
		testArgs.fieldValue = 'High';
		expectedResult      = 'HIGH';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Unknown value', () => {
		testArgs.fieldValue = 'Unknown';
		expectedResult      = 'Unknown';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Default value', () => {
		testArgs.fieldValue = 'default';
		expectedResult      = 'Normal';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Null value', () => {
		testArgs.fieldValue = null;
		expectedResult      = '';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':progToDisplayValue headers', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_progToDisplayValue_ret;
	let expectedResult : Type_progToDisplayValue_ret;
	let testArgs       : Type_progToDisplayValue_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = {
			fieldName:  'field_headers',
			fieldValue: null,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Known value', () => {
		testArgs.fieldValue = 'pos';
		expectedResult      = '#';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Unknown value', () => {
		testArgs.fieldValue = 'Unknown';
		expectedResult      = 'Unknown';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Default value', () => {
		testArgs.fieldValue = 'default';
		expectedResult      = 'UNKNOWN';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Null value', () => {
		testArgs.fieldValue = null;
		expectedResult      = '';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':progToDisplayValue db field', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_progToDisplayValue_ret;
	let expectedResult : Type_progToDisplayValue_ret;
	let testArgs       : Type_progToDisplayValue_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = {
			fieldName:  'db',
			fieldValue: null,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Known value', () => {
		testArgs.fieldValue = 'pos';
		expectedResult      = 'pos';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Unknown value', () => {
		testArgs.fieldValue = 'Unknown';
		expectedResult      = 'Unknown';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Default value', () => {
		testArgs.fieldValue = 'default';
		expectedResult      = 'default'; // There is no default value for the DB field
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Null value', () => {
		testArgs.fieldValue = null;
		expectedResult      = '';
		actualResult        = testModuleObj.progToDisplayValue( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':ProgInputField', () => {
	let testModuleObj        : Type_TestModulePrivateDefs;
	let actualResult         : HTMLElement;
	let expectedJSX          : React.JSX.Element;
	let expectedResult       : HTMLElement;
	let testArgs             : Type_ProgInputField_args;
	let testID               : string;
	let testFieldName        : string;
	let testFieldValue       : string;
	let testSelected         : boolean;
	let onClickMock          : jest.Mock;
	let onKeyDown            : jest.Mock;
	let ProgInputField       : (args: Type_ProgInputField_args) => Type_ProgInputField_ret;
	let component            : RenderResult | null;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		ProgInputField = testModuleObj.ProgInputField;
		testID         = 'select-genre';
		testFieldName  = 'genre';
		testFieldValue = 'Books & Spoken'; // A value that changes for display
		testSelected   = false;
		onClickMock    = jest.fn();
		onKeyDown      = jest.fn();
		testArgs = {
			id:         testID,
			fieldName:  testFieldName,
			fieldValue: testFieldValue,
			selected:   testSelected,
			onClick:    onClickMock,
			onKeyDown:  onKeyDown,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered', () => {
		component = render( <ProgInputField { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});

	test('Rendered correctly', () => {
		expectedJSX = (
			<input type="text"
				className="gip-prog-item-field gip-prog-item-field-genre"
				id={ testID }
				value="Books&Spoken"
				onClick={ onClickMock }
				onKeyDown={ onKeyDown }
				readOnly
				style={ { background: "{}" } }
			/>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <ProgInputField { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':ProgInputFields', () => {
	let testModuleObj        : Type_TestModulePrivateDefs;
	let actualResult         : HTMLElement;
	let expectedJSX          : React.JSX.Element;
	let expectedResult       : HTMLElement;
	let testArgs             : Type_ProgInputFields_args;
	let testPrograms         : Type_DisplayProgramItem[];
	let testArrFieldOrder    : string[];
	let onProgramChangeMock  : jest.Mock;
	let onKeyDownMock        : jest.Mock;
	let ProgInputFields      : (args: Type_ProgInputFields_args) => Type_ProgInputFields_ret;
	let component            : RenderResult | null;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj       = testModule.privateDefs;
		ProgInputFields     = testModuleObj.ProgInputFields;
		testPrograms        = [
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
		];
		testArrFieldOrder   = [ 'pos', 'genre', 'quality' ];
		onProgramChangeMock = jest.fn();
		onKeyDownMock       = jest.fn();
		testArgs = {
			programs:        testPrograms,
			arrFieldOrder:   testArrFieldOrder,
			onKeyDown:       onKeyDownMock,
			onProgramChange: onProgramChangeMock,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered', () => {
		component = render( <ProgInputFields { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});

	test('Rendered correctly', () => {
		expectedJSX = (
			<>
				<div className="gip-prog-item-row gip-prog-item-data-row" id={ `prog-item-row-1` } key={ `prog-item-row-1` }>
					<div className={ ` gip-prog-item-col gip-prog-item-data-col gip-prog-item-col-pos` } id={ `prog-item-count-1` } style={ { background: "{}" } }>1</div>
					<div className={ `gip-prog-item-col gip-prog-item-data-col gip-prog-item-col-genre` } key={ `prog-item-field-1-1` }>
						<input type="text"
							className="gip-prog-item-field gip-prog-item-field-genre"
							id="prog-field-1-1"
							value="Comedy"
							onClick={ () => { expect.any(Function); } }
							onKeyDown={ onKeyDownMock }
							readOnly
							style={ { background: "{}" } }
						/>
					</div>
					<div className={ `gip-prog-item-col gip-prog-item-data-col gip-prog-item-col-quality` } key={ `prog-item-field-1-2` }>
						<input type="text"
							className="gip-prog-item-field gip-prog-item-field-quality"
							id="prog-field-1-2"
							value="Normal"
							onClick={ () => { expect.any(Function); } }
							onKeyDown={ onKeyDownMock }
							readOnly
							style={ { background: "{}" } }
						/>
					</div>
				</div>
			</>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <ProgInputFields { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});

	test('Click on program', () => {
		component = render( <ProgInputFields { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-prog-item-field-quality' );
		expect( arrElement.length ).toBe( 1 );
		const element = arrElement[0] as HTMLInputElement;
		fireEvent.click( element, { target: { value: 'Comedy' } } );
		expect( onProgramChangeMock ).toHaveBeenCalled();
	});

	test('Ctrl-click on unselected program', () => {
		component = render( <ProgInputFields { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-prog-item-field-quality' );
		expect( arrElement.length ).toBe( 1 );
		const element = arrElement[0] as HTMLInputElement;
		fireEvent.click( element, { ctrlKey: true, target: { value: 'Comedy' } } );
		expect( onProgramChangeMock ).toHaveBeenCalled();
	});

	test('Ctrl-click on selected program', () => {
		testPrograms[ 0 ].selected = true;
		component = render( <ProgInputFields { ...testArgs } /> );
		const arrElement = component.container.getElementsByClassName( 'gip-prog-item-field-quality' );
		expect( arrElement.length ).toBe( 1 );
		const element = arrElement[0] as HTMLInputElement;
		fireEvent.click( element, { ctrlKey: true, target: { value: 'Comedy' } } );
		expect( onProgramChangeMock ).toHaveBeenCalled();
	});
});

describe(MODULE_NAME + ':ProgramTable', () => {
	let testModuleObj        : Type_TestModulePrivateDefs;
	let actualResult         : HTMLElement;
	let expectedJSX          : React.JSX.Element;
	let expectedResult       : HTMLElement;
	let testArgs             : Type_ProgramTable_args;
	let testPrograms         : Type_DisplayProgramItem[];
	let testArrFieldOrder    : string[];
	let testHeaderDisplayMap : Record<string,string>;
	let onProgramChangeMock  : jest.Mock;
	let onKeyDownMock        : jest.Mock;
	let ProgramTable         : (args: Type_ProgramTable_args) => Type_ProgramTable_ret;
	let component            : RenderResult | null;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		ProgramTable  = testModuleObj.ProgramTable;
		testPrograms  = [
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
		];
		testArrFieldOrder   = [ 'pos', 'genre', 'quality' ];
		testHeaderDisplayMap = {
			pos:     '#',
			genre:   'Genre',
			quality: 'Quality',
		};
		onProgramChangeMock = jest.fn();
		onKeyDownMock       = jest.fn();
		testArgs = {
			programs:         testPrograms,
			arrFieldOrder:    testArrFieldOrder,
			headerDisplayMap: testHeaderDisplayMap,
			onKeyDown:        onKeyDownMock,
			onProgramChange:  onProgramChangeMock,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered', () => {
		component = render( <ProgramTable { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});

	test('Rendered correctly', () => {
		expectedJSX = (
			<div className="gip-table-wrapper">
				<div className="gip-prog-item-row gip-prog-item-header-row" id="program-header">
					<div key="head-0" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-pos">#</div>
					<div key="head-1" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-genre">Genre</div>
					<div key="head-2" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-quality">Quality</div>
				</div>
				<>
					<div className="gip-prog-item-row gip-prog-item-data-row" id={ `prog-item-row-1` } key={ `prog-item-row-1` }>
						<div className={ ` gip-prog-item-col gip-prog-item-data-col gip-prog-item-col-pos` } id={ `prog-item-count-1` } style={ { background: "{}" } }>1</div>
						<div className={ `gip-prog-item-col gip-prog-item-data-col gip-prog-item-col-genre` } key={ `prog-item-field-1-1` }>
							<input type="text"
								className="gip-prog-item-field gip-prog-item-field-genre"
								id="prog-field-1-1"
								value="Comedy"
								onClick={ () => { expect.any(Function); } }
								onKeyDown={ onKeyDownMock }
								readOnly
								style={ { background: "{}" } }
							/>
						</div>
						<div className={ `gip-prog-item-col gip-prog-item-data-col gip-prog-item-col-quality` } key={ `prog-item-field-1-2` }>
							<input type="text"
								className="gip-prog-item-field gip-prog-item-field-quality"
								id="prog-field-1-2"
								value="Normal"
								onClick={ () => { expect.any(Function); } }
								onKeyDown={ onKeyDownMock }
								readOnly
								style={ { background: "{}" } }
							/>
						</div>
					</div>
				</>
			</div>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <ProgramTable { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':GipProgramTable', () => {
	let testModuleObj        : Type_TestModule;
	let actualResult         : HTMLElement;
	let expectedJSX          : React.JSX.Element;
	let expectedResult       : HTMLElement;
	let testArgs             : Type_GipProgramTable_args;
	let testPrograms         : Type_DisplayProgramItem[];
	let onProgramChangeMock  : jest.Mock;
	let onKeyDownMock        : jest.Mock;
	let GipProgramTable      : (args: Type_GipProgramTable_args) => Type_GipProgramTable_ret;
	let component            : RenderResult | null;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj   = testModule;
		GipProgramTable = testModuleObj.GipProgramTable;
		testPrograms    = [];
		onProgramChangeMock = jest.fn();
		onKeyDownMock       = jest.fn();
		testArgs = {
			programs:         testPrograms,
			onKeyDown:        onKeyDownMock,
			onProgramChange:  onProgramChangeMock,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('Rendered', () => {
		component = render( <GipProgramTable { ...testArgs } /> );
		const containerElement = component.container;
		expect(containerElement).not.toBeFalsy();
	});

	test('Rendered correctly', () => {
		expectedJSX = (
			<div className="row">
				<div className="col-md-1 gip-col gip-label"><label>Programs</label></div>
				<div className="col-md-11 gip-col">
					<div className="gip-table-wrapper">
						<div className="gip-prog-item-row gip-prog-item-header-row" id="program-header">
							<div key="head-0" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-pos">#</div>
							<div key="head-1" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-status">Status</div>
							<div key="head-2" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-pid">PID</div>
							<div key="head-3" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-title">Title</div>
							<div key="head-4" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-day_of_week">Day</div>
							<div key="head-5" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-quality">Quality</div>
							<div key="head-6" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-genre">Genre</div>
							<div key="head-7" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-synopsis">Synopsis</div>
							<div key="head-8" className="gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-image_uri">Image URI</div>
						</div>
						<>
						</>
					</div>
				</div>
			</div>
		);
		const expectedRendered = render( expectedJSX );
		expectedResult = expectedRendered.container;
		component      = render( <GipProgramTable { ...testArgs } /> );
		actualResult   = component.container;
		expect( actualResult ).toEqual( expectedResult );
	});
});
