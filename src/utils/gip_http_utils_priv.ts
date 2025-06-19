/**
 * File:        utils/gip_http_utils_priv.ts
 * Description: Utilities for use by gip_http_utils.
 */
import Url         from 'url-parse';
import queryString from 'query-string';
//import queryString from 'node:querystring'; // Cannot use this as node modules are server-side only

import logger from '@rhobweb/console-logger';

import type {
	Nullable,
	Type_HttpHeaders,
	Type_HttpParams,
	Type_RawHttpParams,
	Type_EndpointDef,
} from './gip_types.ts';

export interface Type_genParams_args {
	endpointDef: Type_EndpointDef,
	params?:     Type_RawHttpParams,
};
export interface Type_genParams_ret {
	uri:    string,
	params: Type_HttpParams,
};
export interface Type_genContent_args {
	endpointDef: Type_EndpointDef,
	headers?:    Type_HttpHeaders,
	params?:     Nullable<Type_HttpParams>,
};
export interface Type_genContent_ret {
	headers: Type_HttpHeaders,
	body:    Nullable<Type_HttpParams>,
};
export interface Type_genURI_args {
	uri:     string, method: string,
	params?: Nullable<Type_HttpParams>,
};
export interface Type_genURI_ret {
	uri:    string,
	params: Nullable<Type_HttpParams>,
};

export interface Type_containsHeader_args {
	headers:    Type_HttpHeaders,
	headerProp: string,
};
export type Type_containsHeader_ret = boolean;

type Type_RawQueryParamScalarValue    = string | null | undefined;
type Type_RawQueryParamValue          = Type_RawQueryParamScalarValue | string[];
export type Type_RawQueryParams       = Partial<Record<string, Type_RawQueryParamValue>>;

const METHOD_GET                     = 'GET';
const HEADER_PROP_CONTENT_TYPE       = 'Content-Type';
const HEADER_CONTENT_TYPE_PLAIN_TEXT = 'text/plain; charset=UTF-8';
const HEADER_CONTENT_TYPE_JSON       = 'application/json; charset=UTF-8';

import type UrlParse from 'url-parse';

// Type to make the properties of the returned UrlParse object mutable
type Type_MutableUrlParse = {
	-readonly [P in keyof UrlParse<string>]+?: UrlParse<string>[P];
};

// The queryString parser allows undefined for property values, but the caller expects null.
type Type_QueryParser<T = Record<string, string | undefined | null>> = (query: string) => T;

/**
 * @param object with properties:
 *          - endpointDef : the endpoint definition with properties: uri, method and params (optional);
 *          - params:       object containing additional endpoint parameters.
 * @returns object with properties:
 *          - uri:    the URI with any query parameters removed;
 *          - params: object or string if the endpointDef parameters are stringified.
 * @exception if the endpointDef parameters are stringified and any additional parameters are specified.
 * @exception if the endpointDef parameters are stringified and any query parameters are specified.
 */
export function genParams( { endpointDef, params } : Type_genParams_args ) : Type_genParams_ret
{
	const { uri, params: endpointParams } = endpointDef;
	let   cookedURI    = uri;
	let   cookedParams : Nullable<Type_HttpParams> = null;

	if ( ( params !== undefined ) && ( endpointParams !== undefined ) ) {
		if ( typeof params !== typeof endpointParams ) {
			throw new Error( 'Type mismatch between fixed params and variable params' );
		} else if ( typeof params === 'string' ) {
			throw new Error( 'Invalid to specify both fixed string params and variable string params' );
		}
		cookedParams = {};
		Object.assign( cookedParams, endpointParams, params );
	} else {
		cookedParams = params ?? endpointParams ?? {};
	}

	const objURI = new Url( endpointDef.uri );
	if ( objURI.query ) {
		//const strQueryParams = objURI.query.replace( /^\?/, '' ); // Required for node:querystring
		const strQueryParams = objURI.query;
		const queryParams    = ( queryString.parse as Type_QueryParser )( strQueryParams ); // queryParams shall be an empty object if no parameters are specified
		Object.entries( queryParams ).forEach( ([p,v]) => {
			if ( v === '' || v === undefined ) {
				queryParams[ p ] = null;
			}
		} );
		// 'query' is typed as a read-only property, but to save copying to another variable, make it mutable.
		(objURI as Type_MutableUrlParse).query = '';
		cookedURI = objURI.toString();
		if ( typeof cookedParams !== 'string' ) {
			Object.assign( cookedParams, queryParams );
		} else {
			logger( 'error', 'Type mismatch between endpoint params and query params', { cookedParams, queryParams } );
			throw new Error( 'Type mismatch between endpoint params and query params' );
		}
	}

	return { uri: cookedURI, params: cookedParams };
}

