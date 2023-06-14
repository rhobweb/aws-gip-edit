
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
      }
      }
    }
    catch ( err ) {
      console.log( 'getDecendentsByClassTag: ', (<Error>err).message );
    }
  }

  return arrDecendentElemList;
}

/**
 * Get the program attributes from a dragged and dropped iPlayer link.
 * @param linkElem - the <a> HTML element containing the link data.
 * @return object with attributes "name" and "episode".
 */
function getProgAttributes( linkElem: TypeHtmlElement ) {
  // console.log('Link element');
  // console.log(linkElem);
  const childElemList     = getDecendentsByClassTag( linkElem, [ 'metadata', 'responsive-image' ] );
  const objProgAttributes : TypeProgramAttributes = {
    title:     '',
    episode:   '',
    synopsis:  '',
    image_uri: '',
  };

  for (let i = 0; i < childElemList.length; ++i) {
    const childElem = childElemList[ i ];
    const attr      = childElem.getAttribute( 'class' );

    if ( attr ) {
      if ( attr.indexOf( 'primary' ) >= 0 ) {
        objProgAttributes.title    = childElem.innerHTML;
      } else if ( attr.indexOf( 'secondary' ) >= 0 ) {
        objProgAttributes.episode  = childElem.innerHTML;
      } else if ( attr.indexOf( 'synopsis' ) >= 0 ) {
        objProgAttributes.synopsis = childElem.innerHTML;
      } else if ( attr.indexOf( 'responsive-image__img' ) >= 0 ) {
        objProgAttributes.image_uri = (<HTMLEmbedElement>childElem).src;
      }
    }
  }

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
  let   arrCookedText = [ rawText ];
  const matched       = rawText.match( /^([0-9]+)\.(.*)/ );

  if ( matched ) {
    arrCookedText = [ matched[1], matched[2] ];
  }

  return arrCookedText;
}

export function cookText( rawText : string ) {
  const arrConversion = [
    ...ARR_COMMON_TEXT_CONVERSIONS,
  ];

  return convertText( arrConversion, rawText );
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
  const synopsis      = cookText( objAttributes.synopsis );
  const image_uri     = objAttributes.image_uri;
  const result = {
    [PROG_FIELD_TITLE]:     title,
    [PROG_FIELD_SYNOPSIS]:  synopsis,
    [PROG_FIELD_IMAGE_URI]: image_uri,
  };
  return result;
}
