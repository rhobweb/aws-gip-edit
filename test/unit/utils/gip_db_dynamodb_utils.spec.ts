/**
 * DESCRIPTION:
 * Unit Tests for utils/gip_db_dynamodb_utils.ts.
 */
const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_db_dynamodb_utils.ts';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;
const OLD_ENV      = { ...process.env };

import type {
	Type_genDbRecord_args,
	Type_genDbRecord_ret,
	Type_genDbHistoryRecord_args,
	Type_genDbHistoryRecord_ret,
	Type_loadTable_args,
	Type_loadTable_ret,
	Type_extractPrograms_args,
	Type_extractPrograms_ret,
	Type_genDeleteCommandParams_args,
	Type_genDeleteCommandParams_ret,
	Type_deletePrograms_args,
	Type_deletePrograms_ret,
	Type_genWriteCommandParams_args,
	Type_genWriteCommandParams_ret,
	Type_validateUpdate_args,
	Type_validateUpdate_ret,
	Type_genUpdateItem_args,
	Type_genUpdateItem_ret,
	Type_genUpdateHistoryItemCommand_args,
	Type_genUpdateHistoryItemCommand_ret,
	Type_genUpdateHistoryCommandParams_args,
	Type_genUpdateHistoryCommandParams_ret,
	Type_genUpdateCommandParams_args,
	Type_genUpdateCommandParams_ret,
	Type_sortPrograms_args,
	Type_sortPrograms_ret,
	Type_loadProgramsHelper_args,
	Type_loadProgramsHelper_ret,
	Type_clearProgramsHelper_args,
	Type_clearProgramsHelper_ret,
	Type_saveProgramsHelper_args,
	Type_saveProgramsHelper_ret,
	Type_updateProgramsHelper_args,
	Type_updateProgramsHelper_ret,
	Type_resetDb_args,
	Type_loadPrograms_ret,
	Type_savePrograms_args,
	Type_savePrograms_ret,
	Type_updatePrograms_args,
	Type_updatePrograms_ret,
} from '../../../src/utils/gip_db_dynamodb_utils.ts';

import type {
	Type_DbProgramHistoryItem,
	Type_DbProgramItem,
	//Type_DbProgramHistoryItem,
	Type_DbProgramEditItem,
	//Type_FieldMap
} from '../../../src/utils/gip_prog_fields.ts';

import {
	//// @ts-expect-error mocks is added for testing
	//mocks as clientDynamodbMocks,
	//DynamoDBClient,
	DynamoDBClientConfig,
	//ScanCommand,
	//ScanCommandOutput,
	//ScanCommandInput,
	//ScanCommandOutput,
	//BatchWriteItemCommandInput,
	//BatchWriteItemCommand,
	//WriteRequest,
	//AttributeValue,
	//TransactWriteItem,
	//TransactWriteItemsCommandInput,
	//TransactWriteItemsCommand,
	WriteRequest,
} from '@aws-sdk/client-dynamodb';

import {
	// @ts-expect-error mocks is added for testing
	mocks as libDynamodbMocks,
	DynamoDBDocumentClient,
	ScanCommand,
	ScanCommandOutput,
	BatchWriteCommand,
	BatchWriteCommandOutput,
	TransactWriteCommandInput,
	TransactWriteCommand,
	//ScanCommandInput,
	//ScanCommandOutput,
	//BatchWriteItemCommandInput,
	//BatchWriteItemCommand,
	//WriteRequest,
	//AttributeValue,
	//TransactWriteItem,
} from '@aws-sdk/lib-dynamodb';

import {
	GipDynamoDB,
} from '../../../src/utils/gip_db_dynamodb_utils';

import {
	HttpError,
} from '../../../src/utils/gip_http_utils';

//import type {
//	Type_DayOfWeek,
//	Type_dayOfWeekToIndex_args,
//	Type_dayOfWeekToIndex_ret,
//	Type_getCurrentDayOfWeek_args,
//	Type_getCurrentDayOfWeek_ret,
//	Type_dayOfWeekDiff_ret,
//	Type_isDayOfWeekAvailable_args,
//	Type_isDayOfWeekAvailable_ret,
//} from '../../../src/utils/gip_date_utils';
//
//interface Type_TestModuleDefaultDefs {
//	getCurrentDayOfWeek:  (args?: Type_getCurrentDayOfWeek_args)  => Type_getCurrentDayOfWeek_ret,
//};

interface Type_TestModulePrivateDefs {
	DEFAULT_DB_CLIENT_CONFIG:      Record<string,unknown>,
	STAGE:                         string,
	SERVICE_NAME:                  string,
	genDbRecord:                   (args: Type_genDbRecord_args)                   => Type_genDbRecord_ret,
	genDbHistoryRecord:            (args: Type_genDbHistoryRecord_args)            => Type_genDbHistoryRecord_ret,
	loadTable:                     (args: Type_loadTable_args)                     => Type_loadTable_ret,
	extractPrograms:               (args: Type_extractPrograms_args)               => Type_extractPrograms_ret,
	genDeleteCommandParams:        (args: Type_genDeleteCommandParams_args)        => Type_genDeleteCommandParams_ret,
	deletePrograms:                (args: Type_deletePrograms_args)                => Type_deletePrograms_ret,
	genWriteCommandParams:         (args: Type_genWriteCommandParams_args)         => Type_genWriteCommandParams_ret,
	validateUpdate:                (args: Type_validateUpdate_args)                => Type_validateUpdate_ret,
	genUpdateItem:                 (args: Type_genUpdateItem_args)                 => Type_genUpdateItem_ret,
	genUpdateHistoryItemCommand:   (args: Type_genUpdateHistoryItemCommand_args)   => Type_genUpdateHistoryItemCommand_ret,
	genUpdateHistoryCommandParams: (args: Type_genUpdateHistoryCommandParams_args) => Type_genUpdateHistoryCommandParams_ret,
	genUpdateCommandParams:        (args: Type_genUpdateCommandParams_args)        => Type_genUpdateCommandParams_ret,
	sortPrograms:                  (args: Type_sortPrograms_args)                  => Type_sortPrograms_ret,
	loadProgramsHelper:            (args: Type_loadProgramsHelper_args)            => Type_loadProgramsHelper_ret,
	clearProgramsHelper:           (args: Type_clearProgramsHelper_args)           => Type_clearProgramsHelper_ret,
	saveProgramsHelper:            (args: Type_saveProgramsHelper_args)            => Type_saveProgramsHelper_ret,
	updateProgramsHelper:          (args: Type_updateProgramsHelper_args)          => Type_updateProgramsHelper_ret,
	resetDb:                       (args: Type_resetDb_args)                       => void,
};

interface Type_TestModule {
	privateDefs:    Type_TestModulePrivateDefs,
	loadPrograms:   () => Type_loadPrograms_ret,
	savePrograms:   (args: Type_savePrograms_args)   => Type_savePrograms_ret,
	updatePrograms: (args: Type_updatePrograms_args) => Type_updatePrograms_ret,
};

const TEST_TIMEOUT_MS = 60 * 1000;
jest.setTimeout( TEST_TIMEOUT_MS );

import * as TEST_MODULE from '../../../src/utils/gip_db_dynamodb_utils';
const testModule = TEST_MODULE as unknown as Type_TestModule;


function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

function commonAfterEach() : void {
	jest.restoreAllMocks();
	jest.resetModules();
	process.env = { ...OLD_ENV };
}

function fail( err : Error | string ) : void {
	if ( typeof err === 'string' ) {
		throw new Error( err );
	} else {
		throw err;
	}
}

const EXPECTED_TABLE_NAME_PROGRAM         = 'dev_test-aws-gip-edit_Program'; // Derived from the jest.setEnvVars.ts file
const EXPECTED_TABLE_NAME_PROGRAM_HISTORY = 'dev_test-aws-gip-edit_ProgramHistory'; // Derived from the jest.setEnvVars.ts file

