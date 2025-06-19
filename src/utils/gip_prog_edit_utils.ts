
/**
 * File:        utils/gip_prog_edit_utils.ts
 * Description: Utilities for manipulating the contents of HTML elements.
 */

import { PROG_FIELD_SYNOPSIS, PROG_FIELD_TITLE, PROG_FIELD_IMAGE_URI } from './gip_types';
import { convertKnownTitle }  from './gip_prog_title_utils';

//type Type_HtmlElement = {
//  //childNodes?:   object[],
//  childNodes?:   NodeListOf<ChildNode>,
//  getAttribute?: ( param: string ) => string,
//  innerHTML?:    string,
//  src?:          string,
//};

type Type_HtmlElement           = Element;
//type Type_HtmlElementCollection = Type_HtmlElement[];

//type Type_HtmlElement           = Element;
//type Type_HtmlElementCollection = HTMLCollectionOf<Element>;

interface Type_ProgramAttributes {
	title:     string,
	episode:   string,
	synopsis:  string,
	image_uri: string,
}

interface Type_ElementTagNameAndClassTag {
	tagName:  string,
	classTag: string | string[],
	retProp:  string,
}

type Type_TextConversionItem = [ ( string | RegExp ), string ];
type Type_TextConversionList = Type_TextConversionItem[];

const ARR_COMMON_TEXT_CONVERSIONS : Type_TextConversionList = [
	[ '\u{2019}', '\'' ],
	[ '\u{0060}', '\'' ],
	[ '&amp;',    '&'  ],
];


type Type_FoundElement = Record<string,Type_HtmlElement | Type_HtmlElement[]>;

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

export type Type_cookEpisode_args = string;
export type Type_cookEpisode_ret  = string[];


export interface Type_cookSynopsis_args {
	rawText : string,
	episode?: string,
};
export type Type_cookSynopsis_ret = string;

export type Type_getProgDetailsFromLink_args = string;
export interface Type_getProgDetailsFromLink_ret {
	[PROG_FIELD_TITLE]:     string,
	[PROG_FIELD_SYNOPSIS]:  string,
	[PROG_FIELD_IMAGE_URI]: string,
};
//Record<string,string>;

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
		cookedStr = str.toLowerCase()    // Lower cases the string
			.replace( /[-_]+/g, ' ')       // Replaces any - or _ characters with a space
			.replace( /[^\w\s]/g, '')      // Removes any non alphanumeric characters
			.replace( /\s+/g, ' ' )        // Shrink multiple spaces
			.replace( / (.)/g, ( ...args ) => { return ( args[1] as string ).toUpperCase(); })  // Uppercases first char in each group after a space
			.replace( / /g, '' )           // Removes spaces
			.replace( /^(.)/g, ( ...args ) => { return ( args[1] as string ).toUpperCase(); }); // Uppercases the first character
	}

	return cookedStr;
}

///**
// * Get all immediate child elements with the specified tag.
// * @param elem     - the HTML element to search.
// * @param childTag - a string to match in the child classes.
// * @return list of the immediate child elements with the specified tag.
// */
//function getDecendentsByClassTag( elem : Type_HtmlElement, arrClassTag: string[] ) : Type_HtmlElementCollection
//{
//	const arrDecendentElemList = [];
//	let   children : Element[] = [];
//
//	if ( elem !== null ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
//		children = Array.from( elem.childNodes ) as Element[];
//	}
//
//	const arrSearchTag = arrClassTag.map( tag => tag.toLowerCase() );
//
//	for ( const child of children ) {
//		//console.log( 'Child: ', JSON.stringify(child), typeof child );
//		try {
//			if ( ( typeof child === 'object' ) && child.getAttribute ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
//				const childClass = child.getAttribute( 'class' );
//				//console.log( 'Child class: ', childClass, typeof childClass );
//				if ( childClass != null ) {
//					arrSearchTag.forEach( classTag => {
//						if ( childClass.toLowerCase().includes( classTag ) ) {
//							arrDecendentElemList.push( child );
//						}
//					} );
//					const arrMore = getDecendentsByClassTag( child, arrSearchTag );
//					arrDecendentElemList.push( ...arrMore );
//				} else {
//					const arrMore = getDecendentsByClassTag( child, arrSearchTag );
//					arrDecendentElemList.push( ...arrMore );
//				}
//			}
//		}
//		catch ( err ) {
//			console.log( 'getDecendentsByClassTag: ', (err as Error).message );
//		}
//	}
//
//	return arrDecendentElemList;
//}

/**
 * @param object with properties:
 *         - className: the name of a class.
 *         - classTag:  a class name or array of class names.
 * @returns true if className case insensitive matches a classTag.
 */
