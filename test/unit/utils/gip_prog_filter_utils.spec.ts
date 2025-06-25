/**
 * File:        utils/gip_prog_filter_utils.spec.ts.
 * Description: Unit Tests for utils/gip_prog_filter_utils.ts.
 */
const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_prog_filter_utils.ts';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

import type {
	Type_isDayActive_args,
	Type_isDayActive_ret,
	Type_filterPrograms_args,
	Type_filterPrograms_ret,
} from '../../../src/utils/gip_prog_filter_utils';

interface Type_TestModulePrivateDefs {
	isDayActive: (args: Type_isDayActive_args) => Type_isDayActive_ret,
};

interface Type_TestModule {
	privateDefs:    Type_TestModulePrivateDefs,
	filterPrograms: (args: Type_filterPrograms_args)  => Type_filterPrograms_ret,
};

import * as TEST_MODULE from '../../../src/utils/gip_prog_filter_utils';
const testModule = TEST_MODULE as unknown as Type_TestModule;


function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

function commonAfterEach() : void {
	jest.restoreAllMocks();
	jest.resetModules();
}

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

describe(MODULE_NAME + ':isDayActive', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_isDayActive_ret;
	let expectedResult : Type_isDayActive_ret;
	let testArgs       : Type_isDayActive_args;
	const testStrSystemTime = '2025-06-02T01:02:03.456Z'; // A Monday
	const testDtSystemTime  = new Date( testStrSystemTime );

	beforeEach( () => {
		commonBeforeEach();
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
		testModuleObj = testModule.privateDefs;
	});

	afterEach( () => {
		commonAfterEach();
		jest.useRealTimers();
	});

	test( 'No day of week, current true', () => {
		testArgs = {
			current: true,
		};
		expectedResult = true;
		actualResult   = testModuleObj.isDayActive( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'No day of week, current false', () => {
		testArgs = {
			current: false,
		};
		expectedResult = true;
		actualResult   = testModuleObj.isDayActive( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Day of week "Mon", current true', () => {
		testArgs = {
			current:     true,
			day_of_week: 'Mon',
		};
		expectedResult = true;
		actualResult   = testModuleObj.isDayActive( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Day of week "Mon", current false', () => {
		testArgs = {
			current:     false,
			day_of_week: 'Mon',
		};
		expectedResult = false;
		actualResult   = testModuleObj.isDayActive( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Day of week "Tue", current false', () => {
		testArgs = {
			current:     false,
			day_of_week: 'Tue',
		};
		expectedResult = false;
		actualResult   = testModuleObj.isDayActive( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Day of week "Tue", current true', () => {
		testArgs = {
			current:     true,
			day_of_week: 'Tue',
		};
		expectedResult = false;
		actualResult   = testModuleObj.isDayActive( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Day of week "Wed", current true', () => {
		testArgs = {
			current:     true,
			day_of_week: 'Wed',
		};
		expectedResult = false;
		actualResult   = testModuleObj.isDayActive( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Day of week "Thu", current true', () => {
		testArgs = {
			current:     true,
			day_of_week: 'Thu',
		};
		expectedResult = false;
		actualResult   = testModuleObj.isDayActive( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Day of week "Fri", current true', () => {
		testArgs = {
			current:     true,
			day_of_week: 'Fri',
		};
		expectedResult = false;
		actualResult   = testModuleObj.isDayActive( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Day of week "Sat", current true', () => {
		testArgs = {
			current:     true,
			day_of_week: 'Sat',
		};
		expectedResult = true;
		actualResult   = testModuleObj.isDayActive( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Day of week "Sun", current false', () => {
		testArgs = {
			current:     false,
			day_of_week: 'Sun',
		};
		expectedResult = true;
		actualResult   = testModuleObj.isDayActive( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});
