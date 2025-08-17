
/**
 * File:        utils/gip_prog_edit_utils.ts
 * Description: Utilities for manipulating the contents of HTML elements.
 */
'use strict';

////////////////////////////////////////////////////////////////////////////////
// Imports

import {
	PROG_FIELD_SYNOPSIS,
	PROG_FIELD_TITLE,
	PROG_FIELD_IMAGE_URI,
} from '#utils/gip_types';

import { convertKnownTitle } from '#utils/gip_prog_title_utils';

import logger  from '@rhobweb/console-logger';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Local types

type Type_HtmlElement = Element;

interface Type_ProgramAttributes {
	title:      string,
	episode:    string,
	rawEpisode: string[],
	synopsis:   string,
	image_uri:  string,
};

interface Type_ElementTagNameAndClassTag {
	tagName:  string,
	classTag: string | string[],
	retProp:  string,
};

type Type_TextConversionItem = [ ( string | RegExp ), string ];
type Type_TextConversionList = Type_TextConversionItem[];

type Type_FoundElement = Record<string,Type_HtmlElement | Type_HtmlElement[]>;

////////////////////////////////////////
// Exported types

export type Type_convertToCamelCase_args = string;
export type Type_convertToCamelCase_ret  = string;
export interface Type_elementClassTagMatches_args {
	className: string,
	classTag : string | string[],
};
export type Type_elementClassTagMatches_ret = boolean;

export interface Type_getDecendentsByTagNameAndClassTag_args {
	elem:                  Type_HtmlElement,
	arrTagNameAndClassTag: Type_ElementTagNameAndClassTag[],
};
export type Type_getDecendentsByTagNameAndClassTag_ret = Type_FoundElement;

export type Type_getProgAttributes_args = Type_HtmlElement;
export type Type_getProgAttributes_ret  = Type_ProgramAttributes;

export interface Type_convertText_args {
	arrConversion : Type_TextConversionList,
	rawText :       string,
};
export type Type_convertText_ret = string;

export type Type_cookTitle_args = string;
export type Type_cookTitle_ret  = string;

export type Type_preProcessEpisode_args = string;
export type Type_preProcessEpisode_ret  = string;

export type Type_cookEpisode_args = string;
export type Type_cookEpisode_ret  = string;

export type Type_cookRawEpisode_args = string[];
export type Type_cookRawEpisode_ret  = string;

export interface Type_cookSynopsis_args {
	rawText : string,
	episode?: string,
};
export type Type_cookSynopsis_ret = string;

export type Type_extractRawElementText_args = Element | Element[];
export type Type_extractRawElementText_ret  = string[];

export type Type_extractElementText_args = Element | Element[];
export type Type_extractElementText_ret  = string;

export type Type_extractElementImageURI_args = Element | Element[];
export type Type_extractElementImageURI_ret  = string;

export type Type_filterOutHTML_args = Element | Element[];
export type Type_filterOutHTML_ret  = Element | Element[];

export type Type_getProgDetailsFromLink_args = string;
export interface Type_getProgDetailsFromLink_ret {
	[PROG_FIELD_TITLE]:     string,
	[PROG_FIELD_SYNOPSIS]:  string,
	[PROG_FIELD_IMAGE_URI]: string,
};

////////////////////////////////////////////////////////////////////////////////
// Constants

const ARR_COMMON_TEXT_CONVERSIONS : Type_TextConversionList = [
	[ '\u{2019}', '\'' ], // Right single quotation
	[ '\u{0060}', '\'' ], // Grave accent
	[ '&amp;',    '&'  ], // Escaped ampersand
];

// Separator to use when joining program attributes, e.g., episode
const ELEMENT_SEPARATOR = '-';

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

/**
 * Convert the specified string to camelcase, with first letter capitalised.
 * @param str - string to convert.
 * @return string in camelcase format.
 */
function convertToCamelCase( str : Type_convertToCamelCase_args ) : Type_convertToCamelCase_ret
{
	let cookedStr = str;

	if ( /\s/g.test(str) ) // Only camelcase if the string contains whitespace
	{
		const preCookedStr = str
			.normalize( 'NFD' ).replace(/\p{Diacritic}/gu, '')  // Replace accented characters with the unaccented equivalent
			.replace( /[-_]+/g, ' ')                            // Replaces any - or _ characters with a space
			.replace( /[^\w\s]/g, '')                           // Removes any non alphanumeric characters
			.replace( /\s+/g, ' ' )                             // Shrink multiple spaces
		;

		const arrWord = preCookedStr.split( ' ' )
			.map( el => {
				const m = /^([a-z])(.*)$/.exec( el );
				if ( m ) {
					return m[1].toUpperCase() + m[2].toLowerCase();
				} else {
					return el;
				}
			} );

		cookedStr = arrWord.join( '' );
	}

	return cookedStr;
}

