/**
 * File:        components/layout.tsx
 * Description: Provides a layout component for the application.
 */
'use strict';

////////////////////////////////////////////////////////////////////////////////
// Imports

import React, { ReactNode } from 'react';
//import Head                 from 'next/head';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

////////////////////////////////////////
// Exported and local types

interface TypeLayoutProps {
	children: ReactNode,
}

////////////////////////////////////////////////////////////////////////////////
// Constants

export const siteTitle = 'GIP Program Edit';

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

////////////////////////////////////////
// Exported definitions

/*
<Head>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link rel="icon" href="/favicon.ico" />
<meta
	name="description"
	content="Drag and drop the programs to edit"
/>
<title>{ siteTitle }</title>
</Head>
*/

export default function Layout( { children } : TypeLayoutProps ) : React.JSX.Element {
	return (
		<div>
			<main>{ children }</main>
		</div>
	);
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions
