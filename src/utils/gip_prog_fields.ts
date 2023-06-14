/**
 * Field map:     This is an object that maps a property name to another name.
 * Raw field map: This is an array that contains both field mapping and ordering information.
 * Collection:    An object containing multiple (raw) field maps.
 * 
 * Raw field map is an array of:
 *   - objects containing a single property:
 *     - field name -> maps to another name.
 * Field map is an object containing one or more properties:
 *     - field name -> maps to another name.
 */

import {
  PROG_FIELD_STATUS, PROG_FIELD_PID, PROG_FIELD_TITLE, PROG_FIELD_SYNOPSIS, PROG_FIELD_IMAGE_URI, PROG_FIELD_GENRE, PROG_FIELD_DAY_OF_WEEK, PROG_FIELD_QUALITY, PROG_FIELD_SELECTED
} from './gip_types';

type TypeRawFieldMapItem       = Record<string, ( string | null )>;
type TypeRawFieldMap           = TypeRawFieldMapItem[];
export type TypeFieldMap       = Record<string, ( string | null )>;
type TypeRawFieldMapCollection = Record<string, TypeRawFieldMap>;
type TypeFieldMapCollection    = Record<string, TypeFieldMap>;
type TypeDefaultValueFieldMap  = Record<string, string>;
export type TypeFieldOrder     = string[];
type TypeFieldOrderCollection  = Record<string, TypeFieldOrder>;

// DB fields
export const DB_FIELD_STATUS        = 'status';
export const DB_FIELD_GENRE         = 'genre';
export const DB_FIELD_DAY_OF_WEEK   = 'day_of_week';
export const DB_FIELD_QUALITY       = 'quality';
export const DB_FIELD_PID           = 'pid';
export const DB_FIELD_TITLE         = 'title';
export const DB_FIELD_SYNOPSIS      = 'synopsis';
export const DB_FIELD_MODIFY_TIME   = 'modify_time';
export const DB_FIELD_DOWNLOAD_TIME = 'download_time';
export const DB_FIELD_IMAGE_URI     = 'image_uri';
export const DB_FIELD_POS           = 'pos';

export interface TypeDbProgramItem extends Record<string, ( string | number | null )> {
  [DB_FIELD_STATUS]        : string,
  [DB_FIELD_GENRE]         : string,
  [DB_FIELD_DAY_OF_WEEK]   : string | null,
  [DB_FIELD_QUALITY]       : string,
  [DB_FIELD_PID]           : string,
  [DB_FIELD_TITLE]         : string,
  [DB_FIELD_SYNOPSIS]      : string,
  [DB_FIELD_MODIFY_TIME]   : string,
  [DB_FIELD_DOWNLOAD_TIME] : string,
  [DB_FIELD_IMAGE_URI]     : string,
  [DB_FIELD_POS]           : number | null,
}

// Dummy field
export const DUMMY_HEADER_FIELD  = 'field_headers';
// The counter field is taken from the first element in the array, use a dummy field as the first element
const DUMMY_PROG_FIELD_POS       = 'pos';
export const DUMMY_FIELD_DB      = 'db';

// Display fields
const DISPLAY_FIELD_POS         = '#';
const DISPLAY_FIELD_STATUS      = 'Status';
const DISPLAY_FIELD_PID         = 'PID';
const DISPLAY_FIELD_TITLE       = 'Title';
const DISPLAY_FIELD_DAY_OF_WEEK = 'Day';
const DISPLAY_FIELD_GENRE       = 'Genre';
const DISPLAY_FIELD_QUALITY     = 'Quality';
const DISPLAY_FIELD_SYNOPSIS    = 'Synopsis';
const DISPLAY_FIELD_IMAGE_URI   = 'Image URI';

// General - actual values and display values
const VALUE_DEFAULT                = 'default';
const DISPLAY_VALUE_UNKNOWN        = 'UNKNOWN';

