/**
 * File:        utils/gip_prog_db_utils.ts
 * Description: Utilities for converting program item objects between DB and display format.
 *
 * Types Used:
 *   DB Program Item: a program object in DB format;
 *   Program Item:    a program object in display format.
 */
'use strict';

////////////////////////////////////////////////////////////////////////////////
// Imports

import {
	FIELD_MAP_COLLECTION,
	REVERSE_FIELD_MAP_COLLECTION,
	DUMMY_FIELD_DB,
	FIELD_DEFAULT_VALUES,
	DB_FIELD_STATUS,
	DB_FIELD_GENRE,
	DB_FIELD_DAY_OF_WEEK,
	DB_FIELD_QUALITY,
	DB_FIELD_PID,
	DB_FIELD_TITLE,
	DB_FIELD_SYNOPSIS,
	DB_FIELD_MODIFY_TIME,
	DB_FIELD_DOWNLOAD_TIME,
	DB_FIELD_IMAGE_URI,
	DB_FIELD_POS,
} from './gip_prog_fields';

import {
	PROG_FIELD_PID,
	PROG_FIELD_STATUS,
	PROG_FIELD_TITLE,
	PROG_FIELD_SYNOPSIS,
	PROG_FIELD_IMAGE_URI,
	PROG_FIELD_GENRE,
	PROG_FIELD_DAY_OF_WEEK,
	PROG_FIELD_QUALITY,
	PROG_FIELD_SELECTED,
	PROG_FIELD_URI,
} from './gip_types';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_DisplayProgramItemPropName,
} from './gip_types.ts';

import type {
	Type_DbProgramEditItem,
	Type_DbProgramEditItemPropName,
} from './gip_prog_fields.ts';

import type {
	Type_DisplayProgramItem,
	Type_DisplayProgramItemStringPropName,
} from './gip_types';

////////////////////////////////////////
// Exported and local types

export type Type_dbToProg_args = Type_DbProgramEditItem;
export type Type_dbToProg_ret  = Type_DisplayProgramItem;

export type Type_progToDb_args = Type_DisplayProgramItem;
export type Type_progToDb_ret  = Type_DbProgramEditItem;

export type Type_dbToProgArray_args = Type_DbProgramEditItem[];
export type Type_dbToProgArray_ret  = Type_DisplayProgramItem[];

////////////////////////////////////////////////////////////////////////////////
// Constants

const PROG_TO_DB_FIELD_MAP = FIELD_MAP_COLLECTION[ DUMMY_FIELD_DB ];
const DB_TO_PROG_FIELD_MAP = REVERSE_FIELD_MAP_COLLECTION[ DUMMY_FIELD_DB ];

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

////////////////////////////////////////
// Exported definitions

/**
 * @param prog : a DB Program Item object;
 * @returns a Program Item object.
 */
export function dbToProg( dbProg : Type_dbToProg_args ) : Type_dbToProg_ret {
	const prog : Type_DisplayProgramItem = {
		[PROG_FIELD_PID]:         '',
		[PROG_FIELD_STATUS]:      '',
		[PROG_FIELD_TITLE]:       '',
		[PROG_FIELD_SYNOPSIS]:    '',
		[PROG_FIELD_IMAGE_URI]:   '',
		[PROG_FIELD_GENRE]:       '',
		[PROG_FIELD_DAY_OF_WEEK]: '',
		[PROG_FIELD_QUALITY]:     '',
		[PROG_FIELD_URI]:         '',
		[PROG_FIELD_SELECTED]:    false,
	};

	// Say 'value' is a string, but it may be null or for FIELD_POS it may be a number
	for ( const [ dbField, dbValue ] of Object.entries( dbProg ) as [Type_DbProgramEditItemPropName, string][] ) {
		const progField = DB_TO_PROG_FIELD_MAP[ dbField ] as Type_DisplayProgramItemStringPropName | undefined;

		if ( progField ) {
			prog[ progField ] = dbValue;
		}
	}

	prog[ PROG_FIELD_DAY_OF_WEEK ] = ( prog[ PROG_FIELD_DAY_OF_WEEK ] ? prog[ PROG_FIELD_DAY_OF_WEEK ] : FIELD_DEFAULT_VALUES[ PROG_FIELD_DAY_OF_WEEK ] );
	prog[ PROG_FIELD_SELECTED ]    = false;

	//console.log( `dbToProg: `, { prog, FIELD_DEFAULT_VALUES } );

	return prog;
}

/**
 * @param programItem : a Program item display object;
 * @returns a DB Program Item object suitable for manipulation.
 */
export function progToDb( programItem: Type_progToDb_args ) : Type_progToDb_ret {
	const dbProg : Type_DbProgramEditItem = {
		[DB_FIELD_STATUS]:        '',
		[DB_FIELD_GENRE]:         '',
		[DB_FIELD_DAY_OF_WEEK]:   '',
		[DB_FIELD_QUALITY]:       '',
		[DB_FIELD_PID]:           '',
		[DB_FIELD_TITLE]:         '',
		[DB_FIELD_SYNOPSIS]:      '',
		[DB_FIELD_MODIFY_TIME]:   '',
		[DB_FIELD_DOWNLOAD_TIME]: '',
		[DB_FIELD_IMAGE_URI]:     '',
		[DB_FIELD_POS]:           null,
	};

	// Say 'value' is a string, but it may be null or for DB_FIELD_POS it may be a number
	for ( const [field, value] of Object.entries( programItem ) as [Type_DisplayProgramItemPropName, string][] ) {
		const dbField = PROG_TO_DB_FIELD_MAP[ field ] as Type_DbProgramEditItemPropName | undefined;

		if ( dbField ) {
			if ( dbField !== DB_FIELD_POS ) {
				dbProg[ dbField ] = value;
			}
		}
	}

	dbProg[ DB_FIELD_DAY_OF_WEEK ] = ( dbProg[ DB_FIELD_DAY_OF_WEEK ] === FIELD_DEFAULT_VALUES[ PROG_FIELD_DAY_OF_WEEK ] ) ? null : dbProg[ DB_FIELD_DAY_OF_WEEK ];

	return dbProg;
}

/**
 * @param rawPrograms : array of DB Program Item objects;
 * @returns array of Program Item objects.
 */
export function dbToProgArray( rawPrograms: Type_DbProgramEditItem[] ) : Type_DisplayProgramItem[] {
	const programs = rawPrograms.map( prog => dbToProg( prog ) );
	return programs;
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions
