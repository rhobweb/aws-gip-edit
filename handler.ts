import 'source-map-support/register.js';
import { Context, APIGatewayEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import logger from '@rhobweb/console-logger';

import type {
	Type_render_args,
	Type_render_ret
} from './src/server/render.ts';

type Type_render_fn = ( event: Type_render_args ) => Type_render_ret;

async function processProgramsApp(event: APIGatewayEvent): Promise<APIGatewayProxyResultV2> {
	// We use asynchronous import here so we can better catch server-side errors during development
	// @ts-expect-error "Relative import paths need explicit file extensions in EcmaScript imports"
	const render  = ( await import( './src/server/render' ) ).default as Type_render_fn; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
	return {
		statusCode: 200,
		headers: {
			'Content-Type': 'text/html',
		},
		body: await render( event ),
	};
}

export const serve = async (event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResultV2> => { // eslint-disable-line @typescript-eslint/no-unused-vars
	try {
		logger.log( 'info',  `handler:serve: `, { httpMethod: event.httpMethod, path: event.path, headers: event?.headers, body: event?.body } ); // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		return await processProgramsApp(event);
	} catch (error) {
		// Custom error handling for server-side errors
		// TODO: Prettify the output, include the callstack, e.g. by using `youch` to generate beautiful error pages
		logger.log( 'info', 'an error has occurred ', ( error as Error ).message );
		logger.log( 'error', error );
		return {
			statusCode: 500,
			headers: {
				'Content-Type': 'text/html',
			},
			body: `<html><body>${( error as Error ).toString()}</body></html>`,
		};
	}
};
