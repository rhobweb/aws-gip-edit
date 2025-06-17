import React, { ReactElement, forwardRef, ForwardedRef }  from 'react';
//import Image                    from 'next/image';
import { GipGridRow }           from './gip_grid_row';
import { GipProgramOptions }    from './gip_program_options';
import {
	PROG_FIELD_URI, PROG_FIELD_TITLE, PROG_FIELD_SYNOPSIS, PROG_FIELD_IMAGE_URI,
	TypeProgramEditInput, TypeProgramEditOptions, TypeEventChangeInput,
} from '../utils/gip_types';

const LABEL_PROGRAM_URL      = 'Program URL';
const LABEL_PROGRAM_TITLE    = 'Program Name';
const LABEL_PROGRAM_INFO     = 'Program Info';
const LABEL_PROGRAM_OPTIONS  = 'Options';

const DOM_CLASS_INPUT_TEXT           = 'gip-program-entry-text-input';
const DOM_CLASS_PROGRAM_INFO         = 'gip-program-entry-info'
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

type TypeRowProgramInputProps = {
	value:        string,
	paramName:    string,
	labelText:    string,
	//refCallback?: MutableRefObject<HTMLInputElement> | null,
	onChange:     ( { paramName, newValue } : { paramName: string, newValue: string } ) => void,
	onKeyDown:    TypeEventHandlerKeyboard,
};

const RowProgramInput = forwardRef( function RowProgramInput( props : TypeRowProgramInputProps, ref : ForwardedRef<HTMLInputElement> )
	{
		const { paramName, labelText, onKeyDown } = props;
	
		const onChange = ( event: TypeEventChangeInput ) => {
			const newValue = event.target.value as string;
			props.onChange( { paramName, newValue } );
		};
	
		const gipComponent = () => (
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

type TypeProgramSynopsisProps = {
	value:     string,
	onKeyDown: ( event: TypeEventKeyboardAny ) => void,
};

function ProgramSynopsis( props: TypeProgramSynopsisProps ) {
	const paramName = DOM_ID_PROGRAM_SYNOPSIS;
	const className = DOM_CLASS_PROGRAM_SYNOPSIS_DIV;
	return (
		<div className={ className }>
		<textarea disabled id={ paramName } className={ DOM_CLASS_SYNOPSIS }
			value={ props.value }
			onKeyDown={ event => props.onKeyDown( event ) }
		/>
		</div>
	);
}


type TypeProgramImageProps = {
	value:     string,
	onKeyDown: ( event: TypeEventKeyboardAny ) => void,
}

function ProgramImage( props: TypeProgramImageProps ) {
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
			onKeyDown={ event => props.onKeyDown( event ) }>
		</img>
		</div>
	);
}

type TypeRowProgramInfoProps = {
	synopsis:  string,
	image_uri: string,
	onKeyDown: ( event: TypeEventKeyboardAny ) => void,
};


function RowProgramInfo( props: TypeRowProgramInfoProps ) {
	const { synopsis, image_uri, onKeyDown } = props;
	const className = DOM_CLASS_PROGRAM_INFO;
	const labelText = LABEL_PROGRAM_INFO;
	const gipComponent = () => (
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

type TypeRowProgramOptionsProps = {
	onChange:     ( newOptions: TypeProgramEditOptions ) => void,
	onKeyDown:    ( event: TypeEventKeyboardAny ) => void,
	optionFields: TypeProgramEditOptions,
};

function RowProgramOptions( props: TypeRowProgramOptionsProps ) {
	return (
		<GipGridRow fieldID={ DOM_ID_PROGRAM_OPTIONS } labelText={ LABEL_PROGRAM_OPTIONS } gipComponent={ () => <GipProgramOptions { ...props }/> }/>
	);
}

type TypeGipProgramEntryProps = {
	programEditInput:   TypeProgramEditInput,
	programEditOptions: TypeProgramEditOptions,
	onInputChange:      ( { paramName, newValue } : { paramName: string, newValue: string } ) => void,
	onKeyDown:          ( event: TypeEventKeyboardAny ) => void,
	onOptionChange:     ( newOptions: TypeProgramEditOptions ) => void,
	ref:                TypeRefs,
};

export const GipProgramEntry = forwardRef( function GipProgramEntry( props : TypeGipProgramEntryProps, ref: ForwardedRef<HTMLInputElement> ) : ReactElement
	{
		//console.log( 'GipProgramEntry: ', props.programEditInput );
		const {
			[PROG_FIELD_URI]:   uriRef,
			[PROG_FIELD_TITLE]: titleRef,
		} = ref as TypeRefs;
	
		return (
			<>
			<RowProgramInput
				ref={ uriRef }
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