/**
 * @param object with properties:
 *         - className: space separated string of class names.
 *         - classTag:  either:
 *                       - a class name;
 *                       - array of two or more:
 *                          - class name   : class name to find in the string of class names;
 *                          - ! class name : class name to not find in the string of class names.
 * @returns true if className case insensitive matches a classTag..
 * e.g.1, className = 'c1 c2 c3', classTag = [ 'c1, 'c2' ], returns true
 * e.g.2, className = 'c1 c2 c3', classTag = [ 'c1, 'c4' ], returns false
 * e.g.3, className = 'c1 c2 c3', classTag = [ 'c1, '!c4' ], returns true
 * e.g.4, className = 'c1 c2 c3', classTag = [ 'c1, '!c3' ], returns false
 */
function elementClassTagMatches( { className, classTag } : Type_elementClassTagMatches_args ) : Type_elementClassTagMatches_ret {
	let bMatch      = true; // Default to true
	let arrClassTag = [];
	const arrClassName = className.split( /\s/ ).map( e => e.toLowerCase() );

	//console.log( `elementClassTagMatches: `, JSON.stringify({ className, classTag }) );

	if ( Array.isArray( classTag ) ) {
		arrClassTag = classTag;
	} else {
		arrClassTag = [ classTag ];
	}

	for ( const classTagItem of arrClassTag ) {
		const matchResult  = /^!(.*)/.exec(classTagItem);
		if ( matchResult ) {
			const thisClassTag = matchResult[ 1 ];
			//console.log( `Matching not: ${thisClassTag}` );
			bMatch = bMatch && ( !arrClassName.includes( thisClassTag.toLowerCase() ) );
			//console.log( `Result: ${bMatch}` );
		} else {
			bMatch = bMatch && ( arrClassName.includes( classTagItem.toLowerCase() ) );
		}
	}

	return bMatch;
}

/**
 * Get all immediate child elements with the specified tag.
 * @param object with properties:
 *          - elem                  : the HTML element to search.
 *          - arrTagNameAndClassTag : array of objects with properties:
 *                                     - tagName:  HTML tag name;
 *                                     - classTag: a class name, or a negated class name, e.g., '!myclass', or an array of these.
 *                                     - retProp:  the name of the property in which to return the data.
 * @return object with properties being the requested return properties and value being either the found child object or an array of child objects.
 */
function getDecendentsByTagNameAndClassTag( { elem, arrTagNameAndClassTag } : Type_getDecendentsByTagNameAndClassTag_args ) : Type_getDecendentsByTagNameAndClassTag_ret
{
	const objFoundElement : Type_FoundElement = {};

	function processChild( child: Element ) : void {
		if ( ( typeof child === 'object' ) && child.getAttribute ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
			const childClass = child.getAttribute( 'class' );
			//console.log( 'Child tagName: ', child.tagName );
			if ( childClass != null ) {
				for ( const tagNameAndClassTag of arrTagNameAndClassTag ) {
					if ( ( child.tagName.toLowerCase() === tagNameAndClassTag.tagName.toLowerCase() ) && elementClassTagMatches( { className: childClass, classTag: tagNameAndClassTag.classTag } ) ) {
						if ( ! objFoundElement[ tagNameAndClassTag.retProp ] ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
							objFoundElement[ tagNameAndClassTag.retProp ] = child;
						} else {
							if ( ! Array.isArray( objFoundElement[ tagNameAndClassTag.retProp ] ) ) {
								objFoundElement[ tagNameAndClassTag.retProp ] = [ objFoundElement[ tagNameAndClassTag.retProp ] as Element ];
							}
							( objFoundElement[ tagNameAndClassTag.retProp ] as Element[] ).push( child );
							//console.log( `Found multiple: ${tagNameAndClassTag.retProp}` );
						}
					}
				}
				const objFoundChildElements = getDecendentsByTagNameAndClassTag( { elem: child, arrTagNameAndClassTag } );
				Object.assign( objFoundChildElements, objFoundElement ); // Do not overwrite existing properties
				Object.assign( objFoundElement, objFoundChildElements );
			} else {
				const objFoundChildElements = getDecendentsByTagNameAndClassTag( { elem: child, arrTagNameAndClassTag } );
				Object.assign( objFoundChildElements, objFoundElement ); // Do not overwrite existing properties
				Object.assign( objFoundElement, objFoundChildElements );
			}
		}
	}

	try {
		//const children = ( elem ? Array.from( elem.childNodes ) : [] ) as Element[]; // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		const children = Array.from( elem.childNodes ) as Element[];
		for ( const child of children ) {
			processChild( child );
		}
	}
	catch ( err ) {
		logger.log( 'info', 'getDecendentsByTagNameAndClassTag: ', (err as Error).message );
	}

	return objFoundElement;
}

