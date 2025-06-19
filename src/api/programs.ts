
import {
	loadPrograms,
	savePrograms,
	updatePrograms,
} from '../utils/gip_db_dynamodb_utils.js';
//import { Context, APIGatewayEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayEvent } from 'aws-lambda';
import logger from '@rhobweb/console-logger';

//import {
//  DB_FIELD_STATUS, DB_FIELD_GENRE, DB_FIELD_DAY_OF_WEEK, DB_FIELD_QUALITY, DB_FIELD_SYNOPSIS,
//  VALUE_STATUS_PENDING, VALUE_STATUS_ERROR, VALUE_STATUS_SUCCESS
//}
//from '../../utils/gip_prog_fields';
import { filterPrograms } from '../utils/gip_prog_filter_utils.js';
import {
	HttpError,
	parseQueryParams,
	stringifyUTF16,
} from '../utils/gip_http_utils.js';
import type { Type_RawQueryParams } from '../utils/gip_http_utils.ts';
import type { Type_DbProgramItem }  from '../utils/gip_prog_fields.ts';

interface Type_HandlerResponse {
	statusCode: number,
	headers?:   Record<string,unknown>,
	body?:      string,
};

type Type_APIGatewayEventHandler = ( event: APIGatewayEvent ) => Promise<Type_HandlerResponse>;

const CONTENT_TYPE_JSON = 'application/json; charset=UTF-16';

/**
 * @param {*} req : the request object, with properties:
 *                  - query : the query parameters:
 *                            - current:    return current day items;
 *                            - downloaded: include already downloaded programs.
 * @returns TODO
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
		const body           = stringifyUTF16( cookedPrograms );
		logger.log( 'debug', 'handleGET: stringifyUTF16: success: ', body );

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

async function handlePOST( event: APIGatewayEvent ) : Promise<Type_HandlerResponse> {
	const result : Type_HandlerResponse = {
		statusCode: 200,
	};
	try {
		const rawBody = event.body ?? '[]';
		const programs = JSON.parse( rawBody ) as Type_DbProgramItem[];
		logger.log( 'debug', 'handlePOST: START: ', { programs } );
		await savePrograms( { programs } );
		logger.log( 'debug', 'handlePOST: savePrograms: success: ' );
		const strPrograms = stringifyUTF16( programs );
		logger.log( 'debug', 'handlePOST: stringifyUTF16: success: ', strPrograms );
		const headers = {
			'Content-Type':  CONTENT_TYPE_JSON,
			'Content-Length': strPrograms.length,
			//'Access-Control-Allow-Origin': '*',
			//'Access-Control-Allow-Methods': [ 'GET', 'POST', 'OPTIONS' ],
			//'Access-Control-Allow-Headers': '*',
		};
		result.headers = headers;
		result.body    = strPrograms;
	}
	catch ( err ) {
		result.statusCode = ( err as HttpError ).statusCode || 500; // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
		const retMessage  = JSON.stringify( { message: ( err as HttpError ).message || '' } );
		result.body       = retMessage;
		result.headers = {
			'Content-Type':   CONTENT_TYPE_JSON,
			'Content-Length': retMessage.length,
		};
	}

	return result;
}

async function handlePATCH( event: APIGatewayEvent ) : Promise<Type_HandlerResponse> {
	const result = {
		statusCode: 200,
	};
	try {
		const rawBody = event.body ?? '[]';
		if ( rawBody.length > 0 ) {
			const newPrograms = JSON.parse( rawBody ) as Type_DbProgramItem[];
			logger.log( 'debug', 'handlePATCH: programs: ', newPrograms );
			await updatePrograms( { programs: newPrograms } );
		} else {
			logger.log( 'info', 'handlePATCH: called with no programs' );
			result.statusCode = 400;
		}
	}
	catch ( err ) {
		result.statusCode = ( err as HttpError ).statusCode || 500; // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
	}
	return result;
}

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

export async function handler( event: APIGatewayEvent /*, _context: Context */ ): Promise<Type_HandlerResponse> { // APIGatewayProxyResultV2
	logger.log( 'info',  `handler:BEGIN: `, { httpMethod: event.httpMethod, path: event.path } );
	logger.log( 'debug', `handler:programs: `, { event } );

	const METHOD_HANDLER : Record<string, Type_APIGatewayEventHandler> = {
		'GET':     handleGET,
		'POST':    handlePOST,
		'PATCH':   handlePATCH,
		'default': handleUnsupported,
	};

	const method    = event.httpMethod ?? 'default';                      // eslint-disable-line @typescript-eslint/no-unnecessary-condition
	const fnHandler = METHOD_HANDLER[ method ] || METHOD_HANDLER.default; // eslint-disable-line @typescript-eslint/no-unnecessary-condition

	const result = await fnHandler( event );

	logger.log( 'info: handler: END ', { httpMethod: event.httpMethod, path: event.path, statusCode: result.statusCode } );

	return result;
}

export default { handler };
