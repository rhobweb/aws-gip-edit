import React     from 'react';
import { FIELD_MAP_COLLECTION, FIELD_ORDER_COLLECTION, DUMMY_HEADER_FIELD, TypeFieldOrder, TypeFieldMap } from '../utils/gip_prog_fields';
import { GipGridRow } from './gip_grid_row';
import {
  PROG_FIELD_SELECTED,
  TypeProgramItem,
  TypeEventHandlerMouse,
  TypeHandlerProgramChange,
  TypeEventMouse,
} from '../utils/gip_types';

const LABEL_PROGRAM_TABLE     = 'Programs';
const SELECTED_PROGRAM_COLOUR = 'rgb(100, 210, 255)';

// Can inlcude this as a style property
//style={ genWidthStyle( { minWidths, fieldName } ) }
//
//const genWidthStyle = ( { minWidths, fieldName } ) => {
//  return ( minWidths[fieldName] ? { width: `${minWidths[fieldName]}em` } : {} );
//};

const genSelectedStyle = ( isSelected: boolean ) => {
  return ( isSelected ? { background: SELECTED_PROGRAM_COLOUR } : {} );
};

type TypeProgHeadersProps = {
  arrFieldOrder:    TypeFieldOrder,
  headerDisplayMap: TypeFieldMap,
};

function ProgHeaders( props: TypeProgHeadersProps ) {
  const { arrFieldOrder, headerDisplayMap } = props;

  return (
    <div className="gip-prog-item-row gip-prog-item-header-row" id="program-header">
    {
      arrFieldOrder.map( ( fieldName, columnIndex ) => (
        <div key={ `head-${columnIndex}` } className={ `gip-prog-item-col gip-prog-item-header-col gip-prog-item-col-${fieldName}` }>{ headerDisplayMap[fieldName] }</div>
      ) )
    }
    </div>
  );
}

type TypeProgInputFieldProps = {
  fieldName:  string,
  fieldValue: string,
  onClick:    TypeEventHandlerMouse,
  onKeyDown:  TypeEventHandlerKeyboard,
  selected:   boolean,
};

function ProgInputField( props: TypeProgInputFieldProps ) {
  const { fieldName, fieldValue, selected, onClick, onKeyDown } = props;

  //const inputFieldProps           = { fieldName, selected, onClick, fieldValue: null };
  //console.log( 'ProgInputField: ', { fieldName, fieldValue, FIELD_MAP_COLLECTION } );
  //const fieldMap = FIELD_MAP_COLLECTION[ fieldName ] || null;
  //if ( fieldMap ) {
  //  inputFieldProps.fieldValue = fieldMap[ fieldValue ];
  //} else {
  //  inputFieldProps.fieldValue = fieldValue;
  //}

  return (
    <input type="text"
      className={ `gip-prog-item-field gip-prog-item-field-${fieldName}` }
      value={ fieldValue }
      onClick={ onClick }
      onKeyDown={ onKeyDown }
      readOnly
      style={ genSelectedStyle( selected ) }
    />
  );
}

type TypeProgInputFieldsProps = {
  programs:        TypeProgramItem[],
  arrFieldOrder:   TypeFieldOrder,
  onKeyDown:       TypeEventHandlerKeyboard,
  onProgramChange: TypeHandlerProgramChange,
};

function ProgInputFields( props: TypeProgInputFieldsProps ) {
  const { programs, arrFieldOrder, onKeyDown } = props;

  const arrCookedFieldOrder = [ ...arrFieldOrder ];
  const counterFieldName = arrCookedFieldOrder.shift();

  const onClick = ( event: TypeEventMouse, program: TypeProgramItem ) => {
    if ( ! event.ctrlKey ) {
      programs.forEach( prog => prog[ PROG_FIELD_SELECTED ] = false );
      program[ PROG_FIELD_SELECTED ] = true;
    } else {
      program[ PROG_FIELD_SELECTED ] = ( program[ PROG_FIELD_SELECTED ] ? false : true );
    }
    //programs[ programIndex ][ fieldName ] = event.target.value;
    props.onProgramChange( programs );
  };

  //console.log( "ProgInputFields: ", { programs, arrCookedFieldOrder } ); // TODO: Remove

  return (
    <>
    { programs.map( ( thisProgram, programIndex ) => (
      <div className="gip-prog-item-row gip-prog-item-data-row" id={ `prog-item-row-${programIndex + 1}` } key={ `prog-item-row-${programIndex + 1}` }>
      <div className={ ` gip-prog-item-col gip-prog-item-data-col gip-prog-item-col-${counterFieldName}` } id={ `prog-item-count-${programIndex + 1}` } style={ genSelectedStyle( thisProgram[ PROG_FIELD_SELECTED ] ) }>{ programIndex + 1 }</div>
      { arrCookedFieldOrder.map( ( fieldName, fieldIndex ) => (
        <div className={ `gip-prog-item-col gip-prog-item-data-col gip-prog-item-col-${fieldName}` } key={ `prog-item-field-${ programIndex + 1 }-${ fieldIndex + 1 }` }>
          <ProgInputField key={ `prog-field-${programIndex + 1}-${fieldIndex + 1}` }
            fieldName={ fieldName }
            fieldValue={ thisProgram[ fieldName ] }
            selected={ thisProgram[ PROG_FIELD_SELECTED ] }
            onClick={ event => onClick( event, thisProgram ) }
            onKeyDown={ onKeyDown }
          />
        </div>
      ) ) }
      </div>
    ) ) }
    </>
  );
}

type TypeProgramTableProps = {
  programs:         TypeProgramItem[],
  onProgramChange:  TypeHandlerProgramChange,
  onKeyDown:        TypeEventHandlerKeyboard,
  arrFieldOrder:    TypeFieldOrder,
  headerDisplayMap: TypeFieldMap,
};

function ProgramTable( props: TypeProgramTableProps ) {
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
        onProgramChange={ newPrograms => onProgramChange( newPrograms ) }
        onKeyDown={ onKeyDown }
      />
    </div>
  );
}

type TypeGipProgramTableProps = {
  programs:        TypeProgramItem[],
  onProgramChange: TypeHandlerProgramChange,
  onKeyDown:       TypeEventHandlerKeyboard,
};

export function GipProgramTable( props: TypeGipProgramTableProps ) {
  const { onProgramChange, onKeyDown, programs = [] } = props;
  //console.log( 'Programs: ', programs );
  const headerDisplayMap = FIELD_MAP_COLLECTION[ DUMMY_HEADER_FIELD ] || null;
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