/**
 * @param el : either an Element object containing text or an array of such objects.
 * @returns an array of zero or more strings.
 */
function extractRawElementText( el : Type_extractRawElementText_args ) : Type_extractRawElementText_ret {
	const arrEl = ( Array.isArray( el ) ? el : [ el ] );
	return arrEl.map( e => e.innerHTML );
}

/**
 * @param el : either an Element object containing text or an array of such objects.
 * @returns the text from the elements concatenated with a dash.
 */
function extractElementText( el : Type_extractElementText_args ) : Type_extractElementText_ret {
	return extractRawElementText( el ).join( ELEMENT_SEPARATOR );
}

/**
 * @param el : either an HTMLEmbedElement object containing image metadata or an array of such objects.
 * @returns the URI of the image from the first or only element.
 */
function extractElementImageURI( el : Type_extractElementImageURI_args ) : Type_extractElementImageURI_ret {
	const imageElement = ( Array.isArray( el ) ? el[ 0 ] : el );
	const uri          = (imageElement as HTMLEmbedElement).src;
	return uri;
}

/**
 * @param el : either an Element object containing text or an array of such objects.
 * @returns an array of Elements with any elements containing HTML removed
 */
function filterOutHTML( el : Type_filterOutHTML_args ) : Type_filterOutHTML_ret {
	const arrEl = ( Array.isArray( el ) ? el : [ el ] );
	const arrRet : Type_extractElementText_args = [];
	for ( const elItem of arrEl ) {
		if ( ! /<\S+>/i.test( elItem.innerHTML ) ) {
			arrRet.push( elItem );
		}
	}
	return arrRet;
}

/**
 * Get the program attributes from a dragged and dropped iPlayer link.
 * @param linkElem - the <a> HTML element containing the link data.
 * @return object with attributes, any of which may be the null string:
 *          - title:     program name;
 *          - episode:   episode number or text;
 *          - synopsis:  program synopsis;
 *          - image_uri: URI to the program image.
 */
function getProgAttributes( linkElem: Type_getProgAttributes_args ) : Type_getProgAttributes_ret {
	const arrSearchItem : Type_ElementTagNameAndClassTag[] = [
		{ tagName: 'img',  classTag: 'sw-object-cover',                               retProp: 'image' },
		{ tagName: 'span', classTag: 'sw-text-primary',                               retProp: 'title' },
		{ tagName: 'p',    classTag: [ 'sw-text-long-primer', '!sw-text-secondary' ], retProp: 'primary' },
		{ tagName: 'p',    classTag: 'sw-text-secondary',                             retProp: 'secondary' },
	];
	const objFoundItem = getDecendentsByTagNameAndClassTag( { elem: linkElem, arrTagNameAndClassTag: arrSearchItem } );

	const objProgAttributes : Type_ProgramAttributes = {
		title:      '',
		episode:    '',
		rawEpisode: [],
		synopsis:   '',
		image_uri:  '',
	};

	if ( objFoundItem.title ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		objProgAttributes.title = extractElementText( objFoundItem.title );
	}
	if ( objFoundItem.primary ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		objProgAttributes.episode    = extractElementText( objFoundItem.primary );
		objProgAttributes.rawEpisode = extractRawElementText( objFoundItem.primary );
	}
	if ( objFoundItem.image ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		objProgAttributes.image_uri = extractElementImageURI( objFoundItem.image );
	}
	if ( objFoundItem.secondary ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		const filteredElements     = filterOutHTML( objFoundItem.secondary );
		objProgAttributes.synopsis = extractElementText( filteredElements );
	}

	return objProgAttributes;
}

