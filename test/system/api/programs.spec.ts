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
	Type_DbProgramItem,
} from '../../../src/utils/gip_prog_fields';

interface Type_axios_result {
	status:  number,
	body:    object,
	headers: object,
};

////////////////////////////////////////////////////////////////////////////////
// Definitions

const GIP_API_URI = 'http://localhost:13003/gip_edit/api/programs';

const TEST_PROGRAM_01 : Type_DbProgramItem = {
	pid:         'mypid1',
	status:      'Pending',
	genre:       'Books&Spoken',
	//day_of_week: will be null or undefined,
	quality:     'Normal',
	synopsis:    'Test program 1',
	title:       'Radio Program with a Unicode character \u2042',
	modify_time: '2023-06-21T01:02:03Z',
	image_uri:   'https://myimage1.jpg',
	pos:         1,
};

const TEST_PROGRAM_02 : Type_DbProgramItem = {
	pid:         'mypid2',
	status:      'Success',
	genre:       'Comedy',
	day_of_week: 'Thu',
	quality:     'High',
	synopsis:    'Test program 2',
	title:       'Another Radio Program',
	modify_time: '2025-06-21T02:03:04Z',
	image_uri:   'https://myimage2.jpg',
	pos:         2,
};

const TEST_PROGRAM_03 : Type_DbProgramItem = {
	pid:         'mypid3',
	status:      'Already',
	genre:       'Books&Spoken',
	day_of_week: 'Any',
	quality:     'Normal',
	synopsis:    'Test program 3',
	title:       'Yet Another Radio Program',
	modify_time: '2025-06-22T04:05:06Z',
	image_uri:   'https://myimage3.jpg',
	pos:         3,
};

const TEST_PROGRAM_04 : Type_DbProgramItem = {
	pid:         'mypid4',
	status:      'Pending',
	genre:       'Books&Spoken',
	day_of_week: 'Wed',
	quality:     'Normal',
	synopsis:    'Test program 4',
	title:       'Radio Program',
	modify_time: '2023-06-22T02:03:03Z',
	image_uri:   'https://myimage4.jpg',
	pos:         4,
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

async function postPrograms( testData : Type_DbProgramItem[] ) : Promise<void> {
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


// Set the timeout to allow debugging. Defaults to 5000 ms
const TEST_TIMEOUT_MS = 300 * 1000;
jest.setTimeout( TEST_TIMEOUT_MS );


////////////////////////////////////////////////////////////////////////////////
// Unit tests

describe(MODULE_NAME + ':POST', () => {
	let requestConfig  : AxiosRequestConfig;
	let rawResponse    : AxiosResponse;
	let testData       : Type_DbProgramItem[];
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
		jest.useRealTimers();	});

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
	let testData        : Type_DbProgramItem[];
	let actualResult    : Type_axios_result;
	let expectedResult  : Type_axios_result;
	let expectedBody    : object;
	let expectedHeaders : object;
	const testStrSystemTime  = '2025-07-30T01:02:03.456Z'; // A Wednesday
	const TEST_DAY_TODAY     = 'Wed';
	const TEST_DAY_YESTERDAY = 'Tue';
	const testDtSystemTime   = new Date( testStrSystemTime );

	beforeEach( () => {
		commonBeforeEach();
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
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
		jest.useRealTimers();	});

	test( 'No programs', async () => {
		testData = [];
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
		await postPrograms( testData );
		expectedBody   = JSON.parse( JSON.stringify( [ TEST_PROGRAM_01 ] ) ) as object;
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
		testData.push( TEST_PROGRAM_04 );
		await postPrograms( testData );
		expectedBody   = JSON.parse( JSON.stringify( [ TEST_PROGRAM_01 ] ) ) as object;
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
		const prog4 = JSON.parse( JSON.stringify( TEST_PROGRAM_04 ) ) as Type_DbProgramItem;
		prog4.day_of_week = TEST_DAY_TODAY;
		testData.push( prog4 );
		await postPrograms( testData );
		expectedBody   = JSON.parse( JSON.stringify( [ TEST_PROGRAM_01 ] ) ) as object;
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
		const prog4 = JSON.parse( JSON.stringify( TEST_PROGRAM_04 ) ) as Type_DbProgramItem;
		prog4.day_of_week = TEST_DAY_TODAY;
		testData.push( prog4 );
		requestConfig.url = `${requestConfig.url}?current`; // eslint-disable-line @typescript-eslint/restrict-template-expressions
		await postPrograms( testData );
		expectedBody   = JSON.parse( JSON.stringify( [ TEST_PROGRAM_01, prog4 ] ) ) as object;
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
		const prog4 = JSON.parse( JSON.stringify( TEST_PROGRAM_04 ) ) as Type_DbProgramItem;
		prog4.day_of_week = TEST_DAY_YESTERDAY;
		testData.push( prog4 );
		await postPrograms( testData );
		expectedBody   = JSON.parse( JSON.stringify( [ TEST_PROGRAM_01, prog4 ] ) ) as object;
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
