/**
 * File:        utils/gip_http_utils.ts
 * Description: Utilities for processing HTTP data
 */
'use strict';

////////////////////////////////////////////////////////////////////////////////
// Imports

import logger        from '@rhobweb/console-logger';
import queryString   from 'query-string';
import * as privDefs from '#utils/gip_http_utils_priv';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Falsy,
	Type_EndpointDef,
	Type_Endpoint,
	Type_EndpointOptions,
	Type_HttpHeaders,
	Type_RawHttpParams,
} from './gip_types.ts';

////////////////////////////////////////
// Exported and local types

type Type_RawQueryParamScalarValue    = string | null | undefined;
type Type_RawQueryParamValue          = Type_RawQueryParamScalarValue | string[];
type Type_CookedQueryParamScalarValue = string | boolean | null;
type Type_CookedQueryParamValue       = Type_CookedQueryParamScalarValue | Type_CookedQueryParamScalarValue[];
export type Type_CookedQueryParams    = Record<string, Type_CookedQueryParamValue>;

export type Type_RawQueryParams       = Partial<Record<string, Type_RawQueryParamValue>>;

export interface Type_processEndpointDef_args {
	endpointDef: Type_EndpointDef,
	params?:     Type_RawHttpParams,
	headers?:    Type_HttpHeaders,
}
export type Type_processEndpointDef_ret = Type_Endpoint;

export type Type_extractJsonResponse_args = Response; // fetch API response
export type Type_extractJsonResponse_ret  = Promise<object>;

export type Type_extractJsonResponseStream_args = Response; // fetch API response
export type Type_extractJsonResponseStream_ret  = Promise<object>;

export type Type_parseQueryParams_args          = Falsy<Type_RawQueryParams>;
export type Type_parseQueryParams_ret           = Type_CookedQueryParams;

export type Type_stringify_args            = object;
export type Type_stringify_ret             = string;

export interface Type_genURI_args { uri : string, queryParams: Record<string,string> };
export type Type_genURI_ret = string;

export type Type_stripQueryParams_args = string;
export type Type_stripQueryParams_ret  = string;

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

////////////////////////////////////////
// Exported definitions

export class HttpError extends Error {
	statusCode : number | undefined;

	constructor ( { statusCode, message } : { statusCode?: number, message: string }) {
		super( message );
		( this as HttpError ).statusCode = statusCode;
		return this;
	}
}

/**
 * @param object with properties:
 *         - endpointDef: object with properties: method, headers, uri, params;
 *         - headers:     object with properties being the header name and values the header value;
 *         - params:      either an object, a string or null.
 * @returns object with properties:
 *           - uri:     URI of the endpoint, including optional query parameter string if this is a GET;
 *           - options: object with properties:
 *                       - method:  the HTTP method, e.g. 'GET';
 *                       - headers: object containing the request headers;
 *                       - body:    optional stringified request body;
 */
export function processEndpointDef( { endpointDef, params = {}, headers = {} } : Type_processEndpointDef_args ) : Type_processEndpointDef_ret {
	const method                                       = endpointDef.method.toUpperCase();
	const { uri: strippedURI, params: cookedParams }   = privDefs.genParams( { endpointDef, params } );
	const { uri: cookedURI,   params: recookedParams } = privDefs.genURI( { uri: strippedURI, method, params: cookedParams } );
	const { headers: cookedHeaders, body }             = privDefs.genContent( { endpointDef, headers, params: recookedParams } );
	const options                                      = { method, headers: cookedHeaders } as Type_EndpointOptions;

	if ( body ) {
		options.body = body;
	}

	return { uri: cookedURI, options };
}

/**
 * @param response : JSON object returned by the fetch API.
 * @returns the response as an array or object.
 */
export async function extractJsonResponse( response : Type_extractJsonResponse_args ) : Type_extractJsonResponse_ret {
	let body : object = [];
	try {
		body = await response.json() as object;
		logger( 'info', `extractJsonResponse: `, { body } );
	}
	catch ( err ) {
		logger( 'error', `extractJsonResponse: `, JSON.stringify( { error: ( err as Error ).message } ) );
	}

	return body;
}