/**
 * @param object with properties:
 *         - uri:    the URI without query parameters (if present for a GET they shall be overwritten);
 *         - method: one of GET,POST,PUT,PATCH,DELETE;
 *         - params: object containing the paramters.
 * @returns object with properties:
 *          - uri:    the URI, if GET with query parameters appended;
 *          - params: the parameters, if GET shall be null.
 */
export function genURI( { uri, method, params = null } : Type_genURI_args ) : Type_genURI_ret
{
	let cookedURI    = uri;
	let cookedParams = params;

	if ( method === METHOD_GET ) {
		const objURI         = new Url( uri );
		let   newQueryParams = undefined;
		if ( params ) {
			newQueryParams = queryString.stringify( params as Record<string,unknown> );
			cookedParams   = null;
		}

		( objURI as Type_MutableUrlParse ).query = newQueryParams; // TODO: This has changed from "null" to "undefined". Check that it still works

		cookedURI = objURI.toString();
	}

	return { uri: cookedURI, params: cookedParams };
}

/**
 * @param object with properies:
 *         - headers:    object with properties being the header name and values the header value;
 *         - headerProp: the header name.
 * @returns true if the case insensitive headerProp is found in the headers and is not the empty string, false otherwise.
 */
export function containsHeader( { headers, headerProp } : Type_containsHeader_args ) : Type_containsHeader_ret {
	const lcSearch = headerProp.toLowerCase();
	let   bFound   = false;
	if ( Object.keys( headers ).filter( h => (h.toLowerCase() === lcSearch) ).length > 0 ) {
		bFound = true;
	}

	return bFound;
}

/**
 * @param object with properties:
 *         - endpointDef: object with properties: method, headers, uri (ignored), params (ignored);
 *         - headers:     object with properties being the header name and values the header value;
 *         - params:      either an object, a string or null.
 * @returns object with properties:
 *           - headers: object with possible addition of content type header;
 *           - body:    either the stringified parameters or null.
 */
export function genContent( { endpointDef, headers = {}, params = null } : Type_genContent_args ) : Type_genContent_ret
{
	const { method, headers: endpointHeaders = {} } = endpointDef;
	const cookedHeaders : Type_HttpHeaders           = {};
	let   cookedParams = params;

	if ( method !== METHOD_GET ) {
		if ( ! ( containsHeader( { headers, headerProp: HEADER_PROP_CONTENT_TYPE } ) || containsHeader( { headers: endpointHeaders, headerProp: HEADER_PROP_CONTENT_TYPE } ) ) ) {
			const contentType = ( ( typeof params === 'string' ) ? HEADER_CONTENT_TYPE_PLAIN_TEXT : HEADER_CONTENT_TYPE_JSON );
			cookedHeaders[ HEADER_PROP_CONTENT_TYPE ] = contentType;
		}
		if ( ( params !== null ) && ( typeof params !== 'string' ) ) {
			cookedParams = JSON.stringify( params );
		}
	}
	Object.assign( cookedHeaders, headers, endpointHeaders );

	return { headers: cookedHeaders, body: cookedParams };
}

////////////////////////////////////////////////////////////////////////////////

const privateDefs = {};

if ( process.env.NODE_ENV === 'test-unit' ) {
	Object.assign( privateDefs, {
	} );
}

export { privateDefs };
