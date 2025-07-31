/**
 * File:        test/system/api/program.spec.ts
 * Description: System tests for the progams API.
 *
 * Environment: Before running these tests, dynamodb_local must be running and be configured with tables.
 *              See https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html.
 *              See the debug targets:
 *                - Create Tables;
 *                - Delete Tables.
 *              Run the following from the project directory.
 *              Perform the TypeScript build:
 *                ./node_modules/.bin/tsc -p ./tsconfig.json
 *              Start the servers:
 *                AWS_REGION=eu-west-1 AWS_ENDPOINT=http://localhost:8000 STAGE=lcl NODE_LOG_LEVEL=debug npm start
 */
'use strict';

////////////////////////////////////////////////////////////////////////////////
// Test module constants
const MODULE_NAME = 'gip-system-test';

////////////////////////////////////////////////////////////////////////////////
// Imports

import axios, {
	AxiosResponse,
	AxiosRequestConfig,
	RawAxiosRequestHeaders,
	AxiosError,
} from 'axios';

////////////////////////////////////////////////////////////////////////////////
// Types

import type {
	Type_DbProgramEditItem,
} from '../../../src/utils/gip_prog_fields';

interface Type_axios_result {
	status:  number,
	body:    object,
	headers: object,
};

////////////////////////////////////////////////////////////////////////////////
// Definitions

const GIP_API_URI = 'http://localhost:13003/gip_edit/api/programs';

const TEST_PROGRAM_01 : Type_DbProgramEditItem = {
	pid:         'mypid1',
	status:      'Pending',
	genre:       'Books&Spoken',
	quality:     'Normal',
	synopsis:    'Test program 1',
	title:       'Radio Program with a Unicode character \u2042',
	image_uri:   'https://myimage1.jpg',
	//day_of_week: will be null or undefined,
};

const TEST_PROGRAM_02 : Type_DbProgramEditItem = {
	pid:         'mypid2',
	status:      'Success',
	genre:       'Comedy',
	quality:     'High',
	synopsis:    'Test program 2',
	title:       'Another Radio Program',
	image_uri:   'https://myimage2.jpg',
	day_of_week: 'Thu',
};

const TEST_PROGRAM_03 : Type_DbProgramEditItem = {
	pid:         'mypid3',
	status:      'Already',
	genre:       'Books&Spoken',
	quality:     'Normal',
	synopsis:    'Test program 3',
	title:       'Yet Another Radio Program',
	image_uri:   'https://myimage3.jpg',
	//day_of_week: will be null or undefined,
};

const TEST_PROGRAM_04 : Type_DbProgramEditItem = {
	pid:         'mypid4',
	status:      'Pending',
	genre:       'Books&Spoken',
	quality:     'Normal',
	synopsis:    'Test program 4',
	title:       'Radio Program',
	image_uri:   'https://myimage4.jpg',
	day_of_week: 'Wed',
};

////////////////////////////////////////////////////////////////////////////////
// Test utilities

function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

function commonAfterEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
	jest.restoreAllMocks();
	jest.resetModules();
}

function fail( err : string | Error ) : void {
	let cookedErr : Error;
	if ( typeof err === 'string' ) {
		cookedErr = new Error( err );
	} else {
		cookedErr = err;
	}
	throw( cookedErr );
}

async function postPrograms( testData : Type_DbProgramEditItem[] ) : Promise<void> {
	const requestConfig : AxiosRequestConfig = {
		url:    GIP_API_URI,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json; charset=UTF-16',
		} as RawAxiosRequestHeaders,
		data: JSON.parse( JSON.stringify( testData ) ) as object,
	};
	try {
		const rawResponse  = await axios( requestConfig );
		const actualResult = parseAxiosResponse( rawResponse );
		expect( actualResult.status ).toEqual( 200 );
	}
	catch ( err ) {
		fail( err as Error );
	}
}

