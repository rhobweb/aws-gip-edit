

import {
	VALUE_STATUS_PENDING,
} from '../utils/gip_prog_fields.js';

import type {
	Type_ProgramItem,
	Type_ProgramEditInput,
	Type_ProgramEditOptions,
} from '../utils/gip_types.js';

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
} from '../utils/gip_types.js';

function getTrimmedField( field : string ) : string {
	return ( field ? field.trim() : '' );
}

function extractPID( uri : string ) : string {
	return uri.replace( /.*\//, '' );
}

// @ts-expect-error as Type_ProgramItem extends Record<string...> it expects a string property
export default class GipProgramItem implements Type_ProgramItem {

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
