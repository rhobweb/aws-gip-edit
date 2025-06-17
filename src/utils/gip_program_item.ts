

import { VALUE_STATUS_PENDING,
} from '../utils/gip_prog_fields';

import {
	PROG_FIELD_PID, PROG_FIELD_STATUS, PROG_FIELD_URI, PROG_FIELD_TITLE, PROG_FIELD_SYNOPSIS, PROG_FIELD_IMAGE_URI, PROG_FIELD_GENRE, PROG_FIELD_DAY_OF_WEEK, PROG_FIELD_QUALITY, PROG_FIELD_SELECTED,
	TypeProgramItem, TypeProgramEditInput, TypeProgramEditOptions,
} from '../utils/gip_types';

function getTrimmedField( field : string ) {
	return ( field ? field.trim() : '' );
}

function extractPID( uri : string ) {
	return uri.replace( /.*\//, '' );
}

export default class GipProgramItem implements TypeProgramItem {

	[PROG_FIELD_PID]         : string;
	[PROG_FIELD_STATUS]      : string;
	[PROG_FIELD_TITLE]       : string;
	[PROG_FIELD_SYNOPSIS]    : string;
	[PROG_FIELD_IMAGE_URI]   : string;
	[PROG_FIELD_GENRE]       : string;
	[PROG_FIELD_DAY_OF_WEEK] : string;
	[PROG_FIELD_QUALITY]     : string;
	[PROG_FIELD_SELECTED]    : boolean;

	constructor( { inputItem, inputOptions } : { inputItem : TypeProgramEditInput, inputOptions : TypeProgramEditOptions } ) {
		this[PROG_FIELD_PID]         = extractPID( getTrimmedField( inputItem[PROG_FIELD_URI] ) );
		this[PROG_FIELD_STATUS]      = VALUE_STATUS_PENDING;
		this[PROG_FIELD_TITLE]       = getTrimmedField( inputItem[PROG_FIELD_TITLE] );
		this[PROG_FIELD_SYNOPSIS]    = getTrimmedField( inputItem[PROG_FIELD_SYNOPSIS] );
		this[PROG_FIELD_IMAGE_URI]   = getTrimmedField( inputItem[PROG_FIELD_IMAGE_URI] );
		this[PROG_FIELD_GENRE]       = inputOptions[PROG_FIELD_GENRE];
		this[PROG_FIELD_DAY_OF_WEEK] = inputOptions[PROG_FIELD_DAY_OF_WEEK];
		this[PROG_FIELD_QUALITY]     = inputOptions[PROG_FIELD_QUALITY];
		this[PROG_FIELD_SELECTED]    = false;
	}
}
