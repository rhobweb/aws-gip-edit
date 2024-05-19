
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
 * @param elem     - the HTML element to search.
 * @param childTag - a string to match in the child classes. 
 * @return object with properties being the requested return properties and values being either the .
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
              objFoundElement[ tagNameAndClassTag.retProp ] = child;
            }
          } );
          const objFoundChildElements = getDecendentsByTagNameAndClassTag( child, arrTagNameAndClassTag );
          Object.assign( objFoundElement, objFoundChildElements );
        } else {
          const objFoundChildElements = getDecendentsByTagNameAndClassTag( child, arrTagNameAndClassTag );
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
  //const childElemList     = getDecendentsByClassTag( linkElem, [ 'metadata', 'responsive-image' ] );
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

/*
<a
href="https://www.bbc.co.uk/sounds/play/m001zdx3"
aria-label="18:15, Loose Ends, Frank Skinner, Maxine Peake, Kathryn Hughes, Rachel Fairburn join Stuart Maconie with music by Willy Vlautin and Phoebe Green, Stuart Maconie and guests with an eclectic mix of conversation, music and comedy."
data-bbc-container="schedule_items"
data-bbc-content-label="content"
data-bbc-event-type="select"
data-bbc-metadata="{&quot;APP&quot;:&quot;responsive::sounds&quot;,&quot;BID&quot;:&quot;b006qjym&quot;,&quot;POS&quot;:&quot;3::1&quot;,&quot;SIS&quot;:&quot;on-demand&quot;}"
data-bbc-source="bbc_radio_fourfm"
class="sw-group sw-block sw-w-full">
<div class="sw-max-w-schedule sw-flex sw-flex-wrap">
<div class="sw-w-5/24"><time class="sw-text-great-primer sw-text-primary">18:15</time></div>
<div class="sw-w-19/24 sw--ml-2 m:sw--ml-4 sw-pl-4"><div class="sw-relative sw-group sw-flex">
<div class="sw-w-full sw-flex sw-grow">
<div class="sw-relative sw-hidden m:sw-block sw-w-1/5 sw-self-start">
<div class="sw-bg-grey-6">
<div class="sw-aspect-w-1 sw-aspect-h-1">
<picture>
<source type="image/webp" srcset="https://ichef.bbci.co.uk/images/ic/160x160/p0hyq32k.jpg.webp 160w,https://ichef.bbci.co.uk/images/ic/192x192/p0hyq32k.jpg.webp 192w,https://ichef.bbci.co.uk/images/ic/224x224/p0hyq32k.jpg.webp 224w,https://ichef.bbci.co.uk/images/ic/288x288/p0hyq32k.jpg.webp 288w,https://ichef.bbci.co.uk/images/ic/368x368/p0hyq32k.jpg.webp 368w,https://ichef.bbci.co.uk/images/ic/400x400/p0hyq32k.jpg.webp 400w,https://ichef.bbci.co.uk/images/ic/448x448/p0hyq32k.jpg.webp 448w,https://ichef.bbci.co.uk/images/ic/496x496/p0hyq32k.jpg.webp 496w,https://ichef.bbci.co.uk/images/ic/512x512/p0hyq32k.jpg.webp 512w,https://ichef.bbci.co.uk/images/ic/576x576/p0hyq32k.jpg.webp 576w,https://ichef.bbci.co.uk/images/ic/624x624/p0hyq32k.jpg.webp 624w" sizes="(max-width: 599px) 50vw, (max-width: 899px) 33vw, (max-width: 1279px) 17vw, 194.66px"><source type="image/jpg" srcset="https://ichef.bbci.co.uk/images/ic/160x160/p0hyq32k.jpg 160w,https://ichef.bbci.co.uk/images/ic/192x192/p0hyq32k.jpg 192w,https://ichef.bbci.co.uk/images/ic/224x224/p0hyq32k.jpg 224w,https://ichef.bbci.co.uk/images/ic/288x288/p0hyq32k.jpg 288w,https://ichef.bbci.co.uk/images/ic/368x368/p0hyq32k.jpg 368w,https://ichef.bbci.co.uk/images/ic/400x400/p0hyq32k.jpg 400w,https://ichef.bbci.co.uk/images/ic/448x448/p0hyq32k.jpg 448w,https://ichef.bbci.co.uk/images/ic/496x496/p0hyq32k.jpg 496w,https://ichef.bbci.co.uk/images/ic/512x512/p0hyq32k.jpg 512w,https://ichef.bbci.co.uk/images/ic/576x576/p0hyq32k.jpg 576w,https://ichef.bbci.co.uk/images/ic/624x624/p0hyq32k.jpg 624w" sizes="(max-width: 599px) 50vw, (max-width: 899px) 33vw, (max-width: 1279px) 17vw, 194.66px">
<img src="https://ichef.bbci.co.uk/images/ic/400x400/p0hyq32k.jpg" alt="" loading="lazy" class="sw-w-full sw-h-full sw-object-cover">
</picture>
</div></div>
<div class="sw-absolute sw-w-full sw-h-full sw-top-0 sw-opacity-0 sw-bg-[rgba(0,_0,_0,_0.85)] sw-duration-350 sw-transition-bg-color group-active:sw-opacity-100 group-focus:sw-opacity-100 group-hover:sw-opacity-100 motion-reduce:sw-transition-none sw-border-2 sw-border-[transparent] sw-border-solid xl:sw-border-4"><svg width="32px" height="32px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" class="sw-absolute sw-ml-0.5 sw-left-1/2 sw-top-1/2 -sw-translate-x-1/2 -sw-translate-y-1/2 sw-fill-grey-1 sw-transition sw-ease sw-duration-350 motion-reduce:sw-transition-none" aria-hidden="true" focusable="false"><path d="M3 32l26-16L3 0z"></path></svg></div></div><div class="sw-pl-2 m:sw-pl-4 sw-w-10/12 m:sw-w-4/5">
<div class="sw-text-primary">
<span class="sw-text-primary sw-font-bold sw-transition sw-ease sw-transition-color sw-duration-350 motion-reduce:sw-transition-none group-active:sw-text-accent group-active:sw-underline group-focus:sw-text-accent group-focus:sw-underline group-hover:sw-text-accent group-hover:sw-underline sw-text-pica sw-antialiased sw-text-primary">Loose Ends</span>
<p class="sw-text-long-primer sw-mt-1">Frank Skinner, Maxine Peake, Kathryn Hughes, Rachel Fairburn join Stuart Maconie with music by Willy Vlautin and Phoebe Green</p>
<p class="sw-text-secondary sw-text-long-primer sw-mt-1 sw-hidden m:sw-block">Stuart Maconie and guests with an eclectic mix of conversation, music and comedy.</p>
</div></div>
<div class="sw-w-1/4 m:sw-hidden sw-flex sw-items-center sw-justify-end sw-grow sw-shrink-0"><div class="sw-flex sw-items-center sw-justify-center sw-rounded-full sw-fill-grey-1 sw-bg-sounds-core sw-w-6 sw-h-6 group-hover:sw-bg-sounds-dark"><svg width="10px" height="10px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" class="sw-fill-grey-1 sw-ml-0.5 sw-transition sw-ease sw-duration-350 motion-reduce:sw-transition-none" aria-hidden="true" focusable="false"><path d="M3 32l26-16L3 0z">
</path></svg></div></div></div></div></div></div></a>


<a href="https://www.bbc.co.uk/sounds/play/m001z6t0" aria-label="12:30, Dead Ringers, Series 24, Politics, world affairs, the culture wars and Mr Blobby." data-bbc-container="schedule_items" data-bbc-content-label="content" data-bbc-event-type="select" data-bbc-metadata="{&quot;APP&quot;:&quot;responsive::sounds&quot;,&quot;BID&quot;:&quot;b007gd85&quot;,&quot;POS&quot;:&quot;3::1&quot;,&quot;SIS&quot;:&quot;on-demand&quot;}" data-bbc-source="bbc_radio_fourfm" class="sw-group sw-block sw-w-full">
<div class="sw-max-w-schedule sw-flex sw-flex-wrap">
<div class="sw-w-5/24">
<time class="sw-text-great-primer sw-text-primary">12:30</time></div><div class="sw-w-19/24 sw--ml-2 m:sw--ml-4 sw-pl-4">
<div class="sw-relative sw-group sw-flex">
<div class="sw-w-full sw-flex sw-grow">
<div class="sw-relative sw-hidden m:sw-block sw-w-1/5 sw-self-start"><div class="sw-bg-grey-6">
<div class="sw-aspect-w-1 sw-aspect-h-1">
<picture><source type="image/webp" srcset="https://ichef.bbci.co.uk/images/ic/160x160/p0cc5g9v.jpg.webp 160w,https://ichef.bbci.co.uk/images/ic/192x192/p0cc5g9v.jpg.webp 192w,https://ichef.bbci.co.uk/images/ic/224x224/p0cc5g9v.jpg.webp 224w,https://ichef.bbci.co.uk/images/ic/288x288/p0cc5g9v.jpg.webp 288w,https://ichef.bbci.co.uk/images/ic/368x368/p0cc5g9v.jpg.webp 368w,https://ichef.bbci.co.uk/images/ic/400x400/p0cc5g9v.jpg.webp 400w,https://ichef.bbci.co.uk/images/ic/448x448/p0cc5g9v.jpg.webp 448w,https://ichef.bbci.co.uk/images/ic/496x496/p0cc5g9v.jpg.webp 496w,https://ichef.bbci.co.uk/images/ic/512x512/p0cc5g9v.jpg.webp 512w,https://ichef.bbci.co.uk/images/ic/576x576/p0cc5g9v.jpg.webp 576w,https://ichef.bbci.co.uk/images/ic/624x624/p0cc5g9v.jpg.webp 624w" sizes="(max-width: 599px) 50vw, (max-width: 899px) 33vw, (max-width: 1279px) 17vw, 194.66px"><source type="image/jpg" srcset="https://ichef.bbci.co.uk/images/ic/160x160/p0cc5g9v.jpg 160w,https://ichef.bbci.co.uk/images/ic/192x192/p0cc5g9v.jpg 192w,https://ichef.bbci.co.uk/images/ic/224x224/p0cc5g9v.jpg 224w,https://ichef.bbci.co.uk/images/ic/288x288/p0cc5g9v.jpg 288w,https://ichef.bbci.co.uk/images/ic/368x368/p0cc5g9v.jpg 368w,https://ichef.bbci.co.uk/images/ic/400x400/p0cc5g9v.jpg 400w,https://ichef.bbci.co.uk/images/ic/448x448/p0cc5g9v.jpg 448w,https://ichef.bbci.co.uk/images/ic/496x496/p0cc5g9v.jpg 496w,https://ichef.bbci.co.uk/images/ic/512x512/p0cc5g9v.jpg 512w,https://ichef.bbci.co.uk/images/ic/576x576/p0cc5g9v.jpg 576w,https://ichef.bbci.co.uk/images/ic/624x624/p0cc5g9v.jpg 624w" sizes="(max-width: 599px) 50vw, (max-width: 899px) 33vw, (max-width: 1279px) 17vw, 194.66px">
<img src="https://ichef.bbci.co.uk/images/ic/400x400/p0cc5g9v.jpg" alt="" loading="lazy" class="sw-w-full sw-h-full sw-object-cover">
</picture>
</div></div>
<div class="sw-absolute sw-w-full sw-h-full sw-top-0 sw-opacity-0 sw-bg-[rgba(0,_0,_0,_0.85)] sw-duration-350 sw-transition-bg-color group-active:sw-opacity-100 group-focus:sw-opacity-100 group-hover:sw-opacity-100 motion-reduce:sw-transition-none sw-border-2 sw-border-[transparent] sw-border-solid xl:sw-border-4"><svg width="32px" height="32px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" class="sw-absolute sw-ml-0.5 sw-left-1/2 sw-top-1/2 -sw-translate-x-1/2 -sw-translate-y-1/2 sw-fill-grey-1 sw-transition sw-ease sw-duration-350 motion-reduce:sw-transition-none" aria-hidden="true" focusable="false">
<path d="M3 32l26-16L3 0z"></path>
</svg></div></div>
<div class="sw-pl-2 m:sw-pl-4 sw-w-10/12 m:sw-w-4/5">
<div class="sw-text-primary">
<span class="sw-text-primary sw-font-bold sw-transition sw-ease sw-transition-color sw-duration-350 motion-reduce:sw-transition-none group-active:sw-text-accent group-active:sw-underline group-focus:sw-text-accent group-focus:sw-underline group-hover:sw-text-accent group-hover:sw-underline sw-text-pica sw-antialiased sw-text-primary">Dead Ringers</span>
<p class="sw-text-long-primer sw-mt-1">Series 24</p>
<p class="sw-text-secondary sw-text-long-primer sw-mt-1 sw-hidden m:sw-block">Politics, world affairs, the culture wars and Mr Blobby.</p>
</div></div>
<div class="sw-w-1/4 m:sw-hidden sw-flex sw-items-center sw-justify-end sw-grow sw-shrink-0">
<div class="sw-flex sw-items-center sw-justify-center sw-rounded-full sw-fill-grey-1 sw-bg-sounds-core sw-w-6 sw-h-6 group-hover:sw-bg-sounds-dark">
<svg width="10px" height="10px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" class="sw-fill-grey-1 sw-ml-0.5 sw-transition sw-ease sw-duration-350 motion-reduce:sw-transition-none" aria-hidden="true" focusable="false">
<path d="M3 32l26-16L3 0z"></path>
</svg></div></div></div></div></div></div></a>
*/

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

  let matched = rawText.match( /^(Series) ([0-9]+)/i );
  if ( matched ) {
    arrCookedText = [ `${matched[1]}${matched[2]}` ];
  } else {
    matched = rawText.match( /^([0-9]+)\.(.*)/ );
    if ( matched ) {
      arrCookedText = [ `${matched[1]}${matched[2]}` ];
    }
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
