/**
 * File:        components/gip_edit.tsx
 * Description: The main React component for the program edit page.
 *              Displays the program list and the components to edit a program.
 */

////////////////////////////////////////////////////////////////////////////////
// Imports

import React, { useState, useEffect, useRef } from 'react';

import { Helmet } from 'react-helmet';

import { getProgDetailsFromLink, cookTitle, cookSynopsis } from '../utils/gip_prog_edit_utils';

import {
	PROG_FIELD_URI,
	PROG_FIELD_PID,
	PROG_FIELD_TITLE,
	PROG_FIELD_SYNOPSIS,
	PROG_FIELD_SELECTED,
	PROG_FIELD_IMAGE_URI,
} from '../utils/gip_types';

import { Type_DbProgramEditItem } from '../utils/gip_prog_fields';

import {
	processEndpointDef,
	extractJsonResponse,
	extractJsonResponseStream,
} from '../utils/gip_http_utils';

import { GipProgramEntry }         from './gip_program_entry';
import { GipProgramTable }         from './gip_program_table';
import { GipActionButtons }        from './gip_action_buttons';
import GipProgramEditInput         from '../utils/gip_program_edit_input';
import GipProgramEditOptions       from '../utils/gip_program_edit_options';
import GipProgramItem              from '../utils/gip_program_item';
import { dbToProgArray, progToDb } from '../utils/gip_prog_db_utils';
import logger                      from '@rhobweb/console-logger';
import ourPackage                  from '../../package.json'; // with { type: "json" };

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_EventKeyboardAny,
	Type_EventDragAny,
} from '../browser_event.ts';

import type {
	Type_EndpointDef,
	Type_DisplayProgramItem,
	Type_ProgramEditInput,
	Type_ProgramEditOptions,
	Type_RawHttpParams,
} from '../utils/gip_types.ts';

import type {
	Type_UriAndTitleRefs,
} from './gip_program_entry';

////////////////////////////////////////
// Exported and local types

interface Type_GipEditState {
	programEditInput:   Type_ProgramEditInput,
	programEditOptions: Type_ProgramEditOptions,
	programs:           Type_DisplayProgramItem[],
}

export interface Type_BodyMessageError {
	message: string,
};

type Type_ErrorBody = Record<string,unknown>[] | Type_BodyMessageError;

export type Type_processProgramForSaving_args = Type_DisplayProgramItem;
export type Type_processProgramForSaving_ret  = Type_DbProgramEditItem;

export type Type_loadPrograms_ret = Promise<Type_DisplayProgramItem[]>;

export type Type_savePrograms_args = Type_DisplayProgramItem[];
export type Type_savePrograms_ret  = Promise<Type_DisplayProgramItem[]>;

export type Type_processProgram_args = Type_GipEditState;
export type Type_processProgram_ret  = Type_DisplayProgramItem[] | null;

export type Type_processDrop_args = Type_EventDragAny;
export type Type_processDrop_ret  = { programEditInput : GipProgramEditInput } | null;

export type Type_GipEdit_ret = React.JSX.Element;

////////////////////////////////////////////////////////////////////////////////
// Constants

const BOOTSTRAP_CSS_URI  = 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css';
const BOOTSTRAP_CSS_HASH = 'sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65';

const ENDPOINT_LOAD : Type_EndpointDef = {
	method: 'GET',
	uri:    '/gip_edit/api/programs',
	params: { all: true },
};

const ENDPOINT_SAVE : Type_EndpointDef = {
	method: 'POST',
	uri:    '/gip_edit/api/programs',
};

const DOC_TITLE = `GIP Program Edit v${ourPackage.version}`;

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

export class ErrorWithBody extends Error {
	body: Type_ErrorBody;
	constructor( message: string, body: Type_ErrorBody = [] ) {
		super( message );
		this.name = 'ErrorWithBody';
		this.body = body;
	}
}

