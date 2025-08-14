/**
 * File:        utils/gip_program_edit_inputs.ts
 * Description: A class to manipulate the program edit fields.
 *
 * Types used:
 *   GipProgramEditInput:   class defined in this file for use in program editing.
 *   Type_ProgramEditInput: contains the editable and display text fields, URI, title, description, image.
 *   Type_DisplayProgramItem:      contains all program fields including display options (e.g., selected).
 */
'use strict';

////////////////////////////////////////////////////////////////////////////////
// Imports

import {
	PROG_FIELD_URI,
	PROG_FIELD_PID,
	PROG_FIELD_TITLE,
	PROG_FIELD_SYNOPSIS,
	PROG_FIELD_IMAGE_URI,
//} from './gip_types'; // Not just types, so need to include these here
} from '#utils/gip_types'; // Not just types, so need to include these here

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_DisplayProgramItem,
	Type_ProgramEditInput,
} from './gip_types.ts';

////////////////////////////////////////
// Exported and local types

type Type_ProgramEditInputPropName = keyof Type_ProgramEditInput;

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

////////////////////////////////////////
// Exported definitions

// Class to handle the program editing fields
export default class GipProgramEditInput implements Type_ProgramEditInput {

	// The edit field values
	[ PROG_FIELD_URI ]        = '';
	[ PROG_FIELD_TITLE ]      = '';
	[ PROG_FIELD_SYNOPSIS ]   = '';
	[ PROG_FIELD_IMAGE_URI ]  = '';

	constructor() {
		this.clear();
	}

	/**
	 * Set all fields to the null string.
	 */
	clear() : void {
		this[ PROG_FIELD_URI ]       = '';
		this[ PROG_FIELD_TITLE ]     = '';
		this[ PROG_FIELD_SYNOPSIS ]  = '';
		this[ PROG_FIELD_IMAGE_URI ] = '';
	}

	/**
	 * @param {string} fieldName:  the name of the field;
	 * @param {string} fieldValue: the new field value.
	 */
	setField( fieldName: string, fieldValue: string ) : void {
		if ( fieldName in this ) {
			this[ fieldName as Type_ProgramEditInputPropName ] = fieldValue;
		}
	}

	/**
	 * @param source : the program edit object to copy from.
	 */
	assign( source: Type_ProgramEditInput ) : void {
		this[ PROG_FIELD_URI ]       = source[ PROG_FIELD_URI ];
		this[ PROG_FIELD_TITLE ]     = source[ PROG_FIELD_TITLE ];
		this[ PROG_FIELD_SYNOPSIS ]  = source[ PROG_FIELD_SYNOPSIS ];
		this[ PROG_FIELD_IMAGE_URI ] = source[ PROG_FIELD_IMAGE_URI ];
	}

	/**
	 * @param source : the program item to copy from.
	 */
	assignFromProgram( programItem: Type_DisplayProgramItem ) : void {
		this[ PROG_FIELD_URI ]       = programItem[ PROG_FIELD_PID ];    // The PID is extracted from URI, when editing just display and edit the PID
		this[ PROG_FIELD_TITLE ]     = programItem[ PROG_FIELD_TITLE ];
		this[ PROG_FIELD_SYNOPSIS ]  = programItem[ PROG_FIELD_SYNOPSIS ];
		this[ PROG_FIELD_IMAGE_URI ] = programItem[ PROG_FIELD_IMAGE_URI ];
	}
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions
