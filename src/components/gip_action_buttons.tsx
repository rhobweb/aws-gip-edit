/**
 * File:        components/gip_action_buttons.tsx
 * Description: Renders action buttons for the GIP program table.
 */

////////////////////////////////////////////////////////////////////////////////
// Imports

import React, { ReactElement } from 'react';

import {
	FIELD_DEFAULT_VALUES,
	VALUE_STATUS_PENDING,
	VALUE_STATUS_ERROR,
	VALUE_STATUS_SUCCESS
} from '../utils/gip_prog_fields';

import { GipGridRow } from './gip_grid_row';

import {
	PROG_FIELD_STATUS,
	PROG_FIELD_SELECTED,
	PROG_FIELD_DAY_OF_WEEK,
} from '../utils/gip_types';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_DisplayProgramItem,
	Type_DisplayProgramItemStringPropName,
	Type_HandlerProgramChange,
} from '../utils/gip_types';

////////////////////////////////////////
// Exported and local types

type Type_ProgramList = Type_DisplayProgramItem[];

interface Type_ActionButtonsProps {
	programs:        Type_ProgramList,
	onProgramChange: Type_HandlerProgramChange,
	programsSaved:   () => void,
	savePrograms:    ( params: Type_ProgramList ) => Promise<Type_ProgramList>,
}

interface Type_GipActionButtonsProps {
	programs:        Type_ProgramList,
	onProgramChange: Type_HandlerProgramChange,
	savePrograms:    ( programs : Type_ProgramList ) => Promise<Type_ProgramList>,
	programsSaved:   () => void,
}

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

/**
 * Action buttons for the program table.
 * Provides buttons to reset errors, clear days, select OK, delete selected programs, and save programs.
 * @param props - The properties for the ActionButtons component.
 * @param props.programs        - The list of programs to display.
 * @param props.onProgramChange - The handler for program changes.
 * @param props.programsSaved   - Callback when programs are saved.
 * @param props.savePrograms    - Function to save the programs.
 * @returns The rendered ActionButtons component.
 */
function ActionButtons( props : Type_ActionButtonsProps ) : ReactElement {
	const { programs, onProgramChange, programsSaved, savePrograms } = props;

	const resetErrors = () : void => {
		//console.log( "resetErrors: ", programs );
		programs.forEach( prog => {
			if ( prog[PROG_FIELD_STATUS] === VALUE_STATUS_ERROR ) {
				prog[PROG_FIELD_STATUS] = VALUE_STATUS_PENDING;
			}
		} );
		onProgramChange( programs );
	};

	const selectOK = () : void => {
		if ( programs.length > 0 ) {
			const newPrograms = programs.map( prog => {
				const program = JSON.parse( JSON.stringify( prog ) ) as Type_DisplayProgramItem;
				if ( program[PROG_FIELD_STATUS] === VALUE_STATUS_SUCCESS ) {
					program[PROG_FIELD_SELECTED] = true;
				} else {
					program[PROG_FIELD_SELECTED] = false;
				}
				return program;
			} );
			onProgramChange( newPrograms );
		} else {
			window.alert( 'No programs selected' );
		}
	};

	const deleteSelected = () : void => {
		const selectedPrograms = programs.filter( prog => prog[PROG_FIELD_SELECTED] );
		if ( selectedPrograms.length > 0 ) {
			if ( window.confirm( 'Delete selected programs?' ) ) {
				const newPrograms = programs.filter( prog => ! prog[PROG_FIELD_SELECTED] );
				onProgramChange( newPrograms );
			}
		} else {
			window.alert( 'No programs selected' );
		}
	};

	const resetField = ( fieldName : Type_DisplayProgramItemStringPropName ) : void => {
		const defaultValue = FIELD_DEFAULT_VALUES[ fieldName ];
		for ( const prog of programs ) {
			if ( prog[ fieldName ] !== defaultValue ) {
				prog[ fieldName ] = defaultValue;
			}
		}
		onProgramChange( programs );
	};

	const saveProgs = () : void => {
		savePrograms( programs )
			.then( newPrograms => {
				onProgramChange( newPrograms );
				programsSaved();
			})
			.catch( ( err : unknown ) => {
				console.error( 'saveProgs: error: ', err );
				window.alert( 'Error saving programs: ' + ( err as Error ).message );
			});
	};

	return (
		<>
			<input type="button" className="gip-action-button" name="resetErrors"    value="Reset Errors"    onClick={ () => { resetErrors(); } }/>
			<input type="button" className="gip-action-button" name="clearDays"      value="Clear Days"      onClick={ () => { resetField( PROG_FIELD_DAY_OF_WEEK ); } }/>
			<input type="button" className="gip-action-button" name="selectOK"       value="Select OK"       onClick={ () => { selectOK(); } }/>
			<input type="button" className="gip-action-button" name="deleteSelected" value="Delete Selected" onClick={ () => { deleteSelected(); } }/>
			<input type="button" className="gip-action-button" name="saveProgs"      value="Save"            onClick={ () => { saveProgs(); } }/>
		</>
	);
}

////////////////////////////////////////
// Exported definitions

/**
 * Action buttons for the program table.
 * Provides buttons to reset errors, clear days, select OK, delete selected programs, and save programs.
 * @param props - The properties for the ActionButtons component.
 * @returns The rendered ActionButtons component.
 */
export function GipActionButtons( props : Type_GipActionButtonsProps ) : ReactElement {
	const labelText            = 'Actions';
	const fieldID              = 'action-buttons';
	const additionalClassNames = [ 'gip-col-buttons' ];
	return (
		<GipGridRow fieldID={ fieldID } labelText={ labelText } additionalClassNames={ additionalClassNames } gipComponent={ () => <ActionButtons { ...props }/> }/>
	);
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions
