import "source-map-support/register";
import { Context, APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import logger from '@rhobweb/console-logger';

export const serve = async (event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResultV2> => {
  try {
    logger.log( 'info',  `handler:serve: `, { httpMethod: event.httpMethod, path: event.path, headers: event?.headers, body: event?.body } );
    logger.log( 'debug', `handler:serve: `, { event } );

    // We use asynchronous import here so we can better catch server-side errors during development
    // @ts-ignore "Relative import paths need explicit file extensions in EcmaScript imports"
    const render = ( await import( './src/server/render' ) ).default;
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
      },
      body: await render(event),
    };
  } catch (error) {
    // Custom error handling for server-side errors
    // TODO: Prettify the output, include the callstack, e.g. by using `youch` to generate beautiful error pages
    logger.log( 'info', 'an error has occurred ', error.message );
    logger.log( 'error', error );
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "text/html",
      },
      body: `<html><body>${error.toString()}</body></html>`,
    };
  }
};
