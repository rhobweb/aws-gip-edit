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

import {jest} from '@jest/globals';

// Add possibility of calling API in development environment, however, CORS currently forbids this.
// Would need to disable CORS or use a test proxy server to allow this.
import ENV_VARS_LCL from '../../../.env-lcl.json' with { type: "json" };
import ENV_VARS_DEV from '../../../.env-dev.json' with { type: "json" };

import axios, {
	AxiosResponse,
	AxiosRequestConfig,
	RawAxiosRequestHeaders,
	AxiosError,
} from 'axios';

import {
	DynamoDBClient,
	DynamoDBClientConfig,
} from '@aws-sdk/client-dynamodb';

import {
	DynamoDBDocumentClient,
	QueryCommand,
	QueryCommandInput,
	ScanCommand,
	ScanCommandInput,
	BatchWriteCommand,
	BatchWriteCommandInput,
	BatchGetCommand,
	BatchGetCommandInput,
} from '@aws-sdk/lib-dynamodb';

import assert from 'node:assert';

////////////////////////////////////////////////////////////////////////////////
// Types

import type {
	Type_DbProgramEditItem,
	Type_DbProgramHistoryItem,
} from '#utils/gip_prog_fields';

interface Type_axios_result {
	status:  number,
	body:    object,
	headers: object,
};

interface Type_Headers {
	"content-type":   string,
	"cache-control":  string,
	"content-length": string,
};

interface Type_EnvVars {
	AWS_REGION                 : string,
	TABLE_NAME_PROGRAM_HISTORY : string,
	GIP_API_URI                : string,
	LOCAL_DYNAMO_DB_ENDPOINT?  : string,
};

////////////////////////////////////////////////////////////////////////////////
// Constants

const STAGE = process.env.STAGE;

const ENV_VARS = (STAGE === 'dev' ? ENV_VARS_DEV : ENV_VARS_LCL) as Type_EnvVars;

const {
	GIP_API_URI,
	AWS_REGION,
	LOCAL_DYNAMO_DB_ENDPOINT,   // May be undefined if running remotely
	TABLE_NAME_PROGRAM_HISTORY,
} = ENV_VARS;

////////////////////////////////////////////////////////////////////////////////
// Definitions

// ESLint does not detect the assertions, so the condition is required to prevent ESLint warnings.
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
assert( GIP_API_URI !== undefined );
assert( AWS_REGION !== undefined );
assert( TABLE_NAME_PROGRAM_HISTORY !== undefined );
const INDEX_NAME_PROGRAM_HISTORY_PID = `${TABLE_NAME_PROGRAM_HISTORY}-pid`;
/* eslint-enable @typescript-eslint/no-unnecessary-condition */

////////////////////////////////////////////////////////////////////////////////
// Definitions

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

/**
 * @description call the POST programs endpoint to store a set of programs.
 * @param testData : array of program items to store.
 * @exception if the request fails.
 */
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

/**
 * @param rawBody : the response body from an API request.
 * @returns either the object from the response body, or if the body is a string, an object with property 'message'.
 */
function parseAxiosBody( rawBody : object | string | undefined ) : object {
	let cookedBody : object;
	if ( typeof rawBody === 'string' ) {
		cookedBody = { message: rawBody };
	} if ( rawBody === undefined ) {
		cookedBody = {};
	} else {
		cookedBody = rawBody as object;
	}
	return cookedBody;
}

/**
 * @param axiosResponse - the response to an API request.
 * @returns an object with properties:
 *           - status:  the API response code as a number, e.g., 200;
 *           - body:    an object containing the response payload;
 *           - headers: an object containing the response headers.
 */
function parseAxiosResponse( axiosResponse : AxiosResponse<unknown, unknown> ) : Type_axios_result {
	const cookedBody = parseAxiosBody( axiosResponse.data as (string | undefined) );
	// Need to convert headers to an object otherwise Jest moans about the types
	return {
		status:  axiosResponse.status,
		body:    cookedBody,
		headers: JSON.parse(JSON.stringify(axiosResponse.headers)) as object,
	};
}

/**
 * @param axiosError : the API error response;
 * @returns an object with properties:
 *           - status:  the API error response code as a number, e.g., 418;
 *           - body:    an object containing the response payload;
 *           - headers: an object containing the response headers.
 */
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

/**
 * @param objItem : an object.
 * @returns the length of the stringified object with UTF-8 characters encoded as Unicode escapes, e.g., '\u1234'.
 */
