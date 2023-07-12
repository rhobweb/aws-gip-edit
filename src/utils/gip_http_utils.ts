import logger        from '@rhobweb/console-logger';
import queryString   from 'query-string';
import * as privDefs from './gip_http_utils_priv';

import { TypeEndpointDef, TypeEndpoint, TypeEndpointOptions } from './gip_types';

type TypeRawQueryParamScalarValue    = string | null | undefined;
type TypeRawQueryParamValue          = TypeRawQueryParamScalarValue | string[];
type TypeCookedQueryParamScalarValue = string | boolean | null;
type TypeCookedQueryParamValue       = TypeCookedQueryParamScalarValue | (TypeCookedQueryParamScalarValue)[];
type TypeCookedQueryParams           = Record<string, TypeCookedQueryParamValue>;

export type TypeRawQueryParams       = Partial<{ [key: string]: TypeRawQueryParamValue }>

type TypeProcessEndpointDefArgs = {
  endpointDef: TypeEndpointDef, params?: TypeRawHttpParams, headers?: TypeHttpHeaders,
};
type TypeProcessEndpointDefRet = TypeEndpoint;

/**
 * @param object with properties:
 *         - endpointDef: object with properties: method, headers, uri, params;
 *         - headers:     object with properties being the header name and values the header value;
 *         - params:      either an object, a string or null.
 * @returns 
 */
export function processEndpointDef( { endpointDef, params = {}, headers = {} } : TypeProcessEndpointDefArgs ) : TypeProcessEndpointDefRet {
  const method                                       = endpointDef.method.toUpperCase();
  const { uri: strippedURI, params: cookedParams }   = privDefs.genParams( { endpointDef, params } );
  const { uri: cookedURI,   params: recookedParams } = privDefs.genURI( { uri: strippedURI, method, params: cookedParams } );
  const { headers: cookedHeaders, body }             = privDefs.genContent( { endpointDef, headers, params: recookedParams } );
  const options : TypeEndpointOptions                = { method, headers: cookedHeaders };

  if ( body ) {
    options.body = body;
  }

  return { uri: cookedURI, options };
}

//fnHeaders: ( len ) => ( {
//  'Content-Type':   'application/json; charset=UTF-8',
//  'Content-Length': len,
//} ),

//async function extractTextResponse( response ) {
//  const buffer       = await response.arrayBuffer();
//  const decoder      = new TextDecoder( 'iso-8859-1' );
//  const textResponse = decoder.decode( buffer );
//  return textResponse;
//}

/**
 * @param rawObject 
 * @returns 
 */
//export async function extractJsonResponse( response : { json: () => object, type: string } ) {
//  let body : object = [];
//  //logger.info( `extractJsonResponse: `, response.type );
//  try {
//    body = await response.json();
//    //logger.info( `JSON response extracted: `, body );
//  }
//  catch ( err ) {
//    logger( 'error', `extractJsonResponse: `, JSON.stringify( { error: err.message, rawResponse: response } ) );
//  }
//
//  return body;
//}

export async function extractStringFromStream( stream : ReadableStream<Uint8Array> ) : Promise<string> {
  let arrChunk   = [];
  let reader     = stream.getReader();
  let bDone      = false;
  while ( ! bDone ) {
    const { done, value } = await reader.read();
    if ( ! done ) {
      arrChunk.push( value );
    } else {
      bDone = true;
    }
  }
  const str = Buffer.concat( arrChunk ).toString();
  return str;
//  return new Promise( ( resolve, reject ) => {
//    stream.setEncoding('utf8');
//    stream.on( 'data', chunk => {
//      str += chunk;
//    })
//    stream.on('end', () {
//      resolve( str );
//    });
//    stream.on('error', () {
//      reject( new Error('Stream error') );
//    });
//  } );
}

export async function extractJsonResponse( response : Response ) {
  let body = [];
  try {
    const strBody = await response.json();
    logger.info( `extractJsonResponse: `, { strBody } );
    body = strBody;
    //body = JSON.parse( strBody );
    //logger.info( `JSON response extracted: `, body );
  }
  catch ( err ) {
    logger( 'error', `extractJsonResponse: `, JSON.stringify( { error: err.message } ) );
  }

  return body;
}

export async function extractJsonResponseStream( response : Response ) {
  let body = [];
  try {
    const strBody = await response.text();
    logger.log( 'info', `extractJsonResponseStream: `, { strBody } );
    body = JSON.parse( strBody );
    //logger.info( `JSON response extracted: `, body );
  }
  catch ( err ) {
    logger( 'error', `extractJsonResponseStream: `, JSON.stringify( { error: err.message } ) );
  }

  return body;
}

/**
 * @param {TypeRawQueryParams} rawParams : object with properties being the query parameter names and values being the values; note that a value may be an array.
 * @returns the query parameter object with undefined values set to null and case insenstive 'false' or 'true' set to the boolean equivalent.
 */
export function parseQueryParams( rawParams : TypeRawQueryParams ) : TypeCookedQueryParams
{
  const mapQueryParamVal = ( rawValue : TypeRawQueryParamScalarValue ) => { 
    let cookedValue : TypeCookedQueryParamValue = rawValue || null;
    if ( ( rawValue === null ) || ( rawValue === undefined ) ) { // Need to check for null so that TS doesn't moan about the subsequent if statements
      cookedValue = null;
    } else if ( rawValue.match( /false/i ) ) {
      cookedValue = false;
    } else if ( rawValue.match( /true/i ) || ( rawValue === '' ) ) {
      cookedValue = true;
    }
    return cookedValue;
  };

  const cookedParams : TypeCookedQueryParams = {};

  Object.entries( rawParams ).forEach( ( [ param, value ] ) => {
    if ( value && Array.isArray( value ) ) {
      cookedParams[ param ] = value.map( el => mapQueryParamVal( el ) );
    } else {
      cookedParams[ param ] = mapQueryParamVal( value );
    }
  } );

  return cookedParams;
}

/**
 * @param rawObject : an object
 * @returns object in UTF-16 format, with all characters 0x7F and above replaced with escaped character codes
 */
export function stringifyUTF16( rawObject: object ) : string {
  const rawString    = JSON.stringify( rawObject );
  const cookedString = rawString.replace( /[\u007F-\uFFFF]/g, chr => "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).slice(-4) );
  return cookedString;
}

export function stripQueryParams( rawURI : string ) : string {
  const decodedURI = decodeURIComponent( rawURI );
  const cookedURI  = decodedURI.replace( /\?.*/, '' );
  return cookedURI;
}

export function genURI( { uri, queryParams } : { uri : string, queryParams: Record<string,string> } ) : string {
  const cookedURI = `${uri}?${queryString.stringify( queryParams )}`;
  return cookedURI;
}