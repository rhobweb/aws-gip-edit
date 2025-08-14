/**
 * File:        utils/gip_db_dynamodb_utils.ts
 * Description: DB access utilities for the program database.
 *
 * Types Used:
 *   Program:           an object containing the program properties, e.g., { pid: 'mypid', ... }.
 *   DB Record:         a program object in DynamoDB format, e.g., { mypid: { S: 'mypid' }, ... }.
 *   DB History Record: a program history object in DynamoDB format, e.g., { mypid: { S: 'mypid' }, ... }.
 */
'use strict';

////////////////////////////////////////////////////////////////////////////////
// Imports

import {
	DynamoDBClient,
	DynamoDBClientConfig,
	WriteRequest,
} from '@aws-sdk/client-dynamodb';

import {
	DynamoDBDocumentClient,
	BatchWriteCommandInput,
	BatchWriteCommand,
	ScanCommand,
	ScanCommandInput,
	ScanCommandOutput,
	TransactWriteCommand,
	TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';

import process from 'node:process';
import assert  from 'node:assert';
import logger  from '@rhobweb/console-logger';

import {
	DB_FIELD_STATUS,
	DB_FIELD_PID,
	DB_FIELD_TITLE,
	DB_FIELD_SYNOPSIS,
	DB_FIELD_GENRE,
	DB_FIELD_QUALITY,
	DB_FIELD_MODIFY_TIME,
	DB_FIELD_DOWNLOAD_TIME,
	DB_FIELD_DAY_OF_WEEK,
	DB_FIELD_POS,
	DB_FIELD_IMAGE_URI,
	VALUE_STATUS_ERROR,
	VALUE_STATUS_SUCCESS,
	VALUE_STATUS_ALREADY,
//} from './gip_prog_fields';
} from '#utils/gip_prog_fields';

import {
	genProgramEditItem,
//} from './gip_prog_db_utils';
} from '#utils/gip_prog_db_utils';

import {
	HttpError,
//} from './gip_http_utils';
} from '#utils/gip_http_utils';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

// @aws-sdk/lib-dynamodb defines TransactWriteCommandInput as either:
//   - array of TransactWriteItems (from @aws-sdk/client-dynamodb), modified so that the DB type property is not required, e,g,. { S: 'val' } => 'val';
//   - undefined.
// The package does not export the modified TransactWriteItems type, so need to extract it.
type TransactWriteItemArr        = TransactWriteCommandInput['TransactItems']; // TransactItems is the property name used by the lib package
type TransactWriteItemArrDefined = Extract<TransactWriteItemArr, unknown[]>;   // Extract the array part, ignoring the undefined part of the union.
type TransactWriteItem           = TransactWriteItemArrDefined[number];        // Extract the array element type

import type {
	Nullable,
} from './gip_types.ts';

import type {
	Type_DbProgramEditItem,
	Type_DbProgramItem,
	Type_DbProgramHistoryItem,
	Type_DbProgramItemPropName,
} from './gip_prog_fields.ts';

////////////////////////////////////////
// Exported and local types

export type Type_ProgramField = typeof PROGRAM_FIELDS[number];

export interface Type_genDbRecord_args {
	program:    Type_DbProgramEditItem,
	programPos: number,
};
export type Type_genDbRecord_ret = Type_DbProgramItem;

export type Type_genDbHistoryRecord_args = Type_DbProgramEditItem;
export type Type_genDbHistoryRecord_ret  = Type_DbProgramHistoryItem;

export interface Type_loadTable_args { dbDocClient : DynamoDBDocumentClient, tableName: string };
export type      Type_loadTable_ret = Promise<Type_DbProgramItem[]>;

export type Type_extractProgram_args = Type_DbProgramItem;
export type Type_extractProgram_ret  = Type_DbProgramItem;

export type Type_extractPrograms_args = Type_DbProgramItem[];
export type Type_extractPrograms_ret  = Type_DbProgramItem[];

export type Type_genDeleteCommandParams_args = Type_DbProgramItem[];
export type Type_genDeleteCommandParams_ret  = BatchWriteCommandInput;

export interface Type_deletePrograms_args {
	dbDocClient: DynamoDBDocumentClient,
	programs:    Type_DbProgramItem[],
};
export type Type_deletePrograms_ret = Promise<void>;

export type Type_genWriteCommandParams_args = Type_DbProgramEditItem[];
export type Type_genWriteCommandParams_ret  = BatchWriteCommandInput;

export interface Type_writePrograms_args {
	dbDocClient: DynamoDBDocumentClient,
	programs:    Type_DbProgramEditItem[],
};
export type Type_writePrograms_ret = Promise<void>;

export type Type_validateUpdate_args = Type_DbProgramEditItem;
export type Type_validateUpdate_ret  = void; // eslint-disable-line @typescript-eslint/no-invalid-void-type

export type Type_genUpdateItem_args = Type_DbProgramEditItem;
export type Type_genUpdateItem_ret  = TransactWriteItem;

export type Type_genUpdateHistoryItemCommand_args = Type_DbProgramEditItem;
export type Type_genUpdateHistoryItemCommand_ret  = TransactWriteItem;

export interface Type_genUpdateHistoryCommandParams_args {
	programs       : Type_DbProgramEditItem[],
	actualPrograms : Type_DbProgramEditItem[],
};
export type Type_genUpdateHistoryCommandParams_ret = TransactWriteItem[];

export interface Type_genUpdateCommandParams_args {
	programs       : Type_DbProgramItem[],
	actualPrograms : Type_DbProgramItem[]
}
export type Type_genUpdateCommandParams_ret = TransactWriteCommandInput;

export interface Type_updateProgramsHelper_args {
	dbDocClient: DynamoDBDocumentClient,
	programs:    Type_DbProgramItem[],
};
export type Type_updateProgramsHelper_ret = Promise<void>;

export type Type_sortPrograms_args = Type_DbProgramItem[];
export type Type_sortPrograms_ret  = Type_DbProgramItem[];

export type Type_loadProgramsHelper_args = DynamoDBDocumentClient;
export type Type_loadProgramsHelper_ret  = Promise<Type_DbProgramItem[]>;

export type Type_clearProgramsHelper_args = DynamoDBDocumentClient;
export type Type_clearProgramsHelper_ret  = Promise<void>;

export interface Type_saveProgramsHelper_args {
	dbDocClient: DynamoDBDocumentClient,
	programs:    Type_DbProgramEditItem[],
};
export type Type_saveProgramsHelper_ret = Promise<void>;

export type Type_resetDb_args = GipDynamoDB | null;

export type Type_loadPrograms_ret = Promise<Type_DbProgramEditItem[]>;

export interface Type_savePrograms_args { programs: Type_DbProgramEditItem[] };
export type Type_savePrograms_ret = Promise<void>;

export interface Type_updatePrograms_args { programs: Type_DbProgramEditItem[] };
export type Type_updatePrograms_ret = Promise<void>;

////////////////////////////////////////////////////////////////////////////////
// Constants

const MODULE_NAME = 'gip_db_dynamodb_utils';

const AWS_REGION               = process.env.AWS_REGION   || 'eu-west-1';         // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
const STAGE                    = process.env.STAGE        || 'dev';               // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
const SERVICE_NAME             = process.env.SERVICE_NAME || 'gip-edit-react';    // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
const IS_LOCAL                 = ( process.env.IS_LOCAL ? true : false );
const LOCAL_DYNAMO_DB_ENDPOINT = process.env.LOCAL_DYNAMO_DB_ENDPOINT || null;    // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
const GIP_MAX_PROGRAMS         = parseInt( process.env.GIP_MAX_PROGRAMS || '0' ); // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing

assert( GIP_MAX_PROGRAMS > 0, 'GIP_MAX_PROGRAMS not defined' );

logger.log( 'debug', `${MODULE_NAME}: `, { IS_LOCAL, LOCAL_DYNAMO_DB_ENDPOINT } );

const DEFAULT_DB_CLIENT_CONFIG : DynamoDBClientConfig = {
	region:   AWS_REGION,
	endpoint: ( IS_LOCAL && LOCAL_DYNAMO_DB_ENDPOINT ) ? LOCAL_DYNAMO_DB_ENDPOINT : undefined,
};

const PROGRAM_FIELDS = [
	DB_FIELD_POS,
	DB_FIELD_PID,
	DB_FIELD_STATUS,
	DB_FIELD_GENRE,
	DB_FIELD_DAY_OF_WEEK,
	DB_FIELD_QUALITY,
	DB_FIELD_TITLE,
	DB_FIELD_SYNOPSIS,
	DB_FIELD_MODIFY_TIME,
	DB_FIELD_IMAGE_URI,
	DB_FIELD_DOWNLOAD_TIME,
] as Type_DbProgramItemPropName[];

const TABLE_PROGRAM         = [ STAGE, SERVICE_NAME, 'Program' ].join( '_' );
const TABLE_PROGRAM_HISTORY = [ STAGE, SERVICE_NAME, 'ProgramHistory' ].join( '_' );
const ARR_HISTORY_STATUSES  = [ VALUE_STATUS_SUCCESS, VALUE_STATUS_ERROR, VALUE_STATUS_ALREADY ];

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

/**
 * @param object with properties:
 *         - program:    a program object in DB format;
 *         - programPos: identifies the position of the program in the list.
 * @returns a program object in regular format.
 */
function genDbRecord( { program, programPos } : Type_genDbRecord_args ) : Type_genDbRecord_ret {

	const cookedRecord = JSON.parse( JSON.stringify( program ) ) as Record<string,unknown>;

	if ( ! cookedRecord[ DB_FIELD_DAY_OF_WEEK ] ) { // If the day of the week is null, delete the field
		delete cookedRecord[ DB_FIELD_DAY_OF_WEEK ]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
	}

	cookedRecord[ DB_FIELD_MODIFY_TIME ] = cookedRecord[ DB_FIELD_MODIFY_TIME ] ?? new Date().toISOString();
	cookedRecord[ DB_FIELD_POS ]         = programPos;

	return cookedRecord as unknown as Type_DbProgramItem;
}

/**
 * @param program: a program object.
 * @returns a program object suitable for writing to the database.
 */
function genDbHistoryRecord( program : Type_genDbHistoryRecord_args ) : Type_genDbHistoryRecord_ret {

	const cookedRecord = JSON.parse( JSON.stringify( program ) ) as Record<string,unknown>;

	delete cookedRecord[ DB_FIELD_DAY_OF_WEEK ]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
	delete cookedRecord[ DB_FIELD_POS ];         // eslint-disable-line @typescript-eslint/no-dynamic-delete

	const strTime = new Date().toISOString();
	cookedRecord[ DB_FIELD_MODIFY_TIME ]   = strTime;
	cookedRecord[ DB_FIELD_DOWNLOAD_TIME ] = strTime;

	return cookedRecord as unknown as Type_DbProgramHistoryItem;
}

/**
 * @param {object} with properties:
 *          - dbClient:  DB client;
 *          - tableName: the table name.
 * @returns array of program records, e.g., [ { "mykey": "keyval", ... } ]
 */
async function loadTable( { dbDocClient, tableName } : Type_loadTable_args ) : Type_loadTable_ret {
	const commandParams : ScanCommandInput = {
		TableName: tableName,
	};
	let lastEvaluatedKey = null;
	const programs : Type_DbProgramItem[] = [];

	logger.log( 'debug', `${MODULE_NAME}: loadTable`, { tableName } );

	try {
		do {
			if ( lastEvaluatedKey ) {
				commandParams.ExclusiveStartKey = lastEvaluatedKey;
			}
			logger.log( 'debug', `${MODULE_NAME}: loadTable: scan: BEGIN`, { tableName } ); // Scan is correct as table will have a max of 20 items
			const command                      = new ScanCommand( commandParams );
			const response : ScanCommandOutput = await dbDocClient.send( command );
			lastEvaluatedKey = response.LastEvaluatedKey ?? null;
			if ( response.Items ) {
				programs.push( ...response.Items as Type_DbProgramItem[] ); // Database type is guaranteed to be Type_DbProgramItem[]
			}
		} while ( lastEvaluatedKey );
		logger.log( 'debug', `${MODULE_NAME}: loadTable: END: `, { tableName, programs } );
	}
	catch ( err ) {
		logger.log( 'error', `${MODULE_NAME}: loadTable: error`, { tableName, errMessage: ( err as Error ).message, stack: ( err as Error ).stack } );
		throw err;
	}

	return programs;
}

/**
 * @param rawProgram : program object in DB format;
 * @returns program object in regular format.
 */
function extractProgram( rawProgram: Type_extractProgram_args ) : Type_extractProgram_ret {
	// @ts-expect-error initialise empty object then fill it up
	const cookedProgram : Type_DbProgramItem = {};

	PROGRAM_FIELDS.forEach( field => {
		if ( field in rawProgram ) {
			// @ts-expect-error the types of the values vary between fields
			cookedProgram[ field ] = rawProgram[ field ];
		}
	} );

	return cookedProgram;
}

/**
 * @param {Array} records : array of raw records, e.g., [ { "mykey": { "S": "keyval" }, ... } ]
 * @returns array of cooked records, e.g., [ { "mykey": "keyval" }, ... ]
 */
function extractPrograms( rawPrograms : Type_extractPrograms_args ) : Type_extractPrograms_ret {
	const programs : Type_DbProgramItem[] = [];

	rawPrograms.forEach( rec => {
		const cookedProgram = extractProgram( rec );
		programs.push( cookedProgram );
	} );

	return programs;
}

/**
 * @param records: array of one or more program items, e.g., [ { pid: '1234z', ... }, ... ]
 * @returns an object suitable for passing to BatchWriteItem to delete records.
 */
function genDeleteCommandParams( programs : Type_genDeleteCommandParams_args ) : Type_genDeleteCommandParams_ret {
	const arrRequest    : WriteRequest[]         = [];
	const commandParams : BatchWriteCommandInput = {
		RequestItems: {
			[TABLE_PROGRAM]: arrRequest,
		}
	};

	logger.log( 'debug', `${MODULE_NAME}: genDeleteCommandParams: BEGIN: `, { programs } );

	assert( programs.length > 0, 'No programs specified' ); // Caller to check this

	for ( const rec of programs ) {
		const thisRequest : WriteRequest = {
			DeleteRequest: {
				Key: {
					//[DB_FIELD_PID]: { S: rec[ DB_FIELD_PID ] },
					// @ts-expect-error - there does not appear to be a lib type for WriteRequest
					[DB_FIELD_PID]: rec[ DB_FIELD_PID ],
				},
			},
		};
		arrRequest.push( thisRequest );
	}

	logger.log( 'debug', `${MODULE_NAME}: genDeleteCommandParams: END: `, { commandParams } );

	return commandParams;
}

/**
 * @param object with properties:
 *          - dbDocClient: database document client;
 *          - programs:    array of program objects to delete (only pid property required)
 * @exception if the DB request fails.
 */
async function deletePrograms( { dbDocClient, programs } : Type_deletePrograms_args ) : Type_deletePrograms_ret {
	logger.log( 'debug', `${MODULE_NAME}: deletePrograms: BEGIN: `, { programs } );
	if ( programs.length > 0 ) {
		const commandParams = genDeleteCommandParams( programs );
		const command       = new BatchWriteCommand( commandParams );
		const result        = await dbDocClient.send( command );
		// No need to check for UnprocessedItems as the table is small and we delete all items
		logger.log( 'debug', `${MODULE_NAME}: deletePrograms: END: `, { result } );
	} else {
		logger.log( 'debug', `${MODULE_NAME}: deletePrograms: END: success, table already empty` );
	}
}

/**
 * @param records: array of one or more DB records, e.g., [ { pid: { S: '1234z' }, ... }, ... ]
 * @returns an object suitable for passing to BatchWriteItem to write records.
 */
function genWriteCommandParams( programs : Type_genWriteCommandParams_args ) : Type_genWriteCommandParams_ret {
	const arrRequest   : WriteRequest[] = [];
	const commandParams: BatchWriteCommandInput = {
		RequestItems: {
			[TABLE_PROGRAM]: arrRequest,
		}
	};

	logger.log( 'debug', `${MODULE_NAME}: genWriteCommandParams: BEGIN: `, { programs } );

	assert( programs.length > 0, 'No programs specified' ); // Caller to check this

	for ( let i = 0; i < programs.length; i++ ) {
		const program    = programs[ i ];
		const programPos = i + 1;
		const thisRequest : WriteRequest = {
			PutRequest: {
				// @ts-expect-error - there does not appear to be a lib type for WriteRequest
				Item: genDbRecord( { program, programPos } ),
			}
		};
		arrRequest.push( thisRequest );
	}

	logger.log( 'debug', `${MODULE_NAME}: genWriteCommandParams: END: `, { commandParams } );

	return commandParams;
}

/**
 * @param object with properties:
 *          - dbDocClient: database document client;
 *          - programs:    array of program objects to save.
 * @exception if the DB request fails.
 */
async function writePrograms( { dbDocClient, programs } : Type_writePrograms_args ) : Type_writePrograms_ret {

	logger.log( 'debug', `${MODULE_NAME}: writePrograms: BEGIN: `, { programs } );

	if ( programs.length > 0 ) {
		const commandParams = genWriteCommandParams( programs );
		const command       = new BatchWriteCommand( commandParams );
		await dbDocClient.send( command );
	}

	logger.log( 'debug', `${MODULE_NAME}: writePrograms: END` );
}

/**
 * @param program the program object to validate.
 * @exception if the program does not contain a 'pid' property.
 * @exception if the program does not contain a 'status' property.
 */
function validateUpdate( program: Type_validateUpdate_args ) : Type_validateUpdate_ret {

	logger.log( 'debug', `${MODULE_NAME}: validateUpdate: BEGIN` );

	const pid    = program[ DB_FIELD_PID ];
	const status = program[ DB_FIELD_STATUS ];

	if ( ! pid ) {
		throw new HttpError( { statusCode: 400, message: 'Invalid PID' } );
	}
	if ( ! ARR_HISTORY_STATUSES.includes( status ) ) {
		throw new HttpError( { statusCode: 400, message: 'Invalid Status' } );
	}

	logger.log( 'debug', `${MODULE_NAME}: validateUpdate: END` );
}

/**
 * @param program the program object to be updated.
 * @returns a TransactItems object to update the program in the database.
 */
function genUpdateItem( program: Type_genUpdateItem_args ) : Type_genUpdateItem_ret {

	logger.log( 'debug', `${MODULE_NAME}: genUpdateItem: BEGIN` );

	validateUpdate( program );

	const { [DB_FIELD_PID] : pid, [DB_FIELD_STATUS] : status } = program;

	const writeItem : TransactWriteItem = {
		Update: {
			TableName:                 TABLE_PROGRAM,
			Key:                       { [DB_FIELD_PID]: pid },
			ExpressionAttributeNames:  { '#S': DB_FIELD_STATUS },
			ExpressionAttributeValues: { ':s': status },
			UpdateExpression:          'SET #S = :s',
		},
	};

	logger.log( 'debug', `${MODULE_NAME}: genUpdateItem: END: `, writeItem );

	return writeItem;
}

/**
 * @param program : the program object to be written to the history table.
 * @returns transact write item to update the history table.
 */
function genUpdateHistoryItemCommand( program: Type_genUpdateHistoryItemCommand_args ) : Type_genUpdateHistoryItemCommand_ret {

	logger.log( 'debug', `${MODULE_NAME}: genUpdateHistoryItemCommand: BEGIN` );

	const writeItem : TransactWriteItem = {
		Put: {
			TableName: TABLE_PROGRAM_HISTORY,
			Item:      genDbHistoryRecord( program ),
		},
	};

	logger.log( 'debug', `${MODULE_NAME}: genUpdateHistoryItemCommand: END: `, writeItem );

	return writeItem;
}

/**
 * @param object with properties:
 *          - programs:       array of program objects;
 *          - actualPrograms: array of actual program objects in the database.
 * @returns a TransactWriteItem array to update the history table with any status changes.
 * @exception if a program in the update list does not exist in the actual programs.
 */
function genUpdateHistoryCommandParams( { programs, actualPrograms } : Type_genUpdateHistoryCommandParams_args ) : Type_genUpdateHistoryCommandParams_ret {
	const arrWriteItem = [] as TransactWriteItem[];

	logger.log( 'debug', `${MODULE_NAME}: genUpdateHistoryCommandParams: BEGIN` );

	for ( const updateProgram of programs ) {
		const { [DB_FIELD_PID] : pid, [DB_FIELD_STATUS] : status } = updateProgram;
		const program = actualPrograms.find( e => e[ DB_FIELD_PID ] === pid );
		if ( ! program ) {
			throw new HttpError( { statusCode: 400, message: `Program not found: ${pid}` } );
		}
		program[ DB_FIELD_STATUS ] = status;
		const thisWriteItem        = genUpdateHistoryItemCommand( program );
		arrWriteItem.push( thisWriteItem );
	}

	logger.log( 'debug', `${MODULE_NAME}: genUpdateHistoryCommandParams: END` );

	return arrWriteItem;
}

/**
 * @param object with properties:
 *          - programs:       array of program objects to update;
 *          - actualPrograms: array of actual program objects in the database.
 * @returns TransactWriteCommandInput object to update the programs and the program history in the database.
 * @exception if a program in the update list does not exist in the actual programs.
 */
function genUpdateCommandParams( { programs, actualPrograms } : Type_genUpdateCommandParams_args ) : Type_genUpdateCommandParams_ret {
	const arrWriteItem : TransactWriteItem[]       = [];
	const commandParams: TransactWriteCommandInput = {
		TransactItems: arrWriteItem,
	};

	logger.log( 'debug', `${MODULE_NAME}: genUpdateCommandParams: BEGIN` );

	for ( const program of programs ) {
		const thisWriteItem = genUpdateItem( program as Type_DbProgramEditItem );
		arrWriteItem.push( thisWriteItem );
	}

	const arrHistoryWriteItems = genUpdateHistoryCommandParams( { programs, actualPrograms } as Type_genUpdateHistoryCommandParams_args );
	arrWriteItem.push( ...arrHistoryWriteItems );

	logger.log( 'debug', `${MODULE_NAME}: genUpdateCommandParams: END: `, { arrWriteItem } );

	return commandParams;
}

/**
 * @param rawPrograms array of program items in DB format.
 * @returns the array of program items, sorted by position.
 */
function sortPrograms( rawPrograms: Type_sortPrograms_args ) : Type_sortPrograms_ret {
	logger.log( 'debug', `${MODULE_NAME}: sortPrograms: BEGIN` );
	rawPrograms.sort( ( a, b ) => {
		return a[ DB_FIELD_POS ] - b[ DB_FIELD_POS ];
	} );
	logger.log( 'debug', `${MODULE_NAME}: sortPrograms: END` );
	return rawPrograms;
}

/**
 * @param dbDocClient : DynamoDBDocumentClient object to access the database.
 * @returns a promise to return an array of program items in DB format.
 * @exception if a DB error occurs.
 */
async function loadProgramsHelper( dbDocClient: Type_loadProgramsHelper_args ) : Type_loadProgramsHelper_ret {
	logger.log( 'debug', `${MODULE_NAME}: loadProgramsHelper: BEGIN` );
	const records           = await loadTable( { dbDocClient, tableName: TABLE_PROGRAM } );
	const unorderedPrograms = extractPrograms( records );
	const programs          = sortPrograms( unorderedPrograms );
	logger.log( 'debug', `${MODULE_NAME}: loadProgramsHelper: END`, { programs } );
	return programs;
}

/**
 * @param dbDocClient : DynamoDBDocumentClient object to access the database.
 * @exception if a DB error occurs.
 */
async function clearProgramsHelper( dbDocClient: Type_clearProgramsHelper_args ) : Type_clearProgramsHelper_ret {
	logger.log( 'debug', `${MODULE_NAME}: clearProgramsHelper: BEGIN` );
	const programs = await loadProgramsHelper( dbDocClient );
	if ( programs.length > 0 ) {
		await deletePrograms( { dbDocClient, programs } );
		logger.log( 'debug', `${MODULE_NAME}: clearProgramsHelper: END` );
	} else {
		logger.log( 'debug', `${MODULE_NAME}: clearProgramsHelper: END: table already empty` );
	}
}

/**
 * @param object with properties:
 *                - dbDocClient : DynamoDBDocumentClient object to access the database;
 *                - programs    : array of programs to save.
 * @exception if the number of programs exceeds the defined limit.
 * @exception if a DB error occurs.
 */
async function saveProgramsHelper( { dbDocClient, programs } : Type_saveProgramsHelper_args ) : Type_saveProgramsHelper_ret {
	logger.log( 'debug', `${MODULE_NAME}: saveProgramsHelper: BEGIN: `, { programs } );
	if ( programs.length > GIP_MAX_PROGRAMS ) {
		throw new HttpError( { statusCode: 400, message: `Too many programs ${JSON.stringify( { numPrograms: programs.length, max: GIP_MAX_PROGRAMS } )}` } );
	}

	await clearProgramsHelper( dbDocClient );
	if ( programs.length > 0 ) {
		await writePrograms( { dbDocClient, programs } );
	} else {
		logger.log( 'debug', `${MODULE_NAME}: saveProgramsHelper: no programs to save` );
	}
	logger.log( 'debug', `${MODULE_NAME}: saveProgramsHelper: success`, { programs } );
	logger.log( 'info',  `${MODULE_NAME}: saveProgramsHelper: success` );
}

/**
 * Update the program status and store the program in the program history.
 * @param object with properties:
 *                - dbDocClient : DynamoDBDocumentClient object to access the database;
 *                - programs    : array of programs to update.
 * @exception if a DB error occurs.
 */
async function updateProgramsHelper( { dbDocClient, programs } : Type_updateProgramsHelper_args ) : Type_updateProgramsHelper_ret {
	try {
		logger.log( 'debug', `${MODULE_NAME}: updateProgramsHelper: BEGIN: `, { programs } );
		const actualPrograms = await loadProgramsHelper( dbDocClient );
		const commandParams  = genUpdateCommandParams( { programs, actualPrograms } as Type_genUpdateCommandParams_args );
		const command        = new TransactWriteCommand( commandParams );
		await dbDocClient.send( command );
		logger.log( 'debug', `${MODULE_NAME}: updateProgramsHelper: END` );
	}
	catch ( err ) {
		logger.log( 'error', `${MODULE_NAME}: updatePrograms: failed: `, { message: ( err as Error ).message, stack: ( err as Error ).stack } );
		throw err;
	}
}

export class GipDynamoDB { // exported for unit test purposes
	config:      DynamoDBClientConfig;
	dbClient:    Nullable<DynamoDBClient>         = null;
	dbDocClient: Nullable<DynamoDBDocumentClient> = null;

	constructor( { config } : { config: Nullable<DynamoDBClientConfig> } = { config: DEFAULT_DB_CLIENT_CONFIG } ) {
		this.config = config!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		this.createClient();
	}

	/**
	 * Free up resources for this object
	 */
	destroy() : void {
		logger.log( 'debug', `${MODULE_NAME}: GipDynamoDB:destroy: BEGIN` );
		if ( this.dbClient ) {
			logger.log( 'debug', `${MODULE_NAME}: GipDynamoDB:destroying` );
			this.dbClient.destroy();
			this.dbClient    = null;
			this.dbDocClient = null;
		}
		logger.log( 'debug', `${MODULE_NAME}: GipDynamoDB:destroy: END` );
	}

	/**
	 * Create a DynamoDBClient and DynamoDBDocumentClient
	 */
	createClient() : void {
		logger.log( 'debug', `${MODULE_NAME}: GipDynamoDB:createClient: BEGIN` );
		if ( ! this.dbClient ) {
			try {
				logger.log( 'debug', `${MODULE_NAME}: GipDynamoDB:createClient: creating client: `, { config: this.config } );
				this.dbClient    = new DynamoDBClient( this.config );
				this.dbDocClient = DynamoDBDocumentClient.from( this.dbClient );
			}
			catch ( err ) {
				logger.log( 'error', `${MODULE_NAME}: GipDynamoDB:createClient: ${( err as Error ).message}`, ( err as Error ).stack );
				throw err;
			}
		}
		logger.log( 'debug', `${MODULE_NAME}: GipDynamoDB:createClient: END` );
	}

	/**
	 * @returns the DB document client.
	 * @exception if no client has been created.
	 */
	getDocClient() : DynamoDBDocumentClient {
		if ( ! this.dbDocClient ) {
			throw new Error( 'DB not configured' );
		}
		return this.dbDocClient;
	}
};

/**
 * Utility function to free up any DB resources.
 * @param objDb : optional DB resource object.
 */
function resetDb( objDb : Type_resetDb_args ) : void {
	if ( objDb ) {
		logger.log( 'debug', `${MODULE_NAME}: resetDB: BEGIN` );
		objDb.destroy();
		logger.log( 'debug', `${MODULE_NAME}: resetDB: END` );
	}
}

/**
 * @param {Type_DbProgramItem[]} arrRawProgram : array of program items read from the database.
 * @returns an array of program items suitable for editing.
 */
function postProcessPrograms( arrRawProgram : Type_DbProgramItem[] ) : Type_DbProgramEditItem[] {
	const arrCookedProgram = [] as Type_DbProgramEditItem[];
	for ( const rawProgram of arrRawProgram ) {
		arrCookedProgram.push( genProgramEditItem( rawProgram ) );
	}
	return arrCookedProgram;
}

////////////////////////////////////////
// Exported definitions

/**
 * @returns array of program objects.
 */
export async function loadPrograms() : Type_loadPrograms_ret {
	let   objDb = null;
	let   programs : Type_DbProgramEditItem[] = [];
	try {
		logger.log( 'debug', `${MODULE_NAME}: loadPrograms: BEGIN` );
		objDb    = new GipDynamoDB();
		const rawPrograms = await loadProgramsHelper( objDb.getDocClient() );
		programs = postProcessPrograms( rawPrograms );
		logger.log( 'debug', `${MODULE_NAME}: loadPrograms: END: `, { programs } );
	}
	catch ( err ) {
		logger.log( 'error', `${MODULE_NAME}: loadPrograms: failed: `, { message: ( err as Error ).message, stack: ( err as Error ).stack } );
		throw err;
	}
	finally {
		resetDb( objDb );
	}

	return programs;
}

/**
 * Save the programs in the database.
 * @param object with properties:
 *         - programs: array of program objects.
 * @exception if a database error occurs.
 */
export async function savePrograms( { programs } : Type_savePrograms_args ) : Type_savePrograms_ret {
	let objDb = null;
	try {
		logger.log( 'debug', `${MODULE_NAME}: savePrograms: BEGIN: `, { programs } );
		objDb = new GipDynamoDB();
		await saveProgramsHelper( { dbDocClient: objDb.getDocClient(), programs } );
		logger.log( 'debug', `${MODULE_NAME}: savePrograms: END` );
	}
	catch ( err ) {
		logger.log( 'error', `${MODULE_NAME}: savePrograms: failed: `, { message: ( err as Error ).message, stack: ( err as Error ).stack } );
		throw err;
	}
	finally {
		resetDb( objDb );
	}
}

/**
 * @param object with properties:
 *         - programs: array of program objects, however only the following fields are required:
 *                      - pid:    identifies the program;
 *                      - status: the status of the object.
 */
export async function updatePrograms( { programs } : Type_updatePrograms_args ) : Type_updatePrograms_ret
{
	let objDb  = null;
	try {
		logger.log( 'debug', `${MODULE_NAME}: updatePrograms: BEGIN: `, { programs } );
		objDb = new GipDynamoDB();
		await updateProgramsHelper( { dbDocClient: objDb.getDocClient(), programs: ( programs as Type_DbProgramItem[] ) } );
		logger.log( 'debug', `${MODULE_NAME}: updatePrograms: END` );
	}
	catch ( err ) {
		logger.log( 'error', `${MODULE_NAME}: updatePrograms: failed: `, { message: ( err as Error ).message, stack: ( err as Error ).stack } );
		throw err;
	}
	finally {
		resetDb( objDb );
	}
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions

export const privateDefs = {};

if ( process.env.NODE_ENV === 'test-unit' ) {
	Object.assign( privateDefs, {
		DEFAULT_DB_CLIENT_CONFIG,
		STAGE,
		SERVICE_NAME,
		genDbRecord,
		genDbHistoryRecord,
		loadTable,
		extractPrograms,
		genDeleteCommandParams,
		deletePrograms,
		genWriteCommandParams,
		writePrograms,
		validateUpdate,
		genUpdateItem,
		genUpdateHistoryItemCommand,
		genUpdateHistoryCommandParams,
		genUpdateCommandParams,
		loadProgramsHelper,
		clearProgramsHelper,
		saveProgramsHelper,
		updateProgramsHelper,
		sortPrograms,
		resetDb,
	} );
}
