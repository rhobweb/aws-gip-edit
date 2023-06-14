
import { FIELD_MAP_COLLECTION, REVERSE_FIELD_MAP_COLLECTION, DUMMY_FIELD_DB, FIELD_DEFAULT_VALUES,
  TypeDbProgramItem,
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
  TypeProgramItem,
} from './gip_types';

const PROG_TO_DB_FIELD_MAP = FIELD_MAP_COLLECTION[ DUMMY_FIELD_DB ];
const DB_TO_PROG_FIELD_MAP = REVERSE_FIELD_MAP_COLLECTION[ DUMMY_FIELD_DB ];

/**
 * @param prog : a DB Program Item object;
 * @returns a Program Item object.
 */
export function dbToProg( dbProg : TypeDbProgramItem ) : TypeProgramItem {
  const prog : TypeProgramItem = {
    [PROG_FIELD_PID]:         '',
    [PROG_FIELD_STATUS]:      '',
    [PROG_FIELD_TITLE]:       '',
    [PROG_FIELD_SYNOPSIS]:    '',
    [PROG_FIELD_IMAGE_URI]:   '',
    [PROG_FIELD_GENRE]:       '',
    [PROG_FIELD_DAY_OF_WEEK]: '',
    [PROG_FIELD_QUALITY]:     '',
    [PROG_FIELD_SELECTED]:    false,
  };

  Object.entries( dbProg ).forEach( ( [ dbField, dbValue ] ) => {
    const progField = DB_TO_PROG_FIELD_MAP[ dbField ];

    if ( progField ) {
      prog[ progField ] = dbValue;
    }
  } );

  prog[ PROG_FIELD_DAY_OF_WEEK ] = ( prog[ PROG_FIELD_DAY_OF_WEEK ] ? prog[ PROG_FIELD_DAY_OF_WEEK ] : FIELD_DEFAULT_VALUES[ PROG_FIELD_DAY_OF_WEEK ] );
  prog[ PROG_FIELD_SELECTED ]    = false;

  //console.log( `dbToProg: `, { prog, FIELD_DEFAULT_VALUES } );

  return prog;
}

/**
 * @param prog : a Program Item object;
 * @returns a DB Program Item object.
 */
export function progToDb( prog: TypeProgramItem ) : TypeDbProgramItem {
  const dbProg : TypeDbProgramItem = {
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

  Object.entries( prog ).forEach( ( [ field, value ] ) => {
    const dbField = PROG_TO_DB_FIELD_MAP[ field ];

    if ( dbField ) {
      dbProg[ field ] = value;
    }
  } );

  dbProg[ DB_FIELD_DAY_OF_WEEK ] = ( dbProg[ DB_FIELD_DAY_OF_WEEK ] === FIELD_DEFAULT_VALUES[ PROG_FIELD_DAY_OF_WEEK ] ? null : dbProg[ DB_FIELD_DAY_OF_WEEK ] );

  return dbProg;
}

