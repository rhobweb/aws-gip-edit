/**
 * File:        components/gip_program_table.tsx
 * Description: React element to display a table of GIP programs.
 */

////////////////////////////////////////////////////////////////////////////////
// Imports

import React, { ReactNode } from 'react';

import {
	FIELD_MAP_COLLECTION,
	FIELD_ORDER_COLLECTION,
	DUMMY_HEADER_FIELD,
} from '#utils/gip_prog_fields';

import { GipGridRow } from '#components/gip_grid_row';

import {
	PROG_FIELD_SELECTED,
	Type_DisplayProgramItem,
	Type_DisplayProgramItemPropName,
	Type_EventHandlerMouse,
	Type_HandlerProgramChange,
	Type_EventMouse,
} from '#utils/gip_types';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_EventHandlerKeyboard,
} from '../browser_event.ts';

import type {
	Type_FieldOrder,
	Type_FieldMap,
} from '../utils/gip_prog_fields.ts';

////////////////////////////////////////
// Exported and local types

export type Type_genSelectedStyle_args = boolean;
export interface Type_genSelectedStyle_ret {
	background?: string,
};

export interface Type_ProgHeaders_args {
	arrFieldOrder:    Type_FieldOrder,
	headerDisplayMap: Type_FieldMap,
}
export type Type_ProgHeaders_ret = React.JSX.Element;

export interface Type_progToDisplayValue_args {
	fieldName:  string,
	fieldValue: string | number | null,
};
export type Type_progToDisplayValue_ret = string;

export interface Type_ProgInputField_args {
	id:         string,
	fieldName:  string,
	fieldValue: string,
	onClick:    Type_EventHandlerMouse,
	onKeyDown:  Type_EventHandlerKeyboard,
	selected:   boolean,
}
export type Type_ProgInputField_ret = React.JSX.Element;

export interface Type_ProgInputFields_args {
	programs:        Type_DisplayProgramItem[],
	arrFieldOrder:   Type_FieldOrder,
	onKeyDown:       Type_EventHandlerKeyboard,
	onProgramChange: Type_HandlerProgramChange,
}
export type Type_ProgInputFields_ret = React.JSX.Element;

export interface Type_ProgramTable_args {
	programs:         Type_DisplayProgramItem[],
	onProgramChange:  Type_HandlerProgramChange,
	onKeyDown:        Type_EventHandlerKeyboard,
	arrFieldOrder:    Type_FieldOrder,
	headerDisplayMap: Type_FieldMap,
}
export type Type_ProgramTable_ret = React.JSX.Element;

export interface Type_GipProgramTable_args {
	programs:        Type_DisplayProgramItem[],
	onProgramChange: Type_HandlerProgramChange,
	onKeyDown:       Type_EventHandlerKeyboard,
}
export type Type_GipProgramTable_ret = React.JSX.Element;

////////////////////////////////////////////////////////////////////////////////
// Constants

const LABEL_PROGRAM_TABLE     = 'Programs';
const SELECTED_PROGRAM_COLOUR = 'rgb(100, 210, 255)';

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

// Can include this as a style property
//style={ genWidthStyle( { minWidths, fieldName } ) }
//
//const genWidthStyle = ( { minWidths, fieldName } ) => {
//  return ( minWidths[fieldName] ? { width: `${minWidths[fieldName]}em` } : {} );
//};

/**
 * @description Generate the style for a selected program row.
 * @param isSelected - Whether the program is selected.
 * @returns The style object for the selected program row.
 */
const genSelectedStyle = ( isSelected: Type_genSelectedStyle_args ) : Type_genSelectedStyle_ret => {
	return ( isSelected ? { background: SELECTED_PROGRAM_COLOUR } : {} );
};

/**
 * @param props                  - The properties for the ProgHeaders component.
 * @param props.arrFieldOrder    - The order of fields to display in the header.
 * @param props.headerDisplayMap - The mapping of field names to their display values.
 * @returns The rendered program headers element.
 */
function ProgHeaders( props: Type_ProgHeaders_args ) : Type_ProgHeaders_ret {
	const { arrFieldOrder, headerDisplayMap } = props;

	return (
		<div className="gip-prog-item-row gip-prog-item-header-row" id="program-header">
			{
				arrFieldOrder.map( ( fieldName: string, columnIndex: number ) => (
					// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
					<div key={ `head-${columnIndex}` } className={ `gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-${fieldName}` }>{ headerDisplayMap[fieldName] }</div>
				) )
			}
		</div>
	);
}

/**
 * @param param0 - An object containing the field name and value.
 * @param param0.fieldName  - The name of the field to display.
 * @param param0.fieldValue - The raw value of the field.
 * @returns The display value for the program field.
 */
function progToDisplayValue( { fieldName, fieldValue } : Type_progToDisplayValue_args ) : Type_progToDisplayValue_ret {
	const valueMap = FIELD_MAP_COLLECTION[ fieldName ] ?? null;
	let   retValue = '';

	if ( valueMap && fieldValue ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		retValue = valueMap[ fieldValue ] ?? ( fieldValue as string );
	} else {
		retValue = ( fieldValue ?? '' ) as string;
	}

	return retValue;
}

/**
 * @param props - The properties for the ProgInputField component.
 * @param props.id         - the ID for the element;
 * @param props.fieldName  - the name of the field to display;
 * @param props.fieldValue - the raw value of the field;
 * @param props.selected   - boolean indicating whether the field is selected;
 * @param props.onClick    - event handler for a left mouse click;
 * @param props.onKeyDown  - event handler for a key down event;
 * @returns The rendered ProgInputField component.
 */
function ProgInputField( props: Type_ProgInputField_args ) : Type_ProgInputField_ret {
	const { id, fieldName, fieldValue, selected, onClick, onKeyDown } = props;

	return (
		<input type="text"
			id={ id }
			className={ `gip-prog-item-field gip-prog-item-field-${fieldName}` }
			value={ progToDisplayValue( { fieldName, fieldValue } ) }
			onClick={ onClick }
			onKeyDown={ onKeyDown }
			readOnly
			style={ genSelectedStyle( selected ) }
		/>
	);
}

/**
 * @description Render the input fields for each program.
 * @param props                 - The properties for the ProgInputFields component.
 * @param props.programs        - The list of programs to display.
 * @param props.arrFieldOrder   - The order of fields to display.
 * @param props.onKeyDown       - The keydown event handler.
 * @param props.onProgramChange - event handler to be called if a program selection changes.
 * @returns The rendered ProgInputFields component.
 */
function ProgInputFields( props: Type_ProgInputFields_args ) : Type_ProgInputFields_ret {
	const {
		programs,
		arrFieldOrder,
		onKeyDown,
		onProgramChange,
	} = props;

	// Strip off the 'pos' field as this shall be generated from the order of the programs
	const arrCookedFieldOrder = [ ...arrFieldOrder ];
	const counterFieldName    = arrCookedFieldOrder.shift();

	const onClick = ( event: Type_EventMouse, program: Type_DisplayProgramItem ) : void => {
		if ( ! event.ctrlKey ) {
			programs.forEach( prog => prog[ PROG_FIELD_SELECTED ] = false );
			program[ PROG_FIELD_SELECTED ] = true;
		} else {
			program[ PROG_FIELD_SELECTED ] = ( program[ PROG_FIELD_SELECTED ] ? false : true );
		}
		onProgramChange( programs );
	};

	// Note: the key property is just for use by React; it does not get generated into HTML, see https://react.dev/learn/rendering-lists
	/* eslint-disable @typescript-eslint/restrict-template-expressions */
	return (
		<>
			{ programs.map( ( thisProgram, programIndex ) => (
				<div className="gip-prog-item-row gip-prog-item-data-row" id={ `prog-item-row-${programIndex + 1}` } key={ `prog-item-row-${programIndex + 1}` }>
					<div className={ ` gip-prog-item-col gip-prog-item-data-col gip-prog-item-col-${counterFieldName}` } id={ `prog-item-count-${programIndex + 1}` } style={ genSelectedStyle( thisProgram[ PROG_FIELD_SELECTED ] ) }>{ programIndex + 1 }</div>
					{ arrCookedFieldOrder.map( ( fieldName : Type_DisplayProgramItemPropName, fieldIndex : number ) : ReactNode => (
						<div className={ `gip-prog-item-col gip-prog-item-data-col gip-prog-item-col-${fieldName}` } key={ `prog-item-field-${ programIndex + 1 }-${ fieldIndex + 1 }` }>
							<ProgInputField
								key={ `prog-field-${programIndex + 1}-${fieldIndex + 1}` }
								id={ `prog-field-${programIndex + 1}-${fieldIndex + 1}` }
								fieldName={ fieldName as string }
								fieldValue={ thisProgram[ fieldName ] as string}
								selected={ thisProgram[ PROG_FIELD_SELECTED ] }
								onClick={ ( event : Type_EventMouse ) => { onClick( event, thisProgram ); } }
								onKeyDown={ onKeyDown }
							/>
						</div>
					) ) }
				</div>
			) ) }
		</>
	);
	/* eslint-enable @typescript-eslint/restrict-template-expressions */
}

