import React from 'react';
import { FIELD_MAP_COLLECTION, FIELD_ORDER_COLLECTION } from '../utils/gip_prog_fields';
import {
  PROG_FIELD_DAY_OF_WEEK, PROG_FIELD_GENRE, PROG_FIELD_QUALITY,
  TypeEventChangeSelect, TypeProgramEditOptions, TypeEventHandlerSelectKey,
} from '../utils/gip_types';

type TypeProgramOptionSelectProps = {
  onChange:     ( newOptions : TypeProgramEditOptions ) => void,
  onKeyDown:    TypeEventHandlerSelectKey,
  optionFields: TypeProgramEditOptions,
  fieldName:    string,
};

function ProgramOptionSelect( props : TypeProgramOptionSelectProps ) {
  const { fieldName } = props;
  const fieldMap      = FIELD_MAP_COLLECTION[ fieldName ] || null;
  const fieldValue    = props.optionFields[ fieldName ] || 'UNK';
  const arrOption     = FIELD_ORDER_COLLECTION[ fieldName ] || [];
  const onChange  = ( event: TypeEventChangeSelect ) => {
    const newOptions = props.optionFields;
    props.optionFields[ fieldName ] = event.target.value;
    props.onChange( newOptions );
  };
  //console.log( 'ProgramOptionSelect: ', { fieldName, minLength } );

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
}

type TypeGipProgramOptionsProps = {
  onChange:     ( newOptions: TypeProgramEditOptions ) => void,
  onKeyDown:    TypeEventHandlerKeyboard,
  optionFields: TypeProgramEditOptions,
};

export function GipProgramOptions( props: TypeGipProgramOptionsProps ) {
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
