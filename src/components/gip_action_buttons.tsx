import React, { ReactElement } from 'react';
import { FIELD_DEFAULT_VALUES, VALUE_STATUS_PENDING, VALUE_STATUS_ERROR, VALUE_STATUS_SUCCESS } from '../utils/gip_prog_fields';
import { GipGridRow }          from './gip_grid_row';
import {
  PROG_FIELD_STATUS, PROG_FIELD_SELECTED, PROG_FIELD_DAY_OF_WEEK,
  TypeProgramItem, TypeHandlerProgramChange,
} from '../utils/gip_types';

type TypeProgramList = TypeProgramItem[];

type TypeActionButtonsProps = {
  programs:        TypeProgramList,
  onProgramChange: TypeHandlerProgramChange,
  programsSaved:   () => void,
  savePrograms:    ( params: TypeProgramList ) => Promise<TypeProgramList>,
};

function ActionButtons( props : TypeActionButtonsProps ) : ReactElement {
  const { programs, onProgramChange, programsSaved, savePrograms } = props;

  const resetErrors = () => {
    //console.log( "resetErrors: ", programs );
    programs.forEach( prog => {
      if ( prog[PROG_FIELD_STATUS] === VALUE_STATUS_ERROR ) {
        prog[PROG_FIELD_STATUS] = VALUE_STATUS_PENDING;
      }
    } );
    onProgramChange( programs );
  };

  const selectOK = () => {
    if ( programs.length > 0 ) {
      const newPrograms = programs.map( prog => {
        const program = JSON.parse( JSON.stringify( prog ) );
        if ( program[PROG_FIELD_STATUS] === VALUE_STATUS_SUCCESS ) {
          program[PROG_FIELD_SELECTED] = true;
        } else {
          program[PROG_FIELD_SELECTED] = false;
        }
        return program;
      } );
      onProgramChange( newPrograms );
    } else {
      window.alert( 'No programs selected' );
    }
  };

  const deleteSelected = () => {
    const selectedPrograms = programs.filter( prog => prog[PROG_FIELD_SELECTED] );
    if ( selectedPrograms.length > 0 ) {
      if ( window.confirm( 'Delete selected programs?' ) ) {
        const newPrograms = programs.filter( prog => ! prog[PROG_FIELD_SELECTED] );
        onProgramChange( newPrograms );
      }
    } else {
      window.alert( 'No programs selected' );
    }
  };

  const resetField = ( fieldName : string ) => {
    const defaultValue = FIELD_DEFAULT_VALUES[ fieldName ];
    programs.forEach( prog => {
      if ( prog[ fieldName ] !== defaultValue ) {
        prog[ fieldName ] = defaultValue;
      }
    } );
    onProgramChange( programs );
  };

  const saveProgs = async () => {
    const newPrograms = await savePrograms( programs );
    onProgramChange( newPrograms );
    programsSaved();
  };

  return (
    <>
    <input type="button" className="gip-action-button" name="resetErrors"    value="Reset Errors"    onClick={ () => resetErrors() }/>
    <input type="button" className="gip-action-button" name="clearDays"      value="Clear Days"      onClick={ () => resetField( PROG_FIELD_DAY_OF_WEEK ) }/>
    <input type="button" className="gip-action-button" name="selectOK"       value="Select OK"       onClick={ () => selectOK() }/>
    <input type="button" className="gip-action-button" name="deleteSelected" value="Delete Selected" onClick={ () => deleteSelected() }/>
    <input type="button" className="gip-action-button" name="saveProgs"      value="Save"            onClick={ saveProgs }/>
    </>
  ); 
}

type TypeGipActionButtonsProps = {
  programs:        TypeProgramList,
  onProgramChange: TypeHandlerProgramChange,
  savePrograms:    ( programs : TypeProgramList ) => Promise<TypeProgramList>,
  programsSaved:   () => void,
};

export function GipActionButtons( props : TypeGipActionButtonsProps ) {
  const labelText            = 'Actions';
  const fieldID              = 'action-buttons';
  const additionalClassNames = [ 'gip-col-buttons' ];
  return (
    <GipGridRow fieldID={ fieldID } labelText={ labelText } additionalClassNames={ additionalClassNames } gipComponent={ () => <ActionButtons { ...props }/> }/>
  );
}
