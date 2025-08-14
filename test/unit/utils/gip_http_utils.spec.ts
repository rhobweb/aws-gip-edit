/**
 * DESCRIPTION:
 * Unit Tests for gip_http_utils.ts.
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_http_utils';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Imports

import {jest} from '@jest/globals'; // For isolateModulesAsync

//import * as TEST_MODULE from '../../../src/utils/gip_http_utils';
import * as TEST_MODULE from '#utils/gip_http_utils';

//import { HttpError } from '../../../src/utils/gip_http_utils';
import { HttpError } from '#utils/gip_http_utils';

////////////////////////////////////////////////////////////////////////////////
// Types

import type {
	Nullable,
	Type_EndpointDef,
	Type_EndpointOptions,
	Type_HttpParams,
	Type_HttpHeaders,
//} from '../../../src/utils/gip_types.ts';
} from '#utils/gip_types';

import type {
	Type_processEndpointDef_args,
	Type_processEndpointDef_ret,
	Type_extractJsonResponse_args,
	Type_extractJsonResponse_ret,
	Type_extractJsonResponseStream_args,
	Type_extractJsonResponseStream_ret,
	Type_parseQueryParams_args,
	Type_parseQueryParams_ret,
	Type_stringify_args,
	Type_stringify_ret,
	Type_stripQueryParams_args,
	Type_stripQueryParams_ret,
	Type_genURI_args,
	Type_genURI_ret,
//} from '../../../src/utils/gip_http_utils';
} from '#utils/gip_http_utils';

interface Type_TestModule {
	processEndpointDef:        ( args: Type_processEndpointDef_args )        => Type_processEndpointDef_ret,
	extractJsonResponse:       ( args: Type_extractJsonResponse_args )       => Type_extractJsonResponse_ret,
	extractJsonResponseStream: ( args: Type_extractJsonResponseStream_args ) => Type_extractJsonResponseStream_ret,
	parseQueryParams:          ( args: Type_parseQueryParams_args )          => Type_parseQueryParams_ret,
	stringify:                 ( args: Type_stringify_args )                 => Type_stringify_ret,
	stripQueryParams:          ( args: Type_stripQueryParams_args )          => Type_stripQueryParams_ret,
	genURI:                    ( args: Type_genURI_args )                    => Type_genURI_ret,
};

////////////////////////////////////////////////////////////////////////////////
// Constants

const TEST_URI = 'http://localhost';

////////////////////////////////////////////////////////////////////////////////
// Definitions

const testModule = TEST_MODULE as unknown as Type_TestModule;

////////////////////////////////////////////////////////////////////////////////
// Test utilities

function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

function commonAfterEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

////////////////////////////////////////////////////////////////////////////////
// Tests

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

describe(MODULE_NAME + ':HttpError', () => {
	const statusCode = 418;
	let errMessage = 'An error message';

	beforeEach( () => {
		commonBeforeEach();
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Status code', () => {
		const err = new HttpError( { statusCode, message: errMessage } );
		expect( err.message ).toEqual( errMessage );
		expect( err.statusCode! ).toEqual( statusCode ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
	});

	test( 'No status code', () => {
		errMessage = 'Status code is undefined';
		const err = new HttpError( { message: errMessage } );
		expect( err.message ).toEqual( errMessage );
		expect( err.statusCode ).toBeUndefined();
	});
} );

describe(MODULE_NAME + ':processEndpointDef', () => {
	let testModuleObj       : Type_TestModule;
	let testArgs            : Type_processEndpointDef_args;
	let testExpectedOptions : Type_EndpointOptions;
	let testEndpointDef     : Type_EndpointDef;
	let testMethod          : string;
	let testParams          : Type_HttpParams;
	let testHeaders         : Type_HttpHeaders;
	let actualResult        : Type_processEndpointDef_ret;
	let expectedResult      : Type_processEndpointDef_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		testHeaders = {
			pheader1: 'pheader1 val',
		};
		testMethod = 'pOSt';
		testEndpointDef = {
			uri:     'test-uri',
			method:  testMethod,
			headers: { epheader1: 'epheader1 val' },
		};
		testParams = { param1: 'test param1' };
		testArgs = {
			endpointDef: testEndpointDef,
			headers:     testHeaders,
			params:      testParams,
		};
		testExpectedOptions = {
			method:  testMethod.toUpperCase(),
			headers: Object.assign( {}, testEndpointDef.headers, { 'Content-Type': 'application/json; charset=UTF-8' } ),
			body:    JSON.stringify( testParams ),
		};
		expectedResult = {
			uri:     testEndpointDef.uri,
			options: testExpectedOptions,
		};
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'POST - no body', () => {
		delete testArgs.params;
		testExpectedOptions.body = '{}';
		Object.assign( testExpectedOptions.headers ??= {}, testHeaders );
		actualResult = testModuleObj.processEndpointDef( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'POST - body', () => {
		Object.assign( testExpectedOptions.headers ??= {}, testHeaders );
		actualResult = testModuleObj.processEndpointDef( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'POST - No parameters or headers', () => {
		delete testArgs.params;
		delete testArgs.headers;
		testExpectedOptions.body = '{}';
		actualResult = testModuleObj.processEndpointDef( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'GET - with no parameters', () => {
		testEndpointDef.method = 'GeT';
		delete testArgs.params;
		expectedResult.uri = new URL(testEndpointDef.uri, TEST_URI).href;
		testExpectedOptions.method = 'GET';
		delete testExpectedOptions.body;
		Object.assign( testExpectedOptions.headers ??= {}, testHeaders );
		actualResult = testModuleObj.processEndpointDef( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'GET - with no additional headers', () => {
		testEndpointDef.method = 'GeT';
		delete testArgs.headers;
		expectedResult.uri = (new URL(testEndpointDef.uri, TEST_URI).href) + '?param1=test%20param1';
		testExpectedOptions.method = 'GET';
		delete testExpectedOptions.body;
		actualResult = testModuleObj.processEndpointDef( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
} );

describe(MODULE_NAME + ':extractJsonResponse', () => {
	let testModuleObj   : Type_TestModule;
	let testArgs        : MockArgs;
	let testError       : Nullable<Error>;
	let actualResult    : Awaited<Type_extractJsonResponse_ret>;
	let expectedResult  : Awaited<Type_extractJsonResponse_ret>;
	let testJsonArgs    : object;

	// Don't need a full fetch API Response object for this test, so just mock a class with the required properties
	class MockArgs {
		async json() : Promise<object> { // eslint-disable-line @typescript-eslint/require-await
			if ( ! testError ) {
				return testJsonArgs;
			} else {
				throw testError;
			}
		}
	}

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		testJsonArgs  = { p1: 'val1' };
		testError     = new Error( 'test error' );
		testArgs      = new MockArgs();
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK', async () => {
		testError      = null;
		expectedResult = { ...testJsonArgs };
		// Don't need a full fetch API Response object for this test, so just cast the cut down object to the expected type
		actualResult = await testModuleObj.extractJsonResponse( testArgs as Type_extractJsonResponse_args );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Error', async () => {
		expectedResult = [];
		// Don't need a full fetch API Response object for this test, so just cast the cut down object to the expected type
		actualResult = await testModuleObj.extractJsonResponse( testArgs as Type_extractJsonResponse_args );
		expect( actualResult ).toEqual( expectedResult );
	});
} );

describe(MODULE_NAME + ':extractJsonResponseStream', () => {
	let testModuleObj  : Type_TestModule;
	let testArgs       : MockArgs;
	let testError      : Nullable<Error>;
	let actualResult   : Awaited<Type_extractJsonResponseStream_ret>;
	let expectedResult : Awaited<Type_extractJsonResponseStream_ret>;
	let testJson       : Record<string,unknown>;
	let testTextArgs   : string;

	// Don't need a full fetch API Response object for this test, so just mock a class with the required properties
	class MockArgs {
		async text() : Promise<string> { // eslint-disable-line @typescript-eslint/require-await
			if ( ! testError ) {
				return testTextArgs;
			} else {
				throw testError;
			}
		}
	}

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		testJson      = { p1: 'val1' };
		testTextArgs  = JSON.stringify( testJson );
		testError     = new Error( 'test error' );
		testArgs      = new MockArgs();
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK', async () => {
		testError      = null;
		expectedResult = testJson;
		// Don't need a full fetch API Response object for this test, so just cast the cut down object to the expected type
		actualResult = await testModuleObj.extractJsonResponseStream( testArgs as Type_extractJsonResponseStream_args );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Error', async () => {
		expectedResult = {
			message: 'test error',
		};
		// Don't need a full fetch API Response object for this test, so just cast the cut down object to the expected type
		actualResult = await testModuleObj.extractJsonResponseStream( testArgs as Type_extractJsonResponseStream_args );
		expect( actualResult ).toEqual( expectedResult );
	});
} );

describe(MODULE_NAME + ':parseQueryParams', () => {
	let testModuleObj  : Type_TestModule;
	let testArgs       : Type_parseQueryParams_args;
	let actualResult   : Type_parseQueryParams_ret;
	let expectedResult : Type_parseQueryParams_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
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

	test( 'OK', () => {
		actualResult = testModuleObj.parseQueryParams( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	} );

	test( 'Undefined args', () => {
		testArgs       = undefined;
		expectedResult = {};
		actualResult = testModuleObj.parseQueryParams( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	} );

	test( 'Null args', () => {
		testArgs       = null;
		expectedResult = {};
		actualResult = testModule.parseQueryParams( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	} );
} );

describe(MODULE_NAME + ':stringify', () => {
	let testModuleObj  : Type_TestModule;
	let testArgs       : Type_stringify_args;
	let actualResult   : Type_stringify_ret;
	let expectedResult : Type_stringify_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		testArgs = {
			p1: "DwithCircle\u0221",
			p2: "Left half circle black \u25D6.",
		};
		expectedResult   = '{"p1":"DwithCircle\\u0221","p2":"Left half circle black \\u25d6."}';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK', () => {
		actualResult = testModuleObj.stringify( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	} );
} );

describe(MODULE_NAME + ':stripQueryParams', () => {
	let testModuleObj  : Type_TestModule;
	let testArgs       : Type_stripQueryParams_args;
	let actualResult   : Type_stripQueryParams_ret;
	let expectedResult : Type_stripQueryParams_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK, URI not encoded', () => {
		testArgs       = 'https://mydom.com/mypath?q1=fred&q2';
		expectedResult = 'https://mydom.com/mypath';
		actualResult   = testModuleObj.stripQueryParams( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'OK, URI encoded', () => {
		testArgs       = 'https%3A%2F%2Fmydom.com%2Fmypath%3Fq1%3Dfred%26q2';
		expectedResult = 'https://mydom.com/mypath';
		actualResult   = testModuleObj.stripQueryParams( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
} );

describe(MODULE_NAME + ':genURI', () => {
	let testModuleObj  : Type_TestModule;
	let testArgs       : Type_genURI_args;
	let actualResult   : Type_genURI_ret;
	let expectedResult : Type_genURI_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'OK', () => {
		testArgs = {
			uri:         'https://mydom.com/mypath',
			queryParams: { q1: 'fred', q2: '' },
		};
		expectedResult = 'https://mydom.com/mypath?q1=fred&q2=';
		actualResult   = testModuleObj.genURI( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
} );
