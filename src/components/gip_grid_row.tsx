/**
 * File:        components/gip_grid_row.tsx
 * Description: This file defines the GipGridRow component, which is used to create a row in a grid layout for displaying GIP program details.
 */

////////////////////////////////////////////////////////////////////////////////
// Imports

import React, { ReactElement } from 'react';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

////////////////////////////////////////
// Exported and local types

interface Type_GipGridRowProps {
	fieldID?:              string,
	paramName?:            string | null,
	labelText:             string,
	gipComponent:          () => ReactElement,
	additionalClassNames?: string[],
}

interface Type_LabelProps {
	htmlFor?: string,
}

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

////////////////////////////////////////
// Exported definitions

/**
 * @param props - The properties for the GipGridRow component.
 * @param props.paramName            - Optional name for the parameter associated with the row, used for form elements.
 * @param props.labelText            - The text to display in the label for the row.
 * @param props.gipComponent         - A function that returns a ReactElement representing the GIP component to be displayed in the row.
 * @param props.additionalClassNames - An optional array of additional class names to apply to the element.
 * @returns A ReactElement representing the grid row.
 */
export function GipGridRow( props : Type_GipGridRowProps ) : ReactElement  {
	const { paramName = null, labelText, gipComponent, additionalClassNames = [] } = props;
	const labelProps : Type_LabelProps = {};
	const classNames  = [ 'col-md-11', 'gip-col', ...additionalClassNames ];

	if ( paramName ) {
		labelProps.htmlFor = paramName;
	}

	return (
		<div className="row">
			<div className="col-md-1 gip-col gip-label"><label { ...labelProps }>{ labelText }</label></div>
			<div className={ classNames.join(" ") }>
				{ gipComponent() }
			</div>
		</div>
	);
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions
