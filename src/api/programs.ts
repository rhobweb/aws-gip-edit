/**
 * File:        api/programs.ts
 * Description: The REST API for this application.
 */

////////////////////////////////////////////////////////////////////////////////
// Imports

import {
	loadPrograms,
	savePrograms,
	updatePrograms,
} from '#utils/gip_db_dynamodb_utils';

import {
	APIGatewayEvent,
	APIGatewayProxyStructuredResultV2,
	//Context,
} from 'aws-lambda';

import logger from '@rhobweb/console-logger';

import { filterPrograms } from '#utils/gip_prog_filter_utils';

import {
	HttpError,
	parseQueryParams,
	stringify,
} from '#utils/gip_http_utils';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported

import type { Type_RawQueryParams }    from '../utils/gip_http_utils.ts';
import type { Type_DbProgramEditItem } from '../utils/gip_prog_fields.ts';

////////////////////////////////////////
// Exported and local

export type Type_HandlerResponse = APIGatewayProxyStructuredResultV2;

//export interface Type_HandlerResponse {
//	statusCode: number,
//	headers?:   Record<string,unknown>,
//	body?:      string,
//};

type Type_APIGatewayEventHandler = ( event: APIGatewayEvent ) => Promise<Type_HandlerResponse>;

export type Type_handler_args = APIGatewayEvent;
export type Type_handler_ret  = Promise<Type_HandlerResponse>;

////////////////////////////////////////////////////////////////////////////////
// Constants

const CONTENT_TYPE_JSON = 'application/json; charset=UTF-8';

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

/**
 * @param {*} event : the request object, with properties:
 *                      - queryStringParameters : object containing the query parameters;
 *                          - all:        if set, return all programs;
 *                          - current:    if set, include current day items;
 *                          - downloaded: include already downloaded programs.
 * @returns object with properties:
 *           - statusCode: integer HTTP response code;
 *           - headers:    object containing the HTTP headers;
 *           - body:       stringified JSON body.
 */
async function handleGET( event: APIGatewayEvent ) : Promise<Type_HandlerResponse> {
	const result : Type_HandlerResponse = {
		statusCode: 200,
	};
	try {
		const rawQueryParams = event.queryStringParameters || {}; // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
		const params         = parseQueryParams( rawQueryParams as Type_RawQueryParams );
		logger.log( 'debug', 'handleGET: START: ', { params } );
		const programs       = await loadPrograms();
		logger.log( 'debug', 'handleGET: filterPrograms: START' );
		const cookedPrograms = filterPrograms( { programs, params } );
		logger.log( 'debug', 'handleGET: filterPrograms: success: ', cookedPrograms );
		const body           = stringify( cookedPrograms );
		logger.log( 'debug', 'handleGET: stringify: success: ', body );

		//console.log( 'handleGET: ', { result: cookedPrograms } );
		const headers        = {
			'Content-Type':   CONTENT_TYPE_JSON,
			'Content-Length': body.length,
			//'Access-Control-Allow-Origin': '*',
			//'Access-Control-Allow-Methods': [ 'GET', 'POST', 'OPTIONS' ],
			//'Access-Control-Allow-Headers': '*',
		};
		result.headers = headers;
		result.body    = body;
	}
	catch ( err ) {
		result.statusCode = ( err as HttpError ).statusCode || 500; // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
	}

	return result;
}

/**
 * @param {*} event : the request object, with properties:
 *                      - body : stringified JSON object.
 * @returns object with properties:
 *           - statusCode: integer HTTP response code;
 *           - headers:    object containing the HTTP headers;
 *           - body:       stringified JSON body.
 */
async function handlePOST( event: APIGatewayEvent ) : Promise<Type_HandlerResponse> {
	const result : Type_HandlerResponse = {
		statusCode: 200,
	};
	let strBody = '';
	try {
		if ( event.body ) {
			const rawBody = event.body;
			const programs = JSON.parse( rawBody ) as Type_DbProgramEditItem[];
			logger.log( 'debug', 'handlePOST: START: ', { programs } );
			await savePrograms( { programs } );
			logger.log( 'debug', 'handlePOST: savePrograms: success: ' );
			strBody = stringify( programs );
			logger.log( 'debug', 'handlePOST: stringify: success: ', strBody );
		} else {
			result.statusCode = 400;
			//strBody = JSON.stringify( { message: 'No programs' } );
			strBody = stringify( { message: 'No programs' } );
		}
	}
	catch ( err ) {
		result.statusCode = ( err as HttpError ).statusCode || 500; // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
		//strBody = JSON.stringify( { message: ( err as HttpError ).message } );
		strBody = stringify( { message: ( err as HttpError ).message } );
	}

	result.body    = strBody;
	result.headers = {
		'Content-Type':   CONTENT_TYPE_JSON,
		'Content-Length': strBody.length,
		//'Access-Control-Allow-Origin': '*',
		//'Access-Control-Allow-Methods': [ 'GET', 'POST', 'OPTIONS' ],
		//'Access-Control-Allow-Headers': '*',
	};

	return result;
}

/**
 * Updates the program status of one or more programs and creates a program history object for each update.
 * @param {*} event : the request object, with properties:
 *                      - body : stringified JSON array of objects with properties:
 *                                - pid:    identifies the program;
 *                                - status: the new status, one of: 'Success', 'Error', 'Already'
 * @returns object with properties:
 *           - statusCode: integer HTTP response code;
 */
async function handlePATCH( event: APIGatewayEvent ) : Promise<Type_HandlerResponse> {
	const result : Type_HandlerResponse = {
		statusCode: 200,
	};
	let rawResultBody = {};
	try {
		const rawBody     = event.body ?? '[]';
		const newPrograms = JSON.parse( rawBody ) as Type_DbProgramEditItem[];
		if ( newPrograms.length > 0 ) {
			logger.log( 'debug', 'handlePATCH: programs: ', newPrograms );
			await updatePrograms( { programs: newPrograms } );
			rawResultBody = { message: 'OK' };
		} else {
			logger.log( 'info', 'handlePATCH: called with no programs' );
			result.statusCode = 400;
			rawResultBody = { message: 'No programs' };
		}
	}
	catch ( err ) {
		result.statusCode = ( err as HttpError ).statusCode || 500; // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
		rawResultBody = { message: ( err as HttpError ).message };
	}

	result.body    = stringify( rawResultBody );
	result.headers = {
		'Content-Type':   CONTENT_TYPE_JSON,
		'Content-Length': result.body.length,
	};
	return result;
}

/**
 * Process any unsupported method calls.
 * @returns object with property:
 *            - statusCode: 404
 */
async function handleUnsupported( /* event: APIGatewayEvent */ ) : Promise<Type_HandlerResponse> { // eslint-disable-line @typescript-eslint/require-await
	//const headers = {
	//  'Content-Type': 'text/plain',
	//  'Content-Length': 0,
	// };
	return {
		statusCode: 404,
		//headers,
	};
}

////////////////////////////////////////
// Exported definitions

/**
 * Lambda handler function for the GIP programs API.
 * @param event : the API Gateway event, expect one of the following methods:
 *                 - GET   : return the program list;
 *                 - POST  : replace the program list;
 *                 - PATCH : update the program status and the program history.
 * @returns object with properties:
 *            - statusCode: numerical HTTP status code;
 *            - headers:    optional HTTP headers object;
 *            - body:       optional stringified JSON object.
 */
export async function handler( event: Type_handler_args /*, _context: Context */ ): Type_handler_ret {
	logger.log( 'info',  `handler:BEGIN: `, { httpMethod: event.httpMethod, path: event.path } );
	logger.log( 'debug', `handler:programs: `, { event } );

	const METHOD_HANDLER : Record<string, Type_APIGatewayEventHandler> = {
		'GET':     handleGET,
		'POST':    handlePOST,
		'PATCH':   handlePATCH,
		'default': handleUnsupported,
	};

	const fnHandler = METHOD_HANDLER[ event.httpMethod ] ?? METHOD_HANDLER.default;

	const result = await fnHandler( event );

	logger.log( 'debug', 'handler:result ', { body: result.body } );
	logger.log( 'info', 'handler: END ', { httpMethod: event.httpMethod, path: event.path, statusCode: result.statusCode } );

	return result;
}

export default { handler };

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions
