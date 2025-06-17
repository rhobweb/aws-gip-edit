/**
 * DESCRIPTION:
 * Unit Tests for gip_date_utils.ts.
 */
import sinon, { SinonSandbox } from 'sinon';
import { expect }              from 'chai';

const REL_SRC_PATH = '../../../src/utils/';
const MODULE_NAME  = 'gip_date_utils.ts';
const TEST_MODULE  = REL_SRC_PATH + MODULE_NAME;

let sandbox : SinonSandbox;

type TypeTestModule = {
	getCurrentDayOfWeek:  Function,
	isDayOfWeekAvailable: Function,
};

async function createTestModule() : Promise<TypeTestModule> {
	const testModule = ( await import( TEST_MODULE ) ).default;
	return testModule;
}

const ARR_DAY_OF_WEEK     = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
const CURRENT_DAY_OF_WEEK = ARR_DAY_OF_WEEK[ (new Date()).getDay() ];

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

describe(MODULE_NAME + ':getCurrentDayOfWeek', () => {
	let testModule : TypeTestModule;
	let actualResult;
	let expectedResult;
	let testArgs;

	beforeEach( async () => {
		commonBeforeEach();
		testModule = await createTestModule();
	});

	afterEach( () => {
		commonAfterEach();
	});

	it ( 'Default to today', () => {
		expectedResult = CURRENT_DAY_OF_WEEK;
		actualResult   = testModule.getCurrentDayOfWeek();
		expect( actualResult ).to.equal( expectedResult );
	});

	it ( 'Date specified', () => {
		expectedResult = 'Wed';
		testArgs       = { dt: new Date( '2022-04-06' ) };
		actualResult   = testModule.getCurrentDayOfWeek( testArgs );
		expect( actualResult ).to.equal( expectedResult );
	});

	it ( 'Date and positive offset specified', () => {
		expectedResult = 'Tue';
		testArgs       = { dt: new Date( '2022-04-06' ), iOffset: 6 };
		actualResult   = testModule.getCurrentDayOfWeek( testArgs );
		expect( actualResult ).to.equal( expectedResult );
	});

	it ( 'Date and negative offset specified', () => {
		expectedResult = 'Thu';
		testArgs       = { dt: new Date( '2022-04-06' ), iOffset: -20 };
		actualResult   = testModule.getCurrentDayOfWeek( testArgs );
		expect( actualResult ).to.equal( expectedResult );
	});
});

describe(MODULE_NAME + ':isDayOfWeekAvailable', () => {
	let testModule : TypeTestModule;
	let actualResult;
	let expectedResult;
	let testArgs;

	beforeEach( async () => {
		commonBeforeEach();
		testModule = await createTestModule();
	});

	afterEach( () => {
		commonAfterEach();
	});

	it ( 'Default to today', () => {
		testArgs       = { checkDay: CURRENT_DAY_OF_WEEK };
		expectedResult = true;
		actualResult   = testModule.isDayOfWeekAvailable( testArgs );
		expect( actualResult ).to.equal( expectedResult );
	});

	it ( 'Within default threshold', () => {
		testArgs       = { checkDay: 'Fri', currDay: 'Sun' };
		expectedResult = true;
		actualResult   = testModule.isDayOfWeekAvailable( testArgs );
		expect( actualResult ).to.equal( expectedResult );
	});

	it ( 'Outside default threshold', () => {
		testArgs       = { checkDay: 'Fri', currDay: 'Mon' };
		expectedResult = false;
		actualResult   = testModule.isDayOfWeekAvailable( testArgs );
		expect( actualResult ).to.equal( expectedResult );
	});

	it ( 'Within custom threshold', () => {
		testArgs       = { checkDay: 'Fri', currDay: 'Mon', numDaysThreshold: 3 };
		expectedResult = true;
		actualResult   = testModule.isDayOfWeekAvailable( testArgs );
		expect( actualResult ).to.equal( expectedResult );
	});
});