function elementClassTagMatches( { className, classTag } : Type_elementClassTagMatches_args ) : Type_elementClassTagMatches_ret {
	let bMatch      = true; // Default to true
	let arrClassTag = [];

	if ( Array.isArray( classTag ) ) {
		arrClassTag = classTag;
	} else {
		arrClassTag = [ classTag ];
	}

	arrClassTag.forEach( classTagItem => {
		let   thisClassTag = classTagItem;
		const matchResult  = /^!(.*)/.exec(classTagItem);
		if ( matchResult ) {
			thisClassTag = matchResult[ 1 ];
			//console.log( `Matching not: ${thisClassTag}` );
			bMatch = bMatch && ( !className.toLowerCase().includes( thisClassTag.toLowerCase() ) );
			//console.log( `Result: ${bMatch}` );
		} else {
			bMatch = bMatch && ( className.toLowerCase().includes( thisClassTag.toLowerCase() ) );
		}
	} );

	return bMatch;
}

/**
 * Get all immediate child elements with the specified tag.
 * @param object with properties:
 *          - elem                  : the HTML element to search.
 *          - arrTagNameAndClassTag : array of objects with properties:
 *                                     - tagName:  HTML tag name;
 *                                     - classTag: a class name, or a negated class name, e.g., '!myclass';
 *                                     - retProp:  the name of the property in which to return the data.
 * @return object with properties being the requested return properties and value being either the found child object.
 */