/**
 * @param arrConversion: array of one or more tuples with properties:
 *                        - [0]: a string or regexp to search for;
 *                        - [1]: the string to replace it with.
 * @param rawText:       the text to convert.
 * @returns the text, possibly converted.
 */
function convertText( { arrConversion, rawText } : Type_convertText_args ) : Type_convertText_ret
{
	let cookedText = rawText;

	for ( const [search,replace] of arrConversion ) {
		if ( typeof search === 'object' ) {
			cookedText = cookedText.replace( search, replace );
		} else {
			cookedText = cookedText.replace( new RegExp( search, 'g' ), replace );
		}
	};
	return cookedText;
}

/**
 * @param {string} strNumber: an integer as string, e.g., '2';
 * @param {number} iLen :     the required length of the string.
 * @returns strNumber padded with leading zeroes, or unchanged if strNumber is already that length or longer.
 */
function padNumberString( strNumber : string, iLen : number ) : string {
	const iSlice = - ( strNumber.length > iLen ? strNumber.length : iLen );
	return `000${strNumber}`.slice( iSlice );
}

/**
 * @param {string} episode: an integer as a string, e.g., '2';
 * @returns the number padded with leading zeroes with a minimum length of 2, e.g., '02'.
 */
const padEpisode = ( episode : string ) : string => padNumberString( episode, 2 );

/**
 * @param {string} series: an integer as a string, e.g., '2';
 * @returns the number padded with leading zeroes with a minimum length of 2, e.g., '02'.
 */
const padSeries  = ( series : string ) : string => padNumberString( series, 2 );

/**
 * String.replace function.
 * @param {string[]} arrArg : the match arguments from a String.replace call, with elements:
 *                    - 0: the matched string;
 *                    - 1: the matched day, either one or two digits.
 *                    - 2: the matched month, either one or two digits.
 *                    - 3: the matched year, either two or four digits (could be three but don't worry about that).
 * @returns the date as a string in format, 'YYYY-MM-DD', e.g., '2025-06-24'
 */
function formatDashDate( ...arrArg : string[] ) : string {
	const day   = padNumberString( arrArg[ 1 ], 2 );
	const month = padNumberString( arrArg[ 2 ], 2 );
	const year  = (arrArg[ 3 ].length === 2 ) ? `20${arrArg[3]}` : arrArg[3];
	return `${year}-${month}-${day}`;
}

/**
 * @param rawText : the raw episode text to pre-process.
 * @returns the processed text.
 */
