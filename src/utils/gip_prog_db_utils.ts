/**
 * File:        utils/gip_prog_db_utils.ts
 * Description: Utilities for converting program item objects between DB and display format.
 *
 * Types Used:
 *   DB Program Item: a program object in DB format;
 *   Program Item:    a program object in display format.
 */

import type {
	Type_DbProgramItem,
} from './gip_prog_fields';

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

import type {
	Type_ProgramItem,
	Type_ProgramItemField,
} from './gip_types';

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

const PROG_TO_DB_FIELD_MAP = FIELD_MAP_COLLECTION[ DUMMY_FIELD_DB ];
const DB_TO_PROG_FIELD_MAP = REVERSE_FIELD_MAP_COLLECTION[ DUMMY_FIELD_DB ];

export type Type_dbToProg_args = Type_DbProgramItem;
export type Type_dbToProg_ret  = Type_ProgramItem;

export type Type_progToDb_args = Type_ProgramItem;
export type Type_progToDb_ret  = Type_DbProgramItem;

export type Type_dbToProgArray_args = Type_DbProgramItem[];
export type Type_dbToProgArray_ret  = Type_ProgramItem[];


/**
 * @param prog : a DB Program Item object;
 * @returns a Program Item object.
 */
export function dbToProg( dbProg : Type_dbToProg_args ) : Type_dbToProg_ret {
	const prog : Type_ProgramItem = {
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

	for ( const [ dbField, dbValue ] of Object.entries( dbProg ) ) {
		const progField = DB_TO_PROG_FIELD_MAP[ dbField ] as Type_ProgramItemField;

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
 * @param prog : a Program Item object;
 * @returns a DB Program Item object.
 */
export function progToDb( prog: Type_progToDb_args ) : Type_progToDb_ret {
	const dbProg : Type_DbProgramItem = {
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

	for ( const [field, value] of Object.entries( prog ) as [string, string][] ) {
		const dbField = PROG_TO_DB_FIELD_MAP[ field ];

		if ( dbField ) {
			dbProg[ field ] = value;
		}
	}

	dbProg[ DB_FIELD_DAY_OF_WEEK ] = ( dbProg[ DB_FIELD_DAY_OF_WEEK ] === FIELD_DEFAULT_VALUES[ PROG_FIELD_DAY_OF_WEEK ] ) ? null : dbProg[ DB_FIELD_DAY_OF_WEEK ];

	return dbProg;
}

/**
 * @param rawPrograms : array of DB Program Item objects;
 * @returns array of Program Item objects.
 */
export function dbToProgArray( rawPrograms: Type_DbProgramItem[] ) : Type_ProgramItem[] {
	const programs = rawPrograms.map( prog => dbToProg( prog ) );
	return programs;
}
