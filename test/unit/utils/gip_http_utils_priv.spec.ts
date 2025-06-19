/**
 * DESCRIPTION:
 * Unit Tests for gip_http_utils_priv.ts.
 */
const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_http_utils_priv';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

import type {
	Nullable,
	Type_EndpointDef,
	Type_HttpHeaders,
	Type_HttpParams,
	Type_RawHttpParams,
} from '../../../src/utils/gip_types.ts';

import type {
	Type_genParams_args,
	Type_genParams_ret,
	Type_genURI_args,
	Type_genURI_ret,
	Type_containsHeader_args,
	Type_containsHeader_ret,
	Type_genContent_args,
	Type_genContent_ret,
} from '../../../src/utils/gip_http_utils_priv.ts';


interface Type_TestModule {
	genParams:      ( params: Type_genParams_args )      => Type_genParams_ret,
	genURI:         ( params: Type_genURI_args )         => Type_genURI_ret,
	containsHeader: ( params: Type_containsHeader_args ) => Type_containsHeader_ret,
	genContent:     ( params: Type_genContent_args )     => Type_genContent_ret,
};

import * as TEST_MODULE from '../../../src/utils/gip_http_utils_priv';
const testModule = TEST_MODULE as unknown as Type_TestModule;

function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

function commonAfterEach() : void {
	jest.restoreAllMocks();
	jest.resetModules();
}

function fail( err : Error | string ) : void {
	if ( typeof err === 'string' ) {
		throw new Error( err );
	} else {
		throw err;
	}
}

describe(MODULE_NAME + ':module can be loaded', () => {
	let testModuleObj : Type_TestModule;

	beforeEach( () => {
		commonBeforeEach();
	});

	afterEach( () => {
		commonAfterEach();
	});

	test('module initialises OK', async () => {
		await jest.isolateModulesAsync(async () => { // Load another instance of the module. This allows configuring a different environment
			testModuleObj = await import( TEST_MODULE_PATH ) as Type_TestModule;
		});
		expect( testModuleObj ).toBeDefined();
	});
});

describe(MODULE_NAME + ':genParams', () => {
	let testModuleObj         : Type_TestModule;
	let testArgs              : Type_genParams_args;
	let testEndpointDef       : Type_EndpointDef;
	let testURI               : string;
	let testQueryParams       : string;
	let testEndpointDefParams : Type_HttpParams;
	let testParams            : Type_HttpParams;
	let actualResult          : Type_genParams_ret;
	let actualErr             : Error;
	let expectedResult        : object;
	let expectedErrMessage;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj         = testModule;
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

	test( 'No parameters in endpoint def or passed in', () => {
		delete testEndpointDef.params;
		testArgs       = { endpointDef: testEndpointDef };
		expectedResult = { uri: testURI, params: {} };
		try {
			actualResult = testModuleObj.genParams( testArgs );
		}
		catch ( err ) {
			fail( `Test should not fail: ${(err as Error).message}` );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'No parameters in endpoint def, parameters passed in', () => {
		delete testEndpointDef.params;
		expectedResult = { uri: testURI, params: JSON.parse( JSON.stringify(testParams) ) as object };
		try {
			actualResult = testModuleObj.genParams( testArgs );
		}
		catch ( err ) {
			fail( `Test should not fail: ${(err as Error).message}` );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Parameters in endpoint def, no parameters passed in', () => {
		delete testArgs.params;
		expectedResult = { uri: testURI, params: JSON.parse( JSON.stringify(testEndpointDefParams) ) as object };
		try {
			actualResult = testModuleObj.genParams( testArgs );
		}
		catch ( err ) {
			fail( `Test should not fail: ${(err as Error).message}` );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Object parameters in endpoint def, object parameters passed in', () => {
		expectedResult = { uri: testURI, params: Object.assign( {}, JSON.parse( JSON.stringify(testEndpointDefParams) ), JSON.parse( JSON.stringify(testParams) ) ) as object };
		try {
			actualResult = testModuleObj.genParams( testArgs );
		}
		catch ( err ) {
			fail( `Test should not fail: ${(err as Error).message}` );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Error Endpoint def string params, object parameters passed in', () => {
		testEndpointDef.params = 'any old string';
		expectedErrMessage     = 'Type mismatch between fixed params and variable params';
		try {
			actualResult = testModuleObj.genParams( testArgs );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( actualErr.message ).toEqual( expectedErrMessage );
	});

	test( 'Error Endpoint def string params, string parameters passed in', () => {
		testEndpointDef.params = 'any old string';
		testArgs.params        = 'some other string' as unknown as Type_RawHttpParams; // A string is invalid, so force the assignment to test the error
		expectedErrMessage     = 'Invalid to specify both fixed string params and variable string params';
		try {
			actualResult = testModuleObj.genParams( testArgs );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( actualErr.message ).toEqual( expectedErrMessage );
	});

	test( 'Query parameters in URI', () => {
		delete testArgs.params;
		delete testEndpointDef.params;
		testEndpointDef.uri = `${testURI}?${testQueryParams}`;
		expectedResult      = { uri: testURI, params: { qparam1: 'qval1', qparam2: null } };
		try {
			actualResult = testModuleObj.genParams( testArgs );
		}
		catch ( err ) {
			fail( `Test should not fail: ${(err as Error).message}` );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Query parameters in URI, endpoint def params', () => {
		delete testArgs.params;
		testEndpointDef.uri = `${testURI}?${testQueryParams}`;
		expectedResult      = { uri: testURI, params: { qparam1: 'qval1', qparam2: null, epd_param1: 'epdvalue1' } };
		try {
			actualResult = testModuleObj.genParams( testArgs );
		}
		catch ( err ) {
			fail( `Test should not fail: ${(err as Error).message}` );
		}
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Error Endpoint def string params, query parameters in URI', () => {
		delete testArgs.params;
		testEndpointDef.params = 'any old string';
		testEndpointDef.uri    = `${testURI}?${testQueryParams}`;
		expectedErrMessage     = 'Type mismatch between endpoint params and query params';
		try {
			actualResult = testModuleObj.genParams( testArgs );
		}
		catch ( err ) {
			actualErr = err as Error;
		}
		expect( actualErr.message ).toEqual( expectedErrMessage );
	});

	test( 'Empty query parameter in URI', () => {
		delete testArgs.params;
		testQueryParams = 'qnovalue=';
		testEndpointDef.uri = `${testURI}?${testQueryParams}`;
		expectedResult      = { uri: testURI, params: { qnovalue: null, epd_param1: 'epdvalue1' } };
		try {
			actualResult = testModuleObj.genParams( testArgs );
		}
		catch ( err ) {
			fail( `Test should not fail: ${(err as Error).message}` );
		}
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':genURI', () => {
	let testModuleObj   : Type_TestModule;
	let testArgs        : Type_genURI_args;
	let testURI         : string;
	let testQueryParams : string;
	let testParams      : Type_RawHttpParams;
	let actualResult    : Type_genURI_ret;
	let expectedResult  : object;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj   = testModule;
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

	test( 'Not GET', () => {
		testArgs.uri    = testURI;
		testArgs.method = 'POST';
		expectedResult  = { uri: testURI, params: testParams };
		actualResult    = testModuleObj.genURI( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'GET with params', () => {
		testArgs.uri = `${testURI}?${testQueryParams}`;
		actualResult = testModuleObj.genURI( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'GET no params', () => {
		testArgs.uri = `${testURI}?${testQueryParams}`;
		expectedResult = {
			uri:    testURI,
			params: null,
		};
		delete testArgs.params;
		actualResult = testModuleObj.genURI( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':containsHeader', () => {
	let testModuleObj  : Type_TestModule;
	let testArgs       : Type_containsHeader_args;
	let testHeaders    : Record<string,string>;
	let actualResult   : Type_containsHeader_ret;
	let expectedResult : Type_containsHeader_ret;

	const testHeaderProp = '';

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
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

	test( 'Not found', () => {
		testArgs.headerProp = 'header3';
		expectedResult      = false;
		actualResult        = testModuleObj.containsHeader( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Found', () => {
		testArgs.headerProp = 'heAdEr2';
		expectedResult      = true;
		actualResult        = testModuleObj.containsHeader( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':genContent', () => {
	let testModuleObj   : Type_TestModule;
	let testArgs        : Type_genContent_args;
	let testParams      : Type_HttpParams;
	let testEndpointDef : Type_EndpointDef;
	let testHeaders     : Type_HttpHeaders;
	let actualResult    : Type_genContent_ret;
	let expectedResult  : Type_genContent_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		testHeaders   = {
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

	test( 'GET', () => {
		testEndpointDef.method = 'GET';
		expectedResult      = {
			headers: { pheader1: 'pheader1 val', epheader1: 'epheader1 val', },
			body:    JSON.parse(JSON.stringify(testParams)) as Nullable<Type_HttpParams>,
		};
		actualResult = testModuleObj.genContent( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Content-Type in supplied header', () => {
		testHeaders[ 'Content-Type' ] = 'provided content type';
		expectedResult      = {
			headers: { pheader1: 'pheader1 val', epheader1: 'epheader1 val', 'Content-Type': 'provided content type' },
			body:    JSON.stringify( testParams ),
		};
		actualResult = testModuleObj.genContent( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Content-Type in endpoint def header', () => {
		testEndpointDef.headers = testEndpointDef.headers ?? {};
		testEndpointDef.headers[ 'Content-Type' ] = 'endpoint content type';
		delete testArgs.headers;
		expectedResult       = {
			headers: { epheader1: 'epheader1 val', 'Content-Type': 'endpoint content type' },
			body:    JSON.stringify( testParams ),
		};
		actualResult = testModuleObj.genContent( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	} );

	test( 'No Content-Type present, params already stringified', () => {
		delete testArgs.headers;
		testArgs.params = 'already stringified';
		expectedResult       = {
			headers: { epheader1: 'epheader1 val', 'Content-Type': 'text/plain; charset=UTF-8' },
			body:    testArgs.params,
		};
		actualResult = testModuleObj.genContent( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	} );
	test( 'No Content-Type present, params object', () => {
		delete testArgs.headers;
		expectedResult       = {
			headers: { epheader1: 'epheader1 val', 'Content-Type': 'application/json; charset=UTF-8' },
			body:    JSON.stringify( testArgs.params ),
		};
		actualResult = testModuleObj.genContent( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	} );

	test( 'No endpoint headers, no additonal params or headers', () => {
		delete testArgs.params;
		delete testArgs.headers;
		delete testEndpointDef.headers;
		//containsHeaderExpectedParamsArr[0].headers = {};
		//containsHeaderExpectedParamsArr[1].headers = {};
		//containsHeaderRetArr = [ false, false ];
		expectedResult = {
			headers: { 'Content-Type': 'application/json; charset=UTF-8' },
			body:    null,
		};
		actualResult = testModuleObj.genContent( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	} );
} );
