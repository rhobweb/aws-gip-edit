'use strict';

//const MODULE_NAME = '@aws-sdk/client-dynamodb';

//const mockedModule = jest.requireActual( MODULE_NAME ); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
//const mockedModule : object = jest.createMockFromModule( MODULE_NAME );

//import {
//	DynamoDBClientConfig,
//	ScanCommandInput,
//} from '@aws-sdk/client-dynamodb';

/**
 * When a test makes mutliple calls to these mocked objects, the same object gets reused and jest can't match the expected object correctly.
 * Make a copy of the return object to force a new object.
 * NOTE: if undefined, function and symbol values need to included, this function should be updated.
 * @param {Object} sourceObj
 * @return a copy of the object.
 */
function copyObject( sourceObj ) {
	return JSON.parse( JSON.stringify( sourceObj ) );
}

const dynamoDBClientMock = {
	// @ts-expect-error just a stub, test shall mock this
	send: () => ({}),
};

class DynamoDBClient {
	testProps = {
		name:      'DynamoDBClient mock',
		destroyed: false,
		config:    null,
	};

	constructor ( config ) {
		if ( config === null ) { // eslint-disable-line @typescript-eslint/no-unnecessary-condition
			throw new Error( 'DynamoDBClient config cannot be null' );
		}
		const newObj = copyObject( dynamoDBClientMock );
		Object.assign( this, newObj );
		this.testProps.config = config;
		return this;
	}
	destroy() {
		this.testProps.config    = null;
		this.testProps.destroyed = true;
	}
}

const scanCommandMock = {
	args: {},
};

class ScanCommand {	// eslint-disable-line @typescript-eslint/no-extraneous-class
	constructor ( args ) {
		const newObj = copyObject( scanCommandMock );
		// @ts-expect-error add an extra property to the mock object
		newObj.testObj = { args };
		return newObj;
	}
}

const mocks = {
	dynamoDBClientMock,
	scanCommandMock,
};

//export default {
module.exports = {
	mocks,
	DynamoDBClient,
	ScanCommand,
};