/**
 * Render the program table.
 * @param props                  - The properties for the ProgramTable element.
 * @param props.arrFieldOrder    - The order of fields to display.
 * @param props.headerDisplayMap - The mapping of field names to their display values.
 * @param props.programs         - The list of programs to display.
 * @param props.onProgramChange  - The handler for program changes.
 * @param props.onKeyDown        - The keydown event handler.
 * @returns The rendered ProgramTable element.
 */
function ProgramTable( props: Type_ProgramTable_args ) : Type_ProgramTable_ret {
	const { arrFieldOrder, headerDisplayMap, programs, onProgramChange, onKeyDown } = props;
	return (
		<div className="gip-table-wrapper">
			<ProgHeaders key="progHeaders"
				arrFieldOrder={ arrFieldOrder }
				headerDisplayMap={ headerDisplayMap }
			/>
			<ProgInputFields key="progInputFields"
				arrFieldOrder={ arrFieldOrder }
				programs={ programs }
				onProgramChange={ onProgramChange }
				onKeyDown={ onKeyDown }
			/>
		</div>
	);
}

////////////////////////////////////////
// Exported definitions

/**
 * Render the GIP program table.
 * @param props - The properties for the GipProgramTable element.
 * @param props.onProgramChange - The handler for program changes.
 * @param props.onKeyDown       - The keydown event handler.
 * @param props.programs        - The list of programs to display.
 * @returns The rendered GipProgramTable element.
 */
export function GipProgramTable( props: Type_GipProgramTable_args ) : Type_GipProgramTable_ret {
	const { onProgramChange, onKeyDown, programs = [] } = props;
	console.assert( DUMMY_HEADER_FIELD in FIELD_MAP_COLLECTION );
	console.assert( DUMMY_HEADER_FIELD in FIELD_ORDER_COLLECTION );
	const headerDisplayMap = FIELD_MAP_COLLECTION[ DUMMY_HEADER_FIELD ];
	const arrFieldOrder    = FIELD_ORDER_COLLECTION[ DUMMY_HEADER_FIELD ];
	const tableProps       = {
		arrFieldOrder,
		headerDisplayMap,
		programs,
		onProgramChange,
		onKeyDown,
	};

	//console.log( 'GipProgramTable: ', { headerDisplayMap } );

	const additionalClassNames : string[] = [];

	return (
		<GipGridRow fieldID="program-label" labelText={ LABEL_PROGRAM_TABLE } additionalClassNames={ additionalClassNames } gipComponent={ () => <ProgramTable { ...tableProps }/> }/>
	);
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions

export const privateDefs = {};

if ( process.env.NODE_ENV === 'test-unit' ) {
	Object.assign( privateDefs, {
		genSelectedStyle,
		ProgHeaders,
		progToDisplayValue,
		ProgInputField,
		ProgInputFields,
		ProgramTable,
	} );
}
