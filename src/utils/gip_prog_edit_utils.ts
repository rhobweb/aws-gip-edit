
import { PROG_FIELD_SYNOPSIS, PROG_FIELD_TITLE, PROG_FIELD_IMAGE_URI } from './gip_types';
import { convertKnownTitle }  from './gip_prog_title_utils';

//type TypeHtmlElement       = {
//  //childNodes?:   object[],
//  childNodes?:   NodeListOf<ChildNode>,
//  getAttribute?: ( param: string ) => string,
//  innerHTML?:    string,
//  src?:          string,
//};

type TypeHtmlElement           = Element;
type TypeHtmlElementCollection = TypeHtmlElement[];

//type TypeHtmlElement           = Element;
//type TypeHtmlElementCollection = HTMLCollectionOf<Element>;

type TypeProgramAttributes = {
	title:     string,
	episode:   string,
	synopsis:  string,
	image_uri: string,
};

type TypeElementTagNameAndClassTag = {
	tagName:  string,
	classTag: string | string[],
	retProp:  string,
};

type TypeFoundElement = Record<string,TypeHtmlElement>;

/**
 * Convert the specified string to camelcase, with first letter capitalised.
 * @param str - string to convert.
 * @return string in camelcase format.
 */
function convertToCamelCase( str : string ) : string
{
	let cookedStr = str;

	if ( /\s/g.test(str) ) // Only camelcase if the string contains whitespace
	{
		cookedStr = str.toLowerCase()    // Lower cases the string
			.replace( /[-_]+/g, ' ')       // Replaces any - or _ characters with a space 
			.replace( /[^\w\s]/g, '')      // Removes any non alphanumeric characters 
			.replace( /\s+/g, ' ' )        // Shrink multiple spaces
			.replace( / (.)/g, ( ...args ) => { return args[1].toUpperCase(); })  // Uppercases first char in each group after a space 
			.replace( / /g, '' )           // Removes spaces 
			.replace( /^(.)/g, ( ...args ) => { return args[1].toUpperCase(); }); // Uppercases the first character
	}

	return cookedStr;
}

/**
 * Get all immediate child elements with the specified tag.
 * @param elem     - the HTML element to search.
 * @param childTag - a string to match in the child classes. 
 * @return list of the immediate child elements with the specified tag.
 */
function getDecendentsByClassTag( elem : TypeHtmlElement, arrClassTag: string[] ) : TypeHtmlElementCollection
{
	const arrDecendentElemList      = [];
	let   children : Array<Element> = [];

	if ( elem !== null ) {
		children = Array.from( elem.childNodes ) as Array<Element>;
	}

	const arrSearchTag = arrClassTag.map( tag => tag.toLowerCase() );

	for ( let i = 0; i < children.length; ++i ) {
		const child = children[i];
		//console.log( 'Child: ', JSON.stringify(child), typeof child );
		try {
			if ( ( typeof child === 'object' ) && child.getAttribute ) {
				const childClass = child.getAttribute( 'class' );
				//console.log( 'Child class: ', childClass, typeof childClass );
				if ( childClass != null ) {
					arrSearchTag.forEach( classTag => {
						if ( childClass.toLowerCase().indexOf( classTag ) !== -1 ) {
							arrDecendentElemList.push( child );
						}
					} );
					const arrMore = getDecendentsByClassTag( child, arrSearchTag );
					arrDecendentElemList.push( ...arrMore );
				} else {
					const arrMore = getDecendentsByClassTag( child, arrSearchTag );
					arrDecendentElemList.push( ...arrMore );
				}
			}
		}
		catch ( err ) {
			console.log( 'getDecendentsByClassTag: ', (<Error>err).message );
		}
	}

	return arrDecendentElemList;
}

function elementClassTagMatches( classNames : string, classTag : string | string[] ) : boolean {
	let bMatch      = true; // Default to true
	let arrClassTag = [];

	if ( Array.isArray( classTag ) ) {
		arrClassTag = classTag;
	} else {
		arrClassTag = [ classTag ];
	}

	arrClassTag.forEach( classTagItem => {
		let   thisClassTag = classTagItem;
		const matchResult  = classTagItem.match( /^!(.*)/ );
		if ( matchResult ) {
			thisClassTag = matchResult[ 1 ];
			//console.log( `Matching not: ${thisClassTag}` );
			bMatch = bMatch && ( classNames.toLowerCase().indexOf( thisClassTag.toLowerCase() ) === -1 );
			//console.log( `Result: ${bMatch}` );
		} else {
			bMatch = bMatch && ( classNames.toLowerCase().indexOf( thisClassTag.toLowerCase() ) !== -1 );
		}
	} );

	return bMatch;
}

/**
 * Get all immediate child elements with the specified tag.
 * @param elem                  - the HTML element to search.
 * @param arrTagNameAndClassTag - array of objects with properties:
 *                                 - tagName:  HTML tag name;
 *                                 - classTag: a class name, or a negated class name, e.g., '!myclass';
 *                                 - retProp:  the name of the property in which to return the data.
 * @return object with properties being the requested return properties and value being either the found child object.
 */
function getDecendentsByTagNameAndClassTag( elem : TypeHtmlElement, arrTagNameAndClassTag: TypeElementTagNameAndClassTag[] ) : TypeFoundElement
{
	const objFoundElement : TypeFoundElement = {};
	let   children        : Array<Element> = [];

	if ( elem !== null ) {
		children = Array.from( elem.childNodes ) as Array<Element>;
	}

	for ( let i = 0; i < children.length; ++i ) {
		const child = children[i];
		//console.log( 'Child: ', JSON.stringify(child), typeof child );
		try {
			if ( ( typeof child === 'object' ) && child.getAttribute ) {
				const childClass = child.getAttribute( 'class' );
				//console.log( 'Child tagName: ', `[${child.tagName}]` );
				if ( childClass != null ) {
					arrTagNameAndClassTag.forEach( tagNameAndClassTag => {
						if ( ( child.tagName.toLowerCase() === tagNameAndClassTag.tagName.toLowerCase() ) && elementClassTagMatches( childClass, tagNameAndClassTag.classTag ) ) {
							if ( ! objFoundElement[ tagNameAndClassTag.retProp ] ) {
								objFoundElement[ tagNameAndClassTag.retProp ] = child;
							} else {
								console.log( `Found multiple: ${tagNameAndClassTag.retProp}` );
							}
						}
					} );
					const objFoundChildElements = getDecendentsByTagNameAndClassTag( child, arrTagNameAndClassTag );
					Object.assign( objFoundChildElements, objFoundElement ); // Do not overwrite existing properties
					Object.assign( objFoundElement, objFoundChildElements );
				} else {
					const objFoundChildElements = getDecendentsByTagNameAndClassTag( child, arrTagNameAndClassTag );
					Object.assign( objFoundChildElements, objFoundElement ); // Do not overwrite existing properties
					Object.assign( objFoundElement, objFoundChildElements );
				}
			}
		}
		catch ( err ) {
			console.log( 'getDecendentsByTypeAndClassTag: ', (<Error>err).message );
		}
	}

	return objFoundElement;
}

/**
 * Get the program attributes from a dragged and dropped iPlayer link.
 * @param linkElem - the <a> HTML element containing the link data.
 * @return object with attributes "name" and "episode".
 */
function getProgAttributes( linkElem: TypeHtmlElement ) {
	console.log('Link element');
	console.log(linkElem);
	const arrSearchItem : TypeElementTagNameAndClassTag[] = [
		{ tagName: 'img',  classTag: 'sw-object-cover',                               retProp: 'image' },
		{ tagName: 'span', classTag: 'sw-text-primary',                               retProp: 'title' },
		{ tagName: 'p',    classTag: [ 'sw-text-long-primer', '!sw-text-secondary' ], retProp: 'primary' },
		{ tagName: 'p',    classTag: [ 'sw-text-long-primer', 'sw-text-secondary' ],  retProp: 'secondary' },
	];
	const objFoundItem = getDecendentsByTagNameAndClassTag( linkElem, arrSearchItem );

	const objProgAttributes : TypeProgramAttributes = {
		title:     '',
		episode:   '',
		synopsis:  '',
		image_uri: '',
	};

	console.log('objFoundItem');
	console.log(objFoundItem);

	if ( objFoundItem.title ) {
		objProgAttributes.title    = objFoundItem.title.innerHTML;
	}
	if ( objFoundItem.primary ) {
		objProgAttributes.episode  = objFoundItem.primary.innerHTML;
	}
	if ( objFoundItem.image ) {
		objProgAttributes.image_uri = (<HTMLEmbedElement>objFoundItem.image).src;
	}
	if ( objFoundItem.secondary ) {
		objProgAttributes.synopsis  = objFoundItem.secondary.innerHTML;
	}
	console.log('objProgAttributes');
	console.log(objProgAttributes);

	return objProgAttributes;
}

type TypeTextConversionItem = [ ( string | RegExp ), string ];
type TypeTextConversionList = TypeTextConversionItem[];

