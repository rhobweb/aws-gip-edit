'use strict';

//const MODULE_NAME = '@aws-sdk/client-dynamodb';

//const mockedModule = jest.requireActual( MODULE_NAME ); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
//const mockedModule : object = jest.createMockFromModule( MODULE_NAME );

jest.mock( '@aws-sdk/client-dynamodb', () => ({ __esModule: true }) );

//import type {
//	DynamoDBClientConfig,
//	ScanCommandInput,
//} from '@aws-sdk/client-dynamodb';

type DynamoDBClientConfig = Record<string,unknown>;
type ScanCommandInput      = Record<string,unknown>;

/**
 * When a test makes mutliple calls to these mocked objects, the same object gets reused and jest can't match the expected object correctly.
 * Make a copy of the return object to force a new object.
 * NOTE: if undefined, function and symbol values need to included, this function should be updated.
 * @param {Object} sourceObj
 * @return a copy of the object.
 */
function copyObject( sourceObj : object ) : object {
	return JSON.parse( JSON.stringify( sourceObj ) ) as object;
}


const dynamoDBClientMock : DynamoDBClient = {
	// @ts-expect-error just a stub, test shall mock this
	send: () : Promise<unknown> => ({}),
};

export interface DynamoDBClientTestProps {
	name:      string,
	destroyed: boolean,
	config:    (DynamoDBClientConfig | null),
};

export class DynamoDBClient {
	testProps : DynamoDBClientTestProps = {
		name:      'DynamoDBClient mock',
		destroyed: false,
		config:    null,
	};

	constructor ( config : DynamoDBClientConfig ) {
		if ( config === null ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
			throw new Error( 'DynamoDBClient config cannot be null' );
		}
		const newObj = copyObject( dynamoDBClientMock ) as DynamoDBClient;
		Object.assign( this, newObj );
		this.testProps.config = config;
		return this;
	}
	destroy() : void {
		this.testProps.config    = null;
		this.testProps.destroyed = true;
	}
}

const scanCommandMock = {
	args: {},
};

export class ScanCommand {	// eslint-disable-line @typescript-eslint/no-extraneous-class
	constructor ( args : ScanCommandInput ) {
		const newObj = copyObject( scanCommandMock ) as DynamoDBClient;
		// @ts-expect-error add an extra property to the mock object
		newObj.testObj = { args };
		return newObj;
	}
}

export const mocks = {
	dynamoDBClientMock,
	scanCommandMock,
};

export default {
	mocks,
	DynamoDBClient,
	ScanCommand,
};
