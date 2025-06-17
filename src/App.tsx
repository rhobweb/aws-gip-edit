import '../public/gip-common.css';

import * as React          from 'react';

import useConfig     from "./components/useConfig";
import GipEdit       from './components/gip_edit';
import Authenticator from './components/authenticator';

/**
 * Our Web Application
 */
export default function App() : React.JSX.Element {
	const config = useConfig();
	return (
		<Authenticator>
			<GipEdit />
		</Authenticator>
	);
}
