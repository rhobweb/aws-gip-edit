/**
 * File:        components/authenticator.tsx
 * Description: Initial attempt to add authentication.
 */
'use strict';

////////////////////////////////////////////////////////////////////////////////
// Imports

import React, { useState, useEffect, /* useRef, ForwardedRef */ } from 'react';
//import Cookies             from 'js-cookie';
//import { APIGatewayEvent } from 'aws-lambda';
//import logger              from '@rhobweb/console-logger';
//import queryString         from 'query-string';
//import Url                 from 'url-parse';
//import { Type_EndpointDef } from '../utils/gip_types';
//import * as httpUtils      from '../utils/gip_http_utils';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

////////////////////////////////////////
// Exported and local types

////////////////////////////////////////////////////////////////////////////////
// Constants

//const AUTH_URI = 'http://localhost:3013/sso';
//const AUTH_URI = process.env.AUTH_URI ?? 'undefined';
//logger.log( 'info', 'authenticator: ', { env: process.env } );

//const ENDPOINT_LOAD : Type_EndpointDef = {
//	method: 'GET',
//	uri:    '/gip_edit/api/programs',
//	params: { all: true },
//};

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

//function getAuthFromEvent( event: APIGatewayEvent | undefined ) : string {
//	logger.log( 'info', 'getAuthFromEvent: ', { event } );
//	const auth = ( event?.queryStringParameters || {} ).token || 'unauthorised';
//	return auth;
//}
//
//function getQueryParamsFromURI( uri: string ) : Record<string,string> {
//	let queryParams = {};
//	const objURI    = new Url( uri );
//	if ( objURI.query ) {
//		const strQueryParams = objURI.query;
//		queryParams = queryString.parse( strQueryParams );
//	}
//	return queryParams;
//}
//
//function getAuthFromURI( uri: string ) : string {
//	const objQueryParam = getQueryParamsFromURI( uri );
//	const rawQueryParam = objQueryParam.token || '';
//	const redirecturi   = Array.isArray( rawQueryParam ) ? rawQueryParam[ 0 ] : rawQueryParam || null;
//	return redirecturi;
//}
//
//function getAuthFromCookie() : string | null {
//	const auth = Cookies.get( 'rhobwebauth' ) || null;
//	logger.log( 'info', 'getAuthFromCookie: ', { auth } );
//	return auth;
//}
//
//function genAuthURI( { authURI, redirectURI } : { authURI : string, redirectURI: string } ) : string {
//	const strippedRedirectURI = httpUtils.stripQueryParams( redirectURI );
//	const queryParams = {
//		redirecturi: strippedRedirectURI,
//	};
//	logger.log( 'info', 'genAuthURI: ', { authURI, queryParams } );
//	const cookedAuthURI = httpUtils.genURI( { uri: authURI, queryParams } );
//	logger.log( 'info', 'genAuthURI: ', { authURI, queryParams, cookedAuthURI } );
//	return cookedAuthURI;
//}

//async function loadPrograms() : Promise<Type_DisplayProgramItem[]> {
//  const { uri, options } = processEndpointDef( { endpointDef: ENDPOINT_LOAD } );
//  logger.log( 'info', `loadPrograms: URI: `, uri );
//  const response         = await fetch( uri, options as RequestInit );
//  const rawPrograms      = await extractJsonResponse( response ) as Type_DbProgramEditItem[];
//  const programs         = rawPrograms.map( prog => processLoadedProgram( prog ) );
//  logger.log( 'info', `loadPrograms: Programs: `, programs );
//  return programs;
//}

////////////////////////////////////////
// Exported definitions

export default function Authenticator( { children } : { children: React.JSX.Element } ) : React.JSX.Element {
	const [ authenticated, setAuthenticated ] = useState( false );

	// eslint moans about the empty dependencies array, but if it isn't present useEffect gets called on every load!
	useEffect( () => {
		setAuthenticated( true ); // For now authenticate every time
		//const thisURI   = window.location.href;
		//const authValue = getAuthFromURI( thisURI );
		////const authValue = getAuthFromCookie();
		//logger.log( 'info', 'authenticator: ', { authValue } );
		//if ( ! authValue ) {
		//  const authHref = genAuthURI( { authURI: AUTH_URI, redirectURI: thisURI } );
		//  logger.log( 'info', 'authenticator: NOT authorised', { authHref } );
		//  window.location.href = authHref;
		//} else {
		//  setAuthenticated( true );
		//}
	}, [] );

	return ( <>
		{ authenticated && ( children ) }
	</>
	);
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions
