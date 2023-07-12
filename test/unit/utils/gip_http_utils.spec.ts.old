/**
 * DESCRIPTION:
 * Unit Tests for gip_http_utils.ts.
 */

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment    */
/* eslint-disable @typescript-eslint/no-explicit-any   */

import sinon, { SinonSandbox } from 'sinon';
import { expect }              from 'chai';

const REL_SRC_PATH = '../../../src/utils/';
const MODULE_NAME  = 'gip_http_utils.ts';
const TEST_MODULE  = REL_SRC_PATH + MODULE_NAME;

let sandbox : SinonSandbox;

import { TypeEndpointDef, TypeEndpoint, TypeEndpointOptions } from '../../../src/utils/gip_types';

type TypeFnGenParams     = ( { endpointDef, params } : TypeGenParamsParams ) => TypeGenParamsRet
type TypeGenParamsRet    = { uri: string, params: TypeHttpParams };
type TypeGenParamsParams = { endpointDef: TypeEndpointDef, params?: TypeHttpParams };
//type TypeGetContentRet = { headers: TypeHttpHeaders, body: Nullable<TypeHttpParams> };
type TypeGenURIParams    = { uri: string, method: string, params?: TypeHttpParams };
type TypeGenURIRet       = { uri: string, params: Nullable<TypeHttpParams> };
type TypeFnGenURI        = ( { uri, params } : TypeGenURIParams ) => TypeGenURIRet

type TypeContainsHeaderParams = { headers: TypeHttpHeaders, headerProp: string };
type TypeFnContainsHeader     = ( { headers, headerProp } : TypeContainsHeaderParams ) => boolean;

type TypeGenContentParams = { endpointDef: TypeEndpointDef, headers: TypeHttpHeaders, params: TypeHttpParams };
type TypeGenContentRet    = { headers: TypeHttpHeaders, body: Nullable<TypeHttpParams> };
type TypeFnGenContent     = ( { endpointDef, headers, params } : TypeGenContentParams ) => TypeGenContentRet;

type TypeProcessEndpointDefParams = { endpointDef: TypeEndpointDef, headers?: TypeHttpHeaders, params?: TypeHttpParams };
type TypeProcessEndpointDefRet    = TypeEndpoint;
type TypeFnProcessEndpointDef     = ( { endpointDef, headers, params } : TypeProcessEndpointDefParams ) => TypeProcessEndpointDefRet;

type TypeRawQueryParamScalarValue    = string | null | undefined;
type TypeRawQueryParamValue          = TypeRawQueryParamScalarValue | string[];
type TypeRawQueryParams              = Partial<{ [key: string]: TypeRawQueryParamValue }>
type TypeCookedQueryParamScalarValue = string | boolean | null;
type TypeCookedQueryParamValue       = TypeCookedQueryParamScalarValue | (TypeCookedQueryParamScalarValue)[];
type TypeCookedQueryParams           = Record<string, TypeCookedQueryParamValue>;
type TypeParseQueryParamsParams      = TypeRawQueryParams;
type TypeParseQueryParamsRet         = TypeCookedQueryParams;

type TypeTestModule = {
  genParams: ( params: object )                  => object[],
  extractJsonResponse: ( response: { json : () => object } ) => object,
  parseQueryParams: ( params?: TypeParseQueryParamsParams ) => TypeParseQueryParamsRet,
  stringifyUTF16: ( params: object ) => string,
};

async function createTestModule() : Promise<TypeTestModule> {
  const testModule = ( await import( TEST_MODULE ) ).default;
  return testModule;
}

function commonBeforeEach() {
  sandbox = sinon.createSandbox();
}

function commonAfterEach() {
  sandbox.restore();
}

describe(MODULE_NAME + ':module can be loaded', () => {

  beforeEach( () => {
    commonBeforeEach();
  });

  afterEach( () => {
    commonAfterEach();
  });

  it ('module initialises OK', async () => {
    await createTestModule();
  });
});

/*
describe(MODULE_NAME + ':genParams', () => {
  const testFnName = 'genParams';
  let   testFn                : TypeFnGenParams;
  let   testProps             : TypeTestProps;
  let   testArgs              : TypeGenParamsParams;
  let   testEndpointDef       : TypeEndpointDef;
  let   testURI               : string;
  let   testQueryParams       : string;
  let   testEndpointDefParams : TypeHttpParams;
  let   testParams            : TypeHttpParams;
  let   actualResult          : TypeGenParamsRet;
  let   actualErr             : Error;
  let   expectedResult        : object;
  let   expectedErrMessage;

  beforeEach( () => {
    commonBeforeEach();
    ( { testProps } = createTestModuleAndGetProps( [ testFnName ] ) );
    testFn                = testProps[ testFnName ];
    testURI               = 'https://mydom/mypath';
    testQueryParams       = 'qparam1=qval1&qparam2';
    testEndpointDefParams = { 'epd_param1': 'epdvalue1' };
    testParams            = { param1: 'value1' };
    testEndpointDef = {
      uri:    testURI,
      method: 'GET',
      params: testEndpointDefParams,
    };
    testArgs = { endpointDef: testEndpointDef, params: testParams };
  });

  afterEach( () => {
    commonAfterEach();
  });

  it ( 'No parameters in endpoint def or passed in', () => {
    delete testEndpointDef.params;
    testArgs       = { endpointDef: testEndpointDef };
    expectedResult = { uri: testURI, params: {} };
    try {
      actualResult = testFn( testArgs );
    }
    catch ( err ) {
      sinon.assert.fail( `Test should not fail: ${(<Error>err).message}` );
    }
    expect( actualResult ).to.deep.equal( expectedResult );
  });

  it ( 'No parameters in endpoint def, parameters passed in', () => {
    delete testEndpointDef.params;
    expectedResult = { uri: testURI, params: JSON.parse( JSON.stringify(testParams) ) };
    try {
      actualResult = testFn( testArgs );
    }
    catch ( err ) {
      sinon.assert.fail( `Test should not fail: ${(<Error>err).message}` );
    }
    expect( actualResult ).to.deep.equal( expectedResult );
  });

  it ( 'Parameters in endpoint def, no parameters passed in', () => {
    delete testArgs.params;
    expectedResult = { uri: testURI, params: JSON.parse( JSON.stringify(testEndpointDefParams) ) };
    try {
      actualResult = testFn( testArgs );
    }
    catch ( err ) {
      sinon.assert.fail( `Test should not fail: ${(<Error>err).message}` );
    }
    expect( actualResult ).to.deep.equal( expectedResult );
  });

  it ( 'Object parameters in endpoint def, object parameters passed in', () => {
    expectedResult = { uri: testURI, params: Object.assign( {}, JSON.parse( JSON.stringify(testEndpointDefParams) ), JSON.parse( JSON.stringify(testParams) ) ) };
    try {
      actualResult = testFn( testArgs );
    }
    catch ( err ) {
      sinon.assert.fail( `Test should not fail: ${(<Error>err).message}` );
    }
    expect( actualResult ).to.deep.equal( expectedResult );
  });

  it ( 'Error Endpoint def string params, object parameters passed in', () => {
    testEndpointDef.params = 'any old string';
    expectedErrMessage     = 'Type mismatch between fixed params and variable params';
    try {
      testFn( testArgs );
    }
    catch ( err ) {
      actualErr = <Error>err;
    }
    expect( actualErr.message ).to.equal( expectedErrMessage );
  });

  it ( 'Error Endpoint def string params, string parameters passed in', () => {
    testEndpointDef.params = 'any old string';
    testArgs.params        = 'some other string';
    expectedErrMessage     = 'Invalid to specify both fixed string params and variable string params';
    try {
      testFn( testArgs );
    }
    catch ( err ) {
      actualErr = <Error>err;
    }
    expect( actualErr.message ).to.equal( expectedErrMessage );
  });

  it ( 'Query parameters in URI', () => {
    delete testArgs.params;
    delete testEndpointDef.params;
    testEndpointDef.uri = `${testURI}?${testQueryParams}`;
    expectedResult      = { uri: testURI, params: { qparam1: 'qval1', qparam2: null } };
    try {
      actualResult = testFn( testArgs );
    }
    catch ( err ) {
      sinon.assert.fail( `Test should not fail: ${(<Error>err).message}` );
    }
    expect( actualResult ).to.deep.equal( expectedResult );
  });

  it ( 'Query parameters in URI, endpoint def params', () => {
    delete testArgs.params;
    testEndpointDef.uri = `${testURI}?${testQueryParams}`;
    expectedResult      = { uri: testURI, params: { qparam1: 'qval1', qparam2: null, epd_param1: 'epdvalue1' } };
    try {
      actualResult = testFn( testArgs );
    }
    catch ( err ) {
      sinon.assert.fail( `Test should not fail: ${(<Error>err).message}` );
    }
    expect( actualResult ).to.deep.equal( expectedResult );
  });

  it ( 'Error Endpoint def string params, query parameters in URI', () => {
    delete testArgs.params;
    testEndpointDef.params = 'any old string';
    testEndpointDef.uri    = `${testURI}?${testQueryParams}`;
    expectedErrMessage     = 'Type mismatch between endpoint params and query params';
    try {
      testFn( testArgs );
    }
    catch ( err ) {
      actualErr = <Error>err;
    }
    expect( actualErr.message ).to.equal( expectedErrMessage );
  });
});

describe(MODULE_NAME + ':genURI', () => {
  const testFnName = 'genURI';
  let   testFn                : TypeFnGenURI;
  let   testProps             : TypeTestProps;
  let   testArgs              : TypeGenURIParams;
  let   testURI               : string;
  let   testQueryParams       : string;
  let   testParams            : TypeRawHttpParams;
  let   actualResult          : TypeGenURIRet;
  let   expectedResult        : object;

  beforeEach( () => {
    commonBeforeEach();
    ( { testProps } = createTestModuleAndGetProps( [ testFnName ] ) );
    testFn          = testProps[ testFnName ];
    testURI         = 'https://mydom/mypath';
    testQueryParams = 'qparam1=qval1';
    testParams      = { param1: 'value1' };
    testArgs = {
      uri:    testURI,
      method: 'GET',
      params: testParams
    };
    expectedResult = {
      uri:    `${testURI}?param1=value1`,
      params: null,
    };
  });

  afterEach( () => {
    commonAfterEach();
  });

  it ( 'Not GET', () => {
    testArgs.uri    = testURI;
    testArgs.method = 'POST';
    expectedResult  = { uri: testURI, params: testParams };
    actualResult    = testFn( testArgs );
    expect( actualResult ).to.deep.equal( expectedResult );
  });

  it ( 'GET with params', () => {
    testArgs.uri = `${testURI}?${testQueryParams}`;
    actualResult = testFn( testArgs );
    expect( actualResult ).to.deep.equal( expectedResult );
  });

  it ( 'GET no params', () => {
    testArgs.uri = `${testURI}?${testQueryParams}`;
    expectedResult = {
      uri:    testURI,
      params: null,
    };
    delete testArgs.params;
    actualResult = testFn( testArgs );
    expect( actualResult ).to.deep.equal( expectedResult );
  });
});

describe(MODULE_NAME + ':containsHeader', () => {
  const testFnName = 'containsHeader';
  let   testFn         : TypeFnContainsHeader;
  let   testProps      : TypeTestProps;
  let   testArgs       : TypeContainsHeaderParams;
  let   testHeaders    : Record<string,string>;
  let   testHeaderProp : string;
  let   actualResult   : boolean;
  let   expectedResult : boolean;

  beforeEach( () => {
    commonBeforeEach();
    ( { testProps } = createTestModuleAndGetProps( [ testFnName ] ) );
    testFn          = testProps[ testFnName ];
    testHeaders     = {
      hEaDeR1: 'header1 val',
      HeadeR2: 'header2 val',
    };
    testArgs = {
      headers:    testHeaders,
      headerProp: testHeaderProp,
    };
  });

  afterEach( () => {
    commonAfterEach();
  });

  it ( 'Not found', () => {
    testArgs.headerProp = 'header3';
    expectedResult      = false;
    actualResult        = testFn( testArgs );
    expect( actualResult ).to.equal( expectedResult );
  });

  it ( 'Found', () => {
    testArgs.headerProp = 'heAdEr2';
    expectedResult      = true;
    actualResult        = testFn( testArgs );
    expect( actualResult ).to.equal( expectedResult );
  });
});

describe(MODULE_NAME + ':genContent', () => {
  const testFnName = 'genContent';
  let   testFn             : TypeFnGenContent;
  let   testModule         : TypeRewiredModule;
  let   testProps          : TypeTestProps;
  let   testStubs          : TypeTestStubs;
  let   testArgs           : TypeGenContentParams;
  let   testParams         : TypeHttpParams;
  let   testEndpointDef    : TypeEndpointDef;
  let   testHeaders        : TypeHttpHeaders;
  let   actualResult       : TypeGenContentRet;
  let   expectedResult     : TypeGenContentRet;
  let   containsHeaderStub : SinonStub;
  let   containsHeaderExpectedParamsArr: any[];
  let   containsHeaderExpectedArgsArr:   [ SinonStub, ...any ][];
  let   containsHeaderRetArr : boolean[];

  beforeEach( () => {
    commonBeforeEach();
    ( { testModule, testProps } = createTestModuleAndGetProps( [ testFnName ] ) );
    testFn          = testProps[ testFnName ];
    testStubs       = getPrivateStubs( testModule, [ 'containsHeader' ] );
    testHeaders     = {
      pheader1: 'pheader1 val',
    };
    testEndpointDef = {
      uri:     'ignored',
      method:  'POST',
      headers: { epheader1: 'epheader1 val' },
    };
    testParams = { param1: 'test param1' };
    testArgs = {
      endpointDef: testEndpointDef,
      headers:     testHeaders,
      params:      testParams,
    };
    containsHeaderStub = sandbox.stub( testStubs, 'containsHeader' ).callsFake( () : boolean => {
      // @ts-ignore
      return containsHeaderRetArr.shift();
    } );
    containsHeaderRetArr = [ true, true ];
    containsHeaderExpectedParamsArr = [
      { headers: testHeaders,             headerProp: 'Content-Type' },
      { headers: testEndpointDef.headers, headerProp: 'Content-Type' },
    ];
    containsHeaderExpectedArgsArr = [
      [ containsHeaderStub, containsHeaderExpectedParamsArr[0] ],
      [ containsHeaderStub, containsHeaderExpectedParamsArr[1] ],
    ];
  });

  afterEach( () => {
    commonAfterEach();
  });

  it ( 'GET', () => {
    testEndpointDef.method = 'GET';
    expectedResult      = {
      headers: { pheader1: 'pheader1 val', epheader1: 'epheader1 val', },
      body:    JSON.parse(JSON.stringify(testParams)),
    };
    actualResult = testFn( testArgs );
    sinon.assert.notCalled( containsHeaderStub );
    expect( actualResult ).to.deep.equal( expectedResult );
  });

  it ( 'Content-Type in supplied header', () => {
    testHeaders[ 'Content-Type' ] = 'provided content type';
    expectedResult      = {
      headers: { pheader1: 'pheader1 val', epheader1: 'epheader1 val', 'Content-Type': 'provided content type' },
      body:    JSON.stringify( testParams ),
    };
    actualResult = testFn( testArgs );
    sinon.assert.calledWithExactly.apply( null, containsHeaderExpectedArgsArr[0] );
    sinon.assert.callCount( containsHeaderStub, 1 );
    expect( actualResult ).to.deep.equal( expectedResult );
  });

  it ( 'Content-Type in endpoint def header', () => {
    // @ts-ignore
    testEndpointDef.headers[ 'Content-Type' ] = 'endpoint content type';
    // @ts-ignore
    delete testArgs.headers;
    containsHeaderExpectedParamsArr[0].headers = {};
    containsHeaderRetArr = [ false, true ];
    expectedResult       = {
      headers: { epheader1: 'epheader1 val', 'Content-Type': 'endpoint content type' },
      body:    JSON.stringify( testParams ),
    };
    actualResult = testFn( testArgs );
    sinon.assert.calledWithExactly.apply( null, containsHeaderExpectedArgsArr[0] );
    sinon.assert.calledWithExactly.apply( null, containsHeaderExpectedArgsArr[1] );
    sinon.assert.callCount( containsHeaderStub, 2 );
    expect( actualResult ).to.deep.equal( expectedResult );
  } );

  it ( 'No Content-Type present, params already stringified', () => {
    // @ts-ignore
    delete testArgs.headers;
    testArgs.params = 'already stringified';
    containsHeaderExpectedParamsArr[0].headers = {};
    containsHeaderRetArr = [ false, false ];
    expectedResult       = {
      headers: { epheader1: 'epheader1 val', 'Content-Type': 'text/plain; charset=UTF-8' },
      body:    testArgs.params,
    };
    actualResult = testFn( testArgs );
    sinon.assert.calledWithExactly.apply( null, containsHeaderExpectedArgsArr[0] );
    sinon.assert.calledWithExactly.apply( null, containsHeaderExpectedArgsArr[1] );
    sinon.assert.callCount( containsHeaderStub, 2 );
    expect( actualResult ).to.deep.equal( expectedResult );
  } );

  it ( 'No Content-Type present, params object', () => {
    // @ts-ignore
    delete testArgs.headers;
    containsHeaderExpectedParamsArr[0].headers = {};
    containsHeaderRetArr = [ false, false ];
    expectedResult       = {
      headers: { epheader1: 'epheader1 val', 'Content-Type': 'application/json; charset=UTF-8' },
      body:    JSON.stringify( testArgs.params ),
    };
    actualResult = testFn( testArgs );
    sinon.assert.calledWithExactly.apply( null, containsHeaderExpectedArgsArr[0] );
    sinon.assert.calledWithExactly.apply( null, containsHeaderExpectedArgsArr[1] );
    sinon.assert.callCount( containsHeaderStub, 2 );
    expect( actualResult ).to.deep.equal( expectedResult );
  } );

  it ( 'No endpoint headers, no additonal params or headers', () => {
    // @ts-ignore
    delete testArgs.params;
    // @ts-ignore
    delete testArgs.headers;
    delete testEndpointDef.headers;
    containsHeaderExpectedParamsArr[0].headers = {};
    containsHeaderExpectedParamsArr[1].headers = {};
    containsHeaderRetArr = [ false, false ];
    expectedResult       = {
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body:    null,
    };
    actualResult = testFn( testArgs );
    sinon.assert.calledWithExactly.apply( null, containsHeaderExpectedArgsArr[0] );
    sinon.assert.calledWithExactly.apply( null, containsHeaderExpectedArgsArr[1] );
    sinon.assert.callCount( containsHeaderStub, 2 );
    expect( actualResult ).to.deep.equal( expectedResult );
  } );
} );

describe(MODULE_NAME + ':processEndpointDef', () => {
  const testFnName = 'processEndpointDef';
  let   testFn                   : TypeFnProcessEndpointDef;
  let   testModule               : TypeRewiredModule;
  let   testProps                : TypeTestProps;
  let   testStubs                : TypeTestStubs;
  let   testArgs                 : TypeProcessEndpointDefParams;
  let   testExpectedOptions      : TypeEndpointOptions;
  let   testMethod               : string;
  let   testEndpointDef          : TypeEndpointDef;
  let   testParams               : TypeHttpParams;
  let   testHeaders              : TypeHttpHeaders;
  let   actualResult             : TypeProcessEndpointDefRet;
  let   expectedResult           : TypeProcessEndpointDefRet;
  let   genParamsStub            : SinonStub;
  let   genParamsRet             : TypeGenParamsRet;
  let   genParamsExpectedParams  : TypeGenParamsParams;
  let   genParamsExpectedArgs    : [ SinonStub, TypeGenParamsParams ];
  let   genURIStub               : SinonStub;
  let   genURIRet                : TypeGenURIRet;
  let   genURIExpectedArgs       : [ SinonStub, TypeGenURIParams ];
  let   genContentStub           : SinonStub;
  let   genContentRet            : TypeGenContentRet;
  let   genContentExpectedParams : TypeGenContentParams;
  let   genContentExpectedArgs   : [ SinonStub, TypeGenContentParams ];

  beforeEach( () => {
    commonBeforeEach();
    ( { testModule, testProps } = createTestModuleAndGetProps( [ testFnName ] ) );
    testFn          = testProps[ testFnName ];
    testStubs       = getPrivateStubs( testModule, [ 'genParams', 'genURI', 'genContent' ] );
    testHeaders     = {
      pheader1: 'pheader1 val',
    };
    testMethod = 'pOSt';
    testEndpointDef = {
      uri:     'ignored',
      method:  testMethod,
      headers: { epheader1: 'epheader1 val' },
    };
    testParams = { param1: 'test param1' };
    testArgs = {
      endpointDef: testEndpointDef,
      headers:     testHeaders,
      params:      testParams,
    };
    genParamsStub = sandbox.stub( testStubs, 'genParams' ).callsFake( () : object => {
      return genParamsRet;
    } );
    genParamsRet            = { uri: 'genParamsRet URI', params: { p1: 'genParamsRet params' } };
    genParamsExpectedParams = { endpointDef: testEndpointDef, params: testParams };
    genParamsExpectedArgs   = [ genParamsStub, genParamsExpectedParams ];
    genURIStub              = sandbox.stub( testStubs, 'genURI' ).callsFake( () => {
      return genURIRet;
    } );
    genURIExpectedArgs = [ genURIStub, { ...genParamsRet, method: testMethod.toUpperCase() } ];
    genURIRet          = { uri: 'genURIRet URI', params: { p1: 'genURIRet params' } };
    genContentStub     = sandbox.stub( testStubs, 'genContent' ).callsFake( () => {
      return genContentRet;
    } );
    genContentExpectedParams = { endpointDef: testEndpointDef, headers: testHeaders, params: <TypeHttpParams>(genURIRet.params) };
    genContentExpectedArgs   = [ genContentStub, genContentExpectedParams ];
    genContentRet            = { headers: { h1: 'genContent headers' }, body: 'genContent body' };
    testExpectedOptions      = { method: testMethod.toUpperCase(), headers: genContentRet.headers, body: <TypeHttpParams>(genContentRet.body) };
  });

  afterEach( () => {
    commonAfterEach();
  });

  it ( 'No body', () => {
    genContentRet.body = null;
    delete testExpectedOptions.body;
    expectedResult      = {
      uri:     genURIRet.uri,
      options: testExpectedOptions,
    };
    actualResult = testFn( testArgs );
    sinon.assert.calledWithExactly.apply( null, genParamsExpectedArgs );
    sinon.assert.calledWithExactly.apply( null, genURIExpectedArgs );
    sinon.assert.calledWithExactly.apply( null, genContentExpectedArgs );
    expect( actualResult ).to.deep.equal( expectedResult );
  });

  it ( 'Body', () => {
    expectedResult      = {
      uri:     genURIRet.uri,
      options: testExpectedOptions,
    };
    actualResult = testFn( testArgs );
    sinon.assert.calledWithExactly.apply( null, genParamsExpectedArgs );
    sinon.assert.calledWithExactly.apply( null, genURIExpectedArgs );
    sinon.assert.calledWithExactly.apply( null, genContentExpectedArgs );
    expect( actualResult ).to.deep.equal( expectedResult );
  });

  it ( 'No parameters or headers', () => {
    delete testArgs.params;
    delete testArgs.headers;
    genParamsExpectedParams.params   = {};
    genContentExpectedParams.headers = {};
    expectedResult      = {
      uri:     genURIRet.uri,
      options: testExpectedOptions,
    };
    actualResult = testFn( testArgs );
    sinon.assert.calledWithExactly.apply( null, genParamsExpectedArgs );
    sinon.assert.calledWithExactly.apply( null, genURIExpectedArgs );
    sinon.assert.calledWithExactly.apply( null, genContentExpectedArgs );
    expect( actualResult ).to.deep.equal( expectedResult );
  });
} );

describe(MODULE_NAME + ':extractJsonResponse', () => {
  let testModule     : TypeRewiredModule;
  let testResponse   : { json: () => object };
  let testJSON       : object;
  let actualResult   : object;
  let expectedResult : object;

  beforeEach( () => {
    commonBeforeEach();
    ( { testModule } = createTestModuleAndGetProps() );
    testJSON     = { p1: 'val1' };
    testResponse = { json: () => testJSON };
  });

  afterEach( () => {
    commonAfterEach();
  });

  it ( 'OK', async () => {
    expectedResult = testJSON;
    actualResult = await testModule.extractJsonResponse( testResponse );
    expect( actualResult ).to.deep.equal( expectedResult );
  });
} );

describe(MODULE_NAME + ':parseQueryParams', () => {
  let testModule     : TypeRewiredModule;
  let testArgs       : TypeParseQueryParamsParams;
  let actualResult   : TypeParseQueryParamsRet;
  let expectedResult : TypeParseQueryParamsRet;

  beforeEach( () => {
    commonBeforeEach();
    ( { testModule } = createTestModuleAndGetProps() );
    testArgs = {
      p_undef: undefined,
      p_true:  'TrUe',
      p_false: 'faLSe',
      p_num:   '23',
      p_arr:   [ '37', 'tRuE', 'FAlsE', 'fred' ],
    };
    expectedResult = {
      p_undef: null,
      p_true:  true,
      p_false: false,
      p_num:   '23',
      p_arr:   [ '37', true, false, 'fred' ],
    };
  });

  afterEach( () => {
    commonAfterEach();
  });

  it ( 'OK', () => {
    actualResult = testModule.parseQueryParams( testArgs );
    expect( actualResult ).to.deep.equal( expectedResult );
  } );

  it ( 'No parameters', () => {
    expectedResult = {};
    actualResult = testModule.parseQueryParams();
    expect( actualResult ).to.deep.equal( expectedResult );
  } );
} );

describe(MODULE_NAME + ':stringifyUTF16', () => {
  let testModule     : TypeRewiredModule;
  let testArgs       : object;
  let actualResult   : string;
  let expectedResult : string;

  beforeEach( () => {
    commonBeforeEach();
    ( { testModule } = createTestModuleAndGetProps() );
    testArgs         = {
      p1: "DwithCircle\u0221",
      p2: "Left half circle black \u25D6.",
    };
    expectedResult   = '{"p1":"DwithCircle\\u0221","p2":"Left half circle black \\u25d6."}';
  });

  afterEach( () => {
    commonAfterEach();
  });

  it ( 'OK', () => {
    actualResult = testModule.stringifyUTF16( testArgs );
    expect( actualResult ).to.equal( expectedResult );
  } );
} );
*/