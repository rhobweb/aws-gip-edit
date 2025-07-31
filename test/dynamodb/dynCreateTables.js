/**
 * Node utility to create the AWS Dynamo DB tables for local testing
 */
const dynCommon = require( "./dynCommon" );

const objProgramIndexes = {
	GlobalSecondaryIndexes: [
		{
			IndexName: dynCommon.getTableName('Program') + '-index',
			KeySchema: [
				{
					AttributeName: "passwordHash",
					KeyType:       "HASH"
				}
			],
			Projection: {
				ProjectionType: "ALL"
			},
			ProvisionedThroughput: {
				ReadCapacityUnits:  1,
				WriteCapacityUnits: 1
			}
		}
	]
};

const objTableProgram = {
	TableName: dynCommon.getTableName('Program'),
	AttributeDefinitions: [ 
		{
			AttributeName: "pid",
			AttributeType: "S" 
		},
	],
	KeySchema: [ 
		{ 
			AttributeName: "pid",
			KeyType:       "HASH"
		},
	],
	BillingMode: 'PAY_PER_REQUEST',
	//...objProgramIndexes,
};

const objProgramHistoryIndexes = {
	GlobalSecondaryIndexes: [
		{
			IndexName: dynCommon.getTableName('ProgramHistory') + '-pid',
			KeySchema: [
				{
					AttributeName: "pid",
					KeyType: "HASH"
				}
			],
			Projection: {
				ProjectionType: "ALL"
			},
			BillingMode: 'PAY_PER_REQUEST',
		}
	]
};

const objTableProgramHistory = {
	TableName: dynCommon.getTableName('ProgramHistory'),
	AttributeDefinitions: [ 
		{
			AttributeName: "pid",
			AttributeType: "S"
		},
		{
			AttributeName: "download_time",
			AttributeType: "S" 
		},
	],
	KeySchema: [ 
		{ 
			AttributeName: "pid",
			KeyType:       "HASH"
		},
		{ 
			AttributeName: "download_time",
			KeyType:       "RANGE"
		},
	],
	BillingMode: 'PAY_PER_REQUEST',
	...objProgramHistoryIndexes,
};

const arrParams = [
	objTableProgram,
	objTableProgramHistory,
];

async function createTable( params ) {
	let err       = null;
	let data      = null;
	let tableName = params.TableName;
	if ( dynCommon.bNoexec ) {
		data = params;
	} else {
		const command = new dynCommon.commands.CreateTableCommand( params );
		try {
			data = await dynCommon.dynamodb.send( command );
		}
		catch ( createErr ) {
			err = createErr;
		}
	}
	return { err, data, tableName };
}

for (var i = 0; i < arrParams.length; ++i) {
	const params = arrParams[i];
	createTable( params )
	.then( result => {
		const { err, data, tableName } = result;
		console.log("*************");
		if (!err) {
			console.log(`SUCCESS: ${tableName} ${JSON.stringify(data,null,2)}`);
		} else {
			console.log(`ERROR  : ${tableName} ${err.message}`);
		}
	} );
}
