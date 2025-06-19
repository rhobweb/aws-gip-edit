import React from 'react';
import type {
	Type_EventHandlerKeyboard,
} from '../browser_event.ts';
import {
	FIELD_MAP_COLLECTION,
	FIELD_ORDER_COLLECTION,
} from '../utils/gip_prog_fields.js';
//import type {
//	Type_FieldMap
//} from '../utils/gip_prog_fields';
import type {
	Type_EventChangeSelect,
	Type_ProgramEditOptions,
	Type_EventHandlerSelectKey,
} from '../utils/gip_types.ts';
import {
	PROG_FIELD_DAY_OF_WEEK,
	PROG_FIELD_GENRE,
	PROG_FIELD_QUALITY,
} from '../utils/gip_types.js';

interface TypeProgramOptionSelectProps {
	onChange:     ( newOptions : Type_ProgramEditOptions ) => void,
	onKeyDown:    Type_EventHandlerSelectKey,
	optionFields: Type_ProgramEditOptions,
	fieldName:    string,
}

function ProgramOptionSelect( props : TypeProgramOptionSelectProps ) : React.JSX.Element {
	const { fieldName } = props;
	const fieldMap      = FIELD_MAP_COLLECTION[ fieldName ]; // TODO: check if fieldName is in fieldMap
	const fieldValue    = ( props.optionFields[ fieldName ]   ?? 'UNK' ) as string;
	const arrOption     = FIELD_ORDER_COLLECTION[ fieldName ] ?? [];
	const onChange  = ( event: Type_EventChangeSelect ) : void => {
		const newOptions = props.optionFields;
		props.optionFields[ fieldName ] = event.target.value;
		props.onChange( newOptions );
	};

	// TODO ${key} may be a number and is regarded as unsafe
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

interface TypeGipProgramOptionsProps {
	onChange:     ( newOptions: Type_ProgramEditOptions ) => void,
	onKeyDown:    Type_EventHandlerKeyboard,
	optionFields: Type_ProgramEditOptions,
}

export function GipProgramOptions( props: TypeGipProgramOptionsProps ) : React.JSX.Element {
	const arrField = [ PROG_FIELD_GENRE, PROG_FIELD_DAY_OF_WEEK, PROG_FIELD_QUALITY ];

	function genProps ( fieldName: string ) : TypeProgramOptionSelectProps {
		const cookedProps : TypeProgramOptionSelectProps = {} as TypeProgramOptionSelectProps;
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
