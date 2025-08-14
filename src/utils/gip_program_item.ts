/**
 * File:        utils/gip_program_item.ts
 * Description: TODO.
 */
'use strict';

////////////////////////////////////////////////////////////////////////////////
// Imports

import {
	VALUE_STATUS_PENDING,
//} from '../utils/gip_prog_fields';
} from '#utils/gip_prog_fields';

import {
	PROG_FIELD_PID,
	PROG_FIELD_STATUS,
	PROG_FIELD_URI,
	PROG_FIELD_TITLE,
	PROG_FIELD_SYNOPSIS,
	PROG_FIELD_IMAGE_URI,
	PROG_FIELD_GENRE,
	PROG_FIELD_DAY_OF_WEEK,
	PROG_FIELD_QUALITY,
	PROG_FIELD_SELECTED,
//} from '../utils/gip_types';
} from '#utils/gip_types';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_DisplayProgramItem,
	Type_ProgramEditInput,
	Type_ProgramEditOptions,
} from '../utils/gip_types.ts';

////////////////////////////////////////
// Exported and local types

export type Type_getTrimmedField_args = string | null;
export type Type_getTrimmedField_ret  = string;
export type Type_extractPID_args      = string;
export type Type_extractPID_ret       = string;

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

/**
 * @param strValue : optional string value, may be null.
 * @returns the string value trimmed of whitepace or the null string.
 */
function getTrimmedField( strValue? : Type_getTrimmedField_args ) : Type_getTrimmedField_ret {
	return ( strValue ? strValue.trim() : '' );
}

/**
 * @param uri : the program URI, e.g., https://www.bbc.co.uk/sounds/play/m002fcbv
 * @returns the PID extracted from the URI, i.e., leaf part, e.g., m002fcbv
 */
function extractPID( uri : Type_extractPID_args ) : Type_extractPID_ret {
	return uri.replace( /.*\//, '' );
}

////////////////////////////////////////
// Exported definitions

// Class to handle the program display fields
export default class GipProgramItem implements Type_DisplayProgramItem {

	[PROG_FIELD_PID]         : string;
	[PROG_FIELD_STATUS]      : string;
	[PROG_FIELD_TITLE]       : string;
	[PROG_FIELD_SYNOPSIS]    : string;
	[PROG_FIELD_IMAGE_URI]   : string;
	[PROG_FIELD_GENRE]       : string;
	[PROG_FIELD_DAY_OF_WEEK] : string;
	[PROG_FIELD_QUALITY]     : string;
	[PROG_FIELD_SELECTED]    : boolean;
	[PROG_FIELD_URI]         : string;

	constructor( { inputItem, inputOptions } : { inputItem : Type_ProgramEditInput, inputOptions : Type_ProgramEditOptions } ) {
		this[PROG_FIELD_PID]         = extractPID( getTrimmedField( inputItem[PROG_FIELD_URI] ) );
		this[PROG_FIELD_STATUS]      = VALUE_STATUS_PENDING;
		this[PROG_FIELD_TITLE]       = getTrimmedField( inputItem[PROG_FIELD_TITLE] );
		this[PROG_FIELD_SYNOPSIS]    = getTrimmedField( inputItem[PROG_FIELD_SYNOPSIS] );
		this[PROG_FIELD_IMAGE_URI]   = getTrimmedField( inputItem[PROG_FIELD_IMAGE_URI] );
		this[PROG_FIELD_GENRE]       = inputOptions[PROG_FIELD_GENRE];
		this[PROG_FIELD_DAY_OF_WEEK] = inputOptions[PROG_FIELD_DAY_OF_WEEK];
		this[PROG_FIELD_QUALITY]     = inputOptions[PROG_FIELD_QUALITY];
		this[PROG_FIELD_SELECTED]    = false;
		this[PROG_FIELD_URI]         = '';
	}
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions

export const privateDefs = {};

if ( process.env.NODE_ENV === 'test-unit' ) {
	Object.assign( privateDefs, {
		getTrimmedField,
		extractPID,
	} );
}
