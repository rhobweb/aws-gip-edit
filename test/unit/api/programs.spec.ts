/**
 * File:        test/unit/api/programs.spec.ts
 * Description: Unit tests for api/programs.ts.
 */
const REL_SRC_PATH     = '../../../src/api/';
const MODULE_NAME      = 'programs';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Imports

import {jest} from '@jest/globals'; // For isolateModulesAsync

import {
	APIGatewayEvent,
	//APIGatewayProxyStructuredResultV2,
	//Context,
} from 'aws-lambda';

import {
	ScanCommand,
} from '@aws-sdk/client-dynamodb';

import libDynamodb, {
	BatchWriteCommand,
	BatchWriteCommandOutput,
	DynamoDBDocumentClient,
	//ScanCommandInput,
	ScanCommandOutput,
	TransactWriteCommand,
	TransactWriteCommandOutput,
} from '@aws-sdk/lib-dynamodb';

// @ts-expect-error mocks is added as part of the module mocking
const dynamoDBDocumentClientMock = libDynamodb.mocks.dynamoDBDocumentClientMock as DynamoDBDocumentClient; // eslint-disable-line @typescript-eslint/no-unsafe-member-access

////////////////////////////////////////////////////////////////////////////////
// Types

import type {
	Type_handler_args,
	Type_handler_ret,
} from '../../../src/api/programs.ts';

interface Type_TestModuleDefaultDefs {
	handler: (args: Type_handler_args) => Type_handler_ret,
};

interface Type_TestModule {
	default: Type_TestModuleDefaultDefs,
};

import * as TEST_MODULE from '#api/programs';

////////////////////////////////////////////////////////////////////////////////
// Test utilities

function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

function commonAfterEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
	jest.restoreAllMocks();
	jest.resetModules();
}

const testModule = TEST_MODULE as unknown as Type_TestModule;

const HANDLER_REQ_TEMPLATE : Type_handler_args = {
	httpMethod: 'set for test',
	body: null,
	headers: {},
	multiValueHeaders: {},
	isBase64Encoded: false,
	path: '',
	pathParameters: null,
	queryStringParameters: null,
	multiValueQueryStringParameters: null,
	stageVariables: null,
	resource: '',
	requestContext: {} as APIGatewayEvent['requestContext'],
};

const EXPECTED_PROGRAM_TABLE_NAME         = 'dev_test-aws-gip-edit_Program';
const EXPECTED_PROGRAM_HISTORY_TABLE_NAME = 'dev_test-aws-gip-edit_ProgramHistory';

function formatBody( rawObject : object ) : string {
	const rawString = JSON.stringify( rawObject );
	return rawString.replace( /[\u007F-\uFFFF]/g, chr => "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).slice(-4) );
}

function genExpectedBody( arrObject : object[] ) : string {
	const arrCooked = [] as object[];
	const arrDeleteProp = [ 'pos', 'modify_time' ];
	for ( const rawItem of arrObject ) {
		const cookedItem = JSON.parse( JSON.stringify( rawItem ) ) as Record<string,unknown>;
		for ( const prop of arrDeleteProp ) {
			delete cookedItem[ prop ]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
		}
		arrCooked.push( cookedItem );
	}
	return formatBody( arrCooked );
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

	it ('module initialises OK', async () => {
		jest.resetModules(); // Otherwise Jest complains that one of the dependencies is already in the cache
		await jest.isolateModulesAsync(async () => { // Load another instance of the module. This allows configuring a different environment
			testModuleObj = await import( TEST_MODULE_PATH ) as Type_TestModule;
		});
		expect( testModuleObj ).toBeDefined();
	});
});

