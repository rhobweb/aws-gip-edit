

import { TypeProgramItem, TypeProgramEditOptions, PROG_FIELD_GENRE, PROG_FIELD_DAY_OF_WEEK, PROG_FIELD_QUALITY } from './gip_types';
import { FIELD_DEFAULT_VALUES } from '../utils/gip_prog_fields';

export default class GipProgramEditOptions implements TypeProgramEditOptions {

  [ PROG_FIELD_GENRE ]       = '';
  [ PROG_FIELD_DAY_OF_WEEK ] = '';
  [ PROG_FIELD_QUALITY ]     = '';

  constructor( props?: TypeProgramEditOptions ) {
    if ( props ) {
      this.assign( props );
    } else {
      this.clear();
    }
  }

  clear() {
    this[ PROG_FIELD_GENRE ]       = FIELD_DEFAULT_VALUES[ PROG_FIELD_GENRE ];
    this[ PROG_FIELD_DAY_OF_WEEK ] = FIELD_DEFAULT_VALUES[ PROG_FIELD_DAY_OF_WEEK ];
    this[ PROG_FIELD_QUALITY ]     = FIELD_DEFAULT_VALUES[ PROG_FIELD_QUALITY ];
  }

  assign( source: TypeProgramEditOptions ) {
    this[ PROG_FIELD_GENRE ]       = source[ PROG_FIELD_GENRE ];
    this[ PROG_FIELD_DAY_OF_WEEK ] = source[ PROG_FIELD_DAY_OF_WEEK ];
    this[ PROG_FIELD_QUALITY ]     = source[ PROG_FIELD_QUALITY ];
  }

  assignFromProgram( programItem: TypeProgramItem ) {
    this[ PROG_FIELD_GENRE ]       = programItem[ PROG_FIELD_GENRE ];
    this[ PROG_FIELD_DAY_OF_WEEK ] = programItem[ PROG_FIELD_DAY_OF_WEEK ];
    this[ PROG_FIELD_QUALITY ]     = programItem[ PROG_FIELD_QUALITY ];
  }
}
