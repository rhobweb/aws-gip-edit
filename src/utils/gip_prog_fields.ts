/**
 * File:        utils/gip_prog_fields.ts
 * Description: Defines the database and display properties and maps between them.
 *
 * Types:
 *   Field map:     This is an object that maps a property name to another name,
 *                   e.g., { p1: 'd1', p2: 'd2' }
 *   Raw field map: This is an array of objects containing a single property.
 *                  Each object maps one property name to another.
 *                  This type is an array so that the ordering of the fields is retained.
 *                   e.g.,  [ { p1: 'd1' }, { p2: 'd2' } ]
 *   Field order:   An array of property names.
 *                   e.g., [ 'p1', 'p2' ]
 *   Collection:    An object containing multiple objects, either field maps, raw field maps or field orders:
 *                   e.g., field map collection:
 *                          {
 *                            t1: { p1: 'd1', p2: 'd2' },
 *                            t2: { pp: 'dp', pq: 'dq' },
 *                          }
 *                   e.g., raw field map collection:
 *                          {
 *                            t1: [ { p1: 'd1' }, { p2: 'd2' } ],
 *                            t2: [ { pp: 'dp' }, { pq: 'dq' } ],
 *                          }
 *                   e.g., field order collection:
 *                          {
 *                            t1: [ 'p1', 'p2' ],
 *                            t2: [ 'pp', 'pq' ],
 *                          }
 */

////////////////////////////////////////////////////////////////////////////////
// Imports

import {
	PROG_FIELD_STATUS,
	PROG_FIELD_PID,
	PROG_FIELD_TITLE,
	PROG_FIELD_SYNOPSIS,
	PROG_FIELD_IMAGE_URI,
	PROG_FIELD_GENRE,
	PROG_FIELD_DAY_OF_WEEK,
	PROG_FIELD_QUALITY,
	PROG_FIELD_SELECTED
} from './gip_types';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Exported Types
export type Type_FieldMap   = Record<string, ( string | null )>;
export type Type_FieldOrder = string[];

// The program object as stored in the database
export interface Type_DbProgramItem extends Record<string, ( string | number | null )> {
	[DB_FIELD_STATUS]        : string,
	[DB_FIELD_GENRE]         : string,
	[DB_FIELD_DAY_OF_WEEK]   : string | null,
	[DB_FIELD_QUALITY]       : string,
	[DB_FIELD_PID]           : string,
	[DB_FIELD_TITLE]         : string,
	[DB_FIELD_SYNOPSIS]      : string,
	[DB_FIELD_MODIFY_TIME]   : string | null,
	[DB_FIELD_DOWNLOAD_TIME] : string,
	[DB_FIELD_IMAGE_URI]     : string,
	[DB_FIELD_POS]           : number | null,
}

// The program object in database format excluding properties not required for manipulation
type Type_DbFullProgramItem_unwanted = typeof DB_FIELD_DOWNLOAD_TIME;
export interface Type_DbFullProgramItem extends Omit<Type_DbProgramItem,Type_DbFullProgramItem_unwanted> {
	[DB_FIELD_MODIFY_TIME]   : string,
	[DB_FIELD_POS]           : number,
};
// The program history object in database format, which is the program object minus some properties.
type Type_DbFullProgramHistoryItem_unwanted = typeof DB_FIELD_DOWNLOAD_TIME | typeof DB_FIELD_POS;
export interface Type_DbFullProgramHistoryItem extends Omit<Type_DbProgramItem,Type_DbFullProgramHistoryItem_unwanted> { // eslint-disable-line @typescript-eslint/no-empty-object-type
};

////////////////////////////////////////
// Local Types

type Type_RawFieldMapItem       = Record<string, ( string | null )>;
type Type_RawFieldMap           = Type_RawFieldMapItem[];
type Type_RawFieldMapCollection = Record<string, Type_RawFieldMap>;
type Type_FieldMapCollection    = Record<string, Type_FieldMap>;
type Type_DefaultValueFieldMap  = Record<string, string>;
type Type_FieldOrderCollection  = Record<string, Type_FieldOrder>;

////////////////////////////////////////////////////////////////////////////////
// Constants

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
const VALUE_GENRE_BOOKS_AND_SPOKEN = 'Books & Spoken';
const DISPLAY_GENRE_COMEDY         = 'Comedy';
const DISPLAY_GENRE_BOOKS          = 'Books&Spoken';

// Day of week - actual values and display values
const VALUE_DAY_ANY = 'Any';
const VALUE_DAY_MON = 'Mon';
const VALUE_DAY_TUE = 'Tue';
const VALUE_DAY_WED = 'Wed';
const VALUE_DAY_THU = 'Thu';
const VALUE_DAY_FRI = 'Fri';
const VALUE_DAY_SAT = 'Sat';
const VALUE_DAY_SUN = 'Sun';

