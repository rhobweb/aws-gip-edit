/**
 * FILE:        test/utils/__mocks__/@aws-sdk/lib-dynamodb.cjs
 * DESCRIPTION: Mocks for the @aws-sdk/lib-dynamodb package.
 *
 * Usage:       ts-jest with ESM does not automatically pick up this mock.
 *              Need to configure a Jest setup script to run:
 *                 import {jest} from '@jest/globals';
 *                 const libDynamodb = jest.requireActual( '../__mocks__/@aws-sdk/lib-dynamodb.cjs' );
 *                 jest.mock( '@aws-sdk/lib-dynamodb', () => ({ __esModule: true, ...libDynamodb }) );
 */
'use strict';

//const MODULE_NAME = '@aws-sdk/lib-dynamodb';

//const mockedModule : object = jest.createMockFromModule( MODULE_NAME );

//import {
//	DynamoDBClient
//} from '@aws-sdk/client-dynamodb';
//
//import {
//	BatchWriteCommandInput,
//	ScanCommandInput,
//	TransactWriteCommandInput,
//} from '@aws-sdk/lib-dynamodb';


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

const dynamoDBDocumentClientMock = {
	testProps: {
		name:      'DynamoDBDocumentClient mock',
		destroyed: false,
		dbClient:  null,
	},
	// @ts-expect-error just a stub, test shall mock this
	send: () => ({}),
	destroy: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
};

class DynamoDBDocumentClient {
	testProps = {
		name:      'DynamoDBDocumentClient mock',
		destroyed: false,
		dbClient:  null,
	};

	constructor ( dbClient ) {
		dynamoDBDocumentClientMock.testProps.dbClient = dbClient;
		return dynamoDBDocumentClientMock;
	}
	destroy() {
		this.testProps.dbClient  = null;
		this.testProps.destroyed = true;
	}
	static from( dbClient ) {
		const docClient = dynamoDBDocumentClientMock;
		docClient.testProps.dbClient = dbClient;
		return docClient;
	}
	// @ts-expect-error just a stub, test shall mock this
	send( args ) { return args; }; // Will be mocked in tests
}

//const scanCommandMock = {
//	args: {},
//};

class ScanCommand { // eslint-disable-line @typescript-eslint/no-extraneous-class
	constructor ( args ) {
		const scanCommandRet = {
			objType: 'ScanCommand',
			args:    copyObject( args ),
		};
		return scanCommandRet;
	}
}

class BatchWriteCommand { // eslint-disable-line @typescript-eslint/no-extraneous-class
	constructor ( args ) {
		const batchWriteCommandRet = {
			objType: 'BatchWriteCommand',
			args:    copyObject( args ),
		};
		return batchWriteCommandRet;
	}
}

class TransactWriteCommand { // eslint-disable-line @typescript-eslint/no-extraneous-class
	constructor ( args ) {
		const transactWriteCommandRet = {
			objType: 'TransactWriteCommand',
			args:    copyObject( args ),
		};
		return transactWriteCommandRet;
	}
}

const mocks = {
	dynamoDBDocumentClientMock,
	//scanCommandMock,
};

//export default {
module.exports = {
	mocks,
	BatchWriteCommand,
	DynamoDBDocumentClient,
	ScanCommand,
	TransactWriteCommand,
};
