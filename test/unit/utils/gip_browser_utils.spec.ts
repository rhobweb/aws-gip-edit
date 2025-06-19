/**
 * DESCRIPTION:
 * Unit Tests for utils/gip_browser_utils.ts.
 */
const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_browser_utils';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

import type {
	Type_BrowserInfo,
	Type_UserAgentMap,
	Type_parseUserAgent_args,
	Type_parseUserAgent_ret,
	Type_searchMap_ret,
	Type_determineOS_args,
	Type_determineOS_ret,
	Type_os_is_IOS_args,
	Type_os_is_IOS_ret,
	Type_getBrowserInfoFromUserAgent_args,
	Type_getBrowserInfoFromUserAgent_ret,
	Type_BrowserInfo_ret,
} from '../../../src/utils/gip_browser_utils';

interface Type_TestModuleDefaultDefs {
	getBrowserInfo: () => Type_BrowserInfo_ret,
};

interface Type_TestModulePrivateDefs {
	parseUserAgent              : ( args : Type_parseUserAgent_args ) => Type_parseUserAgent_ret,
	searchMap                   : ( map : Type_UserAgentMap, searchItem : string ) => Type_searchMap_ret,
	determineOS                 : ( args : Type_determineOS_args ) => Type_determineOS_ret,
	os_is_IOS                   : ( os : Type_os_is_IOS_args ) => Type_os_is_IOS_ret,
	getBrowserInfoFromUserAgent : ( userAgent : Type_getBrowserInfoFromUserAgent_args ) => Type_getBrowserInfoFromUserAgent_ret,
};

interface Type_TestModule {
	default:        Type_TestModuleDefaultDefs,
	privateDefs:    Type_TestModulePrivateDefs,
	getBrowserInfo: () => Type_BrowserInfo_ret,
};

import * as TEST_MODULE from '../../../src/utils/gip_browser_utils';
const testModule = TEST_MODULE as unknown as Type_TestModule;

function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

function commonAfterEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
	jest.restoreAllMocks();
	jest.resetModules();
}

describe(MODULE_NAME + ':module can be loaded', () => {
	let testModuleObj : Type_TestModule;

	beforeEach( () => {
		commonBeforeEach();
	});

	afterEach( () => {
		commonAfterEach();
	});

	it ('module initialises OK', async () => {
		await jest.isolateModulesAsync(async () => { // Load another instance of the module. This allows configuring a different environment
			testModuleObj = await import( TEST_MODULE_PATH ) as Type_TestModule;
		});
		expect( testModuleObj ).toBeDefined();
	});
});

