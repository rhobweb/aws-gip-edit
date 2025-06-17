/**
 * Node utility to create data items in the AWS DynamoDB for local testing.
 */

const dynCommon = require("./dynCommon");
const util      = require("node:util");

const objParamsUser1 = {
	TableName : dynCommon.getTableName("User"),
	Item      : {
		"phoneNumber":  "+12345678901",
		"passwordHash": "$2b$10$mlN5LjI1J.TRlAHSFklw7u6MhA65JPT4lywnlZVOk36C.Lpe6wSfG"
	}
};
const objParamsUser2 = {
	TableName : dynCommon.getTableName("User"),
	Item      : {
		"phoneNumber":  "+12345678902",
		"passwordHash": "z2b$10$mlN5LjI1J.TRlAHSFklw7u6MhA65JPT4lywnlZVOk36C.Lpe6wSfG"
	}
};

const arrParams = [
	objParamsUser1,
	objParamsUser2,
];

/**
 * Items can be put to the database using:
 *    dynamodb.putItems
 * or dynDocClient.put
 * The difference is that the DocClient automatically determines the type of each attribute.
 * So, whole JSON objects can be processed by DocClient.put,
 * but if using dynamodb.putItems each attribute type needs to be specified manually.
 */
async function putItem(params) {
	let err       = null;
	let data      = null;
	let tableName = params.TableName;
	if ( dynCommon.bNoexec ) {
		console.log( "putItem", util.inspect(params) );
		data = "******** NOEXEC enabled: use --exec to write the items ************";;
	}
	const command = new dynCommon.commands.PutCommand( params );
	try {
		const result = await dynCommon.dynDocClient.send( command );
		data = result;
	}
	catch ( putErr ) {
		err = putErr;
	}
	return { err, data, tableName };
}

for (var i = 0; i < arrParams.length; ++i) {
	var params = arrParams[i];

	putItem( params )
	.then( result => {
		const { err, data, tableName } = result;
		console.log( '**************************' );
		if ( err ) console.log("ERROR: " + tableName + " " + err.message);          // an error occurred
		else       console.log("SUCCESS: " + util.inspect(data)); // successful response
	});
}
