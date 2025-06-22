'use strict';

//const MODULE_NAME = '@aws-sdk/lib-dynamodb';

//const mockedModule : object = jest.createMockFromModule( MODULE_NAME );

import {
	DynamoDBClient
} from '@aws-sdk/client-dynamodb';

import {
	BatchWriteCommandInput,
	ScanCommandInput,
	TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';


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

const dynamoDBDocumentClientMock : DynamoDBDocumentClient = {
	testProps: {
		name:      'DynamoDBDocumentClient mock',
		destroyed: false,
		dbClient:  null,
	},
	// @ts-expect-error just a stub, test shall mock this
	send: () : Promise<unknown> => ({}),
	destroy: () : void => {}, // eslint-disable-line @typescript-eslint/no-empty-function
};

interface DynamoDBDocumentClientTestProps {
	name:      string,
	destroyed: boolean,
	dbClient: (DynamoDBClient | null),
};

export class DynamoDBDocumentClient {
	testProps : DynamoDBDocumentClientTestProps = {
		name:      'DynamoDBDocumentClient mock',
		destroyed: false,
		dbClient:  null,
	};

	constructor ( dbClient: DynamoDBClient ) {
		dynamoDBDocumentClientMock.testProps.dbClient = dbClient;
		return dynamoDBDocumentClientMock;
	}
	destroy() : void {
		this.testProps.dbClient  = null;
		this.testProps.destroyed = true;
	}
	static from( dbClient : DynamoDBClient ) : DynamoDBDocumentClient {
		const docClient = dynamoDBDocumentClientMock;
		docClient.testProps.dbClient = dbClient;
		return docClient;
	}
	// @ts-expect-error just a stub, test shall mock this
	send( args : unknown ) : Promise<unknown> { return args; }; // Will be mocked in tests
}

//const scanCommandMock = {
//	args: {},
//};

export class ScanCommand { // eslint-disable-line @typescript-eslint/no-extraneous-class
	constructor ( args : ScanCommandInput ) {
		const scanCommandRet = { args: copyObject( args ) as ScanCommandInput };
		return scanCommandRet;
	}
}

export class BatchWriteCommand { // eslint-disable-line @typescript-eslint/no-extraneous-class
	constructor ( args : BatchWriteCommandInput ) {
		const batchWriteCommandRet = { args: copyObject( args ) as BatchWriteCommandInput };
		return batchWriteCommandRet;
	}
}

export class TransactWriteCommand { // eslint-disable-line @typescript-eslint/no-extraneous-class
	constructor ( args : TransactWriteCommandInput ) {
		const transactWriteCommandRet = { args: copyObject( args ) as TransactWriteCommandInput };
		return transactWriteCommandRet;
	}
}

export const mocks = {
	dynamoDBDocumentClientMock,
	//scanCommandMock,
};

export default {
	mocks,
	BatchWriteCommand,
	DynamoDBDocumentClient,
	ScanCommand,
	TransactWriteCommand,
};