describe(MODULE_NAME + ':handler unsupported methods', () => {
	let testModuleObj  : Type_TestModuleDefaultDefs;
	let actualResult   : Awaited<Type_handler_ret>;
	let expectedResult : Awaited<Type_handler_ret>;
	let testArgs       : Type_handler_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.default;
		testArgs = { ...HANDLER_REQ_TEMPLATE };
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'PUT', async () => {
		testArgs.httpMethod = 'PUT';
		expectedResult = { statusCode: 404 };
		actualResult   = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'DELETE', async () => {
		testArgs.httpMethod = 'DELETE';
		expectedResult = { statusCode: 404 };
		actualResult   = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'HEAD', async () => {
		testArgs.httpMethod = 'HEAD';
		expectedResult = { statusCode: 404 };
		actualResult   = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'CONNECT', async () => {
		testArgs.httpMethod = 'CONNECT';
		expectedResult = { statusCode: 404 };
		actualResult   = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'OPTIONS', async () => {
		testArgs.httpMethod = 'OPTIONS';
		expectedResult = { statusCode: 404 };
		actualResult   = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'TRACE', async () => {
		testArgs.httpMethod = 'TRACE';
		expectedResult = { statusCode: 404 };
		actualResult   = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':handler GET', () => {
	let testModuleObj    : Type_TestModuleDefaultDefs;
	let actualResult     : Awaited<Type_handler_ret>;
	let expectedResult   : Awaited<Type_handler_ret>;
	let expectedBody     : string;
	let testArgs         : Type_handler_args;
	let sendMock         : jest.MockedFunction<(args: ScanCommand) => ScanCommandOutput>;
	let sendErr          : Error | null;
	let sendRet          : ScanCommandOutput;
	let sendExpectedArgs : ScanCommand;
	const testItems = [
		{
			pid:         'pid2',
			title:       'title2',
			synopsis:    'synopsis2',
			genre:       'Books&Spoken',
			quality:     'Normal',
			status:      'Pending',
			modify_time: '2025-06-01T02:03:04.567Z',
			image_uri:   'myimageuri2',
			pos:         2,
		},
		{
			pid:         'pid1',
			title:       'title1',
			synopsis:    'synopsis1',
			genre:       'Comedy',
			quality:     'High',
			status:      'Already',
			modify_time: '2025-06-01T01:02:03.456Z',
			image_uri:   'myimageuri1',
			pos:         1,
		},
	];

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.default;
		testArgs = {
			...HANDLER_REQ_TEMPLATE,
			httpMethod: 'GET',
		};
		sendMock = jest.fn();
		// @ts-expect-error don't bother trying to type this
		dynamoDBDocumentClientMock.send = sendMock;
		// @ts-expect-error don't bother trying to type this
		sendMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
			if ( ! sendErr ) {
				return sendRet;
			} else {
				throw sendErr;
			}
		} );
		sendErr = new Error( 'send Err' );
		sendRet = {
			'$metadata':      {},
			LastEvaluatedKey: undefined,
			Items:            testItems,
		};
		// Provide the required input for ScanCommand, e.g., TableName
		sendExpectedArgs = {
			// @ts-expect-error TODO fix type
			objType: 'ScanCommand',
			args: {
				TableName: EXPECTED_PROGRAM_TABLE_NAME,
			},
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'error', async () => {
		expectedResult = {
			statusCode: 500,
		};
		actualResult = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgs );
	});

	test( 'no parameters, ignore already downloaded', async () => {
		sendErr = null;
		expectedBody   = genExpectedBody( [ testItems[ 0 ] ] );
		expectedResult = {
			statusCode: 200,
			headers:    {
				'Content-Type':   'application/json; charset=UTF-8',
				'Content-Length': expectedBody.length,
			},
			body:       expectedBody,
		};
		actualResult = await testModuleObj.handler( testArgs );
		expect( actualResult.statusCode ).toEqual( expectedResult.statusCode );
		expect( actualResult.headers ).toEqual( expectedResult.headers );
		expect( JSON.parse(actualResult.body!) ).toEqual( JSON.parse(expectedResult.body!) ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgs );
	});

	test( 'downloaded, include already downloaded', async () => {
		sendErr = null;
		testArgs.queryStringParameters = {
			downloaded: '1',
		};
		expectedBody = genExpectedBody( [ testItems[ 1 ], testItems[ 0 ] ] );
		expectedResult = {
			statusCode: 200,
			headers:    {
				'Content-Type':   'application/json; charset=UTF-8',
				'Content-Length': expectedBody.length,
			},
			body:       expectedBody,
		};
		actualResult = await testModuleObj.handler( testArgs );
		expect( actualResult.statusCode ).toEqual( expectedResult.statusCode );
		expect( actualResult.headers ).toEqual( expectedResult.headers );
		expect( JSON.parse(actualResult.body!) ).toEqual( JSON.parse(expectedResult.body!) ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
	});
});

describe(MODULE_NAME + ':handler POST', () => {
	let testModuleObj       : Type_TestModuleDefaultDefs;
	let actualResult        : Awaited<Type_handler_ret>;
	let expectedResult      : Awaited<Type_handler_ret>;
	let expectedBody        : string;
	let testArgs            : Type_handler_args;
	let sendMock            : jest.MockedFunction<(args: ScanCommand|BatchWriteCommand) => ScanCommandOutput|BatchWriteCommandOutput>;
	let sendErrArr          : (Error | null)[];
	let sendRetArr          : [ ScanCommandOutput, BatchWriteCommandOutput, BatchWriteCommandOutput ];
	let sendExpectedArgsArr : [ ScanCommand, BatchWriteCommand, BatchWriteCommand ];
	let expectedItemsArr    : Record<string,string|number>[];
	const testStrSystemTime = '2025-06-01T01:02:03.456Z';
	const testDtSystemTime  = new Date( testStrSystemTime );
	const testItems = [
		{
			pid:         'pid1',
			title:       'title1',
			synopsis:    'synopsis1',
			genre:       'Comedy',
			quality:     'High',
			status:      'Pending',
			//modify_time: '2025-06-01T01:02:03.456Z',
			image_uri:   'myimageuri1',
		},
		{
			pid:         'pid2',
			title:       'title2',
			synopsis:    'synopsis2',
			genre:       'Books&Spoken',
			quality:     'Normal',
			status:      'Pending',
			//modify_time: '2025-06-01T02:03:04.567Z',
			image_uri:   'myimageuri2',
		},
	];

	beforeEach( () => {
		commonBeforeEach();
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
		testModuleObj = testModule.default;
		testArgs = {
			...HANDLER_REQ_TEMPLATE,
			httpMethod: 'POST',
			body: formatBody( testItems ),
		};
		sendMock = jest.fn();
		// @ts-expect-error don't bother trying to type this
		dynamoDBDocumentClientMock.send = sendMock;
		// @ts-expect-error don't bother trying to type this
		sendMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
			const sendErr = sendErrArr.shift();
			const sendRet = sendRetArr.shift();
			if ( ! sendErr ) {
				return sendRet;
			} else {
				throw sendErr;
			}
		} );
		sendErrArr = [
			new Error( 'scan Err' ),
			new Error( 'BatchWrite Err 1' ),
			new Error( 'BatchWrite Err 2' ),
		];
		expectedItemsArr = [
			{
				...testItems[ 0 ],
				pos: 1,
				modify_time: testStrSystemTime,
			},
			{
				...testItems[ 1 ],
				pos: 2,
				modify_time: testStrSystemTime,
			},
		];
		sendRetArr = [
			{
				'$metadata':      {},
				LastEvaluatedKey: undefined,
				Items:            testItems,
			},
			{
				'$metadata': {},
			},
			{
				'$metadata': {},
			},
		];
		// Provide the required input for ScanCommand, e.g., TableName
		sendExpectedArgsArr = [
			{
				// @ts-expect-error TODO fix type
				objType: 'ScanCommand',
				args: {
					TableName: EXPECTED_PROGRAM_TABLE_NAME,
				},
			},
			{
				// @ts-expect-error TODO fix type
				objType: 'BatchWriteCommand',
				args: {
					RequestItems: {
						[EXPECTED_PROGRAM_TABLE_NAME]: [
							{
								DeleteRequest: {
									Key: { pid: 'pid1' },
								},
							},
							{
								DeleteRequest: {
									Key: { pid: 'pid2' },
								},
							},
						],
					},
				},
			},
			{
				// @ts-expect-error TODO fix type
				objType: 'BatchWriteCommand',
				args: {
					RequestItems: {
						[EXPECTED_PROGRAM_TABLE_NAME]: [
							{
								PutRequest: {
									Item: expectedItemsArr[ 0 ],
								},
							},
							{
								PutRequest: {
									Item: expectedItemsArr[ 1 ],
								},
							},
						],
					},
				},
			},
		];
	});

	afterEach( () => {
		commonAfterEach();
		jest.useRealTimers();
	});

	test( 'No body', async () => {
		// @ts-expect-error body is not optional
		delete testArgs.body;
		expectedBody   = JSON.stringify( { message: 'No programs' } );
		expectedResult = {
			statusCode: 400,
			body:       expectedBody,
			headers: {
				'Content-Type':   'application/json; charset=UTF-8',
				'Content-Length': expectedBody.length,
			},
		};
		actualResult = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( sendMock ).toHaveBeenCalledTimes( 0 );
	});

	test( 'scan error', async () => {
		expectedBody = JSON.stringify( { message: 'scan Err' } );
		expectedResult = {
			statusCode: 500,
			body:       expectedBody,
			headers: {
				'Content-Type':   'application/json; charset=UTF-8',
				'Content-Length': expectedBody.length,
			},
		};
		actualResult = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( sendMock ).toHaveBeenCalledTimes( 1 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});

	test( 'delete error', async () => {
		sendErrArr[ 0 ] = null;
		expectedBody = JSON.stringify( { message: 'BatchWrite Err 1' } );
		expectedResult = {
			statusCode: 500,
			body:       expectedBody,
			headers: {
				'Content-Type':   'application/json; charset=UTF-8',
				'Content-Length': expectedBody.length,
			},
		};
		actualResult = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});

	test( 'write error', async () => {
		sendErrArr[ 0 ] = null;
		sendErrArr[ 1 ] = null;
		expectedBody = JSON.stringify( { message: 'BatchWrite Err 2' } );
		expectedResult = {
			statusCode: 500,
			body:       expectedBody,
			headers: {
				'Content-Type':   'application/json; charset=UTF-8',
				'Content-Length': expectedBody.length,
			},
		};
		actualResult = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( sendMock ).toHaveBeenCalledTimes( 3 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});

	test( 'OK', async () => {
		sendErrArr[ 0 ] = null;
		sendErrArr[ 1 ] = null;
		sendErrArr[ 2 ] = null;
		expectedBody = formatBody( [
			{ ...testItems[ 0 ] },
			{ ...testItems[ 1 ] },
		] );
		expectedResult = {
			statusCode: 200,
			body:       expectedBody,
			headers: {
				'Content-Type':   'application/json; charset=UTF-8',
				'Content-Length': expectedBody.length,
			},
		};
		actualResult = await testModuleObj.handler( testArgs );
		expect( actualResult.statusCode ).toEqual( expectedResult.statusCode );
		expect( JSON.parse(actualResult.body!) ).toEqual( JSON.parse(expectedResult.body!) ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		expect( actualResult.headers ).toEqual( expectedResult.headers );
		expect( sendMock ).toHaveBeenCalledTimes( 3 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});
});

describe(MODULE_NAME + ':handler PATCH', () => {
	let testModuleObj       : Type_TestModuleDefaultDefs;
	let actualResult        : Awaited<Type_handler_ret>;
	let expectedResult      : Awaited<Type_handler_ret>;
	let expectedBody        : string;
	let testArgs            : Type_handler_args;
	let sendMock            : jest.MockedFunction<(args: ScanCommand|TransactWriteCommand) => ScanCommandOutput|TransactWriteCommandOutput>;
	let sendErrArr          : (Error | null)[];
	let sendRetArr          : [ ScanCommandOutput, TransactWriteCommandOutput ];
	let sendExpectedArgsArr : [ ScanCommand, TransactWriteCommand ];
	const testStrSystemTime = '2025-06-01T01:02:03.456Z';
	const testDtSystemTime  = new Date( testStrSystemTime );
	const testItems = [
		{
			pid:    'pid1',
			status: 'Success',
		},
		{
			pid:    'pid2',
			status: 'Already',
		},
	];

	beforeEach( () => {
		commonBeforeEach();
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
		testModuleObj = testModule.default;
		testArgs = {
			...HANDLER_REQ_TEMPLATE,
			httpMethod: 'PATCH',
			body: formatBody( testItems ),
		};
		sendMock = jest.fn();
		// @ts-expect-error don't bother trying to type this
		dynamoDBDocumentClientMock.send = sendMock;
		// @ts-expect-error don't bother trying to type this
		sendMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
			const sendErr = sendErrArr.shift();
			const sendRet = sendRetArr.shift();
			if ( ! sendErr ) {
				return sendRet;
			} else {
				throw sendErr;
			}
		} );
		sendErrArr = [
			new Error( 'scan Err' ),
			new Error( 'TransactWrite Err' ),
		];
		sendRetArr = [
			{
				'$metadata':      {},
				LastEvaluatedKey: undefined,
				Items:            testItems,
			},
			{
				'$metadata': {},
			},
		];
		// Provide the required input for ScanCommand, e.g., TableName
		sendExpectedArgsArr = [
			{
				// @ts-expect-error TODO fix type
				objType: 'ScanCommand',
				args: {
					TableName: EXPECTED_PROGRAM_TABLE_NAME,
				},
			},
			{
				// @ts-expect-error TODO fix type
				objType: 'TransactWriteCommand',
				args: {
					TransactItems: [
						{
							Update: {
								TableName:                 EXPECTED_PROGRAM_TABLE_NAME,
								Key:                       { pid: 'pid1' },
								ExpressionAttributeNames:  { '#S': 'status' },
								ExpressionAttributeValues: { ':s': 'Success' },
								UpdateExpression:          'SET #S = :s',
							},
						},
						{
							Update: {
								TableName:                 EXPECTED_PROGRAM_TABLE_NAME,
								Key:                       { pid: 'pid2' },
								ExpressionAttributeNames:  { '#S': 'status' },
								ExpressionAttributeValues: { ':s': 'Already' },
								UpdateExpression:          'SET #S = :s',
							},
						},
						{
							Put: {
								TableName: EXPECTED_PROGRAM_HISTORY_TABLE_NAME,
								Item: {
									...testItems[ 0 ],
									modify_time:   testStrSystemTime,
									download_time: testStrSystemTime,
								},
							},
						},
						{
							Put: {
								TableName: EXPECTED_PROGRAM_HISTORY_TABLE_NAME,
								Item: {
									...testItems[ 1 ],
									modify_time:   testStrSystemTime,
									download_time: testStrSystemTime,
								},
							},
						},
					],
				},
			},
		];
	});

	afterEach( () => {
		commonAfterEach();
		jest.useRealTimers();
	});

	test( 'No body', async () => {
		// @ts-expect-error body is not specified as optional
		delete testArgs.body;
		expectedBody = JSON.stringify( { message: 'No programs' } );
		expectedResult = {
			statusCode: 400,
			body:       expectedBody,
			headers: {
				'Content-Type':   'application/json; charset=UTF-8',
				'Content-Length': expectedBody.length,
			},
		};
		actualResult = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( sendMock ).toHaveBeenCalledTimes( 0 );
	});

	test( 'No programs', async () => {
		testArgs.body = '[]';
		expectedBody = JSON.stringify( { message: 'No programs' } );
		expectedResult = {
			statusCode: 400,
			body:       expectedBody,
			headers: {
				'Content-Type':   'application/json; charset=UTF-8',
				'Content-Length': expectedBody.length,
			},
		};
		actualResult = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( sendMock ).toHaveBeenCalledTimes( 0 );
	});

	test( 'scan error', async () => {
		expectedBody = JSON.stringify( { message: 'scan Err' } );
		expectedResult = {
			statusCode: 500,
			body:       expectedBody,
			headers: {
				'Content-Type':   'application/json; charset=UTF-8',
				'Content-Length': expectedBody.length,
			},
		};
		actualResult = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( sendMock ).toHaveBeenCalledTimes( 1 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});

	test( 'transact error', async () => {
		sendErrArr[ 0 ] = null;
		expectedBody = JSON.stringify( { message: 'TransactWrite Err' } );
		expectedResult = {
			statusCode: 500,
			body:       expectedBody,
			headers: {
				'Content-Type':   'application/json; charset=UTF-8',
				'Content-Length': expectedBody.length,
			},
		};
		actualResult = await testModuleObj.handler( testArgs );
		expect( actualResult ).toEqual( expectedResult );
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});

	test( 'OK', async () => {
		sendErrArr[ 0 ] = null;
		sendErrArr[ 1 ] = null;
		expectedBody = formatBody( { message: 'OK' } );
		expectedResult = {
			statusCode: 200,
			body:       expectedBody,
			headers: {
				'Content-Type':   'application/json; charset=UTF-8',
				'Content-Length': expectedBody.length,
			},
		};
		actualResult = await testModuleObj.handler( testArgs );
		expect( actualResult.statusCode ).toEqual( expectedResult.statusCode );
		expect( JSON.parse(actualResult.body!) ).toEqual( JSON.parse(expectedResult.body!) ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		expect( actualResult.headers ).toEqual( expectedResult.headers );
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});
});