function preProcessEpisode( rawText : Type_preProcessEpisode_args ) : Type_preProcessEpisode_ret
{
	const arrPreprocess = [
		[ /([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{2,4})/g, formatDashDate ],
		[ /%/g,                                        ' percent'     ],      // '4%' => '4 percent'
	] as [ RegExp, string ][];

	let cookedText = rawText;
	for ( const arrRe of arrPreprocess ) {
		cookedText = cookedText.replace( arrRe[ 0 ], arrRe[ 1 ] );
	};

	return cookedText;
}

/**
 * @param rawText : the text to process.
 * @returns the processed text with series and episode data extracted and date format standardised.
 *          If there is no Prelude or postcript then it is ignored, e.g.,
 *           - 'Series 1-2'                            => 'S01E02';
 *           - 'Prelude Series 1-2 postscript'         => 'S01E02-Prelude-postscript';
 *           - 'Prelude Series 1 Episode 2 postscript' => 'S01E02-Prelude-postscript';
 *           - 'Prelude Series 1-2 postscript'         => 'S01E02-Prelude-postscript';
 *           - 'Prelude Series 1. 2. postscript'       => 'S01E02-Prelude-postscript';
 *           - 'Prelude Series 1-postscript'           => 'S01-Prelude-postscript';
 *           - 'Prelude 01/05 postscript               => '01of05-prelude-postscript';
 *           - 'Prelude 15/06/2025 postscript'         => '2025-06-15-Prelude-postscript';
 */
function cookEpisode( rawText : Type_cookEpisode_args ) : Type_cookEpisode_ret
{
	const arrFoundItem : string[] = [];
	let   cookedEpisode           = '';

	type Type_EpisodeMatchItem = [
		RegExp, number[],
	];

	// Define a set of regexps to extract data from the raw text.
	// The order is important as only the first match is processed.
	// This is an array of arrays with elements:
	//  - 0 : the regexp with capture groups defined;
	//  - 1 : an array of elements that contain either a capture group index or zero if the value is not defined;
	//        the array elements are as follows:
	const I_SERIES       = 0; // Contains the capture group index of the series number.
	const I_EPISODE      = 1; // Contains the capture group index of the episode number.
	const I_NUM_EPISODES = 2; // Contains the capture group index of the number of episodes.
	const I_PRE          = 3; // Contains the capture group index of text before the series and episode text.
	const I_POST         = 4; // Contains the capture group index of text after the series and episode text.
	const arrMatch = [
		[ /^(.*)Series ([0-9]+)-([0-9]+)(.*)$/i,               [ 2, 3, 0, 1, 4 ] ], // Series 1-2
		[ /^(.*)Series ([0-9]+).*?Episode.?([0-9]+)\.?(.*)$/i, [ 2, 3, 0, 1, 4 ] ], // Series 1  Episode 2
		[ /^(.*)Series ([0-9]+)\.\s*([0-9]+)\.(.*)$/i,         [ 2, 3, 0, 1, 4 ] ], // 1. 2.
		[ /^(.*)Series ([0-9]+)-?(.*)$/i,                      [ 2, 0, 0, 1, 3 ] ],
		[ /^(.*)Episode ([0-9]+)-?(.*)$/i,                     [ 0, 2, 0, 1, 3 ] ],
		// If the greedy match fails it then does a non-greedy match, so need to check for 0-9 as well as / at either end
		[ /(^|.*[^/0-9])([0-9]+)\/([0-9]+)($|[^/].*)/,         [ 0, 2, 3, 1, 4 ] ], // 01/02 - no need to ignore dates due to pre-processing
		[ /(^|.*[^-0-9])([0-9]+)-([0-9]+)($|[^-0-9].*)/,       [ 0, 2, 3, 1, 4 ] ], // 01-02
		[ /(^|.*?)-?([0-9]+)\.(.*)$/,                          [ 0, 2, 0, 1, 3 ] ], // Number followed by a dot, either at the start or following a dash
	] as Type_EpisodeMatchItem[];

	const preProcessedText = preProcessEpisode( rawText );

	for ( const arrMatchItem of arrMatch ) {
		const matchResult = arrMatchItem[ 0 ].exec( preProcessedText );
		if ( matchResult ) {
			for ( const pos of arrMatchItem[ 1 ] ) {
				if ( pos === 0 ) { // If capture group 0 is specified, it means the element is not present
					arrFoundItem.push( '' );
				} else {
					arrFoundItem.push( matchResult[ pos ] );
				}
			}
			if ( arrFoundItem.length ) {
				break; // Only match one of the regexps
			}
		}
	}

	if ( arrFoundItem.length ) { // If a match has been found
		if ( arrFoundItem[ I_SERIES ].length ) {
			if ( arrFoundItem[ I_EPISODE ].length ) {
				cookedEpisode = `S${padSeries(arrFoundItem[ I_SERIES ])}E${padEpisode(arrFoundItem[1])}`;
			} else {
				cookedEpisode = `S${padSeries(arrFoundItem[ I_SERIES ])}`;
			}
		} else { // If no series is specified, an episode number must have been found
			cookedEpisode = padEpisode(arrFoundItem[ I_EPISODE ]);
		}
		if ( arrFoundItem[ I_NUM_EPISODES ].length ) {
			cookedEpisode += `of${padEpisode(arrFoundItem[ I_NUM_EPISODES ])}`;
		}

		const additionalText = [ arrFoundItem[ I_PRE ], arrFoundItem[ I_POST ] ]
			.filter( e => e )
			.map( e => e.replace( /[.;:?!-_]$/, '') ) // Replace any trailing punctuation
			.map( e => convertToCamelCase( e ) )
			.join( '-' );

		cookedEpisode = [ cookedEpisode, additionalText ]
			.filter( e => e )
			.join( '-' );
	} else { // No match for series or episode, just use the pre-processed text
		cookedEpisode = preProcessedText;
	}

	return cookedEpisode;
}

/**
 * @param arrRawText : array of text items to process.
 * @returns the processed text with series and episode data extracted and date format standardised, see cookEpisode.
 */
function cookRawEpisode( arrRawText : Type_cookRawEpisode_args ) : Type_cookRawEpisode_ret
{
	for ( let i = 0; i < arrRawText.length - 1; ++i ) {
		if ( /[^\s0-9][0-9]+$/.exec( arrRawText[ i ] ) ) {
			arrRawText[ i ] += ';';
		}
	}

	const precookedText = arrRawText.join( ELEMENT_SEPARATOR );

	//console.log( `cookeRawEpisode: precooked: "${precookedText}"` );
	//console.log( `cookeRawEpisode: cooked: "${cookEpisode( precookedText )}"` );

	return cookEpisode( precookedText );
}

////////////////////////////////////////
// Exported definitions

/**
 * Change known program names into favourite names, e.g., "Clue".
 * Remove special characters from the name.
 * @param name - the program name to change.
 * @return the cooked name.
 */
export function cookTitle( rawTitle : Type_cookTitle_args ) : Type_cookTitle_ret
{
	//console.log( `rawTitle: "${rawTitle}"` );
	const arrConversion : Type_TextConversionList = [
		...ARR_COMMON_TEXT_CONVERSIONS,
		[ /[/?\s]/g,          '-' ], // TODO - need to replace more special characters
		[ /[\u007F-\uFFFF]/g, '-' ], // Replace all non-ASCII characters with a dash
	];

	//const normalisedTitle = rawTitle.normalize( 'NFD' ).replace(/\p{Diacritic}/gu, '');
	const knownTitle      = convertKnownTitle( rawTitle );
	const convertedTitle  = convertText( { arrConversion, rawText: knownTitle } );

	return convertedTitle;
}

/**
 * @param object with properties:
 *         - rawText: the text to process;
 *         - episode: optional episode strting.
 * @returns the processed synopsis text, optionally appended with the specified episode string.
 */
export function cookSynopsis( { rawText, episode } : Type_cookSynopsis_args ) : Type_cookSynopsis_ret {
	const arrConversion = [
		...ARR_COMMON_TEXT_CONVERSIONS,
	];

	const arrItem : string[] = [];

	if ( episode ) {
		arrItem.push( episode );
	}
	arrItem.push( rawText );
	arrItem.forEach( (e,i,a) => {
		if ( ! /\.$/.exec( e ) ) {
			a[ i ] = `${a[i]}.`;
		}
	} );
	const synopsis = arrItem.join( "\n" );

	return convertText( { arrConversion, rawText: synopsis } );
}

//synopsis.split( '' ).forEach( c => {
//  const iChar = c.charCodeAt(0);
//  if ( ! c.match( /[A-Za-z ,.;:]/) ) {
//    console.log( 'Char: ' + c + '=0x' + iChar.toString(16) );
//  }
//} );

/**
 * @param {string} strHTML : the HTML of the dropped program link.
 * @returns object with properties:
 *           - title:     the program title string;
 *           - synopsis:  the program synopsis string;
 *           - image_uri: the program image URI.
 */
export function getProgDetailsFromLink( strHTML : Type_getProgDetailsFromLink_args ) : Type_getProgDetailsFromLink_ret
{
	const parser         = new DOMParser();
	const htmlDoc        = parser.parseFromString( strHTML, 'text/html' );
	//console.log( htmlDoc );
	const linkElemList   = htmlDoc.getElementsByTagName( 'A' );
	const linkElem       = linkElemList[ 0 ];
	const objAttributes  = getProgAttributes( linkElem );
	logger.log( 'verbose', 'Program attributes: ',  objAttributes );
	const episode        = cookRawEpisode( objAttributes.rawEpisode );
	const rawTitle       = [ objAttributes.title, episode ]
		.map( el => convertToCamelCase( el ) )
		.filter( val => ( val.length > 0 ) )
		.join( '-' );
	const title         = cookTitle( rawTitle );
	const synopsis      = cookSynopsis( { rawText: objAttributes.synopsis, episode: objAttributes.episode } );
	const image_uri     = objAttributes.image_uri;
	const result = {
		[PROG_FIELD_TITLE]:     title,
		[PROG_FIELD_SYNOPSIS]:  synopsis,
		[PROG_FIELD_IMAGE_URI]: image_uri,
	};
	return result;
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions

export const privateDefs = {};

if ( process.env.NODE_ENV === 'test-unit' ) {
	Object.assign( privateDefs, {
		convertToCamelCase,
		elementClassTagMatches,
		getDecendentsByTagNameAndClassTag,
		extractElementText,
		extractElementImageURI,
		getProgAttributes,
		convertText,
		preProcessEpisode,
		cookEpisode,
		cookRawEpisode,
	} );
}