function calcEncodedObjectLength( objItem : object ) : string {
	const strObject     = JSON.stringify( objItem );
	const strEncoded    = strObject.replace( /[\u007F-\uFFFF]/g, chr => "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).slice(-4) );
	const iLength       = strEncoded.length;
	return iLength.toString();
}

// Day of week types and definitions
const ARR_DAY_OF_WEEK          = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
type Type_DayOfWeek            = typeof ARR_DAY_OF_WEEK[number];
type Type_ValidDayOfWeekOffset = (-1|0|1); // -1 - yesterday, 0 - today, 1 - tomorrow;
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
 * @param {Type_DayOfWeekOffset[]} arrDayOffset : optional array of day offsets relative to the current day, e.g., -1 is yesterday;
 *                                                in the same order as arrProgNum, one per program.
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

// AWS connection configuration
const DB_CLIENT_CONFIG : DynamoDBClientConfig = {
	region:   AWS_REGION,
	endpoint: LOCAL_DYNAMO_DB_ENDPOINT, // May be undefined if running remotely
};

// Type for the program history table key
interface Type_ProgramHistoryKey {
	pid           : string;
	download_time : string;
};

/**
 * @description scans the program history table index to return all object keys.
 * @returns array of program history table key objects.
 */
async function getHistoryKeys() : Promise<Type_ProgramHistoryKey[]> {
	const dbClient    = new DynamoDBClient( DB_CLIENT_CONFIG );
	const dbDocClient = DynamoDBDocumentClient.from( dbClient );
	const scanCommandArgs : ScanCommandInput = {
		TableName:               TABLE_NAME_PROGRAM_HISTORY,
		IndexName:               INDEX_NAME_PROGRAM_HISTORY_PID,
		ProjectionExpression:    '#pid,#download_time',
		ExpressionAttributeNames: { '#pid': 'pid', '#download_time': 'download_time' },
	};

	const scanCommand   = new ScanCommand( scanCommandArgs );
	const scanResponse  = await dbDocClient.send( scanCommand );
	const arrKey        = scanResponse.Items as Type_ProgramHistoryKey[];
	return arrKey;
}

/**
 * @param arrHistoryKey : array of one or more program history key objects.
 * @returns the number of deleted objects.
 */
async function deleteHistoryPrograms( arrHistoryKey : Type_ProgramHistoryKey[] ) : Promise<number> {
	const dbClient    = new DynamoDBClient( DB_CLIENT_CONFIG );
	const dbDocClient = DynamoDBDocumentClient.from( dbClient );

	const arrDeleteRequests = arrHistoryKey.map(key => ({
		DeleteRequest: {
			Key: { pid: key.pid, download_time: key.download_time },
		},
	}));

	const deleteCommandArgs : BatchWriteCommandInput = {
		RequestItems: {
			[TABLE_NAME_PROGRAM_HISTORY]: arrDeleteRequests,
		},
	};
	const deleteCommand  = new BatchWriteCommand(deleteCommandArgs);
	await dbDocClient.send(deleteCommand);
	// TODO check for unprocessed records
	return arrHistoryKey.length;
}

/**
 * @description delete all objects in the program history table.
 * @returns the number of objects deleted.
 */
async function clearHistoryTable() : Promise<number> {
	let numDeleted  = 0;

	const arrHistoryKey = await getHistoryKeys();

	if ( arrHistoryKey.length ) {
		numDeleted = await deleteHistoryPrograms( arrHistoryKey );
	}

	return numDeleted;
}

/**
 * @param arrProgramHistoryKey : array of one or more program history key objects.
 * @returns an array of zero or more program history objects.
 */
async function getProgramHistoryItemsByKey( arrProgramHistoryKey : Type_ProgramHistoryKey[] ) : Promise<Type_DbProgramHistoryItem[]> {
	const arrProgramHistoryItem = [] as Type_DbProgramHistoryItem[];
	const dbClient    = new DynamoDBClient( DB_CLIENT_CONFIG );
	const dbDocClient = DynamoDBDocumentClient.from( dbClient );
	const commandArgs : BatchGetCommandInput = {
		RequestItems: {
			[TABLE_NAME_PROGRAM_HISTORY]: {
				Keys: arrProgramHistoryKey,
			}
		},
	};
	const command  = new BatchGetCommand( commandArgs );
	const response = await dbDocClient.send( command );
	if ( response.Responses ) {
		arrProgramHistoryItem.push( ...response.Responses[ TABLE_NAME_PROGRAM_HISTORY ] as Type_DbProgramHistoryItem[] );
	}

	return arrProgramHistoryItem;
}

/**
 * @param pid : identifies a program.
 * @returns an array of zero or more program history key objects.
 */
async function getProgramHistoryKeysForPID( pid : string ) : Promise<Type_ProgramHistoryKey[]> {
	const dbClient    = new DynamoDBClient( DB_CLIENT_CONFIG );
	const dbDocClient = DynamoDBDocumentClient.from( dbClient );
	const commandArgs : QueryCommandInput = {
		TableName:                 TABLE_NAME_PROGRAM_HISTORY,
		IndexName:                 INDEX_NAME_PROGRAM_HISTORY_PID,
		KeyConditionExpression:    '#pid = :pid',
		ExpressionAttributeNames:  { '#pid': 'pid' },
		ExpressionAttributeValues: { ':pid': pid },
	};

	const queryCommand  = new QueryCommand( commandArgs );
	const queryResponse = await dbDocClient.send( queryCommand );
	const arrItem       = queryResponse.Items as Type_ProgramHistoryKey[];
	return arrItem;
}

/**
 * @param param0.arrPID:                array of zero or more program IDs;
 * @param param0.arrProgramHistoryItem: array of zero or more program history objects.
 * @returns an array of zero or more program history objects in arrPID order.
 */
function sortProgramHistoryItems( { arrPID, arrProgramHistoryItem } : { arrPID: string[], arrProgramHistoryItem : Type_DbProgramHistoryItem[] } ) : Type_DbProgramHistoryItem[] {
	const arrSortedProgramHistoryItem = [] as Type_DbProgramHistoryItem[];

	for ( const pid of arrPID ) {
		arrSortedProgramHistoryItem.push( ...arrProgramHistoryItem.filter( phi => phi.pid === pid ) );
	}

	return arrSortedProgramHistoryItem;
}

/**
 * @param arrPID: array of zero or more program IDs;
 * @returns an array of zero or more program history objects in arrPID order.
 */
async function getProgramHistoryItems( arrPID : string[] ) : Promise<Type_DbProgramHistoryItem[]> {
	const arrProgramHistoryKey = [] as Type_ProgramHistoryKey[];
	for ( const pid of arrPID ) {
		const arrKey = await getProgramHistoryKeysForPID( pid );
		arrProgramHistoryKey.push( ...arrKey );
	}

	const arrUnsortedProgramHistoryItem = await getProgramHistoryItemsByKey( arrProgramHistoryKey );
	const arrProgramHistoryItem         = sortProgramHistoryItems( { arrPID, arrProgramHistoryItem: arrUnsortedProgramHistoryItem } );

	return arrProgramHistoryItem;
}

/**
 * @param programItem : the program object to be stored.
 * @returns an object suitable for using in a jest.expect call for a program history object.
 */
function genExpectedHistoryItem( programItem : Type_DbProgramEditItem ) : Type_DbProgramHistoryItem {
	return {
		pid:           programItem.pid,
		status:        programItem.status,
		genre:         programItem.genre,
		quality:       programItem.quality,
		title:         programItem.title,
		synopsis:      programItem.synopsis,
		image_uri:     programItem.image_uri,
		modify_time:   expect.any(String), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
		download_time: expect.any(String), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
	};
}

/**
 * @param arrProgramItem : array of program objects to be stored.
 * @returns an array of objects suitable for using in a jest.expect call for a program history object.
 */
function genExpectedHistoryItems( arrProgramItem : Type_DbProgramEditItem[] ) : Type_DbProgramHistoryItem[] {
	return arrProgramItem.map( pi => genExpectedHistoryItem( pi ) );
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
	let expectedHeaders: Type_Headers;

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
	let expectedHeaders : Type_Headers;
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

describe(MODULE_NAME + ':PATCH', () => {
	let requestConfig        : AxiosRequestConfig;
	let rawResponse          : AxiosResponse;
	let testData             : Type_DbProgramEditItem[];
	let actualResult         : Type_axios_result;
	let expectedResult       : Type_axios_result;
	let expectedBody         : object;
	let expectedHeaders      : Type_Headers;
	let expectedHistoryItems : Type_DbProgramHistoryItem[];
	let actualHistoryItems   : Type_DbProgramHistoryItem[];

	beforeEach( async () => {
		commonBeforeEach();
		await clearHistoryTable();
		requestConfig = {
			url:    GIP_API_URI,
			method: 'PATCH',
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

	test( 'One program', async () => {
		testData = genTestPrograms( [1] );
		await postPrograms( testData );
		requestConfig.data = [
			{ pid: testData[ 0 ].pid, status: 'Success' }
		];
		expectedBody = { message: 'OK' };
		expectedHeaders[ 'content-length' ] = calcEncodedObjectLength( expectedBody );
		expectedResult = {
			status:  200,
			body:    expectedBody,
			headers: expectedHeaders,
		};
		testData[ 0 ].status = 'Success';
		expectedHistoryItems = genExpectedHistoryItems( testData );
		try {
			rawResponse        = await axios( requestConfig );
			actualResult       = parseAxiosResponse( rawResponse );
			actualHistoryItems = await getProgramHistoryItems( testData.map( el => el.pid ) );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
		expect( actualHistoryItems ).toEqual( expectedHistoryItems );
	});

	test( 'Two programs', async () => {
		testData = genTestPrograms( [4,1] );
		await postPrograms( testData );
		requestConfig.data = [
			{ pid: testData[ 0 ].pid, status: 'Success' },
			{ pid: testData[ 1 ].pid, status: 'Error' },
		];
		expectedBody = { message: 'OK' };
		expectedHeaders[ 'content-length' ] = calcEncodedObjectLength( expectedBody );
		expectedResult = {
			status:  200,
			body:    expectedBody,
			headers: expectedHeaders,
		};
		testData[ 0 ].status = 'Success';
		testData[ 1 ].status = 'Error';
		expectedHistoryItems = genExpectedHistoryItems( testData );
		try {
			rawResponse        = await axios( requestConfig );
			actualResult       = parseAxiosResponse( rawResponse );
			actualHistoryItems = await getProgramHistoryItems( testData.map( el => el.pid ) );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
		expect( actualHistoryItems ).toEqual( expectedHistoryItems );
	});
});
