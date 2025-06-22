import React, { ReactElement } from 'react';

interface TypeGipGridRowProps {
	fieldID?:              string,
	paramName?:            string | null,
	labelText:             string,
	gipComponent:          () => ReactElement,
	additionalClassNames?: string[],
}

interface TypeLabelProps {
	htmlFor?: string,
}


export function GipGridRow( props : TypeGipGridRowProps ) : ReactElement  {
	const { paramName = null, labelText, gipComponent, additionalClassNames = [] } = props;
	const labelProps : TypeLabelProps = {};
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
