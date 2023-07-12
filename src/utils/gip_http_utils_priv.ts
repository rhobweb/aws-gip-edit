import Url         from 'url-parse';
import queryString from 'query-string';

import logger      from '@rhobweb/console-logger';

import { TypeEndpointDef } from './gip_types';

type TypeGenParamsArgs = { endpointDef: TypeEndpointDef, params?: TypeRawHttpParams };
type TypeGenParamsRet  = { uri: string, params: TypeHttpParams };
type TypeGetContentRet = { headers: TypeHttpHeaders, body: Nullable<TypeHttpParams> };
type TypeGenURIArgs    = { uri: string, method: string, params: Nullable<TypeHttpParams> };
type TypeGenURIRet     = { uri: string, params: Nullable<TypeHttpParams> };

type TypeRawQueryParamScalarValue    = string | null | undefined;
type TypeRawQueryParamValue          = TypeRawQueryParamScalarValue | string[];
export type TypeRawQueryParams       = Partial<{ [key: string]: TypeRawQueryParamValue }>

const METHOD_GET                     = 'GET';
const HEADER_PROP_CONTENT_TYPE       = 'Content-Type';
const HEADER_CONTENT_TYPE_PLAIN_TEXT = 'text/plain; charset=UTF-8';
const HEADER_CONTENT_TYPE_JSON       = 'application/json; charset=UTF-8';

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
export function genParams( { endpointDef, params } : TypeGenParamsArgs ) : TypeGenParamsRet
{
  const { uri, params: endpointParams } = endpointDef;
  let   cookedURI    = uri;
  let   cookedParams : Nullable<TypeHttpParams> = null;

  if ( ( params !== undefined ) && ( endpointParams !== undefined ) ) {
    if ( typeof params !== typeof endpointParams ) {
      throw new Error( 'Type mismatch between fixed params and variable params' );
    } else if ( typeof params === 'string' ) {
      throw new Error( 'Invalid to specify both fixed string params and variable string params' );
    }
    cookedParams = {};
    Object.assign( cookedParams, endpointParams, params );
  } else {
    cookedParams = params || endpointParams || {};
  }

  const objURI = new Url( endpointDef.uri );
  if ( objURI.query ) {
    const strQueryParams = objURI.query;
    const queryParams    = queryString.parse( strQueryParams ); // queryParams shall be an empty object
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore 'query' is typed as a read-only property. May be able to fix this another way, but this will do fine
    objURI.query         = '';
    cookedURI            = objURI.toString();
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
export function genURI( { uri, method, params = null } : TypeGenURIArgs ) : TypeGenURIRet
{
  let cookedURI    = uri;
  let cookedParams = params;

  if ( method === METHOD_GET ) {
    const objURI         = new Url( uri );
    let   newQueryParams = null;
    if ( params ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      newQueryParams = queryString.stringify( params as Record<string,any> );
      cookedParams   = null;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore 'query' is typed as a read-only property. May be able to fix this another way, but this will do fine
    objURI.query = newQueryParams;

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
export function containsHeader( { headers, headerProp } : { headers: TypeHttpHeaders, headerProp: string } ) {
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
export function genContent( { endpointDef, headers = {}, params = null } : { endpointDef: TypeEndpointDef, headers?: TypeHttpHeaders, params?: Nullable<TypeHttpParams> } ) : TypeGetContentRet
{
  const { method, headers: endpointHeaders = {} } = endpointDef;
  const cookedHeaders : TypeHttpHeaders           = {};
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
