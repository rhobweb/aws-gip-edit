/**
 * Node utility to create the AWS DynamoDB tables for local testing
 */
const dynCommon = require( "./dynCommon" );

const arrTable = [
  dynCommon.getTableName('Program'),
  dynCommon.getTableName('ProgramHistory'),
];

async function deleteTable( tableName ) {
  let err       = null;
  let result    = null;
  const params  = { TableName: tableName };
  if ( ! dynCommon.bNoexec ) {
    const command = new dynCommon.commands.DeleteTableCommand( params );
    try {
      result = await dynCommon.dynamodb.send( command );
    }
    catch ( deleteErr ) {
      err = deleteErr;
    }
  }
  return { err, result, tableName };
}

for (var i = 0; i < arrTable.length; ++i) {
  const tableName = arrTable[i];
  deleteTable( tableName )
  .then( data => {
    const { err, result } = data;
    console.log("*************");
    if (!err) {
      console.log(`SUCCESS: ${tableName} ${JSON.stringify(result,null,2)}`);
    } else {
      console.log(`ERROR  : ${tableName} ${err.message}`);
    }
  } );
}
