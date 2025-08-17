/**
 * DESCRIPTION:
 * Unit Tests for utils/gip_prog_fields.ts.
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_prog_fields.ts';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Imports

import {jest} from '@jest/globals'; // For isolateModulesAsync

//import * as TEST_MODULE from '../../../src/utils/gip_prog_fields';
import * as TEST_MODULE from '#utils/gip_prog_fields';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_FieldMap,
	Type_FieldOrder,
} from '#utils/gip_prog_fields';

////////////////////////////////////////
// Test module types

//interface Type_TestModulePrivateDefs {
//	convertToCamelCase:                ( args: Type_convertToCamelCase_args )                => Type_convertToCamelCase_ret,
//};

interface Type_TestModule {
	REVERSE_FIELD_MAP_COLLECTION: Record<string, Type_FieldMap>,
	FIELD_MAP_COLLECTION:         Record<string, Type_FieldMap>,
	FIELD_ORDER_COLLECTION:       Record<string, Type_FieldOrder>,
	FIELD_DEFAULT_VALUES:         Record<string, string>,
	//privateDefs: Type_TestModulePrivateDefs,
};

////////////////////////////////////////////////////////////////////////////////
// Constants

const EXPECTED_FIELD_MAP_STATUS : Type_FieldMap = {
	'Already': 'Already',
	'Error':   'ERR',
	'Success': 'OK',
	'Pending': 'Pending',
	'default': 'Pending',
};
const EXPECTED_REVERSE_FIELD_MAP_STATUS : Type_FieldMap = {
	'Already': 'Already',
	'ERR':     'Error',
	'OK':      'Success',
	'Pending': 'Pending',
};
const EXPECTED_FIELD_MAP_GENRE : Type_FieldMap = {
	'Books & Spoken': 'Books&Spoken',
	'Comedy':         'Comedy',
	'default':        'Comedy',
};
const EXPECTED_REVERSE_FIELD_MAP_GENRE : Type_FieldMap = {
	'Books&Spoken': 'Books & Spoken',
	'Comedy':       'Comedy',
};
const EXPECTED_FIELD_MAP_DAY_OF_WEEK : Type_FieldMap = {
	'Any':     'ANY',
	'Mon':     'Mon',
	'Tue':     'Tue',
	'Wed':     'Wed',
	'Thu':     'Thu',
	'Fri':     'Fri',
	'Sat':     'Sat',
	'Sun':     'Sun',
	'default': 'ANY',
};
const EXPECTED_REVERSE_FIELD_MAP_DAY_OF_WEEK : Type_FieldMap = {
	'ANY': 'Any',
	'Mon': 'Mon',
	'Tue': 'Tue',
	'Wed': 'Wed',
	'Thu': 'Thu',
	'Fri': 'Fri',
	'Sat': 'Sat',
	'Sun': 'Sun',
};
const EXPECTED_FIELD_MAP_QUALITY : Type_FieldMap = {
	'Normal':  'Normal',
	'High':    'HIGH',
	'default': 'Normal',
};
const EXPECTED_REVERSE_FIELD_MAP_QUALITY : Type_FieldMap = {
	'Normal':  'Normal',
	'HIGH':    'High',
};
const EXPECTED_FIELD_MAP_HEADER : Type_FieldMap = {
	'pos':          '#',
	'day_of_week':  'Day',
	'genre':        'Genre',
	'image_uri':    'Image URI',
	'pid':          'PID',
	'quality':      'Quality',
	'status':       'Status',
	'synopsis':     'Synopsis',
	'title':        'Title',
	'default':      'UNKNOWN',
};
const EXPECTED_REVERSE_FIELD_MAP_HEADER : Type_FieldMap = {
	'#':         'pos',
	'Day':       'day_of_week',
	'Genre':     'genre',
	'Image URI': 'image_uri',
	'PID':       'pid',
	'Quality':   'quality',
	'Status':    'status',
	'Synopsis':  'synopsis',
	'Title':     'title',
};
const EXPECTED_FIELD_MAP_PROG_TO_DB : Type_FieldMap = {
	'day_of_week': 'day_of_week',
	'genre':       'genre',
	'image_uri':   'image_uri',
	'pid':         'pid',
	'quality':     'quality',
	'status':      'status',
	'synopsis':    'synopsis',
	'title':       'title',
	'selected':    null,
};
const EXPECTED_REVERSE_FIELD_MAP_PROG_TO_DB : Type_FieldMap = {
	'day_of_week': 'day_of_week',
	'genre':       'genre',
	'image_uri':   'image_uri',
	'pid':         'pid',
	'quality':     'quality',
	'status':      'status',
	'synopsis':    'synopsis',
	'title':       'title',
};
const EXPECTED_FIELD_MAP : Record<string,Type_FieldMap> = {
	status:        EXPECTED_FIELD_MAP_STATUS,
	genre:         EXPECTED_FIELD_MAP_GENRE,
	day_of_week:   EXPECTED_FIELD_MAP_DAY_OF_WEEK,
	quality:       EXPECTED_FIELD_MAP_QUALITY,
	field_headers: EXPECTED_FIELD_MAP_HEADER,
	db:            EXPECTED_FIELD_MAP_PROG_TO_DB,
};
const EXPECTED_REVERSE_FIELD_MAP : Record<string,Type_FieldMap> = {
	status:        EXPECTED_REVERSE_FIELD_MAP_STATUS,
	genre:         EXPECTED_REVERSE_FIELD_MAP_GENRE,
	day_of_week:   EXPECTED_REVERSE_FIELD_MAP_DAY_OF_WEEK,
	quality:       EXPECTED_REVERSE_FIELD_MAP_QUALITY,
	field_headers: EXPECTED_REVERSE_FIELD_MAP_HEADER,
	db:            EXPECTED_REVERSE_FIELD_MAP_PROG_TO_DB,
};

const EXPECTED_FIELD_ORDER_STATUS = [
	'Pending',
	'Error',
	'Success',
	'Already',
];
const EXPECTED_FIELD_ORDER_GENRE = [
	'Books & Spoken',
	'Comedy',
];
const EXPECTED_FIELD_ORDER_DAY_OF_WEEK = [
	"Any",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Sun"
];
const EXPECTED_FIELD_ORDER_QUALITY = [
	'Normal',
	'High',
];
const EXPECTED_FIELD_ORDER_HEADER = [
	'pos',
	'status',
	'pid',
	'title',
	'day_of_week',
	'quality',
	'genre',
	'synopsis',
	'image_uri',
];
const EXPECTED_FIELD_ORDER_PROG_TO_DB  = [
	'status',
	'pid',
	'title',
	'synopsis',
	'image_uri',
	'genre',
	'day_of_week',
	'quality',
	'selected',
];
const EXPECTED_FIELD_ORDER : Record<string,Type_FieldOrder> = {
	status:        EXPECTED_FIELD_ORDER_STATUS,
	genre:         EXPECTED_FIELD_ORDER_GENRE,
	day_of_week:   EXPECTED_FIELD_ORDER_DAY_OF_WEEK,
	quality:       EXPECTED_FIELD_ORDER_QUALITY,
	field_headers: EXPECTED_FIELD_ORDER_HEADER,
	db:            EXPECTED_FIELD_ORDER_PROG_TO_DB,
};
const EXPECTED_FIELD_DEFAULT_VALUES : Record<string,string|undefined> = {
	day_of_week:   'Any',
	db:            undefined,
	field_headers: undefined,
	genre:         'Comedy',
	quality:       'Normal',
	status:        'Pending',
};

////////////////////////////////////////////////////////////////////////////////
// Definitions

const testModule = TEST_MODULE as unknown as Type_TestModule;

////////////////////////////////////////////////////////////////////////////////
// Test utilities

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

describe(MODULE_NAME + ':FIELD_MAP_COLLECTION', () => {
	let testModuleObj  : Type_TestModule;
	let actualResult   : Record<string, Type_FieldMap>;
	let expectedResult : Record<string, Type_FieldMap>;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj  = testModule;
		expectedResult = EXPECTED_FIELD_MAP;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK', () => {
		actualResult = testModuleObj.FIELD_MAP_COLLECTION;
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':REVERSE_FIELD_MAP_COLLECTION', () => {
	let testModuleObj  : Type_TestModule;
	let actualResult   : Record<string, Type_FieldMap>;
	let expectedResult : Record<string, Type_FieldMap>;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj  = testModule;
		expectedResult = EXPECTED_REVERSE_FIELD_MAP;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK', () => {
		actualResult = testModuleObj.REVERSE_FIELD_MAP_COLLECTION;
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':FIELD_ORDER_COLLECTION', () => {
	let testModuleObj  : Type_TestModule;
	let actualResult   : Record<string, Type_FieldOrder>;
	let expectedResult : Record<string, Type_FieldOrder>;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj  = testModule;
		expectedResult = EXPECTED_FIELD_ORDER;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK', () => {
		actualResult = testModuleObj.FIELD_ORDER_COLLECTION;
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':FIELD_DEFAULT_VALUES', () => {
	let testModuleObj  : Type_TestModule;
	let actualResult   : Record<string, string | undefined>;
	let expectedResult : Record<string, string | undefined>;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj  = testModule;
		expectedResult = EXPECTED_FIELD_DEFAULT_VALUES;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK', () => {
		actualResult = testModuleObj.FIELD_DEFAULT_VALUES;
		expect( actualResult ).toEqual( expectedResult );
	});
});