/**
 * @param response : text object returned by the fetch API.
 * @returns the response as an array or object.
 */
export async function extractJsonResponseStream( response : Type_extractJsonResponseStream_args ) : Type_extractJsonResponse_ret {
	let body : Awaited<Type_extractJsonResponse_ret> = [];
	try {
		const strBody = await response.text();
		logger( 'info', `extractJsonResponseStream: `, { strBody } );
		body = JSON.parse( strBody ) as typeof body;
		//logger( 'info',`JSON response extracted: `, body );
	}
	catch ( err ) {
		body = {
			message: (err as Error).message,
		};
		logger( 'error', `extractJsonResponseStream: `, JSON.stringify( { error: (err as Error).message } ) );
	}

	return body;
}

/**
 * @param {Type_RawQueryParams} rawParams : object with properties being the query parameter names and values being the values; note that a value may be an array.
 * @returns the query parameter object with undefined values set to null and case insenstive 'false' or 'true' set to the boolean equivalent.
 */
export function parseQueryParams( rawParams : Type_parseQueryParams_args ) : Type_parseQueryParams_ret
{
	const mapQueryParamVal = ( rawValue : Type_RawQueryParamScalarValue ) : Type_CookedQueryParamValue => {
		let cookedValue : Type_CookedQueryParamValue = rawValue ?? null;
		if ( ( rawValue === null ) || ( rawValue === undefined ) ) { // Need to check for null so that TS doesn't moan about the subsequent if statements
			cookedValue = null;
		} else if ( /false/i.exec(rawValue) ) {
			cookedValue = false;
		} else if ( (/true/i.exec(rawValue)) || ( rawValue === '' ) ) {
			cookedValue = true;
		}
		return cookedValue;
	};

	const cookedParams : Type_CookedQueryParams = {};

	if ( rawParams ) {
		Object.entries( rawParams ).forEach( ( [ param, value ] ) => {
			if ( value && Array.isArray( value ) ) {
				cookedParams[ param ] = value.map( el => mapQueryParamVal( el ) ) as Type_CookedQueryParamScalarValue[];
			} else {
				cookedParams[ param ] = mapQueryParamVal( value );
			}
		} );
	}

	return cookedParams;
}
/**

 * @param rawObject : an object
 * @returns object in UTF-8 format, with all characters 0x7F and above replaced with escaped character codes
 */
export function stringify( rawObject: Type_stringify_args ) : Type_stringify_ret {
	logger.log('verbose', 'stringify: ', { rawObject } );
	const rawString    = JSON.stringify( rawObject );
	const cookedString = rawString.replace( /[\u007F-\uFFFF]/g, chr => "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).slice(-4) );
	logger.log('verbose', 'stringify: ', { cookedString } );
	return cookedString;
}

/**
 * @param rawURI : a URI string, possibly with query parametrs.
 * @returns the URI string without the query parameters, e.g.,
 *            http://mydom/mypath?myqp=val1 => http://mydom/mypath
 */
export function stripQueryParams( rawURI : Type_stripQueryParams_args ) : Type_stripQueryParams_ret {
	const decodedURI = decodeURIComponent( rawURI );
	const cookedURI  = decodedURI.replace( /\?.*/, '' );
	return cookedURI;
}
/**

 * @param object: with properties:
 *           - uri:         the URI without any query parameters or trailing query, e.g., http://mydom/mypath
 *           - queryParams: an object containing the query parameters, e.g., { qp1: 'val1', doit: 'yes' }
 * @returns the URI with an appended query string, e.g., http://mydom/mypath?qp1=val1&doit=yes
 */
export function genURI( { uri, queryParams } : Type_genURI_args ) : Type_genURI_ret {
	const cookedURI = `${uri}?${queryString.stringify( queryParams )}`;
	return cookedURI;
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions

const privateDefs = {};

if ( process.env.NODE_ENV === 'test-unit' ) {
	Object.assign( privateDefs, {
	} );
}

export { privateDefs };
