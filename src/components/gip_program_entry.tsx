/**
 * File:        components/gip_program_entry.tsx
 * Description: This file defines the GipProgramEntry component, which is used to display a single program entry in the GIP program editor.
 */

////////////////////////////////////////////////////////////////////////////////
// Imports
import React, { ForwardedRef } from 'react';

import { GipGridRow } from '#components/gip_grid_row';

import { GipProgramOptions } from '#components/gip_program_options';

import {
	PROG_FIELD_URI,
	PROG_FIELD_TITLE,
	PROG_FIELD_SYNOPSIS,
	PROG_FIELD_IMAGE_URI,
} from '#utils/gip_types';

import DEFAULT_PROGRAM_IMAGE_URI from '../../public/program_image_placeholder.png';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_Ref,
	//Type_Refs,
	Type_EventKeyboardAny,
	Type_EventHandlerKeyboard,
} from '../browser_event.ts';

import type {
	Type_ProgramEditInput,
	Type_ProgramEditOptions,
	Type_EventChangeInput,
} from '../utils/gip_types.ts';

////////////////////////////////////////
// Exported and local types

// All types are exported for use in unit tests

export interface Type_RowProgramInput_args {
	value:        string,
	paramName:    string,
	labelText:    string,
	//refCallback?: MutableRefObject<HTMLInputElement> | null,
	onChange:     ( { paramName, newValue } : { paramName: string, newValue: string } ) => void,
	onKeyDown:    Type_EventHandlerKeyboard,
	ref:          ForwardedRef<HTMLInputElement>,
}
export type Type_RowProgramInput_ret = React.JSX.Element;

export interface Type_ProgramSynopsis_args {
	value:     string,
	onKeyDown: ( event: Type_EventKeyboardAny ) => void,
}
export type Type_ProgramSynopsis_ret = React.JSX.Element;

export interface Type_ProgramImage_args {
	value?:    string,
	onKeyDown: ( event: Type_EventKeyboardAny ) => void,
}
export type Type_ProgramImage_ret = React.JSX.Element;

export interface Type_RowProgramInfo_args {
	synopsis:  string,
	image_uri: string,
	onKeyDown: ( event: Type_EventKeyboardAny ) => void,
}
export type Type_RowProgramInfo_ret = React.JSX.Element;

export interface Type_RowProgramOptions_args {
	onChange:     ( newOptions: Type_ProgramEditOptions ) => void,
	onKeyDown:    ( event: Type_EventKeyboardAny ) => void,
	optionFields: Type_ProgramEditOptions,
}
export type Type_RowProgramOptions_ret = React.JSX.Element;

export interface Type_GipProgramEntry_args {
	programEditInput:   Type_ProgramEditInput,
	programEditOptions: Type_ProgramEditOptions,
	onInputChange:      ( { paramName, newValue } : { paramName: string, newValue: string } ) => void,
	onKeyDown:          ( event: Type_EventKeyboardAny ) => void,
	onOptionChange:     ( newOptions: Type_ProgramEditOptions ) => void,
	refs:               Type_UriAndTitleRefs,
	//ref: ForwardedRef<HTMLInputElement>,
}
export type Type_GipProgramEntry_ret = React.JSX.Element;

export interface Type_UriAndTitleRefs {
	[PROG_FIELD_URI]:   Type_Ref,
	[PROG_FIELD_TITLE]: Type_Ref,
};

////////////////////////////////////////////////////////////////////////////////
// Constants

const LABEL_PROGRAM_URL      = 'Program URL';
const LABEL_PROGRAM_TITLE    = 'Program Name';
const LABEL_PROGRAM_INFO     = 'Program Info';
const LABEL_PROGRAM_OPTIONS  = 'Options';