//function beforeUnload( event ) {
//  event.preventDefault();
//  // Chrome requires returnValue to be set
//  logger.log( 'Before Unload' );
//  event.returnValue = '';
//}

/**
 * @param prog - The program to process for saving.
 * @returns the program object ready for saving to the database.
 *          The program is converted to a database format, and the title and synopsis are cooked.
 */
function processProgramForSaving( prog : Type_processProgramForSaving_args ) : Type_processProgramForSaving_ret {
	const cookedProgram                  = JSON.parse( JSON.stringify( prog ) ) as Type_DisplayProgramItem;
	cookedProgram[ PROG_FIELD_TITLE ]    = cookTitle( cookedProgram[ PROG_FIELD_TITLE ] );
	cookedProgram[ PROG_FIELD_SYNOPSIS ] = cookSynopsis( { rawText: cookedProgram[ PROG_FIELD_SYNOPSIS ] } );
	return progToDb( cookedProgram );
}

/**
 * Loads the programs from the server.
 * @returns the list of programs.
 */
async function loadPrograms() : Type_loadPrograms_ret {
	const { uri, options } = processEndpointDef( { endpointDef: ENDPOINT_LOAD } );
	logger.log( 'info', `loadPrograms: URI: `, uri );
	const response         = await fetch( uri, options as RequestInit );
	const rawPrograms      = await extractJsonResponse( response ) as Type_DbProgramEditItem[];
	const programs         = dbToProgArray( rawPrograms );
	logger.log( 'info', `loadPrograms: Programs: `, programs );
	return programs;
}

/**
 * Saves the programs to the server.
 * @param programs - The list of programs to save.
 * @returns the list of saved programs.
 */
async function savePrograms( programs : Type_savePrograms_args ) : Type_savePrograms_ret {
	const dbPrograms       = programs.map( prog => processProgramForSaving( prog ) ) as unknown;
	const params           = dbPrograms as Type_RawHttpParams; // Force casting to match the processEndpointDef function
	const { uri, options } = processEndpointDef( { endpointDef: ENDPOINT_SAVE, params } );

	let newPrograms = [] as Type_DisplayProgramItem[];

	logger.log( 'verbose', 'savePrograms: Programs: ', JSON.stringify( { uri, options, params } ) );

	try {
		const response = await fetch( uri, options as RequestInit );
		if ( response.ok ) {
			logger.log( 'verbose', 'savePrograms: OK', );
			const newDbPrograms = await extractJsonResponseStream( response ) as Type_DbProgramEditItem[];
			newPrograms         = dbToProgArray( newDbPrograms );
		} else {
			const body    = await extractJsonResponseStream( response );
			const errSave = new ErrorWithBody( 'savePrograms error: ' + JSON.stringify( { status: response.status, statusText: response.statusText } ), body as Type_BodyMessageError ); // TODO: tidy up types for body
			throw errSave;
		}
	}
	catch ( err ) {
		logger.log( 'error', 'savePrograms: FAILED', { err: err as ErrorWithBody } );
		newPrograms = programs; // Default to return the request programs so they are not lost
		let errMessage = ( err as Error ).message;
		const body = ( err as ErrorWithBody ).body as Record<'message',string> | null;
		if ( body ) {
			errMessage = ( 'message' in body ) ? body.message : JSON.stringify( body );
		}
		const alertMessage = `saveFailed! ` + errMessage;
		window.alert( alertMessage );
	}

	logger.log( 'info', 'savePrograms: ', { newPrograms } );

	return newPrograms;
}

/**
 * @param param.programEditInput   - The input data for the program to be processed, e.g., pid, title, synopsis, etc.
 * @param param.programEditOptions - The options for the program to be processed, e.g., genre, quality, etc.
 * @param param.programs           - The current list of programs.
 * @returns the updated list of programs or null if the program list is empty.
 */
