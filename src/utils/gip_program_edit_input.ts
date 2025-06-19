

import type {
	Type_ProgramItem,
	Type_ProgramEditInput,
} from './gip_types.ts'; // Not just types, so need to include these here
import {
	PROG_FIELD_URI,
	PROG_FIELD_PID,
	PROG_FIELD_TITLE,
	PROG_FIELD_SYNOPSIS,
	PROG_FIELD_IMAGE_URI,
} from './gip_types.js'; // Not just types, so need to include these here

export default class GipProgramEditInput {

	[ PROG_FIELD_URI ]        = '';
	[ PROG_FIELD_TITLE ]      = '';
	[ PROG_FIELD_SYNOPSIS ]   = '';
	[ PROG_FIELD_IMAGE_URI ]  = '';

	constructor() {
		this.clear();
	}

	clear() : void {
		this[ PROG_FIELD_URI ]       = '';
		this[ PROG_FIELD_TITLE ]     = '';
		this[ PROG_FIELD_SYNOPSIS ]  = '';
		this[ PROG_FIELD_IMAGE_URI ] = '';
	}

	setField( fieldName: string, fieldValue: string ) : void {
		if ( fieldName in this ) {
			( this as Type_ProgramEditInput )[ fieldName ] = fieldValue;
		}
	}

	assign( source: Type_ProgramEditInput ) : void {
		this[ PROG_FIELD_URI ]       = source[ PROG_FIELD_URI ];
		this[ PROG_FIELD_TITLE ]     = source[ PROG_FIELD_TITLE ];
		this[ PROG_FIELD_SYNOPSIS ]  = source[ PROG_FIELD_SYNOPSIS ];
		this[ PROG_FIELD_IMAGE_URI ] = source[ PROG_FIELD_IMAGE_URI ];
	}

	assignFromProgram( programItem: Type_ProgramItem ) : void {
		this[ PROG_FIELD_URI ]       = programItem[ PROG_FIELD_PID ];
		this[ PROG_FIELD_TITLE ]     = programItem[ PROG_FIELD_TITLE ];
		this[ PROG_FIELD_SYNOPSIS ]  = programItem[ PROG_FIELD_SYNOPSIS ];
		this[ PROG_FIELD_IMAGE_URI ] = programItem[ PROG_FIELD_IMAGE_URI ];
	}
}
