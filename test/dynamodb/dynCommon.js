/**
 * Node utility to create data items in the AWS DynamoDB for local testing.
 */

//var aws    = require("aws-sdk");
const { DynamoDBClient, CreateTableCommand, DeleteTableCommand } = require( '@aws-sdk/client-dynamodb' );
const { DynamoDBDocumentClient, PutCommand } = require( '@aws-sdk/lib-dynamodb' );
const commands = { CreateTableCommand, PutCommand, DeleteTableCommand };

let region = "eu-west-1";

const PROJECT_NAME         = 'gip-edit-react';
const DEFAULT_AWS_ENDPOINT = 'http://localhost:8000';
let   bNoexec   = 1;
let   stage     = "dev";
let   bLocal    = 1;
let   awsConfig = {};

let i = 0;
while (i < process.argv.length) {
  if (i > 1) {
    var arg = process.argv[i];
    switch (arg) {
      case '--remote':
      bLocal = 0;
      break;

      case '--exec':
      bNoexec = 0;
      break;

      case '--region':
      if (process.argv.length > (i+1)) {
        ++i;
        region = process.argv[i];
      } else {
        region = null;
      }
      break;

      case '--stage':
      if (process.argv.length > (i+1)) {
        ++i;
        stage = process.argv[i];
      } else {
        stage = null;
      }
      break;

      default:
      console.error("Unknown argument: " + arg);
      process.exit(-1);
      break;
    }
  }
  ++i;
}

if (bNoexec) {
  console.log("******* NOEXEC: use --exec to excute the commands");
}
if (!(region && stage)) {
  console.log("Must specify a valid region and stage");
}
if (bLocal) {
  console.log("Local: " + DEFAULT_AWS_ENDPOINT + "   (Region shall be ignored)");
  awsConfig = { region: region, endpoint: DEFAULT_AWS_ENDPOINT };
  //aws.config.update({ region: region, endpoint: DEFAULT_AWS_ENDPOINT });
} else {
  console.log( "Remote" );
  //aws.config.update({ region: region });
  awsConfig = { region: region };
}
console.log("Stage : " + stage + "    (Specify a different stage with --stage)");
console.log("Region: " + region + "    (Specify a different region with --region)");

function getTableName(tableName) {
  const arrPart = [ stage.toLowerCase(), PROJECT_NAME,  tableName ];
  tableName = arrPart.join( '_' );

  return tableName;
}

const dynamodb     = new DynamoDBClient( awsConfig );
const dynDocClient = DynamoDBDocumentClient.from( dynamodb );

module.exports = {
  DEFAULT_AWS_ENDPOINT,
  bNoexec,
  bLocal,
  region,
  stage,
  dynamodb,
  dynDocClient,
  commands,
  getTableName,
};

