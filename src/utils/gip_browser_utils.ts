/**
 * File:        utils/gip_browser_utils.ts
 * Description: Client side utilities to determine the client browser type.
 */
'use strict';

////////////////////////////////////////////////////////////////////////////////
// Imports

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Exported and local types

export interface Type_BrowserInfo {
	os:    string,
	isIOS: boolean,
}

type Type_UserAgentRestMap = [
	string,                  // Search string
	Record<string, string>,  // Object with keys being the search string and values being the OS
];

// Object with keys being the search string and values being the OS or a further search map
export type Type_UserAgentMap = Record<string, string | Type_UserAgentRestMap>;

export type Type_parseUserAgent_args = string;
export type Type_parseUserAgent_ret  = [ string, string ];

export type Type_searchMap_ret       = string | Type_UserAgentRestMap | null;

export type Type_determineOS_args    = string;
export type Type_determineOS_ret     = string;

export type Type_os_is_IOS_args      = string;
export type Type_os_is_IOS_ret       = boolean;

export type Type_getBrowserInfoFromUserAgent_args = string;
export type Type_getBrowserInfoFromUserAgent_ret  = Type_BrowserInfo;

export type Type_BrowserInfo_ret = Type_BrowserInfo;

////////////////////////////////////////////////////////////////////////////////
// Constants

const UNKNOWN_OS = 'unknown';

// Additional mapping for Macintosh
// UA for iOS chrome is: "Mozilla/5.0 (Macintosh; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/111.0.5563.72 Mobile/15E148 Safari/604.1"
// If the raw OS is 'macintosh', use this map to search the rest of the UA, e.g., for 'CriOS'.
const UA_REST_MAP_MACINTOSH = {
	'CriOS': 'iOS',
};

// Object with properties being string regex and values being either a string or an array of two elements:
//   - the first element being the default OS name.
const USER_AGENT_MAP : Type_UserAgentMap = {
	'windows nt 10(\\.[0-9]|)': 'Windows 10',
	'windows nt 6.3':           'Windows 8.1',
	'windows nt 6.2':           'Windows 8',
	'windows nt 6.1':           'Windows 7',
	'windows nt 6.0':           'Windows Vista',
	'windows nt 5.2':           'Windows Server 2003/XP x64',
	'windows nt 5.1':           'Windows XP',
	'windows xp':               'Windows XP',
	'windows nt 5.0':           'Windows 2000',
	'windows me':               'Windows ME',
	'win98':                    'Windows 98',
	'win95':                    'Windows 95',
	'win16':                    'Windows 3.11',
	'macintosh':                [ 'Mac OS X', UA_REST_MAP_MACINTOSH ],
	'mac os x':                 'Mac OS X',
	'mac_powerpc':              'Mac OS 9',
	'linux':                    'Linux',
	'ubuntu':                   'Ubuntu',
	'iphone':                   'iPhone',
	'ipod':                     'iPod',
	'ipad':                     'iPad',
	'android':                  'Android',
	'blackberry':               'BlackBerry',
	'webos':                    'Mobile',
	[UNKNOWN_OS]:               'Unknown OS Platform',
};

const IOS_OS = [ 'iOS', 'iPhone', 'iPod', 'iPad' ]; // The OS that are part of the iOS family

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////////////////////////////////////////////
// Local definitions

/**
 * @param {string} userAgent : the user agent information received from the client,
 *                             the OS string shall be bound between an opening bracket and a semi-colon, e.g.,
 *                             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36" => "Windows NT 10.0"
 * @returns an array of two elements:
 *           - 0 : raw OS name, 'unknown' if not found;
 *           - 1 : remainder of user agent, the empty string if not found.
 */
function parseUserAgent( userAgent : Type_parseUserAgent_args ) : Type_parseUserAgent_ret
{
	console.log( "User Agent: ", userAgent );
	const agentMatch = /\(([^;]+);(.*)$/.exec(userAgent);
	let   rawOS      = UNKNOWN_OS;
	let   uaRest     = '';

	if ( agentMatch ) {
		rawOS  = agentMatch[ 1 ];
		uaRest = agentMatch[ 2 ];
	}

	return [ rawOS, uaRest ];
}

/**
 * @param map:         object that maps a raw OS string to a property in the search map.
 * @param searchItem : the string to search for.
 * @returns the mapped value of the matched item, or null if not found.
 */
function searchMap( map: Type_UserAgentMap, searchItem : string ) : Type_searchMap_ret
{
	const matchedProp = Object.keys( map )
		.find( strRE => {
			const re = new RegExp( strRE, 'i' );
			return ( searchItem.match( re ) ? true : false );
		}
		);

	return ( matchedProp ? map[ matchedProp ] : null );
}

/**
 * @param {string} userAgent : the user agent information received from the client
 * @returns a string that identifies the client OS, e.g., 'Windows 10', or 'Unknown OS Platform' if unidentified.
 */
function determineOS( userAgent : string ) : string
{
	const [ rawOS, uaRest ] = parseUserAgent( userAgent );
	let   theOS             = UNKNOWN_OS;

	const mappedValue = searchMap( USER_AGENT_MAP, rawOS.toLowerCase() );

	if ( mappedValue ) {
		if ( Array.isArray( mappedValue ) ) {
			const [ restDefaultOS, restMap ] = mappedValue;
			const restMatchedItem = searchMap( restMap, uaRest );
			theOS = ( restMatchedItem ? restMatchedItem as string : restDefaultOS );
		} else {
			theOS = mappedValue;
		}
	}

	return theOS;
}

/**
 * @param os : The OS as determined from the USER_AGENT_MAP
 * @returns true if the OS is part of the iOS family, false otherwise.
 */
function os_is_IOS( os : Type_os_is_IOS_args ) : Type_os_is_IOS_ret {
	const bIOS = ( IOS_OS.includes(os) );
	return bIOS;
}

/**
 * @returns object with properties:
 *   - os   : the OS as determined from the USER_AGENT_MAP;
 *   - isIOS: true if the OS is part of the iOS family, false otherwise.
 */
function getBrowserInfoFromUserAgent( userAgent : Type_getBrowserInfoFromUserAgent_args ) : Type_getBrowserInfoFromUserAgent_ret {
	//console.log( 'getBrowserInfo: ' + userAgent + "\n" );
	const os        = determineOS( userAgent );
	const isIOS     = os_is_IOS( os );
	//console.log( `OS: ${os}` );
	const browserInfo = {
		os,
		isIOS,
	};
	return browserInfo;
}

////////////////////////////////////////////////////////////////////////////////
// Exported definitions

/**
 * @returns object with properties:
 *   - os   : the OS as determined from the USER_AGENT_MAP;
 *   - isIOS: true if the OS is part of the iOS family, false otherwise.
 */
export function getBrowserInfo() : Type_BrowserInfo_ret {
	const userAgent = window.navigator.userAgent || '';
	return getBrowserInfoFromUserAgent( userAgent );
}

export default {
	getBrowserInfo,
};

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions

const privateDefs = {};

if ( process.env.NODE_ENV === 'test-unit' ) {
	Object.assign( privateDefs, {
		parseUserAgent,
		searchMap,
		determineOS,
		os_is_IOS,
		getBrowserInfoFromUserAgent,
	} );
}

export { privateDefs };