// Genre - actual values and display values
const VALUE_GENRE_COMEDY           = 'Comedy';
const VALUE_GENRE_BOOKS_AND_SPOKEN = 'Books&Spoken';

const DISPLAY_GENRE_COMEDY         = 'Comedy';
const DISPLAY_GENRE_BOOKS          = 'Books & Spoken';

// Day of week - actual values and display values
const VALUE_DAY_ANY         = 'Any';
const VALUE_DAY_MON         = 'Mon';
const VALUE_DAY_TUE         = 'Tue';
const VALUE_DAY_WED         = 'Wed';
const VALUE_DAY_THU         = 'Thu';
const VALUE_DAY_FRI         = 'Fri';
const VALUE_DAY_SAT         = 'Sat';
const VALUE_DAY_SUN         = 'Sun';

export const ARR_DAY_ORDER  = [ VALUE_DAY_MON, VALUE_DAY_TUE, VALUE_DAY_WED, VALUE_DAY_THU, VALUE_DAY_FRI, VALUE_DAY_SAT, VALUE_DAY_SUN ];

const DISPLAY_DAY_ANY       = 'ANY';
const DISPLAY_DAY_MON       = 'Mon';
const DISPLAY_DAY_TUE       = 'Tue';
const DISPLAY_DAY_WED       = 'Wed';
const DISPLAY_DAY_THU       = 'Thu';
const DISPLAY_DAY_FRI       = 'Fri';
const DISPLAY_DAY_SAT       = 'Sat';
const DISPLAY_DAY_SUN       = 'Sun';

// Status - actual values and display values
export const VALUE_STATUS_PENDING = 'Pending';
export const VALUE_STATUS_ERROR   = 'Error';
export const VALUE_STATUS_SUCCESS = 'Success';
export const VALUE_STATUS_ALREADY = 'Already';

const DISPLAY_STATUS_PENDING = 'Pending';
const DISPLAY_STATUS_ERROR   = 'ERR';
const DISPLAY_STATUS_SUCCESS = 'OK';
const DISPLAY_STATUS_ALREADY = 'Already';

// Quality - actual values and display values
const VALUE_QUALITY_HIGH     = 'High';
const VALUE_QUALITY_NORMAL   = 'Normal';

const DISPLAY_QUALITY_HIGH   = 'HIGH';
const DISPLAY_QUALITY_NORMAL = 'Normal';

const PROG_TO_DB_FIELD_MAP : TypeRawFieldMap = [
  { [PROG_FIELD_STATUS]:       DB_FIELD_STATUS      },
  { [PROG_FIELD_PID]:          DB_FIELD_PID         },
  { [PROG_FIELD_TITLE]:        DB_FIELD_TITLE       },
  { [PROG_FIELD_SYNOPSIS]:     DB_FIELD_SYNOPSIS    },
  { [PROG_FIELD_IMAGE_URI]:    DB_FIELD_IMAGE_URI   },
  { [PROG_FIELD_GENRE]:        DB_FIELD_GENRE       },
  { [PROG_FIELD_DAY_OF_WEEK]:  DB_FIELD_DAY_OF_WEEK },
  { [PROG_FIELD_QUALITY]:      DB_FIELD_QUALITY     },
  { [PROG_FIELD_SELECTED]:     null                 },
];

// Map program field to the header display
const HEADER_FIELD_MAP : TypeRawFieldMap = [
  { [DUMMY_PROG_FIELD_POS]:   DISPLAY_FIELD_POS,         },
  { [PROG_FIELD_STATUS]:      DISPLAY_FIELD_STATUS,      },
  { [PROG_FIELD_PID]:         DISPLAY_FIELD_PID,         },
  { [PROG_FIELD_TITLE]:       DISPLAY_FIELD_TITLE,       },
  { [PROG_FIELD_DAY_OF_WEEK]: DISPLAY_FIELD_DAY_OF_WEEK, },
  { [PROG_FIELD_QUALITY]:     DISPLAY_FIELD_QUALITY,     },
  { [PROG_FIELD_GENRE]:       DISPLAY_FIELD_GENRE,       },
  { [PROG_FIELD_SYNOPSIS]:    DISPLAY_FIELD_SYNOPSIS,    },
  { [PROG_FIELD_IMAGE_URI]:   DISPLAY_FIELD_IMAGE_URI,   },
  { [VALUE_DEFAULT]:          DISPLAY_VALUE_UNKNOWN,     },
];

const STATUS_FIELD_MAP : TypeRawFieldMap = [
  { [VALUE_STATUS_PENDING]: DISPLAY_STATUS_PENDING, },
  { [VALUE_STATUS_ERROR]:   DISPLAY_STATUS_ERROR,   },
  { [VALUE_STATUS_SUCCESS]: DISPLAY_STATUS_SUCCESS, },
  { [VALUE_STATUS_ALREADY]: DISPLAY_STATUS_ALREADY, },
  { [VALUE_DEFAULT]:        DISPLAY_STATUS_PENDING, },
];

const GENRE_DISPLAY_FIELD_MAP : TypeRawFieldMap = [
  { [VALUE_GENRE_BOOKS_AND_SPOKEN]: DISPLAY_GENRE_BOOKS,  },
  { [VALUE_GENRE_COMEDY]:           DISPLAY_GENRE_COMEDY, },
  { [VALUE_DEFAULT]:                DISPLAY_GENRE_COMEDY, },
];

const DAY_OF_WEEK_FIELD_MAP : TypeRawFieldMap = [
  { [VALUE_DAY_ANY]: DISPLAY_DAY_ANY, },
  { [VALUE_DAY_MON]: DISPLAY_DAY_MON, },
  { [VALUE_DAY_TUE]: DISPLAY_DAY_TUE, },
  { [VALUE_DAY_WED]: DISPLAY_DAY_WED, },
  { [VALUE_DAY_THU]: DISPLAY_DAY_THU, },
  { [VALUE_DAY_FRI]: DISPLAY_DAY_FRI, },
  { [VALUE_DAY_SAT]: DISPLAY_DAY_SAT, },
  { [VALUE_DAY_SUN]: DISPLAY_DAY_SUN, },
  { [VALUE_DEFAULT]: DISPLAY_DAY_ANY, },
];

const QUALITY_FIELD_MAP : TypeRawFieldMap = [
  { [VALUE_QUALITY_NORMAL]: DISPLAY_QUALITY_NORMAL, },
  { [VALUE_QUALITY_HIGH]:   DISPLAY_QUALITY_HIGH,   },
  { [VALUE_DEFAULT]:        DISPLAY_QUALITY_NORMAL, },
];

const RAW_FIELD_MAP_COLLECTION : TypeRawFieldMapCollection = {
  [PROG_FIELD_STATUS]:      STATUS_FIELD_MAP,
  [PROG_FIELD_GENRE]:       GENRE_DISPLAY_FIELD_MAP,
  [PROG_FIELD_DAY_OF_WEEK]: DAY_OF_WEEK_FIELD_MAP,
  [PROG_FIELD_QUALITY]:     QUALITY_FIELD_MAP,
  [DUMMY_HEADER_FIELD]:     HEADER_FIELD_MAP,
  [DUMMY_FIELD_DB]:         PROG_TO_DB_FIELD_MAP,
};

/**
 * @param {TypeFieldMap} rawFieldMap - see comment at head of file.
 * @returns reverse field map.
 */
function genReverseFieldMap( rawFieldMap : TypeRawFieldMap ) : TypeFieldMap {
  const cookedReverseFieldMap : TypeFieldMap = {};

  rawFieldMap.forEach( el => {
    const [ value, mappedValue ] = Object.entries( el )[ 0 ];
    if ( ( mappedValue !== null ) && ( value !== VALUE_DEFAULT ) ) {
      cookedReverseFieldMap[ mappedValue ] = value;
    }
  } );

  return cookedReverseFieldMap;
}

