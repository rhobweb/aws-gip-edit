/**
 * DESCRIPTION:
 * Unit Tests for utils/gip_date_utils.ts.
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_date_utils.ts';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Imports

import {jest} from '@jest/globals'; // For isolateModulesAsync

//import * as TEST_MODULE from '../../../src/utils/gip_date_utils';
import * as TEST_MODULE from '#utils/gip_date_utils';

////////////////////////////////////////////////////////////////////////////////
// Types

import type {
	Type_DayOfWeek,
	Type_dayOfWeekToIndex_args,
	Type_dayOfWeekToIndex_ret,
	Type_getCurrentDayOfWeek_args,
	Type_getCurrentDayOfWeek_ret,
	Type_dayOfWeekDiff_ret,
	Type_isDayOfWeekAvailable_args,
	Type_isDayOfWeekAvailable_ret,
//} from '../../../src/utils/gip_date_utils';
} from '#utils/gip_date_utils';

interface Type_TestModulePrivateDefs {
	dayOfWeekToIndex: (args: Type_dayOfWeekToIndex_args)       => Type_dayOfWeekToIndex_ret,
	dayOfWeekDiff:    (d1: Type_DayOfWeek, d2: Type_DayOfWeek) => Type_dayOfWeekDiff_ret,
};

interface Type_TestModule {
	privateDefs:          Type_TestModulePrivateDefs,
	getCurrentDayOfWeek:  (args?: Type_getCurrentDayOfWeek_args)  => Type_getCurrentDayOfWeek_ret,
	isDayOfWeekAvailable: (args?: Type_isDayOfWeekAvailable_args) => Type_isDayOfWeekAvailable_ret,
};

////////////////////////////////////////////////////////////////////////////////
// Constants

const ARR_DAY_OF_WEEK     = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
const CURRENT_DAY_OF_WEEK = ARR_DAY_OF_WEEK[ (new Date()).getDay() ];

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

describe(MODULE_NAME + ':dayOfWeekToIndex', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_dayOfWeekToIndex_ret;
	let expectedResult : Type_dayOfWeekToIndex_ret;
	let testArgs       : Type_dayOfWeekToIndex_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Sun', () => {
		testArgs       = 'Sun';
		expectedResult = 0;
		actualResult   = testModuleObj.dayOfWeekToIndex( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Mon', () => {
		testArgs       = 'Mon';
		expectedResult = 1;
		actualResult   = testModuleObj.dayOfWeekToIndex( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Tue', () => {
		testArgs       = 'Tue';
		expectedResult = 2;
		actualResult   = testModuleObj.dayOfWeekToIndex( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Wed', () => {
		testArgs       = 'Wed';
		expectedResult = 3;
		actualResult   = testModuleObj.dayOfWeekToIndex( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Thu', () => {
		testArgs       = 'Thu';
		expectedResult = 4;
		actualResult   = testModuleObj.dayOfWeekToIndex( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Fri', () => {
		testArgs       = 'Fri';
		expectedResult = 5;
		actualResult   = testModuleObj.dayOfWeekToIndex( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Sat', () => {
		testArgs       = 'Sat';
		expectedResult = 6;
		actualResult   = testModuleObj.dayOfWeekToIndex( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':getCurrentDayOfWeek', () => {
	let testModuleObj  : Type_TestModule;
	let actualResult   : Type_getCurrentDayOfWeek_ret;
	let expectedResult : Type_getCurrentDayOfWeek_ret;
	let testArgs       : Type_getCurrentDayOfWeek_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Default to today', () => {
		expectedResult = CURRENT_DAY_OF_WEEK;
		actualResult   = testModuleObj.getCurrentDayOfWeek();
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Date specified', () => {
		expectedResult = 'Wed';
		testArgs       = { dt: new Date( '2022-04-06' ) };
		actualResult   = testModuleObj.getCurrentDayOfWeek( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Date and positive offset specified', () => {
		expectedResult = 'Tue';
		testArgs       = { dt: new Date( '2022-04-06' ), iOffset: 6 };
		actualResult   = testModuleObj.getCurrentDayOfWeek( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Date and negative offset specified', () => {
		expectedResult = 'Thu';
		testArgs       = { dt: new Date( '2022-04-06' ), iOffset: -20 }; // 2022-04-06 is a 'Wed', -20 is equivalent to +1
		actualResult   = testModuleObj.getCurrentDayOfWeek( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':dayOfWeekDiff', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_dayOfWeekDiff_ret;
	let expectedResult : Type_dayOfWeekDiff_ret;
	let testArgs       : [Type_DayOfWeek, Type_DayOfWeek];

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Sun => Sun', () => {
		testArgs       = [ 'Sun', 'Sun' ];
		expectedResult = 0;
		actualResult   = testModuleObj.dayOfWeekDiff( ...testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Sun => Mon', () => {
		testArgs       = [ 'Sun', 'Mon' ];
		expectedResult = 1;
		actualResult   = testModuleObj.dayOfWeekDiff( ...testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Sat => Fri', () => {
		testArgs       = [ 'Sat', 'Fri' ];
		expectedResult = 6;
		actualResult   = testModuleObj.dayOfWeekDiff( ...testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Tue => Sat', () => {
		testArgs       = [ 'Tue', 'Sat' ];
		expectedResult = 4;
		actualResult   = testModuleObj.dayOfWeekDiff( ...testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':isDayOfWeekAvailable', () => {
	let testModuleObj  : Type_TestModule;
	;
	let actualResult   : Type_isDayOfWeekAvailable_ret;
	let expectedResult : Type_isDayOfWeekAvailable_ret;
	let testArgs       : Type_isDayOfWeekAvailable_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Default to today', () => {
		testArgs       = { checkDay: CURRENT_DAY_OF_WEEK };
		expectedResult = true;
		actualResult   = testModuleObj.isDayOfWeekAvailable( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Within default threshold', () => {
		testArgs       = { checkDay: 'Fri', currDay: 'Sun' };
		expectedResult = true;
		actualResult   = testModuleObj.isDayOfWeekAvailable( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Outside default threshold', () => {
		testArgs       = { checkDay: 'Fri', currDay: 'Mon' };
		expectedResult = false;
		actualResult   = testModuleObj.isDayOfWeekAvailable( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Within custom threshold', () => {
		testArgs       = { checkDay: 'Fri', currDay: 'Mon', numDaysThreshold: 3 };
		expectedResult = true;
		actualResult   = testModuleObj.isDayOfWeekAvailable( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});