function getDecendentsByTagNameAndClassTag( { elem, arrTagNameAndClassTag } : Type_getDecendentsByTagNameAndClassTag_args ) : Type_getDecendentsByTagNameAndClassTag_ret
{
	const objFoundElement : Type_FoundElement = {};
	let   children        : Element[] = [];

	if ( elem !== null ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		children = Array.from( elem.childNodes ) as Element[];
	}

	function processChild( child: Element ) : void {
		try {
			if ( ( typeof child === 'object' ) && child.getAttribute ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
				const childClass = child.getAttribute( 'class' );
				//console.log( 'Child tagName: ', `[${child.tagName}]` );
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
		catch ( err ) {
			console.log( 'getDecendentsByTypeAndClassTag: ', (err as Error).message );
		}
	}

	for ( const child of children ) {
		processChild( child );
	}

	return objFoundElement;
}

function extractFoundElementText( el : Element | Element[] ) : string {
	const arrEl = ( Array.isArray( el ) ? el : [ el ] );
	const text  = arrEl.map( e => e.innerHTML ).join( '-' );
	return text;
}

function extractFoundElementImageURI( el : Element | Element[] ) : string {
	const imageElement = ( Array.isArray( el ) ? el[ 0 ] : el );
	const uri          = (imageElement as HTMLEmbedElement).src;
	return uri;
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
	console.log('Link element');
	console.log( linkElem );
	const arrSearchItem : Type_ElementTagNameAndClassTag[] = [
		{ tagName: 'img',  classTag: 'sw-object-cover',                               retProp: 'image' },
		{ tagName: 'span', classTag: 'sw-text-primary',                               retProp: 'title' },
		{ tagName: 'p',    classTag: [ 'sw-text-long-primer', '!sw-text-secondary' ], retProp: 'primary' },
		{ tagName: 'p',    classTag: 'sw-text-secondary',                             retProp: 'secondary' },
	];
	const objFoundItem = getDecendentsByTagNameAndClassTag( { elem: linkElem, arrTagNameAndClassTag: arrSearchItem } );

	const objProgAttributes : Type_ProgramAttributes = {
		title:     '',
		episode:   '',
		synopsis:  '',
		image_uri: '',
	};

	console.log('objFoundItem');
	console.log(objFoundItem);

	if ( objFoundItem.title ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		objProgAttributes.title    = extractFoundElementText( objFoundItem.title );
	}
	if ( objFoundItem.primary ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		objProgAttributes.episode  = extractFoundElementText( objFoundItem.primary );
	}
	if ( objFoundItem.image ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		objProgAttributes.image_uri = extractFoundElementImageURI(objFoundItem.image );
	}
	if ( objFoundItem.secondary ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		objProgAttributes.synopsis += extractFoundElementText( objFoundItem.secondary );
	}

	console.log('objProgAttributes');
	console.log(objProgAttributes);

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
 * Change known program names into favourite names, e.g., "Clue".
 * Remove special characters from the name.
 * @param name - the program name to change.
 * @return the cooked name.
 */
export function cookTitle( rawTitle : Type_cookTitle_args ) : Type_cookTitle_ret
{
	const arrConversion : Type_TextConversionList = [
		...ARR_COMMON_TEXT_CONVERSIONS,
		[ /[/?\s]/g,          '-' ], // TODO - need to replace more special characters
		[ /[\u007F-\uFFFF]/g, '-' ], // Replace all non-ASCII characters with a dash
	];

	const knownTitle     = convertKnownTitle( rawTitle );
	const convertedTitle = convertText( { arrConversion, rawText: knownTitle } );

	return convertedTitle;
}

function padEpisode( episode : string ) : string {
	const iSlice = - ( episode.length > 2 ? episode.length : 2 );
	return `000${episode}`.slice( iSlice );
}

/**
 * @param rawText : the text to process.
 * @returns array of one or more text items, containing items matched as episode numbers.
 */
function cookEpisode( rawText : Type_cookEpisode_args ) : Type_cookEpisode_ret
{
	let arrCookedText : string[] = [];

	const matchEpisodeOf = (strText: string) : string[] => {
		let arrCookedEpisode : string[] = [];
		if ( ! /^[0-9]+\/[0-9]+\/[0-9]+/.exec(strText) ) {
			const matchedEpisode = /(.*?)([0-9]+)\/([0-9]+)/.exec(strText);
			if ( matchedEpisode ) {
				arrCookedEpisode = [ matchedEpisode[1], `S${matchedEpisode[3]}E${matchedEpisode[2]}` ];
				console.log( `Cooked ${arrCookedEpisode.join(' ')}` );
			}
		}
		return arrCookedEpisode;
	};

	//console.log( `Cooking episode` );
	//console.log( rawText );
	const matchedSeriesAndEpisode = /(Series) ([0-9]+)-([0-9]+)/i.exec(rawText); // Separator added by extractFoundElementText
	if ( matchedSeriesAndEpisode ) {
		console.log( `Matched series and episode` );
		arrCookedText = [ `${padEpisode(matchedSeriesAndEpisode[3])}/${matchedSeriesAndEpisode[2]}` ];
	} else {
		const matchedSeries = /(Series) ([0-9]+)/i.exec(rawText);
		if ( matchedSeries ) {
			console.log( `Matched series` );
			arrCookedText = [ `${matchedSeries[1]}${matchedSeries[2]}` ];
		} else {
			const matchedEpisodeNum = /^Episode ([0-9]+)/.exec(rawText);
			if ( matchedEpisodeNum ) {
				//console.log( `Matched episode number` );
				arrCookedText = [ matchedEpisodeNum[1], matchedEpisodeNum[2] ];
			} else {
				const matchedEpisodeString = /^Episode ([-a-z]+)/.exec(rawText);
				if ( matchedEpisodeString ) {
					//console.log( `Matched episode string` );
					arrCookedText = [ matchedEpisodeString[1], matchedEpisodeString[2] ];
				} else if ( ! /^[0-9]+\/[0-9]+\/[0-9]+/.exec(rawText) ) {
					const matchedNumberDot = /^([0-9]+)\.(.*)/.exec(rawText);
					if ( matchedNumberDot ) {
						//console.log( `Matched number dot` );
						arrCookedText = [ matchedNumberDot[1], matchedNumberDot[2] ];
					}
				}
			}
		}
	}

	//if ( matched = /(Series) ([0-9]+)/i.exec(rawText) ) {
	//	console.log( `Matched series` );
	//	arrCookedText = [ `${matched[1]}${matched[2]}` ];
	//} else if ( matched = /^([0-9]+)\.(.*)/.exec(rawText) ) {
	//	console.log( `Matched episode` );
	//	arrCookedText = [ matched[1], matched[2] ];
	//}
	let episodeItem : string;
	if ( arrCookedText.length ) {
		episodeItem = arrCookedText.pop() ?? ''; // Will never hit the default unless the previous code is changed
	} else {
		episodeItem = rawText;
	}
	const arrEpisode = matchEpisodeOf( episodeItem );

	if ( arrEpisode.length ) {
		arrCookedText.push( ...arrEpisode );
	} else {
		arrCookedText.push( episodeItem );
	}

	return arrCookedText;
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

	//console.log( 'Synopis: is ' + arrItem[ 0 ] );

	return convertText( { arrConversion, rawText: synopsis } );
}

//synopsis.split( '' ).forEach( c => {
//  const iChar = c.charCodeAt(0);
//  if ( ! c.match( /[A-Za-z ,.;:]/) ) {
//    console.log( 'Char: ' + c + '=0x' + iChar.toString(16) );
//  }
//} );

export function getProgDetailsFromLink( textHTML : Type_getProgDetailsFromLink_args ) : Type_getProgDetailsFromLink_ret
{
	const parser         = new DOMParser();
	const htmlDoc        = parser.parseFromString( textHTML, "text/html" );
	//console.log( htmlDoc );
	const linkElemList   = htmlDoc.getElementsByTagName( 'A' );
	const linkElem       = linkElemList[ 0 ];
	const objAttributes  = getProgAttributes( linkElem );
	console.log( 'Program attributes: ' + JSON.stringify( objAttributes, null, 2 ) );
	const arrEpisode     = cookEpisode( objAttributes.episode );
	const rawTitle       = [ objAttributes.title, ...arrEpisode ]
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

export default {};

export const privateDefs = {};

if ( process.env.NODE_ENV === 'test-unit' ) {
	Object.assign( privateDefs, {
		convertToCamelCase,
		elementClassTagMatches,
		getDecendentsByTagNameAndClassTag,
		getProgAttributes,
		convertText,
		cookEpisode,
	} );
}
