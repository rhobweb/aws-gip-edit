
import {
  PROG_FIELD_URI, PROG_FIELD_PID, PROG_FIELD_TITLE, PROG_FIELD_SYNOPSIS, PROG_FIELD_IMAGE_URI,
  TypeProgramItem, TypeProgramEditInput,
} from './gip_types'; // Not just types, so need to include these here

export default class GipProgramEditInput {

  [ PROG_FIELD_URI ]       = '';
  [ PROG_FIELD_TITLE ]     = '';
  [ PROG_FIELD_SYNOPSIS ]  = '';
  [ PROG_FIELD_IMAGE_URI ] = '';

  constructor() {
    this.clear();
  }

  clear() {
    this[ PROG_FIELD_URI ]       = '';
    this[ PROG_FIELD_TITLE ]     = '';
    this[ PROG_FIELD_SYNOPSIS ]  = '';
    this[ PROG_FIELD_IMAGE_URI ] = '';
  }

  setField( fieldName: string, fieldValue: string ) {
    if ( fieldName in this ) {
      ( this as TypeProgramEditInput )[ fieldName ] = fieldValue;
    }
  }

  assign( source: TypeProgramEditInput ) {
    this[ PROG_FIELD_URI ]       = source[ PROG_FIELD_URI ];
    this[ PROG_FIELD_TITLE ]     = source[ PROG_FIELD_TITLE ];
    this[ PROG_FIELD_SYNOPSIS ]  = source[ PROG_FIELD_SYNOPSIS ];
    this[ PROG_FIELD_IMAGE_URI ] = source[ PROG_FIELD_IMAGE_URI ];
  }

  assignFromProgram( programItem: TypeProgramItem ) {
    this[ PROG_FIELD_URI ]       = programItem[ PROG_FIELD_PID ];
    this[ PROG_FIELD_TITLE ]     = programItem[ PROG_FIELD_TITLE ];
    this[ PROG_FIELD_SYNOPSIS ]  = programItem[ PROG_FIELD_SYNOPSIS ];
    this[ PROG_FIELD_IMAGE_URI ] = programItem[ PROG_FIELD_IMAGE_URI ];
  }
}