function parseAxiosBody( rawBody : object | string | undefined ) : object {
	let cookedBody : object;
	if ( typeof rawBody === 'string' ) {
		//cookedBody = utf16ToText( rawBody );
		cookedBody = { message: rawBody };
	} if ( rawBody === undefined ) {
		cookedBody = {};
	} else {
		cookedBody = rawBody as object;
	}
	return cookedBody;
}

function parseAxiosResponse( axiosResponse : AxiosResponse<unknown, unknown> ) : Type_axios_result {
	const cookedBody = parseAxiosBody( axiosResponse.data as (string | undefined) );
	// Need to convert headers to an object otherwise Jest moans about the types
	return {
		status:  axiosResponse.status,
		body:    cookedBody,
		headers: JSON.parse(JSON.stringify(axiosResponse.headers)) as object,
	};
}

function parseAxiosError( axiosError : AxiosError ) : Type_axios_result {
	if ( axiosError.response ) {
		return parseAxiosResponse( axiosError.response as AxiosResponse<unknown, unknown>);
	} else {
		return {
			status:  418,
			body:    {},
			headers: {},
		};
	}
}

function calcEncodedObjectLength( objItem : object ) : string {
	const strObject     = JSON.stringify( objItem );
	const strEncoded    = strObject.replace( /[\u007F-\uFFFF]/g, chr => "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).slice(-4) );
	const iLength       = strEncoded.length;
	return iLength.toString();
}

const ARR_DAY_OF_WEEK          = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
type Type_DayOfWeek            = typeof ARR_DAY_OF_WEEK[number];
type Type_ValidDayOfWeekOffset = (-1|0|1);
type Type_DayOfWeekOffset      = Type_ValidDayOfWeekOffset | null | undefined;

/**
 * @param {Type_ValidDayOfWeekOffset} dayOffset : -1 - yesterday, 0 - today, 1 - tomorrow;
 * @returns the day of the week, e.g., 'Mon'.
 */
function calcDayOfWeek( dayOffset: Type_ValidDayOfWeekOffset ) : Type_DayOfWeek {
	const curDayIndex = (new Date()).getDay();
	const retDayIndex = (curDayIndex + dayOffset) % ARR_DAY_OF_WEEK.length;
	return ARR_DAY_OF_WEEK[ retDayIndex ];
}

/**
 * @param {number[]} arrProgNum : array of zero or more test program numbers, 1-4;
 * @param {Type_DayOfWeekOffset[]} arrDayOffset : optional array of day offsets relative to the current day, e.g., -1 is yesterday.
 * @returns array of program items for test purposes.
 */
function genTestPrograms( arrProgNum : (1|2|3|4)[], arrDayOffset : Type_DayOfWeekOffset[] = [] ) : Type_DbProgramEditItem[] {
	const arrProgram = [] as Type_DbProgramEditItem[];
	const arrSrcProg = [ TEST_PROGRAM_01, TEST_PROGRAM_02, TEST_PROGRAM_03, TEST_PROGRAM_04 ];

	for ( const n of arrProgNum ) {
		const index = n - 1;
		const thisProgram = JSON.parse( JSON.stringify( arrSrcProg[ index ] ) ) as Type_DbProgramEditItem;
		if ( ! ([null,undefined] as Type_DayOfWeekOffset[]).includes( arrDayOffset[ index ] ) ) {
			thisProgram.day_of_week = calcDayOfWeek( arrDayOffset[ index ]! ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		}
		arrProgram.push( thisProgram );
	}

	return arrProgram;
}

// Set the timeout to allow debugging. Defaults to 5000 ms
const TEST_TIMEOUT_MS = 300 * 1000;
jest.setTimeout( TEST_TIMEOUT_MS );


////////////////////////////////////////////////////////////////////////////////
// Unit tests

describe(MODULE_NAME + ':POST', () => {
	let requestConfig  : AxiosRequestConfig;
	let rawResponse    : AxiosResponse;
	let testData       : Type_DbProgramEditItem[];
	let actualResult   : Type_axios_result;
	let expectedResult : Type_axios_result;
	let expectedBody   : object;
	let expectedHeaders: object;

	beforeEach( () => {
		commonBeforeEach();
		requestConfig = {
			url:    GIP_API_URI,
			method: 'POST',
			headers: {
				'content-type': 'application/json; charset=UTF-8',
			} as RawAxiosRequestHeaders,
			data: null,
		};
		testData = [];
		expectedHeaders = {
			'content-type':   'application/json; charset=UTF-8',
			'cache-control':  'no-cache',
			'content-length': 0,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'No programs', async () => {
		requestConfig.data = null;
		expectedBody = {
			message: 'No programs',
		};
		expectedHeaders[ 'content-length' ] = calcEncodedObjectLength( expectedBody );
		expectedResult = {
			status:  400,
			body:    expectedBody,
			headers: expectedHeaders,
		};
		try {
			await axios( requestConfig );
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualResult = parseAxiosError( err as AxiosError );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'One program', async () => {
		testData           = [ TEST_PROGRAM_01 ];
		requestConfig.data = testData;
		expectedBody       = JSON.parse( JSON.stringify( testData ) ) as object;
		expectedHeaders[ 'content-length' ] = calcEncodedObjectLength( expectedBody );
		expectedResult = {
			status:  200,
			body:    expectedBody,
			headers: expectedHeaders,
		};
		try {
			rawResponse  = await axios( requestConfig );
			actualResult = parseAxiosResponse( rawResponse );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Two programs', async () => {
		testData           = [ TEST_PROGRAM_01, TEST_PROGRAM_02 ];
		requestConfig.data = testData;
		expectedBody       = JSON.parse( JSON.stringify( testData ) ) as object;
		expectedHeaders[ 'content-length' ] = calcEncodedObjectLength( expectedBody );
		expectedResult = {
			status:  200,
			body:    expectedBody,
			headers: expectedHeaders,
		};
		try {
			rawResponse  = await axios( requestConfig );
			actualResult = parseAxiosResponse( rawResponse );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':GET', () => {
	let requestConfig   : AxiosRequestConfig;
	let rawResponse     : AxiosResponse;
	let testData        : Type_DbProgramEditItem[];
	let actualResult    : Type_axios_result;
	let expectedResult  : Type_axios_result;
	let expectedBody    : object;
	let expectedHeaders : object;
	const DAY_TODAY     = 0  as Type_DayOfWeekOffset;
	const DAY_YESTERDAY = -1 as Type_DayOfWeekOffset;
	const DAY_TOMORROW  = 1  as Type_DayOfWeekOffset;

	beforeEach( () => {
		commonBeforeEach();
		requestConfig = {
			url:    GIP_API_URI,
			method: 'GET',
		};
		testData = [
			TEST_PROGRAM_01, TEST_PROGRAM_02, TEST_PROGRAM_03,
		];
		expectedHeaders = {
			'content-type':   'application/json; charset=UTF-8',
			'cache-control':  'no-cache',
			'content-length': 0,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'No programs', async () => {
		testData = genTestPrograms( [] );
		await postPrograms( testData );
		expectedBody   = [];
		expectedHeaders[ 'content-length' ] = calcEncodedObjectLength( expectedBody );
		expectedResult = {
			status:  200,
			body:    expectedBody,
			headers: expectedHeaders,
		};
		try {
			rawResponse  = await axios( requestConfig );
			actualResult = parseAxiosResponse( rawResponse );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Three programs, only one pending', async () => {
		testData = genTestPrograms( [1,2,3] );
		await postPrograms( testData );
		expectedBody   = JSON.parse( JSON.stringify( [ testData[ 0 ] ] ) ) as object;
		expectedHeaders[ 'content-length' ] = calcEncodedObjectLength( expectedBody );
		expectedResult = {
			status:  200,
			body:    expectedBody,
			headers: expectedHeaders,
		};
		try {
			rawResponse  = await axios( requestConfig );
			actualResult = parseAxiosResponse( rawResponse );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Three programs, get all', async () => {
		testData = genTestPrograms( [1,2,3] );
		await postPrograms( testData );
		expectedBody   = JSON.parse( JSON.stringify( testData ) ) as object;
		expectedHeaders[ 'content-length' ] = calcEncodedObjectLength( expectedBody );
		expectedResult = {
			status:  200,
			body:    expectedBody,
			headers: expectedHeaders,
		};
		requestConfig.url = `${requestConfig.url}?all`; // eslint-disable-line @typescript-eslint/restrict-template-expressions
		try {
			rawResponse  = await axios( requestConfig );
			actualResult = parseAxiosResponse( rawResponse );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Four programs, two pending, one day_of_week out of range', async () => {
		testData = genTestPrograms( [1,2,3,4], [null,DAY_TOMORROW,null,DAY_TODAY] );
		await postPrograms( testData );
		expectedBody   = JSON.parse( JSON.stringify( [ testData[ 0 ] ] ) ) as object;
		expectedHeaders[ 'content-length' ] = calcEncodedObjectLength( expectedBody );
		expectedResult = {
			status:  200,
			body:    expectedBody,
			headers: expectedHeaders,
		};
		try {
			rawResponse  = await axios( requestConfig );
			actualResult = parseAxiosResponse( rawResponse );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Four programs, two pending, one day_of_week today', async () => {
		testData = genTestPrograms( [1,2,3,4], [null,DAY_TOMORROW,null,DAY_TODAY] );
		await postPrograms( testData );
		expectedBody   = JSON.parse( JSON.stringify( [ testData[ 0 ] ] ) ) as object;
		expectedHeaders[ 'content-length' ] = calcEncodedObjectLength( expectedBody );
		expectedResult = {
			status:  200,
			body:    expectedBody,
			headers: expectedHeaders,
		};
		try {
			rawResponse  = await axios( requestConfig );
			actualResult = parseAxiosResponse( rawResponse );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Four programs, two pending, one day_of_week today, get current', async () => {
		testData = genTestPrograms( [1,2,3,4], [null,DAY_TOMORROW,null,DAY_TODAY] );
		requestConfig.url = `${requestConfig.url}?current`; // eslint-disable-line @typescript-eslint/restrict-template-expressions
		await postPrograms( testData );
		expectedBody   = JSON.parse( JSON.stringify( [ testData[0], testData[3] ] ) ) as object;
		expectedHeaders[ 'content-length' ] = calcEncodedObjectLength( expectedBody );
		expectedResult = {
			status:  200,
			body:    expectedBody,
			headers: expectedHeaders,
		};
		try {
			rawResponse  = await axios( requestConfig );
			actualResult = parseAxiosResponse( rawResponse );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Four programs, two pending, one day_of_week yesterday', async () => {
		testData = genTestPrograms( [1,2,3,4], [null,DAY_TOMORROW,null,DAY_YESTERDAY] );
		await postPrograms( testData );
		expectedBody   = JSON.parse( JSON.stringify( [ testData[0], testData[3] ] ) ) as object;
		expectedHeaders[ 'content-length' ] = calcEncodedObjectLength( expectedBody );
		expectedResult = {
			status:  200,
			body:    expectedBody,
			headers: expectedHeaders,
		};
		try {
			rawResponse  = await axios( requestConfig );
			actualResult = parseAxiosResponse( rawResponse );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Three programs, get downloaded', async () => {
		testData = genTestPrograms( [3,1,2], [null,null,DAY_YESTERDAY] );
		requestConfig.url = `${requestConfig.url}?downloaded`; // eslint-disable-line @typescript-eslint/restrict-template-expressions
		await postPrograms( testData );
		expectedBody   = JSON.parse( JSON.stringify( [ testData[0], testData[1], testData[2] ] ) ) as object;
		expectedHeaders[ 'content-length' ] = calcEncodedObjectLength( expectedBody );
		expectedResult = {
			status:  200,
			body:    expectedBody,
			headers: expectedHeaders,
		};
		try {
			rawResponse  = await axios( requestConfig );
			actualResult = parseAxiosResponse( rawResponse );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
	});
});