const DOM_CLASS_INPUT_TEXT           = 'gip-program-entry-text-input';
const DOM_CLASS_PROGRAM_INFO         = 'gip-program-entry-info';
const DOM_CLASS_SYNOPSIS             = 'gip-program-entry-synopsis';
const DOM_CLASS_PROGRAM_IMAGE        = 'gip-program-entry-image';
const DOM_CLASS_PROGRAM_IMAGE_DIV    = 'gip-program-entry-image-div';
const DOM_CLASS_PROGRAM_SYNOPSIS_DIV = 'gip-program-entry-synopsis-div';
const DOM_ID_PROGRAM_OPTIONS         = 'progOptions';
const DOM_ID_PROGRAM_SYNOPSIS        = 'synopsis';
const DOM_ID_PROGRAM_IMAGE           = 'image';

const PROGRAM_IMAGE_WIDTH       = '160';
const PROGRAM_IMAGE_HEIGHT      = '160';

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

/**
 * @description element to enter the URI or PID of a program.
 * @param props - The properties for the component.
 * @param props.paramName: the ID for this program property;
 * @param props.labelText: the label text for this program property;
 * @param props.value:     the current element value;
 * @param props.ref:       reference to the title input element;
 * @param props.onKeyDown: key event handler for this program item;
 * @param props.onChange:  change event handler for this program item;
 * @return React Element to display a program in the program table.
 */
function RowProgramInput( props : Type_RowProgramInput_args ) : Type_RowProgramInput_ret
{
	const { paramName, labelText, onKeyDown } = props;

	const onChange = ( event: Type_EventChangeInput ) : void => {
		const newValue = event.target.value;
		props.onChange( { paramName, newValue } );
	};

	const gipComponent = () : React.JSX.Element => (
		<input type="text" id={paramName} className={ DOM_CLASS_INPUT_TEXT } spellCheck="false"
			value={ props.value }
			onKeyDown={ onKeyDown }
			onInput={ onChange }
			ref={ props.ref }
		/>
	);

	return (
		<GipGridRow paramName={paramName} labelText={labelText} gipComponent={ gipComponent }/>
	);
}

/**
 * @description ProgramSynopsis component displays the synopsis of a program.
 * @param props - The properties for the component.
 * @param props.value     - the synopsis text for this program.
 * @param props.onKeyDown - event handler for this element.
 * @returns React Element to display the program synopsis.
 */
function ProgramSynopsis( props: Type_ProgramSynopsis_args ) : Type_ProgramSynopsis_ret {
	const paramName = DOM_ID_PROGRAM_SYNOPSIS;
	const className = DOM_CLASS_PROGRAM_SYNOPSIS_DIV;
	return (
		<div className={ className }>
			<textarea disabled id={ paramName } className={ DOM_CLASS_SYNOPSIS }
				value={ props.value }
				onKeyDown={ event => { props.onKeyDown( event ); } }
			/>
		</div>
	);
}

/**
 * @description ProgramImage component displays the image of a program.
 * @param props - The properties for the component.
 * @param props.value - optional image URI.
 * @param props.onKeyDown: event handler for this program item;
 * @returns React Element to display the program image.
 */
function ProgramImage( props: Type_ProgramImage_args ) : Type_ProgramImage_ret {
	const paramName = DOM_ID_PROGRAM_IMAGE;
	const className = DOM_CLASS_PROGRAM_IMAGE_DIV;
	const imageSrc  = ( ( props.value && props.value.length > 0 ) ? props.value : DEFAULT_PROGRAM_IMAGE_URI );
	return (
		<div className={ className }>
			<img
				src={ imageSrc }
				alt="Program Image"
				className={ DOM_CLASS_PROGRAM_IMAGE }
				id={ paramName }
				width={ PROGRAM_IMAGE_WIDTH }
				height={ PROGRAM_IMAGE_HEIGHT }
				//priority={ true }
				onKeyDown={ event => { props.onKeyDown( event ); } }>
			</img>
		</div>
	);
}

/**
 * @param props - The properties for the component.
 * @param props.synopsis  - The synopsis of the program.
 * @param props.image_uri - The image URI of the program.
 * @param props.onKeyDown - The function to call on key down events.
 * @returns React Element to display the synopsis and image.
 */
function RowProgramInfo( props: Type_RowProgramInfo_args ) : Type_RowProgramInfo_ret {
	const { synopsis, image_uri, onKeyDown } = props;
	const className = DOM_CLASS_PROGRAM_INFO;
	const labelText = LABEL_PROGRAM_INFO;
	const gipComponent = () : React.JSX.Element => (
		<>
			<div className={ className }>
				<ProgramImage value={ image_uri }   onKeyDown={ onKeyDown }/>
				<ProgramSynopsis value={ synopsis } onKeyDown={ onKeyDown }/>
			</div>
		</>
	);

	return (
		<GipGridRow paramName={ 'synopsis' } labelText={ labelText } gipComponent={ gipComponent }/>
	);
}

/**
 * @description RowProgramOptions component displays the options for a program, e.g., genre, quality, day_of_week.
 * @param props - The properties for the component.
 * @param props.optionFields - object containing the values for all option fields, the properties being the field name.
 * @param props.onChange     - handler function for a change event. Takes props.optionFields as an argument.
 * @param props.onKeyDown    - handler function for a key down event.
 * @returns React Element to display the program options.
 */
function RowProgramOptions( props: Type_RowProgramOptions_args ) : Type_RowProgramOptions_ret {
	return (
		<GipGridRow fieldID={ DOM_ID_PROGRAM_OPTIONS } labelText={ LABEL_PROGRAM_OPTIONS } gipComponent={ () => <GipProgramOptions { ...props }/> }/>
	);
}

////////////////////////////////////////
// Exported definitions

/**
 * @description Element to display the program input/editing fields. It includes fields for the program URL, title, synopsis, image, and options.
 * @param props - The properties for the component.
 * @param props.programEditInput   - object containing the values for all input fields, the properties being the field name.
 * @param props.programEditOptions - object containing the values for all option fields, the properties being the field name.
 * @param props.onInputChange      - handler function for a change event for the input elements.
 * @param props.onOptionChange     - handler function for a change event for the option elements.
 * @param props.onKeyDown          - handler function for a key down event.
 * @returns React Element to display the program input fields.
 */
export function GipProgramEntry( props: Type_GipProgramEntry_args ) : Type_GipProgramEntry_ret {
	//console.log( 'GipProgramEntry: ', props.programEditInput );
	const {
		[PROG_FIELD_URI]:   uriRef,
		[PROG_FIELD_TITLE]: titleRef,
	} = props.refs;

	return (
		<>
			<RowProgramInput
				ref={ uriRef as React.RefObject<HTMLInputElement> } // Omit the null option from the ref object
				paramName={ PROG_FIELD_URI }
				value={ props.programEditInput[ PROG_FIELD_URI ] }
				onChange={ props.onInputChange }
				onKeyDown={ props.onKeyDown }
				labelText={ LABEL_PROGRAM_URL }
			/>
			<RowProgramInput
				ref={ titleRef }
				paramName={ PROG_FIELD_TITLE }
				value={ props.programEditInput[ PROG_FIELD_TITLE ] }
				onChange={ props.onInputChange }
				onKeyDown={ props.onKeyDown }
				labelText={ LABEL_PROGRAM_TITLE }
			/>
			<RowProgramInfo
				synopsis={ props.programEditInput[ PROG_FIELD_SYNOPSIS ] }
				image_uri={ props.programEditInput[ PROG_FIELD_IMAGE_URI ] }
				onKeyDown={ props.onKeyDown }
			/>
			<RowProgramOptions
				optionFields={ props.programEditOptions }
				onChange={ props.onOptionChange }
				onKeyDown={ props.onKeyDown }
			/>
		</>
	);
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions

const privateDefs = {};

if ( process.env.NODE_ENV === 'test-unit' ) {
	Object.assign( privateDefs, {
		RowProgramInput,
		ProgramSynopsis,
		ProgramImage,
		RowProgramInfo,
		RowProgramOptions,
	} );
}

export { privateDefs };