describe(MODULE_NAME + ':module', () => {
	const OLD_ENV = { ...process.env };
	let   testModuleLocal    : Type_TestModule;
	let   actualErr          : Error;
	let   expectedErrMessage : string;

	beforeEach( () => {
		commonBeforeEach();
	});

	afterEach( () => {
		commonAfterEach();
	});

	afterAll( () => {
		process.env = { ...OLD_ENV };
	});

	test( 'Local endpoint', async () => {
		await jest.isolateModulesAsync(async () => { // isolateModules allows loading another instance of the module
			process.env.AWS_REGION               = 'cn-west-1';
			process.env.IS_LOCAL                 = '1';
			process.env.LOCAL_DYNAMO_DB_ENDPOINT = 'http://test-local-dynamodb-endpoint';
			testModuleLocal = await import( TEST_MODULE_PATH ) as Type_TestModule;
		});
		const expectedDbClientConfig = {
			region:   'cn-west-1',
			endpoint: 'http://test-local-dynamodb-endpoint',
		};
		expect( testModuleLocal.privateDefs.DEFAULT_DB_CLIENT_CONFIG ).toEqual( expectedDbClientConfig );
	});

	test( 'Default STAGE and SERVICE_NAME', async () => {
		const expectedStage       = 'dev';
		const expectedServiceName = 'gip-edit-react';
		await jest.isolateModulesAsync(async () => { // isolateModules allows loading another instance of the module
			delete process.env.STAGE;
			delete process.env.SERVICE_NAME;
			testModuleLocal = await import( TEST_MODULE_PATH ) as Type_TestModule;
		});
		expect( testModuleLocal.privateDefs.STAGE ).toEqual( expectedStage );
		expect( testModuleLocal.privateDefs.SERVICE_NAME ).toEqual( expectedServiceName );
	});

	test( 'No GIP_MAX_PROGRAMS', async () => {
		delete process.env.GIP_MAX_PROGRAMS;
		expectedErrMessage = 'GIP_MAX_PROGRAMS not defined';
		await jest.isolateModulesAsync(async () => { // isolateModules allows loading another instance of the module
			try {
				testModuleLocal = await import( TEST_MODULE_PATH ) as Type_TestModule;
			}
			catch ( err ) {
				actualErr = err as Error;
			}
		});
		expect( actualErr.message ).toEqual( expectedErrMessage );
	});
});

describe(MODULE_NAME + ':genDbRecord', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_genDbRecord_ret;
	let expectedResult : Type_genDbRecord_ret;
	let testArgs       : Type_genDbRecord_args;
	let testProgram    : Type_DbProgramEditItem;
	const testStrSystemTime = '2025-06-01T01:02:03.456Z';
	const testDtSystemTime  = new Date( testStrSystemTime );

	beforeEach( () => {
		commonBeforeEach();
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
		testProgram = {
			pid:           'mypid',
			status:        'Pending',
			genre:         'Books&Spoken',
			day_of_week:   'Mon',
			quality:       'Normal',
			title:         'My Title',
			synopsis:      'My Synopsis',
			modify_time:   '2025-06-01T12:00:00Z',
			image_uri:     'http://mydom/myimage.png',
			download_time: '2025-06-01T11:00:00Z',
			pos:           null,
		};
		testArgs = {
			program:    testProgram,
			programPos: 7,
		};
		testModuleObj = testModule.privateDefs;
		expectedResult = {
			pid:           'mypid',
			status:        'Pending',
			genre:         'Books&Spoken',
			day_of_week:   'Mon',
			quality:       'Normal',
			title:         'My Title',
			synopsis:      'My Synopsis',
			modify_time:   '2025-06-01T12:00:00Z',
			image_uri:     'http://mydom/myimage.png',
			// download_time is not stored
			pos:           7,
		};
	});

	afterEach( () => {
		commonAfterEach();
		jest.useRealTimers();
	});

	test( 'Pos exists, day of the week present', () => {
		testProgram.pos    = 3;
		expectedResult.pos = 3;
		actualResult       = testModuleObj.genDbRecord( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Pos null, day of week null, no modify time', () => {
		testProgram.day_of_week = null;
		testProgram.modify_time = null;
		delete expectedResult.day_of_week;
		expectedResult.modify_time = testStrSystemTime;
		actualResult = testModuleObj.genDbRecord( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':genDbHistoryRecord', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_genDbHistoryRecord_ret;
	let expectedResult : Type_genDbHistoryRecord_ret;
	let testArgs       : Type_genDbHistoryRecord_args;
	const testStrSystemTime = '2025-06-01T01:02:03.456Z';
	const testDtSystemTime  = new Date( testStrSystemTime );

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
		testArgs = {
			pid:           'mypid',
			status:        'Pending',
			genre:         'Books&Spoken',
			day_of_week:   'Mon',
			quality:       'Normal',
			title:         'My Title',
			synopsis:      'My Synopsis',
			image_uri:     'http://mydom/myimage.png',
			modify_time:   'any old time',
			download_time: 'any old time',
			pos:           null,
		};
		expectedResult = {
			pid:           'mypid',
			status:        'Pending',
			genre:         'Books&Spoken',
			quality:       'Normal',
			title:         'My Title',
			synopsis:      'My Synopsis',
			modify_time:   testStrSystemTime,
			download_time: testStrSystemTime,
			image_uri:     'http://mydom/myimage.png',
		};
	});

	afterEach( () => {
		commonAfterEach();
		jest.useRealTimers();
	});

	test( 'OK', () => {
		actualResult       = testModuleObj.genDbHistoryRecord( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':loadTable', () => {
	let testModuleObj        : Type_TestModulePrivateDefs;
	let actualErr            : Error;
	let expectedErr          : Error;
	let actualResult         : Awaited<Type_loadTable_ret>;
	let expectedResult       : Awaited<Type_loadTable_ret>;
	let testArgs             : Type_loadTable_args;
	let testDbDocClient      : DynamoDBDocumentClient;
	let sendMock             : jest.MockedFunction<(args: ScanCommand) => Promise<ScanCommandOutput>>;
	let sendRetArr           : ScanCommandOutput[];
	let sendRet1             : ScanCommandOutput;
	let sendRet2             : ScanCommandOutput;
	let sendErrArr           : (Error|null)[];
	let sendErr1             : Error;
	let sendErr2             : Error;
	let sendExpectedArgsArr  : object[];
	let sendExpectedArgs1    : object;
	let sendExpectedArgs2    : object;
	const testItem1            = { p: 'val1' } as unknown as Type_DbProgramItem;
	const testItem2            = { p: 'val2' } as unknown as Type_DbProgramItem;
	const testLastEvaluatedKey = { p: 'last' };
	const testTableName        = 'mytable';

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		sendMock = jest.fn();
		testDbDocClient = libDynamodbMocks.dynamoDBDocumentClientMock; // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
		testArgs = {
			dbDocClient: testDbDocClient,
			tableName:   testTableName,
		};
		sendRet1 = {
			'$metadata':      { httpStatusCode: 200 },
			Items:            [ testItem1 ],
			LastEvaluatedKey: testLastEvaluatedKey,
		};
		sendRet2 = {
			'$metadata': { httpStatusCode: 200 },
			Items:       [ testItem2 ],
		};
		sendRetArr = [ sendRet1, sendRet2 ];
		sendErr1 = new Error( 'send err 1' );
		sendErr2 = new Error( 'send err 2' );
		sendErrArr = [ sendErr1, sendErr2 ];
		// @ts-expect-error return type does not match
		sendMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
			const err = sendErrArr.shift();
			const ret = sendRetArr.shift();
			if ( ! err ) {
				return ret;
			} else {
				throw err;
			}
		} );
		testDbDocClient.send = sendMock;
		sendExpectedArgs1 = {
			args: { TableName: testTableName },
		};
		sendExpectedArgs2 = {
			args: { TableName: testTableName, ExclusiveStartKey: testLastEvaluatedKey },
		};
		sendExpectedArgsArr = [ sendExpectedArgs1, sendExpectedArgs2 ];
		expectedResult = [];
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK, one pass, no items', async () => {
		sendErrArr[ 0 ] = null;
		delete sendRet1.LastEvaluatedKey;
		sendRet1.Items = [];
		expectedResult = [];
		try {
			actualResult = await testModuleObj.loadTable( testArgs );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
		expect( sendMock ).toHaveBeenCalledTimes( 1 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});

	test( 'OK, one pass', async () => {
		sendErrArr[ 0 ] = null;
		expectedResult = sendRet1.Items as Type_DbProgramItem[];
		delete sendRet1.LastEvaluatedKey;
		try {
			actualResult = await testModuleObj.loadTable( testArgs );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( actualResult ).toEqual( expectedResult );
		expect( sendMock ).toHaveBeenCalledTimes( 1 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});

	test( 'OK, two passes', async () => {
		sendErrArr[ 0 ] = null;
		sendErrArr[ 1 ] = null;
		try {
			actualResult = await testModuleObj.loadTable( testArgs );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expectedResult = [ testItem1, testItem2 ];
		expect( actualResult ).toEqual( expectedResult );
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});

	test( 'Error, first pass', async () => {
		expectedErr = sendErr1;
		try {
			await testModuleObj.loadTable( testArgs );
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( sendMock ).toHaveBeenCalledTimes( 1 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( actualErr ).toEqual( expectedErr );
	});

	test( 'Error, second pass', async () => {
		sendErrArr[ 0 ] = null;
		expectedErr = sendErr2;
		try {
			await testModuleObj.loadTable( testArgs );
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( actualErr ).toEqual( expectedErr );
	});
});

describe(MODULE_NAME + ':extractPrograms', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_extractPrograms_ret;
	let expectedResult : Type_extractPrograms_ret;
	let testArgs       : Type_extractPrograms_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = [ {
			pid:         'mypid1',
			status:      'Pending',
			genre:       'Books&Spoken',
			quality:     'Normal',
			title:       'My Title1',
			synopsis:    'My Synopsis1',
			modify_time: '2025-06-01T12:00:00Z',
			image_uri:   'http://mydom/myimage1.png',
			pos:         2,
		},
		{
			pid:         'mypid2',
			status:      'Pending',
			genre:       'Comedy',
			quality:     'High',
			title:       'My Title2',
			synopsis:    'My Synopsis2',
			modify_time: '2025-06-02T13:00:00Z',
			image_uri:   'http://mydom/myimage2.png',
			pos:         1,
		}	 ];
		expectedResult = [ {
			pid:           'mypid1',
			status:        'Pending',
			genre:         'Books&Spoken',
			quality:       'Normal',
			title:         'My Title1',
			synopsis:      'My Synopsis1',
			modify_time:   '2025-06-01T12:00:00Z',
			image_uri:     'http://mydom/myimage1.png',
			pos:           2,
			day_of_week:   undefined,
			//download_time: '',
		},
		{
			pid:           'mypid2',
			status:        'Pending',
			genre:         'Comedy',
			quality:       'High',
			title:         'My Title2',
			synopsis:      'My Synopsis2',
			modify_time:   '2025-06-02T13:00:00Z',
			image_uri:     'http://mydom/myimage2.png',
			pos:           1,
			day_of_week:   undefined,
			//download_time: '',
		} ];
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'One item', () => {
		testArgs.pop();
		expectedResult.pop();
		actualResult = testModuleObj.extractPrograms( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Two items', () => {
		actualResult = testModuleObj.extractPrograms( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':genDeleteCommandParams', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_genDeleteCommandParams_ret;
	let expectedResult : Type_genDeleteCommandParams_ret;
	let testArgs       : Type_genDeleteCommandParams_args;
	let expectedItems  : WriteRequest[];
	let actualErr      : Error | null;
	let expectedErrMessage : string;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = [
			{ pid: 'mypid1' },
			{ pid: 'mypid2' },
		] as unknown as Type_DbProgramItem[]; // Only need pid for delete
		expectedItems = [
			// @ts-expect-error there is no lib type for WriteRequest
			{	DeleteRequest: { Key: testArgs[ 0 ] } },
			// @ts-expect-error there is no lib type for WriteRequest
			{	DeleteRequest: { Key: testArgs[ 1 ] } },
		];
		expectedResult = {
			RequestItems: {
				[EXPECTED_TABLE_NAME_PROGRAM]: expectedItems,
			},
		};
		actualErr   = null;
		expectedErrMessage = '';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'One item', () => {
		testArgs.pop();
		expectedItems.pop();
		actualResult = testModuleObj.genDeleteCommandParams( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Two items', () => {
		actualResult = testModuleObj.genDeleteCommandParams( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'No items', () => {
		testArgs.pop();
		testArgs.pop();
		expectedErrMessage = 'No programs specified';
		try {
			testModuleObj.genDeleteCommandParams( testArgs );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( actualErr!.message ).toEqual( expectedErrMessage ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
	});
});

describe(MODULE_NAME + ':deletePrograms', () => {
	let testModuleObj    : Type_TestModulePrivateDefs;
	let testArgs         : Type_deletePrograms_args;
	let actualErr        : Error | null;
	let expectedErr      : Error | null;
	let testDbDocClient  : DynamoDBDocumentClient;
	let sendMock         : ( jest.MockedFunction<(args: BatchWriteCommand) => Promise<BatchWriteCommandOutput>>);
	let sendRet          : BatchWriteCommandOutput;
	let sendErr          : Error | null;
	let sendExpectedArgs : object;
	const testItem1 = {
		pid: 'pid1',
		pos: 1,
	} as unknown as Type_DbProgramItem;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj   = testModule.privateDefs;
		sendMock        = jest.fn();
		testDbDocClient = libDynamodbMocks.dynamoDBDocumentClientMock; // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
		testArgs        = {
			dbDocClient: testDbDocClient,
			programs:    [ testItem1 ],
		};
		sendRet = {
			'$metadata': { httpStatusCode: 200 },
		};
		sendErr = new Error( 'delete error' );
		sendMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
			if ( sendErr ) {
				throw sendErr;
			} else {
				// sendRet should never be null
				return sendRet!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
			}
		} );
		testDbDocClient.send = sendMock;
		const sendExpectedDeleteArgs = {
			RequestItems: {
				[EXPECTED_TABLE_NAME_PROGRAM]: [
					{ DeleteRequest: { Key: { pid: testItem1.pid } } },
				],
			},
		};
		sendExpectedArgs = {
			args: sendExpectedDeleteArgs,
		};
		actualErr = null;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'No programs', async () => {
		testArgs.programs.pop();
		try {
			await testModuleObj.deletePrograms( testArgs );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( sendMock ).toHaveBeenCalledTimes( 0 );
	});

	test( 'Delete error', async () => {
		expectedErr = sendErr;
		try {
			await testModuleObj.deletePrograms( testArgs );
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgs );
		expect( actualErr ).toEqual( expectedErr );
	});

	test( 'Programs deleted', async () => {
		sendErr = null;
		try {
			await testModuleObj.deletePrograms( testArgs );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgs );
	});
});

describe(MODULE_NAME + ':genWriteCommandParams', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_genWriteCommandParams_ret;
	let expectedResult : Type_genWriteCommandParams_ret;
	let testArgs       : Type_genWriteCommandParams_args;
	let actualErr      : Error | null;
	let expectedItems  : WriteRequest[];
	let expectedErrMessage : string;
	const rawProg1 : Type_DbProgramEditItem = {
		pid:           'mypid1',
		status:        'Pending',
		genre:         'Books&Spoken',
		day_of_week:   'Mon',
		quality:       'Normal',
		title:         'My Title1',
		synopsis:      'My Synopsis1',
		modify_time:   '2025-06-01T12:00:00Z',
		image_uri:     'http://mydom/myimage1.png',
		download_time: '2025-06-01T11:00:00Z',
		pos:           null,
	};
	const rawProg2 : Type_DbProgramEditItem = {
		pid:           'mypid2',
		status:        'OK',
		genre:         'Comedy',
		day_of_week:   'Any',
		quality:       'High',
		title:         'My Title2',
		synopsis:      'My Synopsis2',
		modify_time:   '2025-06-02T13:01:05Z',
		image_uri:     'http://mydom/myimage2.png',
		download_time: '2025-06-02T13:01:02Z',
		pos:           null,
	};
	testArgs = [ rawProg1, rawProg2 ];
	const expectedItem1 : Type_DbProgramItem = {
		pid:           'mypid1',
		status:        'Pending',
		genre:         'Books&Spoken',
		day_of_week:   'Mon',
		quality:       'Normal',
		title:         'My Title1',
		synopsis:      'My Synopsis1',
		modify_time:   '2025-06-01T12:00:00Z',
		image_uri:     'http://mydom/myimage1.png',
		// download_time is not stored
		pos:           1,
	};
	const expectedItem2 : Type_DbProgramItem = {
		pid:           'mypid2',
		status:        'OK',
		genre:         'Comedy',
		day_of_week:   'Any',
		quality:       'High',
		title:         'My Title2',
		synopsis:      'My Synopsis2',
		modify_time:   '2025-06-02T13:01:05Z',
		image_uri:     'http://mydom/myimage2.png',
		// download_time is not stored
		pos:           2,
	};

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = [ rawProg1, rawProg2 ];
		expectedItems = [
			{	PutRequest: { Item: expectedItem1 } },
			{	PutRequest: { Item: expectedItem2 } },
		] as unknown[] as WriteRequest[];
		expectedResult = {
			RequestItems: {
				[EXPECTED_TABLE_NAME_PROGRAM]: expectedItems,
			},
		};
		actualErr   = null;
		expectedErrMessage = '';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'One item', () => {
		testArgs.pop();
		expectedItems.pop();
		actualResult = testModuleObj.genWriteCommandParams( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Two items', () => {
		actualResult = testModuleObj.genWriteCommandParams( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'No items', () => {
		testArgs.pop();
		testArgs.pop();
		expectedErrMessage = 'No programs specified';
		try {
			testModuleObj.genWriteCommandParams( testArgs );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( actualErr!.message ).toEqual( expectedErrMessage ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
	});
});

describe(MODULE_NAME + ':validateUpdate', () => {
	let testModuleObj      : Type_TestModulePrivateDefs;
	let actualErr          : Error | null;
	let expectedErrMessage : string;
	let testArgs           : Type_DbProgramEditItem;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs   = {
			pid:           'mypid1',
			status:        'Pending',
			genre:         'Books&Spoken',
			day_of_week:   'Mon',
			quality:       'Normal',
			title:         'My Title1',
			synopsis:      'My Synopsis1',
			modify_time:   '2025-06-01T12:00:00Z',
			image_uri:     'http://mydom/myimage1.png',
			download_time: '2025-06-01T11:00:00Z',
			pos:           null,
		};
		actualErr          = null;
		expectedErrMessage = '';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'No pid', () => {
		// @ts-expect-error pid is mandatory
		delete testArgs.pid;
		expectedErrMessage = 'Invalid PID';
		try {
			testModuleObj.validateUpdate( testArgs );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( actualErr?.message ).toEqual( expectedErrMessage );
	});

	test( 'No status', () => {
		// @ts-expect-error status is mandatory
		delete testArgs.status;
		expectedErrMessage = 'Invalid Status';
		try {
			testModuleObj.validateUpdate( testArgs );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( actualErr?.message ).toEqual( expectedErrMessage );
	});
});

describe(MODULE_NAME + ':genUpdateItem', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let testArgs       : Type_genUpdateItem_args;
	let actualResult   : Type_genUpdateItem_ret;
	let expectedResult : Type_genUpdateItem_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		// @ts-expect-error only need these two properties for this test
		testArgs   = {
			pid:    'mypid1',
			status: 'Success',
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK', () => {
		expectedResult = {
			Update: {
				TableName:                 EXPECTED_TABLE_NAME_PROGRAM,
				Key:                       { pid: testArgs.pid },
				ExpressionAttributeNames:  { '#S': 'status' },
				ExpressionAttributeValues: { ':s': testArgs.status },
				UpdateExpression:          'SET #S = :s',
			}
		};
		actualResult = testModuleObj.genUpdateItem( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':genUpdateHistoryItemCommand', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let testArgs       : Type_genUpdateHistoryItemCommand_args;
	let actualResult   : Type_genUpdateHistoryItemCommand_ret;
	let expectedResult : Type_genUpdateHistoryItemCommand_ret;
	let expectedObject : Type_DbProgramHistoryItem;
	const testStrSystemTime = '2025-06-01T01:02:03.456Z';
	const testDtSystemTime  = new Date( testStrSystemTime );

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
		testArgs = {
			pid:           'mypid1',
			status:        'Success',
			genre:         'Books&Spoken',
			day_of_week:   'Mon',
			quality:       'Normal',
			title:         'My Title1',
			synopsis:      'My Synopsis1',
			modify_time:   '2025-06-01T12:00:00Z',
			image_uri:     'http://mydom/myimage1.png',
			download_time: '2025-06-01T11:00:00Z',
			pos:           null,
		};
		const tempExpectedObject = JSON.parse( JSON.stringify( testArgs ) ) as Record<string,unknown>;
		delete tempExpectedObject.pos;         // pos is not stored in history
		delete tempExpectedObject.day_of_week; // day_of_week is not stored in history
		tempExpectedObject.modify_time   = testStrSystemTime;
		tempExpectedObject.download_time = testStrSystemTime;
		expectedObject = tempExpectedObject as unknown as Type_DbProgramHistoryItem;
	});

	afterEach( () => {
		commonAfterEach();
		jest.useRealTimers();
	});

	test( 'OK', () => {
		expectedResult = {
			Put: {
				TableName: EXPECTED_TABLE_NAME_PROGRAM_HISTORY,
				Item:      expectedObject,
			},
		};
		actualResult = testModuleObj.genUpdateHistoryItemCommand( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':genUpdateHistoryCommandParams', () => {
	let testModuleObj        : Type_TestModulePrivateDefs;
	let testArgs             : Type_genUpdateHistoryCommandParams_args;
	let actualErr            : HttpError;
	let expectedErrStatusCode: number;
	let expectedErrMessage   : string;
	let testProg1            : Type_DbProgramEditItem;
	let testProg2            : Type_DbProgramEditItem;
	let actualResult         : Type_genUpdateHistoryCommandParams_ret;
	let expectedResult       : Type_genUpdateHistoryCommandParams_ret;
	let expectedObject1      : Type_DbProgramHistoryItem;
	let expectedObject2      : Type_DbProgramHistoryItem;
	const testStrSystemTime = '2025-06-01T01:02:03.456Z';
	const testDtSystemTime  = new Date( testStrSystemTime );

	function genExpectedObject( prog : Type_DbProgramEditItem ) : Type_DbProgramHistoryItem {
		const retObj = JSON.parse( JSON.stringify( prog ) ) as Record<string, unknown>;
		delete retObj.pos;         // pos is not stored in history
		delete retObj.day_of_week; // day_of_week is not stored in history
		retObj.modify_time   = testStrSystemTime;
		retObj.download_time = testStrSystemTime;
		return retObj as unknown as Type_DbProgramHistoryItem;
	}

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
		testProg1 = {
			pid:           'mypid1',
			status:        'Success',
			genre:         'Books&Spoken',
			day_of_week:   'Mon',
			quality:       'Normal',
			title:         'My Title1',
			synopsis:      'My Synopsis1',
			modify_time:   '2025-06-01T12:00:00Z',
			image_uri:     'http://mydom/myimage1.png',
			download_time: '2025-06-01T11:00:00Z',
			pos:           1,
		};
		testProg2 = {
			pid:           'mypid2',
			status:        'Error',
			genre:         'Books&Spoken',
			day_of_week:   null,
			quality:       'High',
			title:         'My Title2',
			synopsis:      'My Synopsis2',
			modify_time:   '2025-06-01T12:02:30Z',
			image_uri:     'http://mydom/myimage2.png',
			download_time: '2025-06-01T11:02:00Z',
			pos:           2,
		};
		expectedObject1 = genExpectedObject( testProg1 );
		expectedObject2 = genExpectedObject( testProg2 );
		testArgs = {
			programs:       [ testProg1, testProg2 ],
			actualPrograms: [ { ...testProg1, status: 'Error' }, { ...testProg2, status: 'Already' } ],
		};
	});

	afterEach( () => {
		commonAfterEach();
		jest.useRealTimers();
	});

	test( 'OK', () => {
		expectedResult = [
			{
				Put: {
					TableName: EXPECTED_TABLE_NAME_PROGRAM_HISTORY,
					Item:      expectedObject1,
				},
			},
			{
				Put: {
					TableName: EXPECTED_TABLE_NAME_PROGRAM_HISTORY,
					Item:      expectedObject2,
				},
			},
		];
		actualResult = testModuleObj.genUpdateHistoryCommandParams( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Program not found', () => {
		testArgs.actualPrograms[ 1 ].pid = 'notmypid2'; // Change pid so that it does not match
		expectedErrStatusCode = 400;
		expectedErrMessage    = 'Program not found: mypid2';
		try {
			testModuleObj.genUpdateHistoryCommandParams( testArgs );
			fail( 'Test should not succeed' );
		}
		catch ( err )	{
			actualErr = err as HttpError;
		}
		expect( actualErr.statusCode ).toEqual( expectedErrStatusCode );
		expect( actualErr.message ).toEqual( expectedErrMessage );
	});
});

describe(MODULE_NAME + ':genUpdateCommandParams', () => {
	let testModuleObj          : Type_TestModulePrivateDefs;
	let testArgs               : Type_genUpdateCommandParams_args;
	let testProg1              : Type_DbProgramItem;
	let testProg2              : Type_DbProgramItem;
	let actualResult           : Type_genUpdateCommandParams_ret;
	let expectedResult         : Type_genUpdateCommandParams_ret;
	let expectedProgUpdate1    : Record<string, unknown>;
	let expectedProgUpdate2    : Record<string, unknown>;
	let expectedHistoryObject1 : Type_DbProgramHistoryItem;
	let expectedHistoryObject2 : Type_DbProgramHistoryItem;
	const testStrSystemTime = '2025-06-01T01:02:03.456Z';
	const testDtSystemTime  = new Date( testStrSystemTime );

	function genExpectedUpdateItem( prog : Type_DbProgramItem ) : Record<string, unknown> {
		const retObj = {
			Update: {
				TableName:                 EXPECTED_TABLE_NAME_PROGRAM,
				Key:                       { pid: prog.pid },
				ExpressionAttributeNames:  { '#S': 'status' },
				ExpressionAttributeValues: { ':s': prog.status },
				UpdateExpression:          'SET #S = :s',
			}
		};
		return retObj;
	}

	function genExpectedHistoryUpdateItem( prog : Type_DbProgramItem ) : Type_DbProgramHistoryItem {
		const expectedObj = JSON.parse( JSON.stringify( prog ) ) as Record<string, unknown>;
		delete expectedObj.pos;         // pos is not stored in history
		delete expectedObj.day_of_week; // day_of_week is not stored in history
		expectedObj.modify_time   = testStrSystemTime;
		expectedObj.download_time = testStrSystemTime;
		const retObj = {
			Put: {
				TableName: EXPECTED_TABLE_NAME_PROGRAM_HISTORY,
				Item:      expectedObj,
			},
		};
		return retObj as unknown as Type_DbProgramHistoryItem;
	}

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
		testProg1 = {
			pid:           'mypid1',
			status:        'Success',
			genre:         'Books&Spoken',
			day_of_week:   'Mon',
			quality:       'Normal',
			title:         'My Title1',
			synopsis:      'My Synopsis1',
			modify_time:   '2025-06-01T12:00:00Z',
			image_uri:     'http://mydom/myimage1.png',
			pos:           1,
		};
		testProg2 = {
			pid:           'mypid2',
			status:        'Error',
			genre:         'Books&Spoken',
			day_of_week:   undefined,
			quality:       'High',
			title:         'My Title2',
			synopsis:      'My Synopsis2',
			modify_time:   '2025-06-01T12:02:30Z',
			image_uri:     'http://mydom/myimage2.png',
			pos:           2,
		};
		expectedProgUpdate1    = genExpectedUpdateItem( testProg1 );
		expectedProgUpdate2    = genExpectedUpdateItem( testProg2 );
		expectedHistoryObject1 = genExpectedHistoryUpdateItem( testProg1 );
		expectedHistoryObject2 = genExpectedHistoryUpdateItem( testProg2 );
		testArgs = {
			programs:       [ testProg1, testProg2 ],
			actualPrograms: [ { ...testProg1, status: 'Error' }, { ...testProg2, status: 'Already' } ],
		};
		expectedResult = {
			TransactItems: [
				expectedProgUpdate1,
				expectedProgUpdate2,
				expectedHistoryObject1,
				expectedHistoryObject2,
			]
		};
	});

	afterEach( () => {
		commonAfterEach();
		jest.useRealTimers();
	});

	test( 'OK', () => {
		actualResult = testModuleObj.genUpdateCommandParams( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':sortPrograms', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let testArgs       : Type_sortPrograms_args;
	let testProg1      : Type_DbProgramItem;
	let testProg2      : Type_DbProgramItem;
	let testProg3      : Type_DbProgramItem;
	let actualResult   : Type_sortPrograms_ret;
	let expectedResult : Type_sortPrograms_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		// @ts-expect-error only need these two properties for this test
		testProg1 = {
			pos: 2,
			pid: 'mypid1',
		};
		// @ts-expect-error only need these two properties for this test
		testProg2 = {
			pos: 3,
			pid: 'mypid2',
		};
		// @ts-expect-error only need these two properties for this test
		testProg3 = {
			pos: 1,
			pid: 'mypid3',
		};
		testArgs       = [ testProg1, testProg2, testProg3 ];
		expectedResult = [];
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Three programs', () => {
		expectedResult = [ testProg3, testProg1, testProg2 ];
		actualResult   = testModuleObj.sortPrograms( testArgs );
		expect( actualResult ).toEqual( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Three programs already sorted', () => {
		testArgs       = [ testProg3, testProg1, testProg2 ];
		expectedResult = [ testProg3, testProg1, testProg2 ];
		actualResult   = testModuleObj.sortPrograms( testArgs );
		expect( actualResult ).toEqual( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Two programs', () => {
		testArgs.splice(1,1);
		expectedResult = [ testProg3, testProg1 ];
		actualResult   = testModuleObj.sortPrograms( testArgs );
		expect( actualResult ).toEqual( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'One program', () => {
		testArgs.splice(0,2);
		expectedResult = [ testProg3 ];
		actualResult   = testModuleObj.sortPrograms( testArgs );
		expect( actualResult ).toEqual( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':loadProgramsHelper', () => {
	let testModuleObj    : Type_TestModulePrivateDefs;
	let testArgs         : Type_loadProgramsHelper_args;
	let actualResult     : Awaited<Type_loadProgramsHelper_ret>;
	let expectedResult   : Awaited<Type_loadProgramsHelper_ret>;
	let actualErr        : Error | null;
	let expectedErr      : Error | null;
	let testDbDocClient  : DynamoDBDocumentClient;
	let sendMock         : jest.MockedFunction<(args: ScanCommand) => Promise<ScanCommandOutput>>;
	let sendRet          : ScanCommandOutput;
	let sendErr          : Error | null;
	let sendExpectedArgs : object;
	const testItem1 = {
		pos: 2,
	} as unknown as Type_DbProgramItem;
	const testItem2 = {
		pos: 1
	} as unknown as Type_DbProgramItem;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj   = testModule.privateDefs;
		sendMock        = jest.fn();
		testDbDocClient = libDynamodbMocks.dynamoDBDocumentClientMock; // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
		testArgs        = testDbDocClient;
		sendRet = {
			'$metadata':      { httpStatusCode: 200 },
			Items:            [ testItem1, testItem2 ],
			// no LastEvaluatedKey
		};
		sendErr = new Error( 'send error' );
		sendMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
			if ( ! sendErr ) {
				return sendRet;
			} else {
				throw sendErr;
			}
		} );
		testDbDocClient.send = sendMock;
		sendExpectedArgs = {
			args: { TableName: EXPECTED_TABLE_NAME_PROGRAM },
		};
		expectedResult = [
			{
				...testItem2,
				day_of_week:   null, // day_of_week is not returned by the scan
				download_time: '',   // download_time is not returned by the scan
			},
			{
				...testItem1,
				day_of_week:   null, // day_of_week is not returned by the scan
				download_time: '',  // download_time is not returned by the scan
			},
		] as unknown as Awaited<Type_DbProgramItem[]>;
		actualErr = null;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK', async () => {
		sendErr = null;
		try {
			actualResult = await testModuleObj.loadProgramsHelper( testArgs );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Error', async () => {
		expectedErr = sendErr;
		try {
			actualResult = await testModuleObj.loadProgramsHelper( testArgs );
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgs );
		expect( actualErr ).toEqual( expectedErr );
	});
});

describe(MODULE_NAME + ':clearProgramsHelper', () => {
	let testModuleObj       : Type_TestModulePrivateDefs;
	let testArgs            : Type_clearProgramsHelper_args;
	let actualErr           : Error | null;
	let expectedErr         : Error | null;
	let testDbDocClient     : DynamoDBDocumentClient;
	let sendMock            : ( jest.MockedFunction<(args: ScanCommand | BatchWriteCommand) => Promise<ScanCommandOutput|BatchWriteCommandOutput>>);
	let sendRetArr          : ( ScanCommandOutput | BatchWriteCommandOutput )[];
	let sendErrArr          : (Error | null)[];
	let sendExpectedArgsArr : object[];
	const testItem1 = {
		pid: 'pid2',
		pos: 2,
	} as unknown as Type_DbProgramItem;
	const testItem2 = {
		pid: 'pid1',
		pos: 1
	} as unknown as Type_DbProgramItem;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj   = testModule.privateDefs;
		sendMock        = jest.fn();
		testDbDocClient = libDynamodbMocks.dynamoDBDocumentClientMock; // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
		testArgs        = testDbDocClient;
		sendRetArr = [
			{
				'$metadata':      { httpStatusCode: 200 },
				Items:            [ testItem1, testItem2 ],
				// no LastEvaluatedKey
			},
		];
		sendErrArr = [
			new Error( 'load error' ),
			new Error( 'delete error' ),
		];
		sendMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
			const sendErr = sendErrArr.shift();
			const sendRet = sendRetArr.shift();
			if ( sendErr ) {
				throw sendErr;
			} else {
				// sendRet should never be null
				return sendRet!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
			}
		} );
		testDbDocClient.send = sendMock;
		const sendExpectedDeleteArgs = {
			RequestItems: {
				[EXPECTED_TABLE_NAME_PROGRAM]: [
					{ DeleteRequest: { Key: { pid: testItem2.pid } } },
					{ DeleteRequest: { Key: { pid: testItem1.pid } } },
				],
			},
		};
		sendExpectedArgsArr = [
			{
				args: { TableName: EXPECTED_TABLE_NAME_PROGRAM },
			},
			{
				args: sendExpectedDeleteArgs,
			}
		];
		actualErr = null;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Load error', async () => {
		expectedErr = sendErrArr[ 0 ];
		try {
			await testModuleObj.clearProgramsHelper( testArgs );
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( sendMock ).toHaveBeenCalledTimes( 1 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( actualErr ).toEqual( expectedErr );
	});

	test( 'Delete error', async () => {
		sendErrArr[ 0 ] = null;
		expectedErr = sendErrArr[ 1 ];
		try {
			await testModuleObj.clearProgramsHelper( testArgs );
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( actualErr ).toEqual( expectedErr );
	});

	test( 'No programs', async () => {
		sendErrArr = [];
		(sendRetArr[0] as ScanCommandOutput).Items = [];
		try {
			await testModuleObj.clearProgramsHelper( testArgs );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( sendMock ).toHaveBeenCalledTimes( 1 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});

	test( 'Programs deleted', async () => {
		sendErrArr = [];
		try {
			await testModuleObj.clearProgramsHelper( testArgs );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});
});

describe(MODULE_NAME + ':saveProgramsHelper', () => {
	let testModuleObj       : Type_TestModulePrivateDefs;
	let testArgs            : Type_saveProgramsHelper_args;
	let actualErr           : Error | null;
	let expectedErr         : Error | null;
	let expectedErrMessage  : string;
	let testDbDocClient     : DynamoDBDocumentClient;
	let sendMock            : ( jest.MockedFunction<(args: ScanCommand | BatchWriteCommand) => Promise<ScanCommandOutput|BatchWriteCommandOutput>>);
	let sendRetArr          : ( ScanCommandOutput | BatchWriteCommandOutput )[];
	let sendErrArr          : (Error | null)[];
	let sendExpectedArgsArr : object[];
	const testStrSystemTime = '2025-06-01T01:02:03.456Z';
	const testDtSystemTime  = new Date( testStrSystemTime );
	const testItem1 = {
		pid: 'pid2',
	} as unknown as Type_DbProgramItem;
	const testItem2 = {
		pid: 'pid1',
	} as unknown as Type_DbProgramItem;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
		sendMock   = jest.fn();
		testDbDocClient = libDynamodbMocks.dynamoDBDocumentClientMock; // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
		testArgs        = {
			dbDocClient: testDbDocClient,
			programs:    [ testItem1, testItem2 ] as Type_DbProgramEditItem[],
		};
		sendRetArr = [
			{
				'$metadata': { httpStatusCode: 200 },
				Items:       [], // No stored programs
				// no LastEvaluatedKey
			},
			{
				'$metadata': { httpStatusCode: 200 },
				Items:       [ testItem1, testItem2 ],
			},
		];
		sendErrArr = [
			null, // load programs
			new Error( 'save error' ),
		];
		sendMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
			const sendErr = sendErrArr.shift();
			const sendRet = sendRetArr.shift();
			if ( sendErr ) {
				throw sendErr;
			} else {
				// sendRet should never be null
				return sendRet!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
			}
		} );
		testDbDocClient.send = sendMock;
		const expectedPrograms = [
			{
				...testItem1,
				modify_time: testStrSystemTime,
				pos: 1,
			},
			{
				...testItem2,
				modify_time: testStrSystemTime,
				pos: 2,
			}
		];
		const sendExpectedWriteArgs = {
			RequestItems: {
				[EXPECTED_TABLE_NAME_PROGRAM]: [
					{
						PutRequest: {
							Item: expectedPrograms[ 0 ],
						},
					},
					{
						PutRequest: {
							Item: expectedPrograms[ 1 ],
						},
					},
				],
			},
		};
		sendExpectedArgsArr = [
			{
				args: { TableName: EXPECTED_TABLE_NAME_PROGRAM },
			},
			{
				args: sendExpectedWriteArgs,
			}
		];
		actualErr = null;
	});

	afterEach( () => {
		commonAfterEach();
		jest.useRealTimers();
	});

	test( 'Maximum number of programs exceeded', async () => {
		testArgs.programs = Array(11).fill( testItem1 ) as Type_DbProgramEditItem[];
		expectedErrMessage = `Too many programs ${JSON.stringify( { numPrograms: 11, max: 10 } )}`;
		try {
			await testModuleObj.saveProgramsHelper( testArgs );
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( sendMock ).toHaveBeenCalledTimes( 0 );
		expect( actualErr!.message ).toEqual( expectedErrMessage ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
	});

	test( 'No programs to save', async () => {
		testArgs.programs = [];
		sendErrArr = [];
		(sendRetArr[0] as ScanCommandOutput).Items = [];
		try {
			await testModuleObj.saveProgramsHelper( testArgs );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( sendMock ).toHaveBeenCalledTimes( 1 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});

	test( 'Save error', async () => {
		expectedErr = sendErrArr[ 1 ];
		try {
			await testModuleObj.saveProgramsHelper( testArgs );
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( actualErr ).toEqual( expectedErr );
	});

	test( 'Saved OK', async () => {
		sendErrArr = [];
		try {
			await testModuleObj.saveProgramsHelper( testArgs );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});
});

describe(MODULE_NAME + ':updateProgramsHelper', () => {
	let testModuleObj       : Type_TestModulePrivateDefs;
	let testArgs            : Type_updateProgramsHelper_args;
	let actualErr           : Error | null;
	let expectedErr         : Error | null;
	let testDbDocClient     : DynamoDBDocumentClient;
	let sendMock            : ( jest.MockedFunction<(args: ScanCommand | TransactWriteCommand) => Promise<ScanCommandOutput|TransactWriteCommandInput>>);
	let sendRetArr          : ( ScanCommandOutput | TransactWriteCommandInput )[];
	let sendErrArr          : (Error | null)[];
	let sendExpectedArgsArr : object[];
	const testStrSystemTime = '2025-06-01T01:02:03.456Z';
	const testDtSystemTime  = new Date( testStrSystemTime );
	const testItem1 = {
		pid:    'pid2',
		pos:    2,
		status: 'Pending',
	} as unknown as Type_DbProgramItem;
	const testItem2 = {
		pid:    'pid1',
		pos:    1,
		status: 'Pending',
	} as unknown as Type_DbProgramItem;
	const testItem3 = {
		pid:    'pid3',
		pos:    3,
		status: 'Pending',
	} as unknown as Type_DbProgramItem;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
		sendMock   = jest.fn();
		testDbDocClient = libDynamodbMocks.dynamoDBDocumentClientMock; // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
		testArgs        = {
			dbDocClient: testDbDocClient,
			programs:    [
				{ ...testItem1, status: 'Success' },
				{ ...testItem2, status: 'Already' },
				{ ...testItem3, status: 'Error'   },
			],
		};
		sendRetArr = [
			{
				'$metadata': { httpStatusCode: 200 },
				Items:       [ testItem1, testItem2, testItem3 ],
				// no LastEvaluatedKey
			},
			{
				'$metadata': { httpStatusCode: 200 },
			},
		];
		sendErrArr = [
			new Error( 'load error' ),
			new Error( 'save error' ),
		];
		sendMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
			const sendErr = sendErrArr.shift();
			const sendRet = sendRetArr.shift();
			if ( sendErr ) {
				throw sendErr;
			} else {
				// sendRet should never be null
				return sendRet!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
			}
		} );
		testDbDocClient.send = sendMock;
		const arrHistoryItem = [
			{ ...testItem1, status: 'Success', modify_time: testStrSystemTime, download_time: testStrSystemTime },
			{ ...testItem2, status: 'Already', modify_time: testStrSystemTime, download_time: testStrSystemTime },
			{ ...testItem3, status: 'Error',   modify_time: testStrSystemTime, download_time: testStrSystemTime },
		];
		for ( const histItem of arrHistoryItem ) {
			// @ts-expect-error pos has been added above, but is not in the history object
			delete histItem.pos;
		}
		const sendExpectedUpdateArgs = {
			TransactItems: [
				{
					Update: {
						TableName:                 EXPECTED_TABLE_NAME_PROGRAM,
						Key:                       { pid: 'pid2' },
						ExpressionAttributeNames:  { '#S': 'status' },
						ExpressionAttributeValues: { ':s': 'Success' },
						UpdateExpression:          'SET #S = :s',
					},
				},
				{
					Update: {
						TableName:                 EXPECTED_TABLE_NAME_PROGRAM,
						Key:                       { pid: 'pid1' },
						ExpressionAttributeNames:  { '#S': 'status' },
						ExpressionAttributeValues: { ':s': 'Already' },
						UpdateExpression:          'SET #S = :s',
					},
				},
				{
					Update: {
						TableName:                 EXPECTED_TABLE_NAME_PROGRAM,
						Key:                       { pid: 'pid3' },
						ExpressionAttributeNames:  { '#S': 'status' },
						ExpressionAttributeValues: { ':s': 'Error' },
						UpdateExpression:          'SET #S = :s',
					},
				},
				{
					Put: {
						TableName: EXPECTED_TABLE_NAME_PROGRAM_HISTORY,
						Item:      arrHistoryItem[ 0 ],
					},
				},
				{
					Put: {
						TableName: EXPECTED_TABLE_NAME_PROGRAM_HISTORY,
						Item:      arrHistoryItem[ 1 ],
					},
				},
				{
					Put: {
						TableName: EXPECTED_TABLE_NAME_PROGRAM_HISTORY,
						Item:      arrHistoryItem[ 2 ],
					},
				},
			],
		};
		sendExpectedArgsArr = [
			{
				args: { TableName: EXPECTED_TABLE_NAME_PROGRAM },
			},
			{
				args: sendExpectedUpdateArgs,
			}
		];
		actualErr = null;
	});

	afterEach( () => {
		commonAfterEach();
		jest.useRealTimers();
	});

	test( 'Load error', async () => {
		expectedErr = sendErrArr[ 0 ];
		try {
			await testModuleObj.updateProgramsHelper( testArgs );
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( sendMock ).toHaveBeenCalledTimes( 1 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( actualErr ).toEqual( expectedErr );
	});

	test( 'OK', async () => {
		sendErrArr = [];
		try {
			await testModuleObj.updateProgramsHelper( testArgs );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});
});

describe(MODULE_NAME + ':GipDynamoDB', () => {
	let testObj            : GipDynamoDB;
	let testConfig         : DynamoDBClientConfig;
	let actualErr          : Error;
	let expectedErrMessage : string;

	beforeEach( () => {
		commonBeforeEach();
		testConfig = { region: 'eu-west-2' };
		actualErr  = undefined as unknown as Error;       // Initialize to undefined
		testObj    = undefined as unknown as GipDynamoDB; // Initialize to undefined
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'construct and createClient', () => {
		testObj = new GipDynamoDB( { config: testConfig } );
		expect( testObj.dbClient ).toBeDefined();
		expect( testObj.dbDocClient ).toBeDefined();
		// @ts-expect-error 'testProps' is added to the mock, and dbClient is defined
		expect( testObj.dbClient.testProps.config ).toEqual( testConfig ); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		// @ts-expect-error 'name' is added to the mock
		expect( testObj.dbDocClient.testProps.name ).toEqual( 'DynamoDBDocumentClient mock' ); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		// @ts-expect-error 'testClient' is added to the mock
		expect( testObj.dbClient ).toEqual( testObj.dbDocClient.testProps.dbClient ); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		// @ts-expect-error 'testProps' is added to the mock
		expect( testObj.dbClient.testProps.destroyed ).toEqual( false ); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
		// @ts-expect-error 'testProps' is added to the mock
		expect( testObj.dbDocClient.testProps.destroyed ).toEqual( false ); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
	});

	test( 'destroy', () => {
		testObj = new GipDynamoDB( { config: testConfig } );
		testObj.destroy();
		expect( testObj.dbClient ).toBeNull();
		expect( testObj.dbDocClient ).toBeNull();
	});

	test( 'createClient - invalid config', () => {
		expectedErrMessage = 'DynamoDBClient config cannot be null';
		try {
			new GipDynamoDB( { config: null } );
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( actualErr.message ).toEqual( expectedErrMessage );
	});

	test( 'createClient - already created', () => {
		testObj = new GipDynamoDB( { config: testConfig } );
		const oldDbClient = testObj.dbClient;
		// @ts-expect-error set config to null so that if it tries to create a new client, it will fail
		testObj.config = null;
		testObj.createClient();
		expect( testObj.dbClient ).toBeDefined();
		expect( testObj.dbDocClient ).toBeDefined();
		expect( testObj.dbClient ).toEqual( oldDbClient );
	});

	test( 'getDocClient', () => {
		testObj = new GipDynamoDB( { config: testConfig } );
		const actualResult = testObj.getDocClient();
		expect( testObj.dbDocClient ).toEqual( actualResult );
	});

	test( 'getDocClient error', () => {
		expectedErrMessage = 'DB not configured';
		testObj = new GipDynamoDB( { config: testConfig } );
		try {
			testObj.dbDocClient = null;
			testObj.getDocClient();
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( actualErr.message ).toEqual( expectedErrMessage );
	});
});

describe(MODULE_NAME + ':resetDb', () => {
	let testModuleObj : Type_TestModulePrivateDefs;
	let testArgs      : Type_resetDb_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Reset', () => {
		testArgs = new GipDynamoDB();
		expect( testArgs.dbDocClient ).not.toBeNull();
		testModuleObj.resetDb( testArgs );
		expect( testArgs.dbDocClient ).toBeNull();
	});

	test( 'Not defined', () => {
		testArgs = null;
		testModuleObj.resetDb( testArgs );
		expect( testArgs ).toBeNull(); // Add any old expect for the test
	});
});

describe(MODULE_NAME + ':loadPrograms', () => {
	let testModuleObj    : Type_TestModule;
	let actualResult     : Awaited<Type_loadPrograms_ret>;
	let expectedResult   : Awaited<Type_loadPrograms_ret>;
	let actualErr        : Error | null;
	let expectedErr      : Error | null;
	let testDbDocClient  : DynamoDBDocumentClient;
	let sendMock         : jest.MockedFunction<(args: ScanCommand) => Promise<ScanCommandOutput>>;
	let sendRet          : ScanCommandOutput;
	let sendErr          : Error | null;
	let sendExpectedArgs : object;
	const testItem1 = {
		pos: 1,
		pid: 'pid1',
	} as unknown as Type_DbProgramItem;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj        = testModule;
		testDbDocClient      = libDynamodbMocks.dynamoDBDocumentClientMock; // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
		sendMock             = jest.fn();
		testDbDocClient.send = sendMock;
		sendRet = {
			'$metadata':      { httpStatusCode: 200 },
			Items:            [ testItem1 ],
			// no LastEvaluatedKey
		};
		sendErr = new Error( 'send error' );
		sendMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
			if ( ! sendErr ) {
				return sendRet;
			} else {
				throw sendErr;
			}
		} );
		sendExpectedArgs = {
			args: { TableName: EXPECTED_TABLE_NAME_PROGRAM },
		};
		expectedResult = [
			{
				...testItem1,
				day_of_week:   null, // day_of_week is not returned by the scan
				download_time: '',  // download_time is not returned by the scan
			},
		] as unknown as Awaited<Type_DbProgramEditItem[]>;
		actualErr = null;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK', async () => {
		sendErr = null;
		try {
			actualResult = await testModuleObj.loadPrograms();
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Error', async () => {
		expectedErr = sendErr;
		try {
			actualResult = await testModuleObj.loadPrograms();
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgs );
		expect( actualErr ).toEqual( expectedErr );
	});
});

describe(MODULE_NAME + ':savePrograms', () => {
	let testModuleObj       : Type_TestModule;
	let testArgs            : Type_savePrograms_args;
	let actualErr           : Error | null;
	let expectedErr         : Error | null;
	let testDbDocClient     : DynamoDBDocumentClient;
	let sendMock            : ( jest.MockedFunction<(args: ScanCommand | BatchWriteCommand) => Promise<ScanCommandOutput|BatchWriteCommandOutput>>);
	let sendRetArr          : ( ScanCommandOutput | BatchWriteCommandOutput )[];
	let sendErrArr          : (Error | null)[];
	let sendExpectedArgsArr : object[];
	const testStrSystemTime = '2025-06-01T01:02:03.456Z';
	const testDtSystemTime  = new Date( testStrSystemTime );
	const testItem1 = {
		pid: 'pid1',
	} as unknown as Type_DbProgramItem;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
		testDbDocClient = libDynamodbMocks.dynamoDBDocumentClientMock; // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
		// @ts-expect-error add test property
		testDbDocClient.fred = 'fred';
		sendMock             = jest.fn();
		testDbDocClient.send = sendMock;
		testArgs = {
			programs: [ testItem1 ] as Type_DbProgramEditItem[],
		};
		sendRetArr = [
			{
				'$metadata': { httpStatusCode: 200 },
				Items:       [], // No stored programs
				// no LastEvaluatedKey
			},
			{
				'$metadata': { httpStatusCode: 200 },
				Items:       [ testItem1 ],
			},
		];
		sendErrArr = [
			null, // load programs
			new Error( 'save error' ),
		];
		sendMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
			const sendErr = sendErrArr.shift();
			const sendRet = sendRetArr.shift();
			if ( sendErr ) {
				throw sendErr;
			} else {
				// sendRet should never be null
				return sendRet!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
			}
		} );
		testDbDocClient.send = sendMock;
		const expectedPrograms = [
			{
				...testItem1,
				modify_time: testStrSystemTime,
				pos: 1,
			},
		];
		const sendExpectedWriteArgs = {
			RequestItems: {
				[EXPECTED_TABLE_NAME_PROGRAM]: [
					{
						PutRequest: {
							Item: expectedPrograms[ 0 ],
						},
					},
				],
			},
		};
		sendExpectedArgsArr = [
			{
				args: { TableName: EXPECTED_TABLE_NAME_PROGRAM },
			},
			{
				args: sendExpectedWriteArgs,
			}
		];
		actualErr = null;
	});

	afterEach( () => {
		commonAfterEach();
		jest.useRealTimers();
	});

	test( 'OK', async () => {
		sendErrArr[ 1 ] = null;
		try {
			await testModuleObj.savePrograms( testArgs );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});

	test( 'Error', async () => {
		expectedErr = sendErrArr[ 1 ];
		try {
			await testModuleObj.savePrograms( testArgs );
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( actualErr ).toEqual( expectedErr );
	});
});

describe(MODULE_NAME + ':updatePrograms', () => {
	let testModuleObj       : Type_TestModule;
	let testArgs            : Type_savePrograms_args;
	let actualErr           : Error | null;
	let expectedErr         : Error | null;
	let testDbDocClient     : DynamoDBDocumentClient;
	let sendMock            : ( jest.MockedFunction<(args: ScanCommand | TransactWriteCommand) => Promise<ScanCommandOutput|TransactWriteCommandInput>>);
	let sendRetArr          : ( ScanCommandOutput | TransactWriteCommandInput )[];
	let sendErrArr          : (Error | null)[];
	let sendExpectedArgsArr : object[];
	const testStrSystemTime = '2025-06-01T01:02:03.456Z';
	const testDtSystemTime  = new Date( testStrSystemTime );
	const testItem1 = {
		pid: 'pid1',
		pos: 1,
	} as unknown as Type_DbProgramEditItem;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		jest.useFakeTimers();
		jest.setSystemTime( testDtSystemTime );
		testDbDocClient = libDynamodbMocks.dynamoDBDocumentClientMock; // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
		// @ts-expect-error add test property
		testDbDocClient.fred = 'fred';
		sendMock             = jest.fn();
		testDbDocClient.send = sendMock;
		testArgs = {
			programs: [
				{ ...testItem1, status: 'Success' },
			],
		};
		sendRetArr = [
			{
				'$metadata': { httpStatusCode: 200 },
				Items:       [ testItem1 ],
				// no LastEvaluatedKey
			},
			{
				'$metadata': { httpStatusCode: 200 },
			},
		];
		sendErrArr = [
			null, // load programs
			new Error( 'update error' ),
		];
		sendMock.mockImplementation( async () => { // eslint-disable-line @typescript-eslint/require-await
			const sendErr = sendErrArr.shift();
			const sendRet = sendRetArr.shift();
			if ( sendErr ) {
				throw sendErr;
			} else {
				// sendRet should never be null
				return sendRet!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
			}
		} );
		testDbDocClient.send = sendMock;
		const arrHistoryItem = [
			{ ...testItem1, status: 'Success', modify_time: testStrSystemTime, download_time: testStrSystemTime },
		];
		for ( const histItem of arrHistoryItem ) {
			delete histItem.pos;
		}
		const sendExpectedUpdateArgs = {
			TransactItems: [
				{
					Update: {
						TableName:                 EXPECTED_TABLE_NAME_PROGRAM,
						Key:                       { pid: 'pid1' },
						ExpressionAttributeNames:  { '#S': 'status' },
						ExpressionAttributeValues: { ':s': 'Success' },
						UpdateExpression:          'SET #S = :s',
					},
				},
				{
					Put: {
						TableName: EXPECTED_TABLE_NAME_PROGRAM_HISTORY,
						Item:      arrHistoryItem[ 0 ],
					},
				},
			],
		};
		sendExpectedArgsArr = [
			{
				args: { TableName: EXPECTED_TABLE_NAME_PROGRAM },
			},
			{
				args: sendExpectedUpdateArgs,
			}
		];
		actualErr = null;
	});

	afterEach( () => {
		commonAfterEach();
		jest.useRealTimers();
	});

	test( 'OK', async () => {
		sendErrArr[ 1 ] = null;
		try {
			await testModuleObj.updatePrograms( testArgs );
		}
		catch ( err ) {
			fail( err as Error );
		}
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
	});

	test( 'Error', async () => {
		expectedErr = sendErrArr[ 1 ];
		try {
			await testModuleObj.updatePrograms( testArgs );
			fail( 'Test should not succeed' );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( sendMock ).toHaveBeenCalledTimes( 2 );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( sendMock ).toHaveBeenCalledWith( sendExpectedArgsArr.shift() );
		expect( actualErr ).toEqual( expectedErr );
	});
});
