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

import assert  from 'node:assert';

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

export interface Type_ProgramOptionsSelect_args {
	onChange:     ( newOptions : Type_ProgramEditOptions ) => void,
	onKeyDown:    Type_EventHandlerSelectKey,
	optionFields: Type_ProgramEditOptions,
	fieldName:    keyof Type_ProgramEditOptions,
}

export type Type_ProgramOptionsSelect_ret = React.JSX.Element;

export interface Type_GipProgramOptions_args {
	onChange:     ( newOptions: Type_ProgramEditOptions ) => void,
	onKeyDown:    Type_EventHandlerKeyboard,
	optionFields: Type_ProgramEditOptions,
}

export type Type_GipProgramOptions_ret = React.JSX.Element;

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

/**
 * @param props - The properties for the component.
 * @param props.fieldName    - the name of the field to display.
 * @param props.optionFields - object containing the values for all option fields, the properties being the field name.
 * @param props.onChange     - handler function for a change event. Takes props.optionFields as an argument.
 * @param props.onKeyDown    - handler function for a key down event.
 * @returns React Element to display a program option select element.
 * @global FIELD_MAP_COLLECTION - a collection of field maps indexed by field name, where each field map is an object that maps field values to their display names.
 * @global FIELD_ORDER_COLLECTION - a collection of arrays indexed by field name, where each array contains a list of names in order.
 */
function ProgramOptionSelect( props : Type_ProgramOptionsSelect_args ) : Type_ProgramOptionsSelect_ret {
	const { fieldName } = props;

	assert( fieldName in props.optionFields );
	assert( fieldName in FIELD_MAP_COLLECTION );
	assert( fieldName in FIELD_ORDER_COLLECTION );

	const fieldValue = props.optionFields[ fieldName ];
	const fieldMap   = FIELD_MAP_COLLECTION[ fieldName ];
	const arrOption  = FIELD_ORDER_COLLECTION[ fieldName ];

	const onChange = ( event: Type_EventChangeSelect ) : void => {
		props.optionFields[ fieldName ] = event.target.value;
		props.onChange( props.optionFields );
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
			{ arrOption.map( (optVal, key) => <option key={ `gip-${fieldName}-option-${key}` } value={ optVal }>{ fieldMap[optVal] }</option> ) }
		</select>
	);
	/* eslint-enable @typescript-eslint/restrict-template-expressions */
}

//function TestItem() : React.JSX.Element {
//
//	const onKeyDown = ( event: React.KeyboardEvent<HTMLElement> ) : void => {
//		if ( event.key === 'Enter' ) {
//			const arrElement = document.getElementsByClassName( 'gip-prog-option-field-genre' );
//			const element = arrElement[0] as HTMLSelectElement;
//			element.focus();
//			element.dispatchEvent( new KeyboardEvent('keydown', { 'key': '[ArrowUp]', bubbles: true, cancelable: false }));
//			element.dispatchEvent( new KeyboardEvent('keyup', { 'key': '[ArrowUp]', bubbles: true, cancelable: false }));
//		}
//	};
//
//	return (
//		<button
//			className={ `gip-test-button` }
//			id={ `button-test` }
//			onKeyDown={ onKeyDown }
//			type='button'
//		>Test Button
//		</button>
//	);
//}

////////////////////////////////////////
// Exported definitions

/**
 * @param props - The properties for the component.
 * @param props.optionFields - object containing the values for all option fields, the properties being the field name.
 * @param props.onChange     - handler function for a change event. Takes props.optionFields as an argument.
 * @param props.onKeyDown    - handler function for a key down event.
 * @returns React Element to display the program options select dropdowns, e.g., genre, day of week, quality.
 */
export function GipProgramOptions( props: Type_GipProgramOptions_args ) : Type_GipProgramOptions_ret {
	const arrField = [ PROG_FIELD_GENRE, PROG_FIELD_DAY_OF_WEEK, PROG_FIELD_QUALITY ];

	function genProps ( fieldName: string ) : Type_ProgramOptionsSelect_args {
		const cookedProps : Type_ProgramOptionsSelect_args = {} as Type_ProgramOptionsSelect_args;
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

const privateDefs = {};

if ( process.env.NODE_ENV === 'test-unit' ) {
	Object.assign( privateDefs, {
		ProgramOptionSelect,
	} );
}

export { privateDefs };