function processProgram( { programEditInput, programEditOptions, programs } : Type_processProgram_args ) : Type_processProgram_ret {
	let newProgramList : Type_DisplayProgramItem[] = [];
	const newOrUpdatedProgram = new GipProgramItem( { inputItem: programEditInput, inputOptions: programEditOptions } );

	const newOrUpdatedPid = newOrUpdatedProgram[ PROG_FIELD_PID ];

	if ( newOrUpdatedPid.length && newOrUpdatedProgram[ PROG_FIELD_TITLE ].length ) {

		newProgramList = [];
		newProgramList = JSON.parse( JSON.stringify( programs ) ) as Type_DisplayProgramItem[];

		logger.log( 'verbose', `processProgram: `, { newOrUpdatedPid } );

		programs.forEach( prog => prog[ PROG_FIELD_SELECTED ] = false ); // Clear the selection

		const existingProgram = newProgramList.find( prog => prog.pid === newOrUpdatedPid ); // newProgramList already set previously

		if ( existingProgram ) {
			Object.assign( existingProgram, newOrUpdatedProgram );
		} else {
			newProgramList.push( newOrUpdatedProgram as Type_DisplayProgramItem );
		}
	} else {
		alert( 'Incomplete program info' );
	}

	return ( newProgramList.length > 0 ? newProgramList : null );
}

/**
 * @param event - The drag and drop event containing the data transfer object.
 *                The data transfer object should contain the program details in HTML format.
 * @returns if successful, object with property:
 *           - programEditInput: the processed program data;
 *          or null if the drop was not valid.
 */
function processDrop( event : Type_processDrop_args ) : Type_processDrop_ret {
	let result = null;

	logger.log( 'debug', 'processDrop', event.dataTransfer );

	if ( event.dataTransfer ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		const textHTML = event.dataTransfer.getData( 'text/html' );

		logger.log( 'debug', 'processDrop: ', textHTML );

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

////////////////////////////////////////
// Exported definitions

/**
 * @returns the main program edit page React element, including:
 *           - the program list;
 *           - program edit elements:
 *              - title;
 *              - synopsis;
 *              - genre;
 *              - day of week;
 *              - qualiry;
 *            - program display elements:
 *              - program image.
 */
export default function GipEdit() : Type_GipEdit_ret {

	// Sub-elements of this element
	const [ programEditInput,   setProgramEditInput ]   = useState( new GipProgramEditInput() );
	const [ programEditOptions, setProgramEditOptions ] = useState( new GipProgramEditOptions() );
	const [ programs,           setPrograms ]           = useState( [] as Type_DisplayProgramItem[] );

	// References to elements in the sub-elements
	const refs : Type_UriAndTitleRefs = {
		[PROG_FIELD_URI]:   useRef(null),
		[PROG_FIELD_TITLE]: useRef(null),
	};

	type Type_RefFieldName = keyof Type_UriAndTitleRefs;

	/**
	 * @description Set the focus to the element identified by name
	 * @param inputFieldName : reference to an element in the page.
	 */
	function setFocus( inputFieldName : Type_RefFieldName ) : void {
		logger.log( 'debug', 'setFocus: Requested: ', inputFieldName );
		// Focus the text input using the raw DOM API
		if ( refs[ inputFieldName ]?.current ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
			// logger.log( "setFocus: Performing" );
			refs[ inputFieldName ].current.focus();
		}
	}

	/**
	 * @description Set the focus to the first element on the page
	 */
	function setInitialFocus() : void {
		//logger.log( 'debug', 'setInitialFocus' );
		setFocus( PROG_FIELD_URI );
	}

	/**
	 * @description Clear the input fields
	 */
	const clearProgramInput = () : void => {
		const newProgramEditInput = new GipProgramEditInput();
		setProgramEditInput( newProgramEditInput );
	};

	/**
	 * @param param0.paramName : the name of the field to update.
	 * @param param0.newValue  : the new value of the field.
	 */
	const onInputChange = ( { paramName, newValue } : { paramName: string, newValue: string } ) : void => {
		// logger.log( 'debug', 'onInputChange: ', { paramName, newValue } );
		const newProgramEditInput = new GipProgramEditInput();
		newProgramEditInput.assign( programEditInput );
		newProgramEditInput.setField( paramName, newValue );
		setProgramEditInput( newProgramEditInput );
	};

	/**
	 * @description : sets the input elements from the selected program item.
	 * @param program : a program item.
	 */
	const setInputFieldsFromProgram = ( program : Type_DisplayProgramItem ) : void => {
		const newProgramEditInput   = new GipProgramEditInput();
		const newProgramEditOptions = new GipProgramEditOptions();
		newProgramEditInput.assignFromProgram( program );
		newProgramEditOptions.assignFromProgram( program );
		setProgramEditInput( newProgramEditInput );
		setProgramEditOptions( newProgramEditOptions );
	};

	/**
	 * @description : if one program item is selected, set the input elements from the selected program item.
	 * @param {Type_DisplayProgramItem[]} programs : array of program items.
	 */
	const setInputToSelected = ( programs : Type_DisplayProgramItem[] ) : void => {
		const arrSelected = programs.filter( prog => prog[ PROG_FIELD_SELECTED ] );
		if ( arrSelected.length === 1 ) {
			setInputFieldsFromProgram( arrSelected[ 0 ] );
		} else {
			clearProgramInput();
		}
	};

	/**
	 * @description deselect all prgram items
	 */
	const clearSelected = () : void => {
		const newPrograms = programs.map( prog => { prog[ PROG_FIELD_SELECTED ] = false; return prog; } );
		setPrograms( newPrograms );
	};

	/**
	 * @description update the program options input elements, i.e., genre, day of week, quality.
	 * @param {Type_ProgramEditOptions} newProgramEditOptions: the new values for the options.
	 */
	const onOptionChange = ( newProgramEditOptions : Type_ProgramEditOptions ) : void => {
		logger.log( 'debug', 'Program Options Changed ' );
		const objNewProgramOptions = new GipProgramEditOptions( newProgramEditOptions );
		setProgramEditOptions( objNewProgramOptions );
	};

	/**
	 * @description called whenever a change has been made to the program items.
	 * @param {Type_DisplayProgramItem[]} newPrograms : array of program items.
	 */
	const onProgramChange = ( newPrograms: Type_DisplayProgramItem[] ) : void => {
		logger.log( 'debug', 'Programs Changed ', newPrograms );
		setPrograms( newPrograms );
		setInputToSelected( newPrograms );
	};

	/**
	 * @description if the escape key was pressed, clear the input elements and selected programs.
	 * @param {Type_EventKeyboardAny} event : a keyboard event.
	 */
	const handleEscapeKey = ( event : Type_EventKeyboardAny ) : void => {
		if ( event.key === 'Escape' ) {
			clearProgramInput();
			setInitialFocus();
			clearSelected();
		}
	};

	/**
	 * @descripton handle an enter or escape key press in one of the input elements or in the program table.
	 * @param {Type_EventKeyboardAny} event : a keyboard event.
	 */
	const onKeyDown = ( event: Type_EventKeyboardAny ) : void => {
		//const arrIgnore = [ 'stateNode' ];
		//const arrProp = Object.keys( event ).filter( k => !arrIgnore.includes( k ) );
		//console.log( 'onKeyDown', JSON.stringify( event, arrProp ) );
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
	};

	/**
	 * @description handle an escape key press in the program table.
	 * @param {Type_EventKeyboardAny} event : a keyboard event
	 */
	const onProgramTableKeyDown = ( event : Type_EventKeyboardAny ) : void => {
		handleEscapeKey( event );
	};

	/**
	 * @description override the default drag behaviour anywhere on the page container element.
	 * @param {Type_EventDragAny} event : a drag over event.
	 */
	const onDragEnter = ( event: Type_EventDragAny ) : void => {
		logger.log( 'debug', 'onDragEnter' );
		event.preventDefault();
		event.stopPropagation();
	};

	/**
	 * @description attempt to populate the input elements with dropped content.
	 * @param {Type_EventDragAny} event : a drop event.
	 */
	const onDrop = ( event : Type_EventDragAny ) : void => {
		logger.log( 'debug', 'onDrop' );
		event.preventDefault();
		event.stopPropagation();
		const stateUpdates = processDrop( event );
		if ( stateUpdates ) {
			const { programEditInput: newProgramEditInput } = stateUpdates;
			setProgramEditInput( newProgramEditInput );
			clearSelected();
			setFocus( PROG_FIELD_TITLE );
		}
	};

	//const onTouchEnd = ( event : Type_EventTouchAny ) => {
	//	logger.log( 'debug', 'onTouchEnd', { event: Object.keys( event ) } );
	//	//event.stopPropagation();
	//}
	//const onTouchEndCapture= ( event : Type_EventTouchAny ) => {
	//	logger.log( 'debug', 'onTouchEndCapture' );
	//	//event.stopPropagation();
	//}
	//const onTouchCancelCapture=  ( event : Type_EventTouchAny ) => {
	//	logger.log( 'debug', 'onTouchCancelCapture' );
	//	//event.stopPropagation();
	//}
	//onTouchEnd={ event => onTouchEnd( event ) }
	//onTouchEndCapture={ event => onTouchEndCapture( event ) }
	//onTouchCancelCapture={ event => onTouchCancelCapture( event ) }

	/**
	 * @description effect function to load the programs from the database. Empty dependency list, means run once when element is loaded.
	 */
	useEffect( () => {
		//logger.log( 'debug', 'gip_edit: Use Effect' );
		document.title = DOC_TITLE;
		loadPrograms()
			.then( newPrograms => {
				setPrograms( newPrograms );
				setInitialFocus();
			} )
			.catch( ( err : unknown ) => {
				logger.log( 'error', 'loadPrograms: FAILED', { err } );
			});
	}, [] );

	return (
		<div className="app">
			<Helmet>
				<link href={BOOTSTRAP_CSS_URI} rel="stylesheet" integrity={BOOTSTRAP_CSS_HASH} crossOrigin="anonymous"/>
			</Helmet>
			<div className="container-fluid gip-grid"
				onDragEnter={ event => { onDragEnter( event ); } }
				onDrop={ event => { onDrop( event ); } }
			>
				<GipProgramEntry
					programEditInput={ programEditInput }
					programEditOptions={ programEditOptions }
					onInputChange={ ( { paramName, newValue } : { paramName: string, newValue: string } ) => { onInputChange( { paramName, newValue } ); } }
					onOptionChange={ ( newOptions : Type_ProgramEditOptions ) => { onOptionChange( newOptions ); } }
					onKeyDown={ ( event : Type_EventKeyboardAny ) => { onKeyDown( event ); } }
					refs={ refs } // Expects 'refs' to be a simple reference, even though it can handle objects
				/>
				<GipActionButtons
					programs={ programs }
					onProgramChange={ ( newPrograms ) => {  onProgramChange( newPrograms ); } }
					savePrograms={ savePrograms }
					programsSaved={ () => { setInitialFocus(); } }
				/>
				<GipProgramTable
					programs={ programs }
					onProgramChange={ newPrograms => { onProgramChange( newPrograms ); } }
					onKeyDown={ event => { onProgramTableKeyDown( event ); } }
				/>
			</div>
		</div>
	);
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions

export const privateDefs = {};

if ( process.env.NODE_ENV === 'test-unit' ) {
	Object.assign( privateDefs, {
		processProgramForSaving,
		loadPrograms,
		savePrograms,
		processProgram,
		processDrop,
	} );
}
