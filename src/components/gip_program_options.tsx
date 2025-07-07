/**
 * File:        components/gip_program_options.tsx
 * Description: This file defines the GipProgramOptions component, which is used to display the options for a program in the GIP program editor.
 */

////////////////////////////////////////////////////////////////////////////////
// Imports
import React from 'react';

import {
	FIELD_MAP_COLLECTION,
	FIELD_ORDER_COLLECTION,
} from '../utils/gip_prog_fields';

import {
	PROG_FIELD_DAY_OF_WEEK,
	PROG_FIELD_GENRE,
	PROG_FIELD_QUALITY,
} from '../utils/gip_types';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_EventHandlerKeyboard,
} from '../browser_event.ts';

//import type {
//	Type_FieldMap
//} from '../utils/gip_prog_fields';

import type {
	Type_EventChangeSelect,
	Type_ProgramEditOptions,
	Type_EventHandlerSelectKey,
} from '../utils/gip_types.ts';

////////////////////////////////////////
// Exported and local types

interface Type_ProgramOptionSelectProps {
	onChange:     ( newOptions : Type_ProgramEditOptions ) => void,
	onKeyDown:    Type_EventHandlerSelectKey,
	optionFields: Type_ProgramEditOptions,
	fieldName:    keyof Type_ProgramEditOptions,
}

interface Type_GipProgramOptionsProps {
	onChange:     ( newOptions: Type_ProgramEditOptions ) => void,
	onKeyDown:    Type_EventHandlerKeyboard,
	optionFields: Type_ProgramEditOptions,
}

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

/**
 * @param props - The properties for the component.
 * @param props.fieldName - The name of the field to display.
 * @returns React Element to display a program option select element.
 */
function ProgramOptionSelect( props : Type_ProgramOptionSelectProps ) : React.JSX.Element {
	const { fieldName } = props;
	const fieldMap      = FIELD_MAP_COLLECTION[ fieldName ]; // TODO: check if fieldName is in fieldMap
	const fieldValue    = ( props.optionFields[ fieldName ]   ?? 'UNK' ); // eslint-disable-line @typescript-eslint/no-unnecessary-condition
	const arrOption     = FIELD_ORDER_COLLECTION[ fieldName ] ?? [];
	const onChange  = ( event: Type_EventChangeSelect ) : void => {
		const newOptions = props.optionFields;
		props.optionFields[ fieldName ] = event.target.value;
		props.onChange( newOptions );
	};

	/* eslint-disable @typescript-eslint/restrict-template-expressions */
	return (
		<select
			className={ `gip-prog-option-field gip-prog-option-field-${fieldName}` }
			id={ `select-${fieldName}` }
			onChange={ onChange }
			onKeyDown={ props.onKeyDown }
			value={ fieldValue }
			key={ `gip-${fieldName}-option-select` }
		>
			{ arrOption.map( (optVal, key) => <option key={ `gip-${fieldName}-option-${key}` } value={ optVal }>{ fieldMap[optVal] }</option> ) };
		</select>
	);
	/* eslint-enable @typescript-eslint/restrict-template-expressions */
}

////////////////////////////////////////
// Exported definitions

/**
 * @param props - The properties for the component.
 * @returns React Element to display the program options select dropdowns, e.g., genre, day of week, quality.
 */
export function GipProgramOptions( props: Type_GipProgramOptionsProps ) : React.JSX.Element {
	const arrField = [ PROG_FIELD_GENRE, PROG_FIELD_DAY_OF_WEEK, PROG_FIELD_QUALITY ];

	function genProps ( fieldName: string ) : Type_ProgramOptionSelectProps {
		const cookedProps : Type_ProgramOptionSelectProps = {} as Type_ProgramOptionSelectProps;
		Object.assign( cookedProps, props, { fieldName } );
		return cookedProps;
	}

	return (
		<div className="gip-row-options">
			<div className="gip-col-options">
				{ arrField.map( fieldName => ProgramOptionSelect( genProps( fieldName ) ) ) }
			</div>
		</div>
	);
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions
