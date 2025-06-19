import React, { forwardRef, ForwardedRef }  from 'react';
import type {
	Type_Ref,
	//Type_Refs,
	Type_EventKeyboardAny,
	Type_EventHandlerKeyboard,
} from '../browser_event.ts';
//import Image                    from 'next/image';
import { GipGridRow }           from './gip_grid_row.js';
import { GipProgramOptions }    from './gip_program_options.js';
import type {
	Type_ProgramEditInput,
	Type_ProgramEditOptions,
	Type_EventChangeInput,
} from '../utils/gip_types.ts';
import {
	PROG_FIELD_URI,
	PROG_FIELD_TITLE,
	PROG_FIELD_SYNOPSIS,
	PROG_FIELD_IMAGE_URI,
} from '../utils/gip_types.js';

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

import DEFAULT_PROGRAM_IMAGE_URI from '../../public/program_image_placeholder.png';

const PROGRAM_IMAGE_WIDTH       = '160';
const PROGRAM_IMAGE_HEIGHT      = '160';

interface TypeRowProgramInputProps {
	value:        string,
	paramName:    string,
	labelText:    string,
	//refCallback?: MutableRefObject<HTMLInputElement> | null,
	onChange:     ( { paramName, newValue } : { paramName: string, newValue: string } ) => void,
	onKeyDown:    Type_EventHandlerKeyboard,
}

const RowProgramInput = forwardRef( function RowProgramInput( props : TypeRowProgramInputProps, ref : ForwardedRef<HTMLInputElement> )
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
}
);

interface TypeProgramSynopsisProps {
	value:     string,
	onKeyDown: ( event: Type_EventKeyboardAny ) => void,
}

function ProgramSynopsis( props: TypeProgramSynopsisProps ) : React.JSX.Element {
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


interface TypeProgramImageProps {
	value:     string,
	onKeyDown: ( event: Type_EventKeyboardAny ) => void,
}

function ProgramImage( props: TypeProgramImageProps ) : React.JSX.Element {
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

interface TypeRowProgramInfoProps {
	synopsis:  string,
	image_uri: string,
	onKeyDown: ( event: Type_EventKeyboardAny ) => void,
}


function RowProgramInfo( props: TypeRowProgramInfoProps ) : React.JSX.Element {
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

interface TypeRowProgramOptionsProps {
	onChange:     ( newOptions: Type_ProgramEditOptions ) => void,
	onKeyDown:    ( event: Type_EventKeyboardAny ) => void,
	optionFields: Type_ProgramEditOptions,
}

function RowProgramOptions( props: TypeRowProgramOptionsProps ) : React.JSX.Element {
	return (
		<GipGridRow fieldID={ DOM_ID_PROGRAM_OPTIONS } labelText={ LABEL_PROGRAM_OPTIONS } gipComponent={ () => <GipProgramOptions { ...props }/> }/>
	);
}

interface TypeGipProgramEntryProps {
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

export const GipProgramEntry = forwardRef( function GipProgramEntry( props: TypeGipProgramEntryProps, ref: ForwardedRef<HTMLInputElement> ) : React.JSX.Element
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
}
);