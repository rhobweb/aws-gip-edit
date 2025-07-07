/**
 * File:        components/gip_program_entry.tsx
 * Description: This file defines the GipProgramEntry component, which is used to display a single program entry in the GIP program editor.
 */

////////////////////////////////////////////////////////////////////////////////
// Imports
import React, { forwardRef, ForwardedRef } from 'react';

import { GipGridRow } from './gip_grid_row';

import { GipProgramOptions } from './gip_program_options';

import {
	PROG_FIELD_URI,
	PROG_FIELD_TITLE,
	PROG_FIELD_SYNOPSIS,
	PROG_FIELD_IMAGE_URI,
} from '../utils/gip_types';

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

interface Type_RowProgramInputProps {
	value:        string,
	paramName:    string,
	labelText:    string,
	//refCallback?: MutableRefObject<HTMLInputElement> | null,
	onChange:     ( { paramName, newValue } : { paramName: string, newValue: string } ) => void,
	onKeyDown:    Type_EventHandlerKeyboard,
}

interface Type_ProgramSynopsis_args {
	value:     string,
	onKeyDown: ( event: Type_EventKeyboardAny ) => void,
}

interface Type_ProgramImage_args {
	value:     string,
	onKeyDown: ( event: Type_EventKeyboardAny ) => void,
}

interface Type_RowProgramInfoProps {
	synopsis:  string,
	image_uri: string,
	onKeyDown: ( event: Type_EventKeyboardAny ) => void,
}

interface Type_RowProgramOptions_args {
	onChange:     ( newOptions: Type_ProgramEditOptions ) => void,
	onKeyDown:    ( event: Type_EventKeyboardAny ) => void,
	optionFields: Type_ProgramEditOptions,
}

interface Type_GipProgramEntryProps {
	programEditInput:   Type_ProgramEditInput,
	programEditOptions: Type_ProgramEditOptions,
	onInputChange:      ( { paramName, newValue } : { paramName: string, newValue: string } ) => void,
	onKeyDown:          ( event: Type_EventKeyboardAny ) => void,
	onOptionChange:     ( newOptions: Type_ProgramEditOptions ) => void,
	//ref:                Type_Refs,
}

interface Type_UriAndTitleRefs {
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
 * TODO: remove forwardRef https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop
 * @return React Element to display a program in the program table.
 */
const RowProgramInput = forwardRef( function RowProgramInput( props : Type_RowProgramInputProps, ref : ForwardedRef<HTMLInputElement> )
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
			ref={ ref }
		/>
	);

	return (
		<GipGridRow paramName={paramName} labelText={labelText} gipComponent={ gipComponent }/>
	);
});

/**
 * ProgramSynopsis component displays the synopsis of a program.
 * @param props - The properties for the component.
 * @returns React Element to display the program synopsis.
 */
function ProgramSynopsis( props: Type_ProgramSynopsis_args ) : React.JSX.Element {
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
 * ProgramImage component displays the image of a program.
 * @param props - The properties for the component.
 * @returns React Element to display the program image.
 */
function ProgramImage( props: Type_ProgramImage_args ) : React.JSX.Element {
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
function RowProgramInfo( props: Type_RowProgramInfoProps ) : React.JSX.Element {
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
 * RowProgramOptions component displays the options for a program, e.g., genre, quality, etc.
 * @param props - The properties for the component.
 * @returns React Element to display the program options.
 */
function RowProgramOptions( props: Type_RowProgramOptions_args ) : React.JSX.Element {
	return (
		<GipGridRow fieldID={ DOM_ID_PROGRAM_OPTIONS } labelText={ LABEL_PROGRAM_OPTIONS } gipComponent={ () => <GipProgramOptions { ...props }/> }/>
	);
}

////////////////////////////////////////
// Exported definitions

/**
 * Element to display the program input/editing fields.
 * It includes fields for the program URL, title, synopsis, image, and options.
 * @returns React Element to display the program input fields.
 * TODO: remove forwardRef https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop
 */
export const GipProgramEntry = forwardRef( function GipProgramEntry( props: Type_GipProgramEntryProps, ref: ForwardedRef<HTMLInputElement> ) : React.JSX.Element
{
	//console.log( 'GipProgramEntry: ', props.programEditInput );
	const {
		[PROG_FIELD_URI]:   uriRef,
		[PROG_FIELD_TITLE]: titleRef,
	} = ref as unknown as Type_UriAndTitleRefs;

	return (
		<>
			<RowProgramInput
				ref={ uriRef as React.RefObject<HTMLInputElement> }
				paramName={ PROG_FIELD_URI }
				value={ props.programEditInput[ PROG_FIELD_URI ] }
				onChange={ props.onInputChange }
				onKeyDown={ props.onKeyDown }
				//refCallback={ props.refCallback( PROG_FIELD_URI ) }
				labelText={ LABEL_PROGRAM_URL }
			/>
			<RowProgramInput
				ref={ titleRef }
				paramName={ PROG_FIELD_TITLE }
				value={ props.programEditInput[ PROG_FIELD_TITLE ] }
				onChange={ props.onInputChange }
				onKeyDown={ props.onKeyDown }
				//refCallback={ props.refCallback( PROG_FIELD_TITLE ) }
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
});

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions
