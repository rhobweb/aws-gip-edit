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
} from '#utils/gip_prog_fields';

import { GipGridRow } from '#components/gip_grid_row';

import {
	PROG_FIELD_STATUS,
	PROG_FIELD_SELECTED,
	PROG_FIELD_DAY_OF_WEEK,
} from '#utils/gip_types';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_DisplayProgramItem,
	Type_DisplayProgramItemStringPropName,
	Type_HandlerProgramChange,
} from '#utils/gip_types';

////////////////////////////////////////
// Exported and local types

export interface Type_ActionButtons_args {
	programs:        Type_DisplayProgramItem[],
	onProgramChange: Type_HandlerProgramChange,
	programsSaved:   () => void,
	savePrograms:    ( params: Type_DisplayProgramItem[] ) => Promise<Type_DisplayProgramItem[]>,
}
export type Type_ActionButtons_ret = ReactElement;

export interface Type_GipActionButtons_args {
	programs:        Type_DisplayProgramItem[],
	onProgramChange: Type_HandlerProgramChange,
	savePrograms:    ( programs : Type_DisplayProgramItem[] ) => Promise<Type_DisplayProgramItem[]>,
	programsSaved:   () => void,
}
export type Type_GipActionButtons_ret = ReactElement;

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
function ActionButtons( props : Type_ActionButtons_args ) : Type_ActionButtons_ret {
	const { programs, onProgramChange, programsSaved, savePrograms } = props;

	/**
	 * @description reset all programs with error status to be 'Pending'.
	 */
	const resetErrors = () : void => {
		//console.log( "resetErrors: ", programs );
		programs.forEach( prog => {
			if ( prog[PROG_FIELD_STATUS] === VALUE_STATUS_ERROR ) {
				prog[PROG_FIELD_STATUS] = VALUE_STATUS_PENDING;
			}
		} );
		onProgramChange( programs );
	};

	/**
	 * @description select all programs with status 'OK'.
	 */
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
			window.alert( 'No programs' );
		}
	};

	/**
	 * @description delete all selected programs.
	 */
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

	/**
	 * @description reset the specified field of all programs to the default value.
	 * @param fieldName : the program field name to reset.
	 */
	const resetField = ( fieldName : Type_DisplayProgramItemStringPropName ) : void => {
		const defaultValue = FIELD_DEFAULT_VALUES[ fieldName ];
		for ( const prog of programs ) {
			if ( prog[ fieldName ] !== defaultValue ) {
				prog[ fieldName ] = defaultValue;
			}
		}
		onProgramChange( programs );
	};

	/**
	 * @description Save the programs to the database.
	 */
	const saveProgs = async () : Promise<void> => {
		try {
			const newPrograms = await savePrograms( programs );
			onProgramChange( newPrograms );
			programsSaved();
		}
		catch( err ) {
			console.error( 'saveProgs: error: ', err );
			window.alert( 'Error saving programs: ' + ( err as Error ).message );
		}
	};

	/* eslint-disable @typescript-eslint/no-misused-promises */
	return (
		<>
			<input type="button" className="gip-action-button gip-action-button-reset-errors"    name="resetErrors"    value="Reset Errors"    onClick={ resetErrors }/>
			<input type="button" className="gip-action-button gip-action-button-clear-days"      name="clearDays"      value="Clear Days"      onClick={ () => { resetField( PROG_FIELD_DAY_OF_WEEK ); } }/>
			<input type="button" className="gip-action-button gip-action-button-select-ok"       name="selectOK"       value="Select OK"       onClick={ selectOK }/>
			<input type="button" className="gip-action-button gip-action-button-delete-selected" name="deleteSelected" value="Delete Selected" onClick={ deleteSelected }/>
			<input type="button" className="gip-action-button gip-action-button-save-progs"      name="saveProgs"      value="Save"            onClick={ async () => { await saveProgs(); } }/>
		</>
	);
	/* eslint-enable @typescript-eslint/no-misused-promises */
}

////////////////////////////////////////
// Exported definitions

/**
 * Action buttons for the program table.
 * Provides buttons to reset errors, clear days, select OK, delete selected programs, and save programs.
 * @param props - The properties for the ActionButtons component.
 * @returns The rendered ActionButtons component.
 */
export function GipActionButtons( props : Type_GipActionButtons_args ) : Type_GipActionButtons_ret {
	const labelText            = 'Actions';
	const fieldID              = 'action-buttons';
	const additionalClassNames = [ 'gip-col-buttons' ];
	return (
		<GipGridRow fieldID={ fieldID } labelText={ labelText } additionalClassNames={ additionalClassNames } gipComponent={ () => <ActionButtons { ...props }/> }/>
	);
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions

export const privateDefs = {};

if ( process.env.NODE_ENV === 'test-unit' ) {
	Object.assign( privateDefs, {
		ActionButtons,
	} );
}
