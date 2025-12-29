import 'source-map-support/register.js';
import { Context, APIGatewayEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import fs from 'node:fs';
import path from 'node:path';
import logger from '@rhobweb/console-logger';

import type {
	Type_render_args,
	Type_render_ret
} from './src/server/render.ts';

type Type_render_fn = ( event: Type_render_args ) => Type_render_ret;

const PATH_MANIFEST = '/manifest.json';
const PATH_FAVICON = '/favicon.ico';

const CONTENT_TYPE_ICO = 'image/x-icon';
const CONTENT_TYPE_JSON = 'application/json';
const CONTENT_TYPE_TEXT = 'text/plain';

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

function processFile( event: APIGatewayEvent, contentType: string): APIGatewayProxyResultV2 {
	const response: APIGatewayProxyResultV2 = {
		statusCode: 500,
		headers: {
			'Content-Type': CONTENT_TYPE_TEXT,
		},
		body: 'Error',
	};
	const filePath = path.join('./public', event.path);
	logger.log( 'info', `processFile: ${filePath}`);
	try {
		const fileBuffer = fs.readFileSync(filePath);
		const fileBase64 = fileBuffer.toString('base64');
		//const fileUtf8 = fileBuffer.toString('utf8');
		response.statusCode = 200;
		response.body = fileBase64;
		response.isBase64Encoded = true;
		response.headers = {
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=60',
			//'Content-Length': Buffer.byteLength(fileBuffer),
		};
		logger.log( 'info', `processFile: done: `, { size: Buffer.byteLength(fileBuffer), body: fileBase64 });
	}
	catch (error) {
		logger.log( 'error', `File not found: ${filePath} `, error );
	}
	return response;
}

export const serve = async (event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResultV2> => { // eslint-disable-line @typescript-eslint/no-unused-vars
	try {
		logger.log( 'info',  `handler:serve: `, { httpMethod: event.httpMethod, path: event.path, headers: event?.headers, body: event?.body } ); // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		//logger.log( 'debug', `handler:serve: `, { event } );

		if (event.path === PATH_MANIFEST) {
			logger.log('info', 'Path manifest');
			return processFile(event, CONTENT_TYPE_JSON);
		} else if (event.path === PATH_FAVICON) {
			logger.log('info', 'Path favicon');
			return processFile(event, CONTENT_TYPE_ICO);
		} else {
			logger.log('info', 'Path programs');
			return await processProgramsApp(event);
		}
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
