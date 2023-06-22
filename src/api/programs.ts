
import { loadProgs, saveProgs, updateProgs }                 from '../utils/gip_db_dynamodb_utils';
import { Context, APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import logger                                                from '@rhobweb/console-logger';

//import {
//  DB_FIELD_STATUS, DB_FIELD_GENRE, DB_FIELD_DAY_OF_WEEK, DB_FIELD_QUALITY, DB_FIELD_SYNOPSIS,
//  VALUE_STATUS_PENDING, VALUE_STATUS_ERROR, VALUE_STATUS_SUCCESS
//}
//from '../../utils/gip_prog_fields';
import { filterPrograms }                                       from '../utils/gip_prog_filter_utils';
import { parseQueryParams, stringifyUTF16, TypeRawQueryParams } from '../utils/gip_http_utils';
import { TypeDbProgramItem }                                    from '../utils/gip_prog_fields';

type TypeHandlerResponse = {
  statusCode: Number,
  headers?:   Record<string,any>,
  body?:      string,
};

/**
 * @param {*} req : the request object, with properties:
 *                  - query : the query parameters:
 *                            - current:    return current day items;
 *                            - downloaded: include already downloaded programs.
 * @returns 
 */
async function handleGET( event: APIGatewayEvent ) : Promise<TypeHandlerResponse> {
  const result : TypeHandlerResponse = {
    statusCode: 200,
  };
  try {
    const rawQueryParams = event.queryStringParameters || {};
    const params         = parseQueryParams( rawQueryParams as TypeRawQueryParams );
    logger.log( 'debug', 'handleGET: START: ', { params } );
    const programs       = await loadProgs();
    logger.log( 'debug', 'handleGET: filterPrograms: START' );
    const cookedPrograms = filterPrograms( { programs, params } );
    logger.log( 'debug', 'handleGET: filterPrograms: success: ', cookedPrograms );
    const body           = stringifyUTF16( cookedPrograms );
    logger.log( 'debug', 'handleGET: stringifyUTF16: success: ', body );
  
    //console.log( 'handleGET: ', { result: cookedPrograms } );
    const headers        = {
      'Content-Type':   'application/json; charset=UTF-16',
      'Content-Length': body.length,
      //'Access-Control-Allow-Origin': '*',
      //'Access-Control-Allow-Methods': [ 'GET', 'POST', 'OPTIONS' ],
      //'Access-Control-Allow-Headers': '*',
     };
    result.headers = headers;
    result.body    = body;
  }
  catch ( err ) {
    result.statusCode = err.statusCode || 500;
  }

   return result;
}

async function handlePOST( event: APIGatewayEvent ) : Promise<TypeHandlerResponse> {
  const result : TypeHandlerResponse = {
    statusCode: 200,
  };
  try {
    const rawBody = event.body || '[]';
    const programs : TypeDbProgramItem[] = JSON.parse( rawBody );
    logger.log( 'debug', 'handlePOST: START: ', { programs } );
    const newPrograms = await saveProgs( { programs } );
    logger.log( 'debug', 'handlePOST: saveProgs: success: ', newPrograms );
    const strPrograms = stringifyUTF16( newPrograms );
    logger.log( 'debug', 'handlePOST: stringifyUTF16: success: ', strPrograms );
    const headers = {
      'Content-Type':  'application/json; charset=UTF-16',
      'Content-Length': strPrograms.length,
      //'Access-Control-Allow-Origin': '*',
      //'Access-Control-Allow-Methods': [ 'GET', 'POST', 'OPTIONS' ],
      //'Access-Control-Allow-Headers': '*',
     };
     result.headers = headers;
     result.body    = strPrograms;
  }
  catch ( err ) {
    result.statusCode = err.statusCode || 500;
  }

  return result;
}

async function handlePATCH( event: APIGatewayEvent ) : Promise<TypeHandlerResponse> {
  const result = {
    statusCode: 200,
  };
  try {
    const rawBody                           = event.body || '[]';
    const newPrograms : TypeDbProgramItem[] = JSON.parse( rawBody );
    logger.log( 'debug', 'handlePATCH: programs: ', newPrograms );
    await updateProgs( { programs: newPrograms } );
  }
  catch ( err ) {
    result.statusCode = err.statusCode || 500;
  }
  return result;
}

async function handleUnsupported( event: APIGatewayEvent ) : Promise<TypeHandlerResponse> {
  //const headers = {
  //  'Content-Type': 'text/plain',
  //  'Content-Length': 0,
  // };
  return {
    statusCode: 404,
    //headers,
  };
}

export async function handler( event: APIGatewayEvent, _context: Context ): Promise<APIGatewayProxyResultV2> {
  logger.log( 'info',  `handler:BEGIN: `, { httpMethod: event.httpMethod, path: event.path } );
  logger.log( 'debug', `handler:programs: `, { event } );

  const METHOD_HANDLER : Record<string, Function> = {
    'GET':     handleGET,
    'POST':    handlePOST,
    'PATCH':   handlePATCH,
    'default': handleUnsupported,
  };

  const method    = event.httpMethod || 'default'; // 'method' may be undefined
  const fnHandler = METHOD_HANDLER[ method ] || METHOD_HANDLER.default;

  const result = await fnHandler( event );

  logger.log( 'info: handler: END ', { httpMethod: event.httpMethod, path: event.path, statusCode: result.statusCode } );

  return result;
}

export default { handler };
