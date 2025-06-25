import type {
	//Type_Ref,
	//Type_Refs,
	//Type_EventKeyboardAny,
	Type_EventHandlerKeyboard,
} from '../browser_event.ts';
import React, { ReactNode } from 'react';
import type {
	Type_FieldOrder,
	Type_FieldMap,
} from '../utils/gip_prog_fields.ts';
import {
	FIELD_MAP_COLLECTION,
	FIELD_ORDER_COLLECTION,
	DUMMY_HEADER_FIELD,
} from '../utils/gip_prog_fields';
import { GipGridRow } from './gip_grid_row';
import {
	PROG_FIELD_SELECTED,
	Type_ProgramItem,
	Type_ProgramItemField,
	Type_EventHandlerMouse,
	Type_HandlerProgramChange,
	Type_EventMouse,
} from '../utils/gip_types';

const LABEL_PROGRAM_TABLE     = 'Programs';
const SELECTED_PROGRAM_COLOUR = 'rgb(100, 210, 255)';

// Can include this as a style property
//style={ genWidthStyle( { minWidths, fieldName } ) }
//
//const genWidthStyle = ( { minWidths, fieldName } ) => {
//  return ( minWidths[fieldName] ? { width: `${minWidths[fieldName]}em` } : {} );
//};

const genSelectedStyle = ( isSelected: boolean ) : { background?: string } => {
	return ( isSelected ? { background: SELECTED_PROGRAM_COLOUR } : {} );
};

interface TypeProgHeadersProps {
	arrFieldOrder:    Type_FieldOrder,
	headerDisplayMap: Type_FieldMap,
}

function ProgHeaders( props: TypeProgHeadersProps ) : React.JSX.Element {
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

interface TypeProgInputFieldProps {
	fieldName:  string,
	fieldValue: string,
	onClick:    Type_EventHandlerMouse,
	onKeyDown:  Type_EventHandlerKeyboard,
	selected:   boolean,
}

function progToDisplayValue( { fieldName, fieldValue } : { fieldName: string, fieldValue: string | number | null } ) : string {
	const valueMap = FIELD_MAP_COLLECTION[ fieldName ] ?? null;
	let   retValue = '';

	if ( valueMap && fieldValue ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		retValue = valueMap[ fieldValue ] ?? ( fieldValue as string );
	} else {
		retValue = ( fieldValue ?? '' ) as string;
	}

	return retValue;
}

function ProgInputField( props: TypeProgInputFieldProps ) : React.JSX.Element {
	const { fieldName, fieldValue, selected, onClick, onKeyDown } = props;

	return (
		<input type="text"
			className={ `gip-prog-item-field gip-prog-item-field-${fieldName}` }
			value={ progToDisplayValue( { fieldName, fieldValue } ) }
			onClick={ onClick }
			onKeyDown={ onKeyDown }
			readOnly
			style={ genSelectedStyle( selected ) }
		/>
	);
}

interface TypeProgInputFieldsProps {
	programs:        Type_ProgramItem[],
	arrFieldOrder:   Type_FieldOrder,
	onKeyDown:       Type_EventHandlerKeyboard,
	onProgramChange: Type_HandlerProgramChange,
}

/* eslint-disable @typescript-eslint/restrict-template-expressions */
function ProgInputFields( props: TypeProgInputFieldsProps ) : React.JSX.Element {
	const { programs, arrFieldOrder, onKeyDown } = props;

	const arrCookedFieldOrder = [ ...arrFieldOrder ];
	const counterFieldName = arrCookedFieldOrder.shift();

	const onClick = ( event: Type_EventMouse, program: Type_ProgramItem ) : void => {
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
					{ arrCookedFieldOrder.map( ( fieldName : Type_ProgramItemField, fieldIndex : number ) : ReactNode => (
						<div className={ `gip-prog-item-col gip-prog-item-data-col gip-prog-item-col-${fieldName}` } key={ `prog-item-field-${ programIndex + 1 }-${ fieldIndex + 1 }` }>
							<ProgInputField key={ `prog-field-${programIndex + 1}-${fieldIndex + 1}` }
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
}
/* eslint-enable @typescript-eslint/restrict-template-expressions */

interface TypeProgramTableProps {
	programs:         Type_ProgramItem[],
	onProgramChange:  Type_HandlerProgramChange,
	onKeyDown:        Type_EventHandlerKeyboard,
	arrFieldOrder:    Type_FieldOrder,
	headerDisplayMap: Type_FieldMap,
}

function ProgramTable( props: TypeProgramTableProps ) : React.JSX.Element {
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
				onProgramChange={ newPrograms => { onProgramChange( newPrograms ); } }
				onKeyDown={ onKeyDown }
			/>
		</div>
	);
}

interface TypeGipProgramTableProps {
	programs:        Type_ProgramItem[],
	onProgramChange: Type_HandlerProgramChange,
	onKeyDown:       Type_EventHandlerKeyboard,
}

export function GipProgramTable( props: TypeGipProgramTableProps ) : React.JSX.Element {
	const { onProgramChange, onKeyDown, programs = [] } = props;
	//console.log( 'Programs: ', programs );
	const headerDisplayMap = FIELD_MAP_COLLECTION[ DUMMY_HEADER_FIELD ] || null; // eslint-disable-line @typescript-eslint/no-unnecessary-condition
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
