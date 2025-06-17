import React, { ReactNode } from 'react';
//import Head                 from 'next/head';

export const siteTitle = 'GIP Program Edit';

type TypeLayoutProps = {
	children: ReactNode,
};

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

export default function Layout( { children } : TypeLayoutProps ) {
	return (
		<div>
			<main>{ children }</main>
		</div>
	);
}
