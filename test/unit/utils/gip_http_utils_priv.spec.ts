/**
 * DESCRIPTION:
 * Unit Tests for gip_http_utils_priv.ts.
 */

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment    */
/* eslint-disable @typescript-eslint/no-explicit-any   */

import sinon, { SinonSandbox, SinonStub } from 'sinon';
import { expect }                         from 'chai';
//import rewiremock                         from '../rewiremock.es6';

const REL_SRC_PATH = '../../../src/utils/';
const MODULE_NAME  = 'gip_http_utils_priv.ts';
const TEST_MODULE  = REL_SRC_PATH + MODULE_NAME;

let sandbox : SinonSandbox;

import { TypeEndpointDef } from '../../../src/utils/gip_types';

type TypeGenParamsArgs      = { endpointDef: TypeEndpointDef, params?: TypeHttpParams };
type TypeGenParamsRet       = { uri: string, params: TypeHttpParams };
//type TypeGetContentRet    = { headers: TypeHttpHeaders, body: Nullable<TypeHttpParams> };
type TypeGenURIArgs         = { uri: string, method: string, params?: TypeHttpParams };
type TypeGenURIRet          = { uri: string, params: Nullable<TypeHttpParams> };
type TypeContainsHeaderArgs = { headers: TypeHttpHeaders, headerProp: string };
type TypeContainsHeaderRet  = boolean;
type TypeGenContentArgs     = { endpointDef: TypeEndpointDef, headers: TypeHttpHeaders, params: TypeHttpParams };
type TypeGenContentRet      = { headers: TypeHttpHeaders, body: Nullable<TypeHttpParams> };

type TypeTestModule = {
	genParams:      ( params: TypeGenParamsArgs )      => TypeGenParamsRet,
	genURI:         ( params: TypeGenURIArgs )         => TypeGenURIRet,
	containsHeader: ( params: TypeContainsHeaderArgs ) => TypeContainsHeaderRet,
	genContent:     ( params: TypeGenContentArgs )     => TypeGenContentRet,
};

async function createTestModule() : Promise<TypeTestModule> {
	const testModule = await import( TEST_MODULE );
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

describe(MODULE_NAME + ':genParams', () => {
	let   testModule            : TypeTestModule;
	let   testArgs              : TypeGenParamsArgs;
	let   testEndpointDef       : TypeEndpointDef;
	let   testURI               : string;
	let   testQueryParams       : string;
	let   testEndpointDefParams : TypeHttpParams;
	let   testParams            : TypeHttpParams;
	let   actualResult          : TypeGenParamsRet;
	let   actualErr             : Error;
	let   expectedResult        : object;
	let   expectedErrMessage;

	beforeEach( async () => {
		commonBeforeEach();
		testModule            = await createTestModule();
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
			actualResult = testModule.genParams( testArgs );
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
			actualResult = testModule.genParams( testArgs );
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
			actualResult = testModule.genParams( testArgs );
		}
		catch ( err ) {
			sinon.assert.fail( `Test should not fail: ${(<Error>err).message}` );
		}
		expect( actualResult ).to.deep.equal( expectedResult );
	});

	it ( 'Object parameters in endpoint def, object parameters passed in', () => {
		expectedResult = { uri: testURI, params: Object.assign( {}, JSON.parse( JSON.stringify(testEndpointDefParams) ), JSON.parse( JSON.stringify(testParams) ) ) };
		try {
			actualResult = testModule.genParams( testArgs );
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
			actualResult = testModule.genParams( testArgs );
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
			actualResult = testModule.genParams( testArgs );
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
			actualResult = testModule.genParams( testArgs );
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
			actualResult = testModule.genParams( testArgs );
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
			actualResult = testModule.genParams( testArgs );
		}
		catch ( err ) {
			actualErr = <Error>err;
		}
		expect( actualErr.message ).to.equal( expectedErrMessage );
	});
});

describe(MODULE_NAME + ':genURI', () => {
	let   testModule      : TypeTestModule;
	let   testArgs        : TypeGenURIArgs;
	let   testURI         : string;
	let   testQueryParams : string;
	let   testParams      : TypeRawHttpParams;
	let   actualResult    : TypeGenURIRet;
	let   expectedResult  : object;

	beforeEach( async () => {
		commonBeforeEach();
		testModule      = await createTestModule();
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
		actualResult = testModule.genURI( testArgs );
		( testArgs );
		expect( actualResult ).to.deep.equal( expectedResult );
	});

	it ( 'GET with params', () => {
		testArgs.uri = `${testURI}?${testQueryParams}`;
		actualResult = testModule.genURI( testArgs );
		expect( actualResult ).to.deep.equal( expectedResult );
	});

	it ( 'GET no params', () => {
		testArgs.uri = `${testURI}?${testQueryParams}`;
		expectedResult = {
			uri:    testURI,
			params: null,
		};
		delete testArgs.params;
		actualResult = testModule.genURI( testArgs );
		expect( actualResult ).to.deep.equal( expectedResult );
	});
});

describe(MODULE_NAME + ':containsHeader', () => {
	let   testModule:     TypeTestModule;
	let   testArgs:       TypeContainsHeaderArgs;
	let   testHeaders:    Record<string,string>;
	let   testHeaderProp: string = '';
	let   actualResult:   TypeContainsHeaderRet;
	let   expectedResult: TypeContainsHeaderRet;

	beforeEach( async () => {
		commonBeforeEach();
		testModule  = await createTestModule();
		testHeaders = {
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
		actualResult        = testModule.containsHeader( testArgs );
		expect( actualResult ).to.equal( expectedResult );
	});

	it ( 'Found', () => {
		testArgs.headerProp = 'heAdEr2';
		expectedResult      = true;
		actualResult        = testModule.containsHeader( testArgs );
		expect( actualResult ).to.equal( expectedResult );
	});
});

describe(MODULE_NAME + ':genContent', () => {
	let testModule      : TypeTestModule;
	let testArgs        : TypeGenContentArgs;
	let testParams      : TypeHttpParams;
	let testEndpointDef : TypeEndpointDef;
	let testHeaders     : TypeHttpHeaders;
	let actualResult    : TypeGenContentRet;
	let expectedResult  : TypeGenContentRet;

	beforeEach( async () => {
		commonBeforeEach();
		testModule = await createTestModule();
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
		actualResult = testModule.genContent( testArgs );
		expect( actualResult ).to.deep.equal( expectedResult );
	});

	it ( 'Content-Type in supplied header', () => {
		testHeaders[ 'Content-Type' ] = 'provided content type';
		expectedResult      = {
			headers: { pheader1: 'pheader1 val', epheader1: 'epheader1 val', 'Content-Type': 'provided content type' },
			body:    JSON.stringify( testParams ),
		};
		actualResult = testModule.genContent( testArgs );
		expect( actualResult ).to.deep.equal( expectedResult );
	});

	it ( 'Content-Type in endpoint def header', () => {
		// @ts-ignore
		testEndpointDef.headers[ 'Content-Type' ] = 'endpoint content type';
		// @ts-ignore
		delete testArgs.headers;
		expectedResult       = {
			headers: { epheader1: 'epheader1 val', 'Content-Type': 'endpoint content type' },
			body:    JSON.stringify( testParams ),
		};
		actualResult = testModule.genContent( testArgs );
		expect( actualResult ).to.deep.equal( expectedResult );
	} );

	it ( 'No Content-Type present, params already stringified', () => {
		// @ts-ignore
		delete testArgs.headers;
		testArgs.params = 'already stringified';
		expectedResult       = {
			headers: { epheader1: 'epheader1 val', 'Content-Type': 'text/plain; charset=UTF-8' },
			body:    testArgs.params,
		};
		actualResult = testModule.genContent( testArgs );
		expect( actualResult ).to.deep.equal( expectedResult );
	} );
	it ( 'No Content-Type present, params object', () => {
		// @ts-ignore
		delete testArgs.headers;
		expectedResult       = {
			headers: { epheader1: 'epheader1 val', 'Content-Type': 'application/json; charset=UTF-8' },
			body:    JSON.stringify( testArgs.params ),
		};
		actualResult = testModule.genContent( testArgs );
		expect( actualResult ).to.deep.equal( expectedResult );
	} );

	it ( 'No endpoint headers, no additonal params or headers', () => {
		// @ts-ignore
		delete testArgs.params;
		// @ts-ignore
		delete testArgs.headers;
		delete testEndpointDef.headers;
		//containsHeaderExpectedParamsArr[0].headers = {};
		//containsHeaderExpectedParamsArr[1].headers = {};
		//containsHeaderRetArr = [ false, false ];
		expectedResult = {
			headers: { 'Content-Type': 'application/json; charset=UTF-8' },
			body:    null,
		};
		actualResult = testModule.genContent( testArgs );
		expect( actualResult ).to.deep.equal( expectedResult );
	} );
} );
