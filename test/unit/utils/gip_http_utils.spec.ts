/**
 * DESCRIPTION:
 * Unit Tests for gip_http_utils.ts.
 */

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment    */
/* eslint-disable @typescript-eslint/no-explicit-any   */

import sinon, { SinonSandbox, SinonStub } from 'sinon';
import { expect }                         from 'chai';
import { rewiremock, AnyModuleMock }      from '../rewiremock.es6';

const REL_SRC_PATH = '../../../src/utils/';
const MODULE_NAME  = 'gip_http_utils.ts';
const TEST_MODULE  = REL_SRC_PATH + MODULE_NAME;
const TEST_PRIV_MODULE = REL_SRC_PATH + 'gip_http_utils_priv.ts';

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

type TypeProcessEndpointDefArgs = {
	endpointDef: TypeEndpointDef, params?: TypeRawHttpParams, headers?: TypeHttpHeaders,
};
type TypeProcessEndpointDefRet = TypeEndpoint;

type TypeRawQueryParamScalarValue    = string | null | undefined;
type TypeRawQueryParamValue          = TypeRawQueryParamScalarValue | string[];
type TypeRawQueryParams              = Partial<{ [key: string]: TypeRawQueryParamValue }>
type TypeCookedQueryParamScalarValue = string | boolean | null;
type TypeCookedQueryParamValue       = TypeCookedQueryParamScalarValue | (TypeCookedQueryParamScalarValue)[];
type TypeCookedQueryParams           = Record<string, TypeCookedQueryParamValue>;
type TypeParseQueryParamsParams      = TypeRawQueryParams;
type TypeParseQueryParamsRet         = TypeCookedQueryParams;



type TypeTestModule = {
	processEndpointDef:      ( args: TypeProcessEndpointDefArgs ) => TypeProcessEndpointDefRet,
	extractStringFromStream: () => {},
	stripQueryParams:        ( uri: string ) => string | null,
	genURI:                  ( { uri, queryParams } : { uri: string, queryParams: Record<string,string> } ) => string,
};

type TypeTestPrivModule = {
	genParams?:      Function,
	genURI?:         Function,
	containsHeader?: Function,
	genContent?:     Function,
};

async function createTestModule( stubs: Nullable<any> = null ) : Promise<TypeTestModule> {
	if ( stubs ) {
		const testPrivModule = await rewiremock( TEST_PRIV_MODULE ).by( stubs ) as unknown;
		rewiremock.enable();
		const testModule = await import( TEST_MODULE );
		//rewiremock.disable();
		return testModule;
	} else {
		const testModule = await import( TEST_MODULE );
		return testModule;
	}
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
describe(MODULE_NAME + ':processEndpointDef', () => {
	let   testModule               : TypeTestModule;
	let   testStubs                : TypeTestPrivModule;
	let   testArgs                 : TypeProcessEndpointDefArgs;
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

	beforeEach( async () => {
		commonBeforeEach();
		testStubs = {
			genParams:  () => {},
			genURI:     () => {},
			genContent: () => {},
		};
		testModule  = await createTestModule( testStubs );
		testHeaders = {
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
		expectedResult     = {
			uri:     genURIRet.uri,
			options: testExpectedOptions,
		};
		actualResult = testModule.processEndpointDef( testArgs );
		sinon.assert.calledWithExactly.apply( null, genParamsExpectedArgs );
		//sinon.assert.calledWithExactly.apply( null, genURIExpectedArgs );
		//sinon.assert.calledWithExactly.apply( null, genContentExpectedArgs );
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
*/
/*

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

describe(MODULE_NAME + ':stripQueryParams', () => {
	let testModule     : TypeTestModule;
	let testArgs       : string;
	let actualResult   : string | null;
	let expectedResult : string;

	beforeEach( async () => {
		commonBeforeEach();
		testModule = await createTestModule();
	});

	afterEach( () => {
		commonAfterEach();
	});

	it ( 'OK, URI not encoded', () => {
		testArgs = 'https://mydom.com/mypath?q1=fred&q2';
		expectedResult = 'https://mydom.com/mypath';
		actualResult   = testModule.stripQueryParams( testArgs );
		expect( actualResult ).to.equal( expectedResult );
	});

	it ( 'OK, URI encoded', () => {
		testArgs       = 'https%3A%2F%2Fmydom.com%2Fmypath%3Fq1%3Dfred%26q2';
		expectedResult = 'https://mydom.com/mypath';
		actualResult   = testModule.stripQueryParams( testArgs );
		expect( actualResult ).to.equal( expectedResult );
	});
} );

describe(MODULE_NAME + ':genURI', () => {
	let testModule     : TypeTestModule;
	let testArgs       : { uri: string, queryParams: Record<string,string> };
	let actualResult   : string | null;
	let expectedResult : string;

	beforeEach( async () => {
		commonBeforeEach();
		testModule = await createTestModule();
	});

	afterEach( () => {
		commonAfterEach();
	});

	it ( 'OK', () => {
		testArgs = {
			uri:         'https://mydom.com/mypath',
			queryParams: { q1: 'fred', q2: '' },
		};
		expectedResult = 'https://mydom.com/mypath?q1=fred&q2=';
		actualResult   = testModule.genURI( testArgs );
		expect( actualResult ).to.equal( expectedResult );
	});
} );