/**
 * @param {Array} rawFieldMap - see comment at head of file.
 * @returns regular field map.
 */
function genFieldMap( rawFieldMap: TypeRawFieldMap ) : TypeFieldMap {
  const cookedFieldMap : TypeFieldMap = {};

  rawFieldMap.forEach( el => {
    const [ value, mappedValue ] = Object.entries( el )[ 0 ];
    cookedFieldMap[ value ] = mappedValue;
  } );

  return cookedFieldMap;
}

/**
 * 
 * @param {Object} rawFieldMap - object containing field mapping and order information;
 *                                       - the properties are field names;
 *                                       - the values ar an array of objects with:
 *                                          - a single property which is a field name;
 *                                          - the value which is the value to map it to.
 * @returns object with the same properties as the input object but the values are objects that map a field name to another name.
 */
function genReverseFieldMapCollection( rawFieldMapCollection: TypeRawFieldMapCollection ) : TypeFieldMapCollection {
  const reverseFieldMapCollection : TypeFieldMapCollection = {};

  Object.entries( rawFieldMapCollection ).forEach( ( [ field, rawFieldMap ] ) => {
    reverseFieldMapCollection[ field ] = genReverseFieldMap( rawFieldMap );
  } );

  return reverseFieldMapCollection;
}

function genFieldMapCollection( rawFieldMapCollection : TypeRawFieldMapCollection ) : TypeFieldMapCollection {
  const fieldMapCollection : TypeFieldMapCollection = {};

  Object.entries( rawFieldMapCollection ).forEach( ( [ field, rawFieldMap ] ) => {
    fieldMapCollection[ field ] = genFieldMap( rawFieldMap );
  } );

  return fieldMapCollection;
}

function genFieldOrderCollection( rawFieldMapCollection : TypeRawFieldMapCollection ) : TypeFieldOrderCollection {
  const cookedFieldOrderCollection : TypeFieldOrderCollection = {};

  Object.entries( rawFieldMapCollection ).forEach( ( [ field, rawFieldMap ] ) => {
    cookedFieldOrderCollection[ field ] = rawFieldMap.filter( el => Object.keys(el)[0] !== VALUE_DEFAULT ).map( el => Object.keys(el)[0] );
  } );

  return cookedFieldOrderCollection;
}

/**
 * @param {Object} fieldMapCollection 
 * @param {Object} reverseFieldMapCollection 
 * @returns object with properties being the field name and value being the display default value
 */
function genDefaultFieldValue( fieldMapCollection : TypeFieldMapCollection, reverseFieldMapCollection : TypeFieldMapCollection ) : TypeDefaultValueFieldMap {
  const mapDefaultFieldValue : TypeDefaultValueFieldMap = {};

  Object.entries( fieldMapCollection ).forEach( ( [ fieldName, fieldMap ] ) => {
    const defaultValue = fieldMap[ VALUE_DEFAULT ];
    if ( ( defaultValue !== undefined ) && ( defaultValue !== null ) ) {
      mapDefaultFieldValue[ fieldName ] = reverseFieldMapCollection[ fieldName ][ defaultValue ] as string; // Default values must be non-null
    }
  } );

  return mapDefaultFieldValue;
}

export const REVERSE_FIELD_MAP_COLLECTION = genReverseFieldMapCollection( RAW_FIELD_MAP_COLLECTION );
export const FIELD_MAP_COLLECTION         = genFieldMapCollection( RAW_FIELD_MAP_COLLECTION );
export const FIELD_ORDER_COLLECTION       = genFieldOrderCollection( RAW_FIELD_MAP_COLLECTION );
export const FIELD_DEFAULT_VALUES         = genDefaultFieldValue( FIELD_MAP_COLLECTION, REVERSE_FIELD_MAP_COLLECTION );