const ARR_COMMON_TEXT_CONVERSIONS : TypeTextConversionList = [
	[ '\u{2019}', '\'' ],
	[ '\u{0060}', '\'' ],
	[ '&amp;',    '&'  ],
];

export function convertText( arrConversion : TypeTextConversionList, rawText : string ) : string
{
	let cookedText = rawText;
	arrConversion.forEach( ([search, replace]) => {
		if ( typeof search === 'object' ) {
			cookedText = cookedText.replace( search, replace );
		} else {
			cookedText = cookedText.replace( new RegExp( search, 'g' ), replace );
		}
	} );
	return cookedText;
}

/**
 * Change known program names into favourite names, e.g., "Clue".
 * Remove special characters from the name.
 * @param name - the program name to change.
 * @return the cooked name.
 */
export function cookTitle( rawTitle : string ) : string
{
	const arrConversion : TypeTextConversionList = [
		...ARR_COMMON_TEXT_CONVERSIONS,
		[ /[/?\s]/g,          '-' ], // TODO - need to replace more special characters
		[ /[\u007F-\uFFFF]/g, '-' ], // Replace all non-ASCII characters with a dash
	];

	const knownTitle     = convertKnownTitle( rawTitle );
	const convertedTitle = convertText( arrConversion, knownTitle );

	return convertedTitle;
}

function cookEpisode( rawText : string ) : string[]
{
	let arrCookedText : string[] = [];
	let matched;

	const matchEpisodeOf = (strText: string) => {
		let arrCookedEpisode : string[] = [];
		let matchedEpisode;
		if ( matchedEpisode = strText.match( /(.*?)([0-9]+)\/([0-9]+)/ ) ) {
			arrCookedEpisode = [ matchedEpisode[1], `${matchedEpisode[2]}of${matchedEpisode[3]}` ];
			console.log( `Cooked ${arrCookedEpisode.join(' ')}` );
		}
		return arrCookedEpisode;
	};

	//console.log( `Cooking episode` );
	//console.log( rawText );
	if ( matched = rawText.match( /(Series) ([0-9]+)/i ) ) {
		arrCookedText = [ `${matched[1]}${matched[2]}` ];
	} else if ( matched = rawText.match( /^([0-9]+)\.(.*)/ ) ) {
		arrCookedText = [ matched[1], matched[2] ];
	}
	let episodeItem : string;
	let arrEpisode;
	if ( arrCookedText.length ) {
		episodeItem = arrCookedText.pop() || ''; // Will never hit the default unless the previous code is changed
	} else {
		episodeItem = rawText;
	}
	arrEpisode = matchEpisodeOf( episodeItem );

	if ( arrEpisode.length ) {
		arrCookedText.push( ...arrEpisode );
	} else {
		arrCookedText.push( episodeItem );
	}

	return arrCookedText;
}

export function cookSynopsis( rawText : string, episode: string | null = null ) {
	const arrConversion = [
		...ARR_COMMON_TEXT_CONVERSIONS,
	];

	const arrItem  = [ rawText ];
	if ( episode ) {
		arrItem.push( episode );
	}
	const synopsis = arrItem.join( ' ' );

	return convertText( arrConversion, synopsis );
}

//synopsis.split( '' ).forEach( c => {
//  const iChar = c.charCodeAt(0);
//  if ( ! c.match( /[A-Za-z ,.;:]/) ) {
//    console.log( 'Char: ' + c + '=0x' + iChar.toString(16) );
//  }
//} );

export function getProgDetailsFromLink( textHTML : string )
{
	const parser         = new DOMParser();
	const htmlDoc        = parser.parseFromString( textHTML, "text/html" );
	//console.log( htmlDoc );
	const linkElemList   = htmlDoc.getElementsByTagName( 'A' );
	const linkElem       = linkElemList[ 0 ];
	const objAttributes  = getProgAttributes( linkElem );
	//console.log( JSON.stringify( objAttributes, null, 2 ) );
	const arrEpisode     = cookEpisode( objAttributes.episode );
	const rawTitle       = [ objAttributes.title, ...arrEpisode ]
														.map( el => convertToCamelCase( el ) )
														.filter( val => ( val.length > 0 ) )
														.join( '-' );
	const title         = cookTitle( rawTitle );
	const synopsis      = cookSynopsis( objAttributes.synopsis, objAttributes.episode );
	const image_uri     = objAttributes.image_uri;
	const result = {
		[PROG_FIELD_TITLE]:     title,
		[PROG_FIELD_SYNOPSIS]:  synopsis,
		[PROG_FIELD_IMAGE_URI]: image_uri,
	};
	return result;
}