describe(MODULE_NAME + ':parseUserAgent', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_parseUserAgent_ret;
	let expectedResult : Type_parseUserAgent_ret;
	let testArgs       : Type_parseUserAgent_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Not found', () => {
		testArgs       = 'Unknown user agent';
		expectedResult = [ 'unknown', '' ];
		actualResult   = testModuleObj.parseUserAgent( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Windows 10', () => {
		testArgs       = 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko';
		expectedResult = [ 'Windows NT 10.0', ' WOW64; Trident/7.0; rv:11.0) like Gecko' ];
		actualResult   = testModuleObj.parseUserAgent( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Windows 6.3', () => {
		testArgs       = 'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; MATBJS; rv:11.0) like Gecko';
		expectedResult = [ 'Windows NT 6.3', ' WOW64; Trident/7.0; MATBJS; rv:11.0) like Gecko' ];
		actualResult   = testModuleObj.parseUserAgent( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Ubuntu Linux', () => {
		testArgs       = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/604.1 (KHTML, like Gecko) Version/11.0 Safari/604.1 Ubuntu/17.04 (3.24.1-0ubuntu1) Epiphany/3.24.1';
		expectedResult = [ 'X11', ' Linux x86_64) AppleWebKit/604.1 (KHTML, like Gecko) Version/11.0 Safari/604.1 Ubuntu/17.04 (3.24.1-0ubuntu1) Epiphany/3.24.1' ];
		actualResult   = testModuleObj.parseUserAgent( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':searchMap', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_searchMap_ret;
	let expectedResult : Type_searchMap_ret;
	const testMap      : Type_UserAgentMap = {
		'os type one(\\.[0-9]|)': 'OS 1',
		'os type two':            [ 'OS 2', { 'CriOS': 'iOS' } ],
		'os type three':          'OS 3',
	};
	let testSearchItem : string;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Not found', () => {
		testSearchItem = 'Unknown OS';
		expectedResult = null;
		actualResult   = testModuleObj.searchMap( testMap, testSearchItem );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Search with regex optional text', () => {
		testSearchItem = 'Start bit os type one.8 then some other text';
		expectedResult = 'OS 1';
		actualResult   = testModuleObj.searchMap( testMap, testSearchItem );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Search without regex optional text', () => {
		testSearchItem = 'Start bit os type one then some other text';
		expectedResult = 'OS 1';
		actualResult   = testModuleObj.searchMap( testMap, testSearchItem );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Find array item', () => {
		testSearchItem = 'Start bit os type two then some other text';
		expectedResult = [ 'OS 2', { 'CriOS': 'iOS' } ];
		actualResult   = testModuleObj.searchMap( testMap, testSearchItem );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Find plain item at start', () => {
		testSearchItem = 'os type three then some other text';
		expectedResult = 'OS 3';
		actualResult   = testModuleObj.searchMap( testMap, testSearchItem );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Find plain item at end', () => {
		testSearchItem = 'Start text then os type three';
		expectedResult = 'OS 3';
		actualResult   = testModuleObj.searchMap( testMap, testSearchItem );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':determineOS', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_determineOS_ret;
	let expectedResult : Type_determineOS_ret;
	let testArgs       : Type_determineOS_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Not found', () => {
		testArgs       = 'Not a known OS';
		expectedResult = 'Unknown OS Platform';
		actualResult   = testModuleObj.determineOS( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Windows 10', () => {
		testArgs       = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';
		expectedResult = 'Windows 10';
		actualResult   = testModuleObj.determineOS( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Macintosh', () => {
		testArgs       = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15';
		expectedResult = 'Mac OS X';
		actualResult   = testModuleObj.determineOS( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'iOS Chrome', () => {
		testArgs       = 'Mozilla/5.0 (Macintosh; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/111.0.5563.72 Mobile/15E148 Safari/604.1';
		expectedResult = 'iOS';
		actualResult   = testModuleObj.determineOS( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':os_is_IOS', () => {
	let testModuleObj     : Type_TestModulePrivateDefs;
	let actualResult   : Type_os_is_IOS_ret;
	let expectedResult : Type_os_is_IOS_ret;
	let testArgs       : Type_os_is_IOS_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Unknown OS Platform', () => {
		testArgs       = 'Unknown OS Platform';
		expectedResult = false;
		actualResult   = testModuleObj.os_is_IOS( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Mac OS X', () => {
		testArgs       = 'Mac OS X';
		expectedResult = false;
		actualResult   = testModuleObj.os_is_IOS( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'iPhone', () => {
		testArgs       = 'iPhone';
		expectedResult = true;
		actualResult   = testModuleObj.os_is_IOS( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'iPod', () => {
		testArgs       = 'iPod';
		expectedResult = true;
		actualResult   = testModuleObj.os_is_IOS( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'iPad', () => {
		testArgs       = 'iPad';
		expectedResult = true;
		actualResult   = testModuleObj.os_is_IOS( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':getBrowserInfoFromUserAgent', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let actualResult   : Type_getBrowserInfoFromUserAgent_ret;
	let expectedResult : Type_getBrowserInfoFromUserAgent_ret;
	let testArgs       : Type_getBrowserInfoFromUserAgent_args;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Unknown OS Platform', () => {
		testArgs       = 'Unknown OS Platform';
		expectedResult = {
			os:   'Unknown OS Platform',
			isIOS: false,
		};
		actualResult   = testModuleObj.getBrowserInfoFromUserAgent( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Macintosh', () => {
		testArgs       = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15';
		expectedResult = {
			os:   'Mac OS X',
			isIOS: false,
		};
		actualResult   = testModuleObj.getBrowserInfoFromUserAgent( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'iPhone', () => {
		testArgs       = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/36.0  Mobile/15E148 Safari/605.1.15';
		expectedResult = {
			os:   'iPhone',
			isIOS: true,
		};
		actualResult   = testModuleObj.getBrowserInfoFromUserAgent( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':getBrowserInfo', () => {
	let testModuleObj  : Type_TestModuleDefaultDefs;
	let actualResult   : Type_BrowserInfo;
	let expectedResult : Type_BrowserInfo;
	let navigatorMock	 : Navigator;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
		// Eslint moans about the class prototype being lost, but don't care about that for this test
		navigatorMock = { ...window.navigator }; // eslint-disable-line @typescript-eslint/no-misused-spread
		jest.spyOn( window, 'navigator', 'get' ).mockReturnValue( navigatorMock );
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Default', () => {
		expectedResult = {
			os:    'Unknown OS Platform',
			isIOS: false,
		};
		actualResult = testModuleObj.getBrowserInfo();
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Windows 10', () => {
		expectedResult = {
			os:    'Windows 10',
			isIOS: false,
		};
		// @ts-expect-error userAgent is mocked and is no longer readonly
		navigatorMock.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';
		actualResult = testModuleObj.getBrowserInfo();
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'iPhone 12', () => {
		expectedResult = {
			os:    'iPhone',
			isIOS: true,
		};
		// @ts-expect-error userAgent is mocked and is no longer readonly
		navigatorMock.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/36.0  Mobile/15E148 Safari/605.1.15';
		actualResult = testModuleObj.getBrowserInfo();
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Mac OS X', () => {
		expectedResult = {
			os:    'Mac OS X',
			isIOS: false,
		};
		// @ts-expect-error userAgent is mocked and is no longer readonly
		navigatorMock.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';;
		actualResult = testModuleObj.getBrowserInfo();
		expect( actualResult ).toEqual( expectedResult );
	});
});
