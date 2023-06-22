
//import logger from '@rhobweb/console-logger';
import {
  DynamoDBClient, DynamoDBClientConfig, ScanCommand, ScanCommandInput, ScanCommandOutput,
  BatchWriteItemCommandInput, BatchWriteItemCommand, WriteRequest, AttributeValue,
  TransactWriteItem, TransactWriteItemsCommandInput, TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb';
//import { DynamoDBDocumentClient, PutItemCommand                     } from '@aws-sdk/lib-dynamodb';
import process    from 'node:process';
import assert     from 'node:assert';
import logger     from '@rhobweb/console-logger';

const AWS_REGION               = process.env.AWS_REGION   || 'eu-west-1';
const STAGE                    = process.env.STAGE        || 'dev';
const IS_LOCAL                 = ( process.env.IS_LOCAL === 'true' ? true : false );
const LOCAL_DYNAMO_DB_ENDPOINT = process.env.LOCAL_DYNAMO_DB_ENDPOINT || null;

assert( AWS_REGION, 'AWS_REGION not defined' );
assert( STAGE,      'STAGE not defined' );

const MODULE_NAME = 'gip_db_dynamodb_utils';

const DEFAULT_DB_CLIENT_CONFIG : DynamoDBClientConfig = {
  region: AWS_REGION,
};

if ( IS_LOCAL && LOCAL_DYNAMO_DB_ENDPOINT ) {
  DEFAULT_DB_CLIENT_CONFIG.endpoint = LOCAL_DYNAMO_DB_ENDPOINT;
}

import {
  DB_FIELD_STATUS, DB_FIELD_PID, DB_FIELD_TITLE, DB_FIELD_SYNOPSIS, DB_FIELD_GENRE, DB_FIELD_QUALITY, DB_FIELD_MODIFY_TIME, DB_FIELD_DOWNLOAD_TIME, DB_FIELD_DAY_OF_WEEK, DB_FIELD_POS, DB_FIELD_IMAGE_URI,
  VALUE_STATUS_ERROR, VALUE_STATUS_SUCCESS, VALUE_STATUS_ALREADY, TypeDbProgramItem
} from './gip_prog_fields';

type TYPE_DB_RECORD = Record< string, AttributeValue >;

const DB_FIELD_TYPES : Record<string,string> = {
  [DB_FIELD_PID]:           "S",
  [DB_FIELD_STATUS]:        "S",
  [DB_FIELD_GENRE]:         "S",
  [DB_FIELD_DAY_OF_WEEK]:   "S",
  [DB_FIELD_QUALITY]:       "S",
  [DB_FIELD_TITLE]:         "S",
  [DB_FIELD_SYNOPSIS]:      "S",
  [DB_FIELD_MODIFY_TIME]:   "S",
  [DB_FIELD_IMAGE_URI]:     "S",
  [DB_FIELD_POS]:           "N",
  [DB_FIELD_DOWNLOAD_TIME]: "S",
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
];

const TABLE_PROGRAM           = `${STAGE}_gip-edit-react_Program`;
const TABLE_PROGRAM_HISTORY   = `${STAGE}_gip-edit-react_ProgramHistory`;
//const QUERY_LOAD_PROGRAMS     = `SELECT * FROM ${TABLE_PROGRAM} ORDER BY ${DB_FIELD_POS}`;
const ARR_PROG_FIELD          = [ DB_FIELD_STATUS, DB_FIELD_PID, DB_FIELD_TITLE, DB_FIELD_SYNOPSIS, DB_FIELD_GENRE, DB_FIELD_QUALITY, DB_FIELD_DAY_OF_WEEK, DB_FIELD_IMAGE_URI ];
const ARR_PROG_FIELD_WITH_POS = [ ...ARR_PROG_FIELD, DB_FIELD_POS ];
//const ARR_PROG_HISTORY_FIELD = [ DB_FIELD_STATUS, DB_FIELD_PID, DB_FIELD_TITLE, DB_FIELD_SYNOPSIS, DB_FIELD_DAY_OF_WEEK, DB_FIELD_GENRE, DB_FIELD_QUALITY, DB_FIELD_DOWNLOAD_TIME ];
const ARR_PROG_HISTORY_FIELD_MAP = [
  [ DB_FIELD_STATUS,        DB_FIELD_STATUS      ],
  [ DB_FIELD_PID,           DB_FIELD_PID         ],
  [ DB_FIELD_TITLE,         DB_FIELD_TITLE       ],
  [ DB_FIELD_SYNOPSIS,      DB_FIELD_SYNOPSIS    ],
  [ DB_FIELD_GENRE,         DB_FIELD_GENRE       ],
  [ DB_FIELD_QUALITY,       DB_FIELD_QUALITY     ],
  [ DB_FIELD_DOWNLOAD_TIME, DB_FIELD_MODIFY_TIME ],
  [ DB_FIELD_IMAGE_URI,     DB_FIELD_IMAGE_URI   ],
];
const ARR_PROG_HISTORY_FIELD        = ARR_PROG_HISTORY_FIELD_MAP.map( el => el[ 0 ] );
const ARR_PROG_HISTORY_SOURCE_FIELD = ARR_PROG_HISTORY_FIELD_MAP.map( el => el[ 1 ] );

const ARR_HISTORY_STATUSES  = [ VALUE_STATUS_SUCCESS, VALUE_STATUS_ERROR, VALUE_STATUS_ALREADY ];

const UPDATE_QUERY_TEXT     = `
WITH upd AS ( UPDATE ${TABLE_PROGRAM} SET ${DB_FIELD_STATUS} = $1 WHERE ${DB_FIELD_PID} = $2 RETURNING * )
INSERT INTO ${TABLE_PROGRAM_HISTORY} ( ${ARR_PROG_HISTORY_FIELD.join(',')} ) SELECT ${ARR_PROG_HISTORY_SOURCE_FIELD.join(',')} FROM upd
`;

class HttpError extends Error {
  statusCode : number;

  constructor ( { statusCode, message } : { statusCode: number, message: string }) {
    const err : unknown = super( message );
    ( err as HttpError ).statusCode = statusCode;
    return this;
  }
}

function genAttributeValue( { field, value } : { field: string, value: string } ) : AttributeValue {
  let attributeValue : AttributeValue;

  const fieldType = DB_FIELD_TYPES[ field ];
  assert( fieldType, `genAttributeValue: Unknown field type ${fieldType} for ${field}` );

  switch ( fieldType ) {
    case 'S': attributeValue = { S: value }; break;
    case 'N': attributeValue = { N: value }; break;
    default:  assert( false, `Unsupported fieldType ${fieldType}` );
  }

  return attributeValue
}

function extractAttributeValue( { field, attrValue } : { field: string, attrValue: AttributeValue } ) : string | number {
  let value;

  const fieldType = DB_FIELD_TYPES[ field ];
  assert( fieldType, `extractAttributeValue: Unknown field type ${fieldType} for ${field}` );

  switch ( fieldType ) {
    case 'S': value = attrValue.S; break;
    case 'N': value = convertToInt( attrValue.N ); break;
    default: assert( false, `Unsupported fieldType ${fieldType}` );
  }

  assert( value !== undefined, `Value is undefined: ${JSON.stringify( { fieldType, attrValue } )}` );

  return value;
}

function convertToInt( val : string | undefined ) : number {
  let intVal : number;
  assert ( val !== undefined, 'convertToInt: Integer value is undefined' );
  intVal = parseInt( val );
  return intVal;
}

function programToRecord( { program, programPos } : { program: TypeDbProgramItem, programPos: Number } ) : TYPE_DB_RECORD {

  const cookedRecord = JSON.parse( JSON.stringify( program ) );

  if ( ! cookedRecord[ DB_FIELD_DAY_OF_WEEK ] ) {
    delete cookedRecord[ DB_FIELD_DAY_OF_WEEK ];
  }

  if ( ! cookedRecord[ DB_FIELD_MODIFY_TIME ] ) {
    cookedRecord[ DB_FIELD_MODIFY_TIME ] = new Date().toISOString();
  }

  if ( ! cookedRecord[ DB_FIELD_POS ] ) {
    cookedRecord[ DB_FIELD_POS ] = programPos.toString();
  } else {
    cookedRecord[ DB_FIELD_POS ] = cookedRecord[ DB_FIELD_POS ].toString();
  }

  delete cookedRecord[ DB_FIELD_DOWNLOAD_TIME ]; // Not stored in the program table

  const saveRecord : TYPE_DB_RECORD = {};

  Object.entries( cookedRecord ).forEach( ( [ field, value ] : [ string, string ] ) => {
    saveRecord[ field ] = genAttributeValue( { field, value } );
  } );

  return saveRecord;
}

function programToHistoryRecord( program : TypeDbProgramItem ) : TYPE_DB_RECORD {

  const cookedRecord = JSON.parse( JSON.stringify( program ) );

  delete cookedRecord[ DB_FIELD_DAY_OF_WEEK ];
  delete cookedRecord[ DB_FIELD_POS ];

  const strTime = new Date().toISOString();
  cookedRecord[ DB_FIELD_MODIFY_TIME ]   = strTime;
  cookedRecord[ DB_FIELD_DOWNLOAD_TIME ] = strTime;

  const saveRecord : TYPE_DB_RECORD = {};

  Object.entries( cookedRecord ).forEach( ( [ field, value ] : [ string, string ] ) => {
    saveRecord[ field ] = genAttributeValue( { field, value } );
  } );

  return saveRecord;
}

function recordToProgram( rec: TYPE_DB_RECORD ) : TypeDbProgramItem {
  const cookedRecord : Record<string,any> = {};

  PROGRAM_FIELDS.forEach( field => {
    if ( field in rec ) {
      cookedRecord[ field ] = extractAttributeValue( { field, attrValue: rec[ field ] } );
    } else {
      switch ( field ) {
        case DB_FIELD_DAY_OF_WEEK:   cookedRecord[ field ] = null; break;
        case DB_FIELD_DOWNLOAD_TIME: cookedRecord[ field ] = '';   break;
      }
    }
  } );

  return cookedRecord as TypeDbProgramItem;
}

/**
 * @param {object} with properties:
 *          - dbClient:  connected DB client;
 *          - tableName: the table name.
 * @returns array of raw records, e.g., [ { "mykey": { "S": "keyval" }, ... } ]
 */
async function loadTable( { dbClient, tableName } : { dbClient : DynamoDBClient, tableName: string } ) {
  const commandParams : ScanCommandInput = {
    TableName: tableName,
  };
  let lastEvaluatedKey = null;
  let records          = [];

  logger.log( 'debug', `${MODULE_NAME}: loadTable`, { tableName, client: ( dbClient ? true : false ) } );

  try {
    do {
      if ( lastEvaluatedKey ) {
        commandParams.ExclusiveStartKey = lastEvaluatedKey;
      }
      logger.log( 'debug', `${MODULE_NAME}: loadTable: scan: BEGIN`, { tableName } );
      const command                      = new ScanCommand( commandParams );
      const response : ScanCommandOutput = await dbClient.send( command );
      lastEvaluatedKey = response.LastEvaluatedKey || null;
      if ( response.Items ) {
        records.push( ...response.Items );
      }
    } while ( lastEvaluatedKey );
    logger.log( 'debug', `${MODULE_NAME}: loadTable: scan: COMPLETE`, { tableName, records } );
  }
  catch ( err ) {
    logger.log( 'error', `${MODULE_NAME}: loadTable: scan: error`, { tableName, errMessage: err.message, stack: err.stack } );
    throw err;
  }

  return records;
}

/**
 * @param {Array} records : array of raw records, e.g., [ { "mykey": { "S": "keyval" }, ... } ]
 * @returns 
 */
function extractPrograms( records : TYPE_DB_RECORD[] ) : TypeDbProgramItem[] {
  const programs : TypeDbProgramItem[] = [];

  records.forEach( rec => {
    const cookedRecord = recordToProgram( rec );
    programs.push( cookedRecord );
  } );

  //rawResult = {
  //  rows: [
  //    DUMMY_PROGRAM_1,
  //  ],
  //};
  //programs  = rawResult.rows as TypeDbProgramItem[];
  return programs;
}

function genDeleteCommandParams( records : Record<string,any>[] ) {
  const arrRequest   : WriteRequest[] = [];
  const commandParams: BatchWriteItemCommandInput = {
    RequestItems: {
      [TABLE_PROGRAM]: arrRequest
    }
  };

  records.forEach( rec => {
    const thisRequest : WriteRequest = {
      DeleteRequest: {
        Key: {
          [DB_FIELD_PID]: rec[ DB_FIELD_PID ],
        }
      }
    }
    arrRequest.push( thisRequest );
  } );

  return commandParams;
}

function genSaveCommandParams( programs : TypeDbProgramItem[] ) {
  const arrRequest   : WriteRequest[] = [];
  const commandParams: BatchWriteItemCommandInput = {
    RequestItems: {
      [TABLE_PROGRAM]: arrRequest
    }
  };

  for ( let i = 0; i < programs.length; i++ ) {
    const program    = programs[ i ];
    const programPos = i + 1;
    const thisRequest : WriteRequest = {
      PutRequest: {
        Item: programToRecord( { program, programPos } ),
      }
    };
    arrRequest.push( thisRequest );
  }

  return commandParams;
}

function validateUpdate( program: TypeDbProgramItem ) {
  const pid    = program[ DB_FIELD_PID ] || '';
  const status = program[ DB_FIELD_STATUS ];
  if ( pid.length === 0 ) {
    throw new HttpError( { statusCode: 400, message: 'Invalid PID' } );
  }
  if ( ARR_HISTORY_STATUSES.indexOf( status ) < 0 ) {
    throw new HttpError( { statusCode: 400, message: 'Invalid Status' } );
  }
}

function genUpdateItem( program: TypeDbProgramItem ) : TransactWriteItem {
  validateUpdate( program );
  const { [DB_FIELD_PID] : pid, [DB_FIELD_STATUS] : status } = program;
  const thisWriteItem : TransactWriteItem = {
    Update: {
      TableName:                 TABLE_PROGRAM,
      Key:                       { [DB_FIELD_PID]: genAttributeValue( { field: DB_FIELD_PID, value: pid } ) },
      ExpressionAttributeNames:  { '#S': DB_FIELD_STATUS },
      ExpressionAttributeValues: { ':s': { S: status } },
      UpdateExpression:          'SET #S = :s',
    },
  };

  return thisWriteItem
}

function genUpdateHistoryItemCommand( program: TypeDbProgramItem ) : TransactWriteItem {
  const writeItem : TransactWriteItem = {
    Put: {
      TableName: TABLE_PROGRAM_HISTORY,
      Item:      programToHistoryRecord( program ),
    },
  };

  return writeItem;
}

function genUpdateHistoryCommandParams( { programs, actualPrograms } : { programs : TypeDbProgramItem[], actualPrograms : TypeDbProgramItem[] } ) : TransactWriteItem[] {
  const arrWriteItem : TransactWriteItem[] = [];

  for ( let i = 0; i < programs.length; i++ ) {
    const updateProgram                                        = programs[ i ];
    const { [DB_FIELD_PID] : pid, [DB_FIELD_STATUS] : status } = updateProgram;
    const program = actualPrograms.find( e => e[ DB_FIELD_PID ] === pid );
    if ( ! program ) {
      throw new HttpError( { statusCode: 400, message: `Program not found: ${pid}` } );
    }
    program[ DB_FIELD_STATUS ] = status;
    const thisWriteItem        = genUpdateHistoryItemCommand( program );
    arrWriteItem.push( thisWriteItem );
  }

  return arrWriteItem;
}

async function genUpdateCommandParams( { programs, actualPrograms } : { programs : TypeDbProgramItem[], actualPrograms : TypeDbProgramItem[] } ) : Promise<TransactWriteItemsCommandInput> {
  const arrWriteItem : TransactWriteItem[] = [];
  const commandParams: TransactWriteItemsCommandInput = {
    TransactItems: arrWriteItem,
  };

  for ( let i = 0; i < programs.length; i++ ) {
    const program       = programs[ i ];
    const thisWriteItem = genUpdateItem( program );
    arrWriteItem.push( thisWriteItem );
  }

  const arrHistoryWriteItems = genUpdateHistoryCommandParams( { programs, actualPrograms } );
  arrWriteItem.push( ...arrHistoryWriteItems );

  return commandParams;
}

class GipDynamoDB {
  config:      DynamoDBClientConfig;
  dbClient:    Nullable<DynamoDBClient> = null;
  //dbDocClient: Nullable<DynamoDBDocumentClient>;

  constructor( { config } : { config: Nullable<DynamoDBClientConfig> } = { config: DEFAULT_DB_CLIENT_CONFIG } ) {
    this.config = config as DynamoDBClientConfig;
    this.connect();
    //this.dbDocClient = null;
  }

  destroy() {
    if ( this.dbClient ) {
      this.dbClient.destroy();
      this.dbClient    = null;
      //this.dbDocClient = null;
    }
  }

  connect() {
    if ( ! this.dbClient ) {
      try {
        this.dbClient = new DynamoDBClient( this.config );
        //this.dbDocClient = DynamoDBDocumentClient.from( this.dbClient );
      }
      catch ( err ) {
        logger.log( 'error', `${MODULE_NAME}: GipDynamoDB:connect: ${err.message}`, err.stack );
        throw err;
      }
    }
  }

  /**
   * @returns promise to return an array of program items in DB format.
   * @exception if the DB connection or the query fails.
   */
  async loadProgs() : Promise<TypeDbProgramItem[]> {
    let programs : TypeDbProgramItem[] = [];
  
    if ( ! this.dbClient ) {
      throw new Error( 'Not connected' );
    }

    try {
      const records  = await loadTable( { dbClient: this.dbClient, tableName: TABLE_PROGRAM } );
      programs = extractPrograms( records );
      logger.log( 'debug', 'loadProgs: success', { programs } );
    }
    catch ( err ) {
      console.log( 'error', `${MODULE_NAME}: loadProgs: `, { error: err.message, stack: err.stack } );
      throw err;
    }
  
    //const SYNOPSIS = 'My synopsis which is really long as I want to try to get a horizontal scroll bar to be displayed if I can but it is proving troublesome';
    //const programs = [
    //  { pid: 'pid1234', title: 'MyProg', synopsis: SYNOPSIS, day_of_week: '***', genre: 'C', quality: 'Normal' },
    //];
  
    return programs;
  }

  /**
   * @param arrProgram : array of program items;
   * @returns a query object that will insert the programs into the DB.
   */
  //function genSaveQuery( arrProgram: TypeDbProgramItem[] ) : TypeQuery {
  //  const query = {
  //    text:   '',
  //    values: [],
  //  };
  //  const strInsQuery = `INSERT INTO ${TABLE_PROGRAM} ( ${ARR_PROG_FIELD_WITH_POS.join( ', ' )} )`;
  //  const arrPos      = [];
  //  const arrValue    = [];
  //  arrProgram.forEach( ( program, i ) => {
  //    arrValue[ i ] = arrValue[ i ] || [];
  //    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //    // @ts-ignore 'field' only contains valid property names
  //    ARR_PROG_FIELD.forEach( field => arrValue[ i ].push( program[ field ] ) )
  //    arrValue[ i ].push( i ); // Add the pos field value
  //  } );
  //  let iParam = 1;
  //  arrValue.forEach( ( arrRecordValue, i ) => {
  //    arrPos[ i ] = arrPos[ i ] || [];
  //    arrRecordValue.forEach( val => {
  //      arrPos[ i ].push( `$${iParam}` );
  //      ++iParam;
  //      query.values.push( val );
  //    } );
  //  } );
  //  query.text = `${strInsQuery} VALUES( ${ arrPos.map( arrRec => arrRec.join( ',' ) ).join( '),(' ) } ) RETURNING *`;
  //
  //  return query;
  //}

  /**
   * @param program : a program item;
   * @returns a query object that will update the programs into the DB or null if no updates are required.
   */
  //function genUpdateQuery( program: TypeDbProgramItem ) : ( TypeQuery | null ) {
  //  let   query = null;
  //  const newStatus = program[ DB_FIELD_STATUS ];
  //  const pid       = program[ DB_FIELD_PID ];
  //
  //  if ( ARR_HISTORY_STATUSES.indexOf( newStatus ) >= 0 ) {
  //    query = {
  //      text:   UPDATE_QUERY_TEXT,
  //      values: [ newStatus, pid ],
  //    };
  //  }
  //
  //  return query;
  //}

  /**
   * @param arrProgram : array of program items;
   * @return array of query objects to update the database.
   */
  //function genUpdateQueries( arrProgram: TypeDbProgramItem[] ) : TypeQuery[] {
  //  const arrQuery : TypeQuery[] = [];
  //
  //  arrProgram.forEach( prog => {
  //    const query = genUpdateQuery( prog );
  //    if ( query ) {
  //      arrQuery.push( query );
  //    }
  //  } );
  //
  //  return arrQuery;
  //}

  //async function runDeleteQuery() {
  //  const numRecordsDeleted = 0;
  //
  //  //try {
  //  //  const strDelQuery = `DELETE FROM ${TABLE_PROGRAM}`;
  //  //  const result      = await dbClient.query( strDelQuery );
  //  //  numRecordsDeleted = result.rowCount;
  //  //}
  //  //catch ( err ) {
  //  //  logger.log( 'error', 'runDeleteQuery: ', (err as Error).message );
  //  //  throw err;
  //  //}
  //
  //  return numRecordsDeleted;
  //}

  async clearProgs() {
    if ( ! this.dbClient ) {
      throw new Error( 'DB not connected' );
    }
    try {
      const records = await loadTable( { dbClient: this.dbClient, tableName: TABLE_PROGRAM } );
      if ( records.length > 0 ) {
        const commandParams = genDeleteCommandParams( records );
        const command       = new BatchWriteItemCommand( commandParams )
        const result        = await this.dbClient.send( command );
        logger.log( 'debug', 'clearProgs: success', result );
      } else {
        logger.log( 'debug', `clearProgs: success, table already empty` );
      }
    }
    catch ( err ) {
      logger.log( 'error', `clearProgs: clear table failed: ${err.message}` );
      throw err;
    }
  }

  /**
   * @param {Object} with properties:
   *           - programs :  array of program items;
   * @returns array of DB program items.
   */
  async saveProgs( { programs } : { programs: TypeDbProgramItem[] } ) : Promise<TypeDbProgramItem[]> {
    //let dbClient = null;
    let result : TypeDbProgramItem[] = [];

    if ( ! this.dbClient ) {
      throw new Error( 'DB not connected' );
    }

    try {
      await this.clearProgs();
      if ( programs.length > 0 ) {
        const commandParams = genSaveCommandParams( programs );
        const command       = new BatchWriteItemCommand( commandParams )
        await this.dbClient.send( command );
      } else {
        logger.log( 'debug', 'saveProgs: no programs to save' );
      }
      logger.log( 'debug', 'saveProgs: success', { programs } );
      logger.log( 'info',  'saveProgs: success' );
    }
    catch ( err ) {
      logger.log( 'error', `saveProgs: failed: `, { message: err.message, stack: err.stack } );
      throw err;
    }
  
    return programs;
  }

  /**
   * @param object with properties:
   *         - programs: array of program objects, however only the following fields are required:
   *                      - pid:    identifies the program;
   *                      - status: the status of the object.
   */
  async updateProgs( { programs } : { programs: TypeDbProgramItem[] } ) : Promise<void>
  {
    if ( ! this.dbClient ) {
      throw new Error( 'DB not connected' );
    }
  
    try {
      const actualPrograms = await this.loadProgs();
      const commandParams  = await genUpdateCommandParams( { programs, actualPrograms } );
      const command        = new TransactWriteItemsCommand( commandParams )
      await this.dbClient.send( command );
    }
    catch ( err ) {
      logger.log( 'error', `updateProgs: failed: `, { message: err.message, stack: err.stack } );
      throw err;
    }
  }
};

function getDb() : GipDynamoDB {
  const objDb = new GipDynamoDB();
  return objDb;
}

function resetDb( objDb : GipDynamoDB ) {
  if ( objDb ) {
    logger.log( 'debug', 'resetDB: BEGIN' );
    objDb.destroy();
    logger.log( 'debug', 'resetDB: END' );
  }
}

export async function loadProgs() : Promise<TypeDbProgramItem[]> {
  let   objDb = null;
  let   programs : TypeDbProgramItem[] = [];
  try {
    objDb    = getDb();
    programs = await objDb.loadProgs();
  }
  catch ( err ) {
    logger.log( 'error', `loadProgs: `, { message: err.message } );
    throw err;
  }
  finally {
    resetDb( objDb as GipDynamoDB );
  }

  return programs;
}

export async function saveProgs( { programs } : { programs: TypeDbProgramItem[] } ) : Promise<TypeDbProgramItem[]> {
  let objDb = null;
  try {
    objDb    = getDb();
    programs = await objDb.saveProgs( { programs } );
  }
  catch ( err ) {
    logger.log( 'error', `saveProgs: `, { message: err.message } );
    throw err;
  }
  finally {
    resetDb( objDb as GipDynamoDB );
  }

  return programs;
}

/**
 * @param object with properties:
 *         - programs: array of program objects, however only the following fields are required:
 *                      - pid:    identifies the program;
 *                      - status: the status of the object.
 */
export async function updateProgs( { programs } : { programs: TypeDbProgramItem[] } ) : Promise<void>
{
  let objDb  = null;
  try {
    objDb = getDb();
    await objDb.updateProgs( { programs } );
  }
  catch ( err ) {
    logger.log( 'error', `updateProgs: `, { message: err.message } );
    throw err;
  }
  finally {
    resetDb( objDb as GipDynamoDB );
  }
}

export default {};