// Define the order of the days for display purposes
export const ARR_DAY_ORDER  = [ VALUE_DAY_MON, VALUE_DAY_TUE, VALUE_DAY_WED, VALUE_DAY_THU, VALUE_DAY_FRI, VALUE_DAY_SAT, VALUE_DAY_SUN ];

const DISPLAY_DAY_ANY = 'ANY';
const DISPLAY_DAY_MON = 'Mon';
const DISPLAY_DAY_TUE = 'Tue';
const DISPLAY_DAY_WED = 'Wed';
const DISPLAY_DAY_THU = 'Thu';
const DISPLAY_DAY_FRI = 'Fri';
const DISPLAY_DAY_SAT = 'Sat';
const DISPLAY_DAY_SUN = 'Sun';

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

// Map the program object property to the database property
const PROG_TO_DB_FIELD_MAP : Type_RawFieldMap = [
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

// Map program object property to the header to display above the program list
const HEADER_FIELD_MAP : Type_RawFieldMap = [
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

// Map the program status property to the display string
const STATUS_FIELD_MAP : Type_RawFieldMap = [
	{ [VALUE_STATUS_PENDING]: DISPLAY_STATUS_PENDING, },
	{ [VALUE_STATUS_ERROR]:   DISPLAY_STATUS_ERROR,   },
	{ [VALUE_STATUS_SUCCESS]: DISPLAY_STATUS_SUCCESS, },
	{ [VALUE_STATUS_ALREADY]: DISPLAY_STATUS_ALREADY, },
	{ [VALUE_DEFAULT]:        DISPLAY_STATUS_PENDING, },
];

// Map the program genre property to the display string
const GENRE_DISPLAY_FIELD_MAP : Type_RawFieldMap = [
	{ [VALUE_GENRE_BOOKS_AND_SPOKEN]: DISPLAY_GENRE_BOOKS,  },
	{ [VALUE_GENRE_COMEDY]:           DISPLAY_GENRE_COMEDY, },
	{ [VALUE_DEFAULT]:                DISPLAY_GENRE_COMEDY, },
];

// Map the program day of the week
const DAY_OF_WEEK_FIELD_MAP : Type_RawFieldMap = [
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

// Map the program sound quality
const QUALITY_FIELD_MAP : Type_RawFieldMap = [
	{ [VALUE_QUALITY_NORMAL]: DISPLAY_QUALITY_NORMAL, },
	{ [VALUE_QUALITY_HIGH]:   DISPLAY_QUALITY_HIGH,   },
	{ [VALUE_DEFAULT]:        DISPLAY_QUALITY_NORMAL, },
];

// A collection of all the raw field maps
const RAW_FIELD_MAP_COLLECTION : Type_RawFieldMapCollection = {
	[PROG_FIELD_STATUS]:      STATUS_FIELD_MAP,
	[PROG_FIELD_GENRE]:       GENRE_DISPLAY_FIELD_MAP,
	[PROG_FIELD_DAY_OF_WEEK]: DAY_OF_WEEK_FIELD_MAP,
	[PROG_FIELD_QUALITY]:     QUALITY_FIELD_MAP,
	[DUMMY_HEADER_FIELD]:     HEADER_FIELD_MAP,
	[DUMMY_FIELD_DB]:         PROG_TO_DB_FIELD_MAP,
};

////////////////////////////////////////////////////////////////////////////////
// Local functions

/**
 * @param {Type_RawFieldMap} rawFieldMap - see comment at head of file,
 *            e.g., [ { p1: 'd1' }, { p2: 'd2' } ]
 * @returns {Type_FieldMap} a field map with the properties and values reversed - see comment at head of file,
 *            e.g., { d1: 'p1', d2: 'p2' }
 */
function genReverseFieldMap( rawFieldMap : Type_RawFieldMap ) : Type_FieldMap {
	const cookedReverseFieldMap : Type_FieldMap = {};

	rawFieldMap.forEach( el => {
		const [ value, mappedValue ] = Object.entries( el )[ 0 ];
		if ( ( mappedValue !== null ) && ( value !== VALUE_DEFAULT ) ) {
			cookedReverseFieldMap[ mappedValue ] = value;
		}
	} );

	return cookedReverseFieldMap;
}

/**
 * @param {Type_RawFieldMap} rawFieldMap - see comment at head of file,
 *            e.g., [ { p1: 'd1' }, { p2: 'd2' } ]
 * @returns {Type_FieldMap} a field map - see comment at head of file,
 *            e.g., { p1: 'd1', p2: 'd2' }
 */
function genFieldMap( rawFieldMap: Type_RawFieldMap ) : Type_FieldMap {
	const cookedFieldMap : Type_FieldMap = {};

	rawFieldMap.forEach( el => {
		const [ value, mappedValue ] = Object.entries( el )[ 0 ];
		cookedFieldMap[ value ] = mappedValue;
	} );

	return cookedFieldMap;
}

/**
 * @param {Type_RawFieldMapCollection} rawFieldMapCollection - a collection of raw field maps, see top of file;
 *                                      e.g., { t1: [ { p1: 'd1' }, { p2: 'd2' } ], t2: [ { p3: 'd3' }, { p4: 'd4' } ] }
 * @returns {Type_FieldMapCollection} - a collection of field maps, see top of file. Properties are reversed.
 *                                      e.g., { t1: { d1: 'p1', d2: 'p2' }, t2: { d3: 'p3', d4: 'p4' } }
 */
function genReverseFieldMapCollection( rawFieldMapCollection: Type_RawFieldMapCollection ) : Type_FieldMapCollection {
	const reverseFieldMapCollection : Type_FieldMapCollection = {};

	Object.entries( rawFieldMapCollection ).forEach( ( [ field, rawFieldMap ] ) => {
		reverseFieldMapCollection[ field ] = genReverseFieldMap( rawFieldMap );
	} );

	return reverseFieldMapCollection;
}

/**
 * @param {Type_RawFieldMapCollection} rawFieldMapCollection - a collection of raw field maps, see top of file;
 *                                      e.g., { t1: [ { p1: 'd1' }, { p2: 'd2' } ], t2: [ { p3: 'd3' }, { p4: 'd4' } ] }
 * @returns {Type_FieldMapCollection} - a collection of field maps, see top of file.
 *                                      e.g., { t1: { p1: 'd1', p2: 'd2' }, t2: { p3: 'd3', p4: d4' } }
 */
function genFieldMapCollection( rawFieldMapCollection : Type_RawFieldMapCollection ) : Type_FieldMapCollection {
	const fieldMapCollection : Type_FieldMapCollection = {};

	Object.entries( rawFieldMapCollection ).forEach( ( [ field, rawFieldMap ] ) => {
		fieldMapCollection[ field ] = genFieldMap( rawFieldMap );
	} );

	return fieldMapCollection;
}

/**
 * @param {Type_RawFieldMapCollection} rawFieldMapCollection - a collection of raw field maps, see top of file;
 *                                      e.g., { t1: [ { p1: 'd1' }, { p2: 'd2' } ], t2: [ { p3: 'd3' }, { p4: 'd4' } ] }
 * @returns {Type_FieldOrderCollection} - a collection of field orders, see top of file.
 *                                      e.g., { t1: [ 'p1', 'p2' ], t2: [ 'p3', 'p4' ] }
 */
function genFieldOrderCollection( rawFieldMapCollection : Type_RawFieldMapCollection ) : Type_FieldOrderCollection {
	const cookedFieldOrderCollection : Type_FieldOrderCollection = {};

	Object.entries( rawFieldMapCollection ).forEach( ( [ field, rawFieldMap ] ) => {
		cookedFieldOrderCollection[ field ] = rawFieldMap.filter( el => Object.keys(el)[0] !== VALUE_DEFAULT ).map( el => Object.keys(el)[0] );
	} );

	return cookedFieldOrderCollection;
}

/**
 * @param {Type_FieldMapCollection} fieldMapCollection:        see top of file.
 * @param {Type_FieldMapCollection} reverseFieldMapCollection: see top of file.
 * @returns {Type_DefaultValueFieldMap} object with properties being the field name and value being the display default value.
 *                                       e.g., { p1: 'Default1', p2: 'Default2' }
 */
function genDefaultFieldValue( fieldMapCollection : Type_FieldMapCollection, reverseFieldMapCollection : Type_FieldMapCollection ) : Type_DefaultValueFieldMap {
	const mapDefaultFieldValue : Type_DefaultValueFieldMap = {};

	Object.entries( fieldMapCollection ).forEach( ( [ fieldName, fieldMap ] ) => {
		const defaultValue = fieldMap[ VALUE_DEFAULT ]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
		// Default values must be non-null
		mapDefaultFieldValue[ fieldName ] = reverseFieldMapCollection[ fieldName ][ defaultValue ]!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
	} );

	return mapDefaultFieldValue;
}

////////////////////////////////////////////////////////////////////////////////
// Generate the exported constants using the local functions

export const REVERSE_FIELD_MAP_COLLECTION = genReverseFieldMapCollection( RAW_FIELD_MAP_COLLECTION );
export const FIELD_MAP_COLLECTION         = genFieldMapCollection( RAW_FIELD_MAP_COLLECTION );
export const FIELD_ORDER_COLLECTION       = genFieldOrderCollection( RAW_FIELD_MAP_COLLECTION );
export const FIELD_DEFAULT_VALUES         = genDefaultFieldValue( FIELD_MAP_COLLECTION, REVERSE_FIELD_MAP_COLLECTION );
