//import React from 'react';

import React, { useState, useEffect, useRef, ForwardedRef } from 'react';
import { getProgDetailsFromLink, cookTitle, cookText }      from '../utils/gip_prog_edit_utils';
import {
  PROG_FIELD_URI, PROG_FIELD_PID, PROG_FIELD_TITLE, PROG_FIELD_SYNOPSIS, PROG_FIELD_SELECTED, PROG_FIELD_IMAGE_URI,
  TypeEndpointDef, TypeProgramItem, TypeProgramList, TypeProgramEditInput, TypeProgramEditOptions
} from '../utils/gip_types';
import { TypeDbProgramItem }  from '../utils/gip_prog_fields';
import { processEndpointDef, extractJsonResponse, extractJsonResponseStream } from '../utils/gip_http_utils';
import { GipProgramEntry }    from './gip_program_entry';
import { GipProgramTable }    from './gip_program_table';
import { GipActionButtons }   from './gip_action_buttons';
import GipProgramEditInput    from '../utils/gip_program_edit_input';
import GipProgramEditOptions  from '../utils/gip_program_edit_options';
import GipProgramItem         from '../utils/gip_program_item';
import { dbToProg, progToDb } from '../utils/gip_prog_db_utils';
import logger                 from '@rhobweb/console-logger';

type TypeGipEditState = {
  programEditInput:   TypeProgramEditInput,
  programEditOptions: TypeProgramEditOptions,
  programs:           TypeProgramItem[],
};

const ENDPOINT_LOAD : TypeEndpointDef = {
  method: 'GET',
  uri:    '/gip_edit/api/programs',
  params: { all: true },
};

const ENDPOINT_SAVE : TypeEndpointDef = {
  method: 'POST',
  uri:    '/gip_edit/api/programs',
};

const DOC_TITLE = 'GIP Program Edit';

//function beforeUnload( event ) {
//  event.preventDefault();
//  // Chrome requires returnValue to be set
//  logger.log( "Before Unload" );
//  event.returnValue = '';
//}

function processLoadedProgram( rawProg: TypeDbProgramItem ) : TypeProgramItem {
  return dbToProg( rawProg );
}

function processProgramForSaving( prog : TypeProgramItem ) : TypeDbProgramItem {
  const cookedProgram                  = JSON.parse( JSON.stringify( prog ) );
  cookedProgram[ PROG_FIELD_TITLE ]    = cookTitle( cookedProgram[ PROG_FIELD_TITLE ] );
  cookedProgram[ PROG_FIELD_SYNOPSIS ] = cookText( cookedProgram[ PROG_FIELD_SYNOPSIS ] );
  return progToDb( cookedProgram );
}

async function loadPrograms() : Promise<TypeProgramItem[]> {
  const { uri, options } = processEndpointDef( { endpointDef: ENDPOINT_LOAD } );
  logger.log( 'info', `loadPrograms: URI: `, uri );
  const response         = await fetch( uri, options as RequestInit );
  const rawPrograms      = await extractJsonResponse( response ) as TypeDbProgramItem[];
  const programs         = rawPrograms.map( prog => processLoadedProgram( prog ) );
  logger.log( 'info', `loadPrograms: Programs: `, programs );
  return programs;
}

async function savePrograms( programs : TypeProgramItem[] ) : Promise<TypeProgramItem[]> {
  const dbPrograms = programs.map( prog => processProgramForSaving( prog ) ) as unknown;
  const params     = dbPrograms as TypeRawHttpParams; // Force casting to match the processEndpointDef function
  const { uri, options } = processEndpointDef( { endpointDef: ENDPOINT_SAVE, params } );
  logger.log( 'verbose', 'savePrograms: Programs: ', JSON.stringify( { uri, options, params } ) );
  const response         = await fetch( uri, options as RequestInit );
  logger.log( 'verbose', 'savePrograms: ', { response } );
  const rawPrograms      = (await extractJsonResponseStream( response ) || [] ) as TypeDbProgramItem[];
  const newPrograms      = rawPrograms.map( prog => processLoadedProgram( prog ) );
  logger.log( 'info', 'savePrograms: ', { newPrograms } );
  return newPrograms;
}

function processProgram( { programEditInput, programEditOptions, programs } : TypeGipEditState ) : TypeProgramList | null {
  let newProgramList : TypeProgramList = [];
  const newOrUpdatedProgram = new GipProgramItem( { inputItem: programEditInput, inputOptions: programEditOptions } );

  const newOrUpdatedPid = newOrUpdatedProgram[ PROG_FIELD_PID ];

  if ( newOrUpdatedPid.length && newOrUpdatedProgram[ PROG_FIELD_TITLE ].length ) {

    newProgramList = [];
    newProgramList = JSON.parse( JSON.stringify( programs ) );

    logger.log( 'verbose', `processProgram: `, { newOrUpdatedPid } );

    programs.forEach( prog => prog[ PROG_FIELD_SELECTED ] = false ); // Clear the selection

    const existingProgram = newProgramList.find( prog => prog.pid === newOrUpdatedPid ); // newProgramList already set previously

    if ( existingProgram ) {
      Object.assign( existingProgram, newOrUpdatedProgram );
    } else {
      newProgramList.push( newOrUpdatedProgram );
    }
  } else {
    alert( 'Incomplete program info' );
  }

  return ( newProgramList.length > 0 ? newProgramList : null );
}

function processDrop( event : DragEvent ) {
  let result = null;

  if ( event.dataTransfer ) {
    const textHTML = event.dataTransfer.getData( 'text/html' );

    logger.log( 'debug', "processDrop: ", textHTML );
  
    if ( textHTML.length > 0 )
    {
      const programURL       = event.dataTransfer.getData( 'text/plain' );
      const programDetails   = getProgDetailsFromLink( textHTML );
      const programEditInput = new GipProgramEditInput();
      programEditInput[ PROG_FIELD_URI ]       = programURL;
      programEditInput[ PROG_FIELD_TITLE ]     = programDetails[ PROG_FIELD_TITLE ];
      programEditInput[ PROG_FIELD_SYNOPSIS ]  = programDetails[ PROG_FIELD_SYNOPSIS ];
      programEditInput[ PROG_FIELD_IMAGE_URI ] = programDetails[ PROG_FIELD_IMAGE_URI ];
  
      result = {
        programEditInput,
      };
  
      logger.log( 'debug', 'processDrop: ', { result } );
    }
  }

  return result;
}

function GipEdit() {

  const [ programEditInput,   setProgramEditInput ]   = useState( new GipProgramEditInput() );
  const [ programEditOptions, setProgramEditOptions ] = useState( new GipProgramEditOptions() );
  const [ programs,           setPrograms ]           = useState( [] as TypeProgramList );

  const refs : TypeRefs = {
    [PROG_FIELD_URI]:   useRef(null),
    [PROG_FIELD_TITLE]: useRef(null),
  };

  function setFocus( inputFieldName : string ) {
    logger.log( 'debug', 'setFocus: Requested: ', inputFieldName );
    // Focus the text input using the raw DOM API
    if ( refs[ inputFieldName ]?.current ) {
      // logger.log( "setFocus: Performing" );
      refs[ inputFieldName ].current.focus();
    }
  }
  
  function setInitialFocus() {
    //logger.log( 'debug', 'setInitialFocus' );
    setFocus( PROG_FIELD_URI );
  }
  
  const clearProgramInput = () => {
    const newProgramEditInput = new GipProgramEditInput();
    setProgramEditInput( newProgramEditInput );
  };

  const onInputChange = ( { paramName, newValue } : { paramName: string, newValue: string } ) => {
    // logger.log( 'debug', 'onInputChange: ', { paramName, newValue } );
    const newProgramEditInput = new GipProgramEditInput();
    newProgramEditInput.assign( programEditInput );
    newProgramEditInput.setField( paramName, newValue );
    setProgramEditInput( newProgramEditInput );
  }

  const setInputFieldsFromProgram = ( program : TypeProgramItem ) => {
    const newProgramEditInput   = new GipProgramEditInput();
    const newProgramEditOptions = new GipProgramEditOptions();
    newProgramEditInput.assignFromProgram( program );
    newProgramEditOptions.assignFromProgram( program );
    setProgramEditInput( newProgramEditInput );
    setProgramEditOptions( newProgramEditOptions );
  }

  const setInputToSelected = ( programs : TypeProgramList ) => {
    const arrSelected = programs.filter( prog => prog[ PROG_FIELD_SELECTED ] );
    if ( arrSelected.length === 1 ) {
      setInputFieldsFromProgram( arrSelected[ 0 ] );
    } else {
      clearProgramInput();
    }
  }

  const clearSelected = () => {
    const newPrograms = programs.map( prog => { prog[ PROG_FIELD_SELECTED ] = false; return prog; } );
    setPrograms( newPrograms );
  }

  const onOptionChange = ( newProgramEditOptions : TypeProgramEditOptions ) => {
    logger.log( 'debug', 'Program Options Changed ' );
    const objNewProgramOptions = new GipProgramEditOptions( newProgramEditOptions );
    setProgramEditOptions( objNewProgramOptions );
  }

  const onProgramChange = ( newPrograms: TypeProgramList ) => {
    logger.log( 'debug', 'Programs Changed ', newPrograms );
    setPrograms( newPrograms );
    setInputToSelected( newPrograms );
  }    

  const handleEscapeKey = ( event : TypeEventKeyboardAny ) => {
    if ( event.key === 'Escape' ) {
      clearProgramInput();
      setInitialFocus();
      clearSelected();
    }
  }

  const onKeyDown = ( event: TypeEventKeyboardAny ) => {
    logger.log( 'silly', 'onKeyDown' );
    if ( event.key === 'Enter' ) {
      const newPrograms = processProgram( { programEditInput, programEditOptions, programs } );
      if ( newPrograms ) {
        setPrograms( newPrograms );
        clearProgramInput();
        setInitialFocus();
      }
    } else {
      handleEscapeKey( event );
    }
  }

  const onProgramTableKeyDown = ( event : TypeEventKeyboardAny ) => {
    handleEscapeKey( event );
  }

  const onDragOver = ( event: TypeEventDragAny ) => {
    event.preventDefault();
    event.stopPropagation();
  }

  const onDrop = ( event : TypeEventDragAny ) => {
    event.preventDefault();
    event.stopPropagation();
    const stateUpdates = processDrop( event );
    if ( stateUpdates ) {
      const { programEditInput: newProgramEditInput } = stateUpdates;
      setProgramEditInput( newProgramEditInput );
      clearSelected();
      setFocus( PROG_FIELD_TITLE );
    }
  }

  // eslint moans about the empty dependencies array, but if it isn't present useEffect gets called on every load!
  useEffect( () => {
    document.title = DOC_TITLE;
    logger.log( 'silly', 'Use Effect' );
    loadPrograms()
    .then( newPrograms => {
      setPrograms( newPrograms );
      setInitialFocus();
    } );
  }, [] ); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
    <div className="container-fluid gip-grid"
      onDragOver={ event => onDragOver( event ) }
      onDrop={ event => onDrop( event ) }
    >
      <GipProgramEntry
        programEditInput={ programEditInput }
        programEditOptions={ programEditOptions }
        onInputChange={ ( { paramName, newValue } ) => onInputChange( { paramName, newValue } ) }
        onOptionChange={ newOptions => onOptionChange( newOptions ) }
        onKeyDown={ event => onKeyDown( event ) }
        //refCallback={ inputFieldName => setRef( inputFieldName ) }
        ref={ refs as ForwardedRef<HTMLInputElement> } // Expects 'ref' to be a simple reference, even though it can handle objects
      />
      <GipActionButtons
        programs={ programs }
        onProgramChange={ ( newPrograms ) => onProgramChange( newPrograms ) }
        savePrograms={ savePrograms }
        programsSaved={ () => setInitialFocus() }
      />
      <GipProgramTable
        programs={ programs }
        onProgramChange={ newPrograms => onProgramChange( newPrograms ) }
        onKeyDown={ event => onProgramTableKeyDown( event ) }
      />
    </div>
    </>
  );
}

export default GipEdit;
