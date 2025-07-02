/**
 * File:        utils/gip_prog_filter_utils.spec.ts.
 * Description: Unit Tests for utils/gip_prog_filter_utils.ts.
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_prog_filter_utils.ts';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_ProgramDownloadOptions,
} from '../../../src/utils/gip_types.ts';

import type { Type_DbProgramItem } from '../../../src/utils/gip_prog_fields';

import type {
	Type_isDayActive_args,
	Type_isDayActive_ret,
	Type_filterPrograms_args,
	Type_filterPrograms_ret,
} from '../../../src/utils/gip_prog_filter_utils';

////////////////////////////////////////
// Test module types

interface Type_TestModulePrivateDefs {
	isDayActive: (args: Type_isDayActive_args) => Type_isDayActive_ret,
};

interface Type_TestModule {
	privateDefs:    Type_TestModulePrivateDefs,
	filterPrograms: (args: Type_filterPrograms_args)  => Type_filterPrograms_ret,
};

////////////////////////////////////////////////////////////////////////////////
// Imports

import * as TEST_MODULE from '../../../src/utils/gip_prog_filter_utils';

////////////////////////////////////////////////////////////////////////////////
// Constants

const TEST_PROGRAM_ITEM : Type_DbProgramItem = {
	pid:           'pid',
	title:         'title',
	synopsis:      'synopsis',
	status:        'Pending',
	genre:         'Books&Spoken',
	day_of_week:   null,
	quality:       'Normal',
	modify_time:   '2025-06-29T12:34:56.789Z',
	download_time: '2025-06-29T12:33:56.789Z',
	image_uri:     'http://myimage/image.img',
	pos:           1,
};

////////////////////////////////////////
// The module under test

const testModule = TEST_MODULE as unknown as Type_TestModule;

////////////////////////////////////////////////////////////////////////////////
// Local test functions

/**
 * Actions to be performed before every test
 */
function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

/**
 * Actions to be performed after every test
 */
function commonAfterEach() : void {
	jest.restoreAllMocks();
	jest.resetModules();
}

/**
 * @param {string|Date} start : earliest date/time.
 * @param {string|Date} end   : optional latest date/time, defaults to current date.
 * @returns a random date/time between the specified start and end date/times, as an ISO string.
 */
function randomDate(start : (Date | string), end : (Date | string) = new Date() ) : string {
	const dtStart = new Date( start );
	const dtEnd   = new Date( end );
	return (new Date(dtStart.getTime() + Math.random() * (dtEnd.getTime() - dtStart.getTime()))).toISOString();
}

/**
 * @param numItems : the number of program items to create.
 * @returns an array of 'numItems' program items.
 */
function createProgramItems( numItems: number ) : Type_DbProgramItem[] {
	const arrItem = [] as Type_DbProgramItem[];
	for ( let i = 0 ; i < numItems ; ++i ) {
		const pos    = i + 1;
		const item   = { ...TEST_PROGRAM_ITEM };
		arrItem.push( item );
		const strPos = pos.toString();
		item.title         += strPos;
		item.synopsis      += strPos;
		item.pid           += strPos;
		item.pos           = numItems + 1 - pos;
		item.download_time = randomDate( new Date(2025, 0, 1) );
		item.modify_time   = randomDate( item.download_time );
	}
	return arrItem;
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

describe(MODULE_NAME + ':filterPrograms', () => {
	let testModuleObj  : Type_TestModule;
	let actualResult   : Type_filterPrograms_ret;
	let expectedResult : Type_filterPrograms_ret;
	let testArgs       : Type_filterPrograms_args;
	let testPrograms   : Type_DbProgramItem[];
	let testParams     : Type_ProgramDownloadOptions;
	const testStrSystemTime = '2025-06-04T01:02:03.456Z'; // A Wednesday
	const testDtSystemTime  = new Date( testStrSystemTime );

	beforeEach( () => {
		commonBeforeEach();
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
		testModuleObj = testModule;
		testPrograms  = createProgramItems( 5 );
		testPrograms[ 0 ].status = 'Already';
		testPrograms[ 1 ].status = 'Pending';
		testPrograms[ 2 ].status = 'Success';
		testPrograms[ 3 ].status = 'Error';
		testPrograms[ 4 ].status = 'Success';
		testParams = {
			all:        false,
			current:    false,
			downloaded: false,
		};
		testArgs = {
			programs: testPrograms,
			params:   testParams,
		};
	});

	afterEach( () => {
		commonAfterEach();
		jest.useRealTimers();
	});

	test( 'Default params', () => {
		testArgs.params = {};
		expectedResult  = [
			testPrograms[ 1 ],
			testPrograms[ 3 ],
		];
		actualResult = testModuleObj.filterPrograms( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'current', () => {
		testPrograms[ 1 ].day_of_week = 'Wed';
		testPrograms[ 3 ].day_of_week = 'Thu';
		testParams.current = true;
		expectedResult = [
			testPrograms[ 1 ],
		];
		actualResult       = testModuleObj.filterPrograms( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'downloaded', () => {
		testParams.downloaded = true;
		expectedResult  = testPrograms;
		actualResult    = testModuleObj.filterPrograms( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'all', () => {
		testParams.all = true;
		expectedResult = testPrograms;
		actualResult   = testModuleObj.filterPrograms( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});
