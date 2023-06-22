/**
 * DESCRIPTION:
 * System tests for the progams API
 */
'use strict';

import chai  from 'chai';
import sinon from 'sinon';
//chai.config.truncateThreshold = 0; // Do not truncate 'expect' error messages
const { expect } = chai;

const REL_SRC_PATH = `../../../src/utils/`;
const MODULE_NAME  = 'gip_db_dynamodb_utils';
const TEST_MODULE  = REL_SRC_PATH + MODULE_NAME;

//const testModule = require( TEST_MODULE );
import testModule from '../../../test-out/gip_db_dynamodb_utils.js';

const TEST_PROGRAMS_01 = [
  {
    pid:            'mypid',
    status:         'Pending',
    genre:          'Books&Spoken',
    day_of_week:    null,
    quality:        'Normal',
    title:          'Sir Radio Program',
    synopsis:       'Test program',
    modify_time:    '2023-06-21T01:02:03Z',
    image_uri:      'https://myimage.jpg',
    pos:            1,
    download_time:  '',
  },
];


async function test_loadProgs01() {
  let actualResult;
  let expectedResult = JSON.parse( JSON.stringify( TEST_PROGRAMS_01 ) );

  console.log( "test_loadProgs01: START" );

  try {
    actualResult = await testModule.loadProgs();
  }
  catch ( err ) {
    console.log( `test01: error: ${err.message}` );
  }
  expect( actualResult ).to.deep.equal( expectedResult );
  console.log( "test_loadProgs01: OK" );
}

async function test_saveProgs01() {
  let actualResult;
  let expectedResult = [];
  let testPrograms   = TEST_PROGRAMS_01;

  console.log( "test_saveProgs01: START" );

  expectedResult = JSON.parse( JSON.stringify( testPrograms ) );

  try {
    actualResult = await testModule.saveProgs( { programs: testPrograms } );
  }
  catch ( err ) {
    console.log( `test01: error: ${err.message}` );
  }
  expect( actualResult ).to.deep.equal( expectedResult );
  console.log( "test_saveProgs01: OK" );
}

//test_loadProgs01().then( () => {} );
test_saveProgs01().then( () => {
  test_loadProgs01().then( () => {
  } );
} );
