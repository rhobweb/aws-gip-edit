/**
 * DESCRIPTION:
 * Unit Tests for utils/gip_prog_edit_utils.ts.
 */

////////////////////////////////////////////////////////////////////////////////
// Test module constants

const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_prog_edit_utils.ts';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

import type {
	Type_convertToCamelCase_args,
	Type_convertToCamelCase_ret,
	Type_elementClassTagMatches_args,
	Type_elementClassTagMatches_ret,
	Type_getProgDetailsFromLink_args,
	Type_getProgDetailsFromLink_ret,
	Type_getDecendentsByTagNameAndClassTag_args,
	Type_getDecendentsByTagNameAndClassTag_ret,
	Type_extractElementText_args,
	Type_extractElementText_ret,
	Type_extractElementImageURI_args,
	Type_extractElementImageURI_ret,
	Type_preProcessEpisode_args,
	Type_preProcessEpisode_ret,
	Type_cookEpisode_args,
	Type_cookEpisode_ret,
	Type_cookRawEpisode_args,
	Type_cookRawEpisode_ret,
	Type_cookSynopsis_args,
	Type_cookSynopsis_ret,
} from '../../../src/utils/gip_prog_edit_utils';

////////////////////////////////////////
// Test module types
interface Type_TestModulePrivateDefs {
	convertToCamelCase:                ( args: Type_convertToCamelCase_args )                => Type_convertToCamelCase_ret,
	elementClassTagMatches:            ( args: Type_elementClassTagMatches_args )            => Type_elementClassTagMatches_ret,
	getDecendentsByTagNameAndClassTag: ( args: Type_getDecendentsByTagNameAndClassTag_args ) => Type_getDecendentsByTagNameAndClassTag_ret,
	extractElementText:                ( args: Type_extractElementText_args )                => Type_extractElementText_ret,
	extractElementImageURI:            ( args: Type_extractElementImageURI_args )            => Type_extractElementImageURI_ret,
	preProcessEpisode:                 ( args: Type_preProcessEpisode_args )                 => Type_preProcessEpisode_ret,
	cookEpisode:                       ( args: Type_cookEpisode_args )                       => Type_cookEpisode_ret,
	cookRawEpisode:                    ( args: Type_cookRawEpisode_args )                    => Type_cookRawEpisode_ret,
};

interface Type_TestModule {
	privateDefs: Type_TestModulePrivateDefs,
	getProgDetailsFromLink: ( args: Type_getProgDetailsFromLink_args ) => Type_getProgDetailsFromLink_ret,
	cookSynopsis:           ( args: Type_cookSynopsis_args )           => Type_cookSynopsis_ret,
};

////////////////////////////////////////////////////////////////////////////////
// Imports

import { // TODO: These may not work client-side
	TextEncoder as NodeTextEncoder,
	TextDecoder as NodeTextDecoder,
} from 'node:util';

// jsdom expects global definitions for: TextEncoder, TextDecoder
if (typeof global.TextEncoder === 'undefined') {
	global.TextEncoder = NodeTextEncoder as typeof global.TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
	global.TextDecoder = NodeTextDecoder as typeof global.TextDecoder;
}

import jsdom from 'jsdom';

import * as TEST_MODULE from '../../../src/utils/gip_prog_edit_utils';

////////////////////////////////////////////////////////////////////////////////
// Constants

////////////////////////////////////////
// The module under test
const testModule = TEST_MODULE as unknown as Type_TestModule;

const { JSDOM }  = jsdom;

// A full link element test data item
const TEST_PROG_FULL_ELEMENT_1 = `
<a href="https://www.bbc.co.uk/sounds/play/m002d1v9"
  aria-label="14:15, Conversations from a Long Marriage, Series 6, 5. Stuck in the Middle with You, Roger heads for a car wash after a long flight home."
	data-bbc-container="schedule_items"
	data-bbc-content-label="content" data-bbc-event-type="select"
	data-bbc-metadata="{&quot;APP&quot;:&quot;responsive::sounds&quot;,&quot;BID&quot;:&quot;m000dpqn&quot;,&quot;POS&quot;:&quot;3::1&quot;,&quot;SIS&quot;:&quot;future&quot;}"
	data-bbc-source="bbc_radio_fourfm" class="sw-group sw-block sw-w-full"
>
	<div class="sw-max-w-schedule sw-flex sw-flex-wrap">
		<div class="sw-w-5/24 sw-text-primary">
			<time class="sw-text-great-primer">14:15</time>
		</div>
		<div class="sw--ml-2 sw-w-19/24 sw-pl-4 m:sw--ml-4">
			<div class="sw-relative">
				<div class="sw-group sw-flex sw-w-full sw-grow">
					<div class="sw-relative sw-hidden sw-w-1/5 sw-self-start m:sw-block">
						<div class="sw-relative">
							<div class="sw-relative">
								<div class="sw-bg-grey-6">
									<div class="sw-aspect-w-1 sw-aspect-h-1">
										<picture>
											<source type="image/webp"
												srcset="https://ichef.bbci.co.uk/images/ic/160x160/p0h7spqk.jpg.webp 160w,https://ichef.bbci.co.uk/images/ic/192x192/p0h7spqk.jpg.webp 192w,https://ichef.bbci.co.uk/images/ic/224x224/p0h7spqk.jpg.webp 224w,https://ichef.bbci.co.uk/images/ic/288x288/p0h7spqk.jpg.webp 288w,https://ichef.bbci.co.uk/images/ic/368x368/p0h7spqk.jpg.webp 368w,https://ichef.bbci.co.uk/images/ic/400x400/p0h7spqk.jpg.webp 400w,https://ichef.bbci.co.uk/images/ic/448x448/p0h7spqk.jpg.webp 448w,https://ichef.bbci.co.uk/images/ic/496x496/p0h7spqk.jpg.webp 496w,https://ichef.bbci.co.uk/images/ic/512x512/p0h7spqk.jpg.webp 512w,https://ichef.bbci.co.uk/images/ic/576x576/p0h7spqk.jpg.webp 576w,https://ichef.bbci.co.uk/images/ic/624x624/p0h7spqk.jpg.webp 624w"
												sizes="(max-width: 599px) 50vw, (max-width: 899px) 33vw, (max-width: 1279px) 17vw, 194.66px">
											<source type="image/jpg" srcset="https://ichef.bbci.co.uk/images/ic/160x160/p0h7spqk.jpg 160w,https://ichef.bbci.co.uk/images/ic/192x192/p0h7spqk.jpg 192w,https://ichef.bbci.co.uk/images/ic/224x224/p0h7spqk.jpg 224w,https://ichef.bbci.co.uk/images/ic/288x288/p0h7spqk.jpg 288w,https://ichef.bbci.co.uk/images/ic/368x368/p0h7spqk.jpg 368w,https://ichef.bbci.co.uk/images/ic/400x400/p0h7spqk.jpg 400w,https://ichef.bbci.co.uk/images/ic/448x448/p0h7spqk.jpg 448w,https://ichef.bbci.co.uk/images/ic/496x496/p0h7spqk.jpg 496w,https://ichef.bbci.co.uk/images/ic/512x512/p0h7spqk.jpg 512w,https://ichef.bbci.co.uk/images/ic/576x576/p0h7spqk.jpg 576w,https://ichef.bbci.co.uk/images/ic/624x624/p0h7spqk.jpg 624w" sizes="(max-width: 599px) 50vw, (max-width: 899px) 33vw, (max-width: 1279px) 17vw, 194.66px">
											<img src="https://ichef.bbci.co.uk/images/ic/400x400/p0h7spqk.jpg" width="100" alt="" loading="lazy" class="sw-w-full sw-h-full sw-object-cover">
										</picture>
									</div>
								</div>
								<div class="sw-absolute sw-w-full sw-h-full sw-top-0 sw-opacity-0 sw-bg-grey-10/[.85] sw-duration-350 sw-transition-opacity group-active:sw-opacity-100 group-focus-visible:sw-opacity-100 group-hover:sw-opacity-100 motion-reduce:sw-transition-none sw-border-2 sw-border-[transparent] sw-border-solid xl:sw-border-4">
									<svg width="32px" height="32px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" class="sw-ease sw-transition motion-reduce:sw-transition-none sw-duration-350 sw-absolute sw-ml-0.5 sw-left-1/2 sw-top-1/2 -sw-translate-x-1/2 -sw-translate-y-1/2 sw-fill-grey-1" aria-hidden="true" focusable="false">
										<path d="M3 32l26-16L3 0z"></path>
									</svg>
								</div>
							</div>
						</div>
					</div>
					<div class="sw-w-10/12 sw-pl-2 m:sw-w-4/5 m:sw-pl-4">
						<div class="sw-text-primary">
							<span class="sw-text-primary sw-font-bold sw-transition sw-ease sw-transition-colors sw-duration-350 motion-reduce:sw-transition-none group-active:sw-text-accent group-active:sw-underline group-focus:sw-text-accent group-focus:sw-underline group-hover:sw-text-accent group-hover:sw-underline sw-text-pica sw-antialiased sw-text-primary">Conversations from a Long Marriage</span>
							<p class="sw-text-long-primer sw-mt-1">Series 6</p>
							<p class="sw-text-long-primer sw-mt-1">5. Stuck in the Middle with You</p>
							<p class="sw-text-long-primer sw-text-secondary sw-text-brevier sw-mt-1 sw-hidden m:sw-block">Roger heads for a car wash after a long flight home.</p>
						</div>
					</div>
					<div class="sw-flex sw-w-1/4 sw-shrink-0 sw-grow sw-items-center sw-justify-end m:sw-hidden">
						<div class="sw-flex sw-items-center sw-justify-center sw-rounded-full sw-fill-grey-1 sw-bg-sounds-core sw-size-6 group-hover:sw-bg-sounds-dark">
							<svg width="10px" height="10px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" class="sw-ease sw-transition motion-reduce:sw-transition-none sw-duration-350 sw-fill-grey-1 sw-ml-0.5" aria-hidden="true" focusable="false">
								<path d="M3 32l26-16L3 0z"></path>
							</svg>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</a>`;

// Taken from TEST_PROG_FULL_ELEMENT_1
const TEST_PROG_SPAN_PRIMARY_ELEMENT     = `<span class="sw-text-primary sw-font-bold sw-transition sw-ease sw-transition-colors sw-duration-350 motion-reduce:sw-transition-none group-active:sw-text-accent group-active:sw-underline group-focus:sw-text-accent group-focus:sw-underline group-hover:sw-text-accent group-hover:sw-underline sw-text-pica sw-antialiased sw-text-primary">Conversations from a Long Marriage</span>`;
const TEST_PROG_IMG_ELEMENT              = `<img src="https://ichef.bbci.co.uk/images/ic/400x400/p0h7spqk.jpg" width="100" alt="" loading="lazy" class="sw-w-full sw-h-full sw-object-cover">`;
const TEST_PROG_TEXT_LONG_PRIMER_ELEMENT = `<p class="sw-text-long-primer sw-mt-1">Series 6</p><p class="sw-text-long-primer sw-mt-1">5. Stuck in the Middle with You</p>`;
const TEST_PROG_TEXT_SECONDARY_ELEMENT   = `<p class="sw-text-long-primer sw-text-secondary sw-text-brevier sw-mt-1 sw-hidden m:sw-block">Roger heads for a car wash after a long flight home.</p>`;

// Cut down link element
const TEST_PROG_DANCE_MOVES_1 = `
<a>
	<picture>
		<img src="https://ichef.bbci.co.uk/images/ic/400x400/p0d6bs33.jpg" width="100" alt="" loading="lazy" class="sw-w-full sw-h-full sw-object-cover">
		<span class="sw-text-primary">Dance Move by Wendy Erskine</span>
	</picture>
	<div class="sw-text-primary">
		<p class="sw-text-long-primer sw-mt-1">Episode 3 - Bildungsroman</p>
		<p class="sw-text-secondary sw-text-brevier sw-mt-1 sw-hidden m:sw-block">Whilst on his work experience placement, teenager Lee must stay with a complete stranger.</p>
		<span class="sw-text-primary">Programme Website<svg width="16px" height="16px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" class="sw-ease" aria-hidden="true" focusable="false"></svg></span>
	</div>
</a>
`;

const TEST_PROG_ARCHERS_1 = `
<a href="https://www.bbc.co.uk/programmes/m002dmlb" aria-label="19:00, The Archers, 16/06/2025, Jakob questions his abilities., Programme website">
	<picture>
		<source type="image/webp" srcset="https://ichef.bbci.co.uk/images/ic/160x160/p0bzj12m.jpg.webp 160w,https://ichef.bbci.co.uk/images/ic/192x192/p0bzj12m.jpg.webp 192w,https://ichef.bbci.co.uk/images/ic/224x224/p0bzj12m.jpg.webp 224w,https://ichef.bbci.co.uk/images/ic/288x288/p0bzj12m.jpg.webp 288w,https://ichef.bbci.co.uk/images/ic/368x368/p0bzj12m.jpg.webp 368w,https://ichef.bbci.co.uk/images/ic/400x400/p0bzj12m.jpg.webp 400w,https://ichef.bbci.co.uk/images/ic/448x448/p0bzj12m.jpg.webp 448w,https://ichef.bbci.co.uk/images/ic/496x496/p0bzj12m.jpg.webp 496w,https://ichef.bbci.co.uk/images/ic/512x512/p0bzj12m.jpg.webp 512w,https://ichef.bbci.co.uk/images/ic/576x576/p0bzj12m.jpg.webp 576w,https://ichef.bbci.co.uk/images/ic/624x624/p0bzj12m.jpg.webp 624w" sizes="(max-width: 599px) 50vw, (max-width: 899px) 33vw, (max-width: 1279px) 17vw, 194.66px"><source type="image/jpg" srcset="https://ichef.bbci.co.uk/images/ic/160x160/p0bzj12m.jpg 160w,https://ichef.bbci.co.uk/images/ic/192x192/p0bzj12m.jpg 192w,https://ichef.bbci.co.uk/images/ic/224x224/p0bzj12m.jpg 224w,https://ichef.bbci.co.uk/images/ic/288x288/p0bzj12m.jpg 288w,https://ichef.bbci.co.uk/images/ic/368x368/p0bzj12m.jpg 368w,https://ichef.bbci.co.uk/images/ic/400x400/p0bzj12m.jpg 400w,https://ichef.bbci.co.uk/images/ic/448x448/p0bzj12m.jpg 448w,https://ichef.bbci.co.uk/images/ic/496x496/p0bzj12m.jpg 496w,https://ichef.bbci.co.uk/images/ic/512x512/p0bzj12m.jpg 512w,https://ichef.bbci.co.uk/images/ic/576x576/p0bzj12m.jpg 576w,https://ichef.bbci.co.uk/images/ic/624x624/p0bzj12m.jpg 624w" sizes="(max-width: 599px) 50vw, (max-width: 899px) 33vw, (max-width: 1279px) 17vw, 194.66px">
		<img src="https://ichef.bbci.co.uk/images/ic/400x400/p0bzj12m.jpg" width="100" alt="" loading="lazy" class="sw-w-full sw-h-full sw-object-cover">
	</picture>
	<div class="sw-text-primary">
		<span class="sw-text-primary sw-font-bold sw-text-pica sw-antialiased sw-text-primary">The Archers</span>
		<p class="sw-text-long-primer sw-mt-1">16/06/2025</p>
		<p class="sw-text-secondary sw-text-brevier sw-mt-1 sw-hidden m:sw-block">Jakob questions his abilities.</p>
	</div>
	<div class="sw-group">
		<span class="sw-text-primary">Programme Website<svg width="16px" height="16px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" class="sw-ease" aria-hidden="true" focusable="false"></svg></span>
	</div>
</a>
`;

const TEST_PROG_SHARDLAKE_1 = `
<a href="https://www.bbc.co.uk/sounds/play/m002fv6k" aria-label="03:50, Shardlake (Omnibus), Lamentation, Episode 2, 1546. Catholic and Protestant factions vie for power at the court of Henry VIII." data-bbc-container="schedule_items" data-bbc-content-label="content" data-bbc-event-type="select" data-bbc-metadata="{&quot;APP&quot;:&quot;responsive::sounds&quot;,&quot;BID&quot;:&quot;m000y1yn&quot;,&quot;POS&quot;:&quot;3::1&quot;,&quot;SIS&quot;:&quot;on-demand&quot;}" data-bbc-source="bbc_radio_four_extra" class="sw-group sw-block sw-w-full">
	<picture>
		<source type="image/webp" srcset="https://ichef.bbci.co.uk/images/ic/160x160/p09kwpfd.jpg.webp 160w,https://ichef.bbci.co.uk/images/ic/192x192/p09kwpfd.jpg.webp 192w,https://ichef.bbci.co.uk/images/ic/224x224/p09kwpfd.jpg.webp 224w,https://ichef.bbci.co.uk/images/ic/288x288/p09kwpfd.jpg.webp 288w,https://ichef.bbci.co.uk/images/ic/368x368/p09kwpfd.jpg.webp 368w,https://ichef.bbci.co.uk/images/ic/400x400/p09kwpfd.jpg.webp 400w,https://ichef.bbci.co.uk/images/ic/448x448/p09kwpfd.jpg.webp 448w,https://ichef.bbci.co.uk/images/ic/496x496/p09kwpfd.jpg.webp 496w,https://ichef.bbci.co.uk/images/ic/512x512/p09kwpfd.jpg.webp 512w,https://ichef.bbci.co.uk/images/ic/576x576/p09kwpfd.jpg.webp 576w,https://ichef.bbci.co.uk/images/ic/624x624/p09kwpfd.jpg.webp 624w" sizes="(max-width: 599px) 50vw, (max-width: 899px) 33vw, (max-width: 1279px) 17vw, 194.66px">
		<source type="image/jpg" srcset="https://ichef.bbci.co.uk/images/ic/160x160/p09kwpfd.jpg 160w,https://ichef.bbci.co.uk/images/ic/192x192/p09kwpfd.jpg 192w,https://ichef.bbci.co.uk/images/ic/224x224/p09kwpfd.jpg 224w,https://ichef.bbci.co.uk/images/ic/288x288/p09kwpfd.jpg 288w,https://ichef.bbci.co.uk/images/ic/368x368/p09kwpfd.jpg 368w,https://ichef.bbci.co.uk/images/ic/400x400/p09kwpfd.jpg 400w,https://ichef.bbci.co.uk/images/ic/448x448/p09kwpfd.jpg 448w,https://ichef.bbci.co.uk/images/ic/496x496/p09kwpfd.jpg 496w,https://ichef.bbci.co.uk/images/ic/512x512/p09kwpfd.jpg 512w,https://ichef.bbci.co.uk/images/ic/576x576/p09kwpfd.jpg 576w,https://ichef.bbci.co.uk/images/ic/624x624/p09kwpfd.jpg 624w" sizes="(max-width: 599px) 50vw, (max-width: 899px) 33vw, (max-width: 1279px) 17vw, 194.66px">
		<img src="https://ichef.bbci.co.uk/images/ic/400x400/p09kwpfd.jpg" width="100" alt="" loading="lazy" class="sw-w-full sw-h-full sw-object-cover">
	</picture>
	<div class="sw-text-primary">
		<span class="sw-text-primary sw-font-bold sw-transition sw-ease sw-transition-colors sw-duration-350 motion-reduce:sw-transition-none group-active:sw-text-accent group-active:sw-underline group-focus-visible:sw-text-accent group-focus-visible:sw-underline group-hover:sw-text-accent group-hover:sw-underline sw-text-pica sw-antialiased sw-text-primary">Shardlake (Omnibus)</span>
		<p class="sw-text-long-primer sw-mt-1">Lamentation</p>
		<p class="sw-text-long-primer sw-mt-1">Episode 2</p>
		<p class="sw-text-secondary sw-text-brevier sw-mt-1 sw-hidden m:sw-block">1546. Catholic and Protestant factions vie for power at the court of Henry VIII.</p>
	</div>
</a>
`;

////////////////////////////////////////////////////////////////////////////////
// Local test functions

function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

function commonAfterEach() : void {
	jest.restoreAllMocks();
	jest.resetModules();
}

/**
 * @param strHTML : a valid HTML string.
 * @returns and array of one or more HTML Element objects.
 */
function createElementsFromString( strHTML : string ) : Element[] {
	const dom            = new JSDOM( strHTML );
	const htmlCollection = dom.window.document.body.getElementsByTagName( '*' );
	const arrElement     = [] as Element[];
	for ( let i = 0; i < htmlCollection.length; ++i ) {
		arrElement.push( htmlCollection.item( i )! ); // eslint-disable-line @typescript-eslint/no-non-null-assertion
	}
	return arrElement;
}

/**
 * @param strHTML : an HTML string containing a containing element and the child contents, e.g., <div><p>dsada</p></div>
 * @returns the containing element, e.g., the 'div' element in the param example.
 */
function createContainingElementFromString( strHTML : string ) : Element {
	const arrElement = createElementsFromString( strHTML );
	return arrElement[ 0 ];
}

/**
 * @param strHTML : an HTML string containing one or more elements, with no containing element, e.g, <p>p1</p><p>p2</p>
 * @returns either a single Element object or an array of Element objects
 */
function createElementOrElementsFromString( strHTML : string ) : Element | Element [] {
	const arrElement = createElementsFromString( strHTML );
	if ( arrElement.length === 1 ) {
		return arrElement[ 0 ];
	} else {
		return arrElement;
	}
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

describe(MODULE_NAME + ':convertToCamelCase', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let testArgs       : Type_convertToCamelCase_args;
	let actualResult   : Type_convertToCamelCase_ret;
	let expectedResult : Type_convertToCamelCase_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = '';
		expectedResult = '';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Empty string', () => {
		actualResult = testModuleObj.convertToCamelCase( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Uppercase acronym', () => {
		testArgs       = 'The story of HS2';
		expectedResult = 'TheStoryOfHS2';
		actualResult   = testModuleObj.convertToCamelCase( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Episode 2', () => {
		testArgs       = 'Episode 2';
		expectedResult = 'Episode2';
		actualResult   = testModuleObj.convertToCamelCase( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':elementClassTagMatches', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let testArgs       : Type_elementClassTagMatches_args;
	let actualResult   : Type_elementClassTagMatches_ret;
	let expectedResult : Type_elementClassTagMatches_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
		testArgs = {
			className: 'test-class-name1',
			classTag:  'test-class-name1',
		};
		expectedResult = true;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Scalar matches exactly', () => {
		testArgs = {
			className: 'test-class-name1',
			classTag:  'test-class-name1',
		};
		expectedResult = true;
		actualResult = testModuleObj.elementClassTagMatches( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Scalar matches case insensitive', () => {
		testArgs = {
			className: 'test-class-name1',
			classTag:  'test-CLASS-name1',
		};
		expectedResult = true;
		actualResult = testModuleObj.elementClassTagMatches( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Scalar does not match', () => {
		testArgs = {
			className: 'test-class-name1',
			classTag:  'test-class-name2',
		};
		expectedResult = false;
		actualResult = testModuleObj.elementClassTagMatches( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Array match case insensitive', () => {
		testArgs = {
			className: 'test-class-name1',
			classTag:  [ 'test-CLASS-name1', '!test-class-name2' ],
		};
		expectedResult = true;
		actualResult = testModuleObj.elementClassTagMatches( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Array matches class name and not negated class name', () => {
		testArgs = {
			className: 'test-class-name1 test-class-name3',
			classTag:  [ 'test-CLASS-name1', '!test-class-name2' ],
		};
		expectedResult = true;
		actualResult = testModuleObj.elementClassTagMatches( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Array matches all', () => {
		testArgs = {
			className: 'test-class-name1 test-class-name2 test-class-name3',
			classTag:  [ 'test-class-name2', 'test-CLASS-name3', 'test-class-namE1' ],
		};
		expectedResult = true;
		actualResult = testModuleObj.elementClassTagMatches( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Scalar matches none', () => {
		testArgs = {
			className: 'test-class-name1 test-class-name2 test-class-name3',
			classTag:  'test-class-name',
		};
		expectedResult = false;
		actualResult = testModuleObj.elementClassTagMatches( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':getDecendentsByTagNameAndClassTag', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let testArgs       : Type_getDecendentsByTagNameAndClassTag_args;
	let actualResult   : Type_getDecendentsByTagNameAndClassTag_ret;
	let expectedResult : Type_getDecendentsByTagNameAndClassTag_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule.privateDefs;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Find one item with a single element', () => {
		testArgs = {
			elem: createContainingElementFromString( TEST_PROG_FULL_ELEMENT_1 ),
			arrTagNameAndClassTag: [
				{ tagName: 'span', classTag: 'sw-text-primary', retProp: 'title' },
			],
		};
		expectedResult = {
			title: createElementOrElementsFromString( TEST_PROG_SPAN_PRIMARY_ELEMENT ),
		};
		actualResult = testModuleObj.getDecendentsByTagNameAndClassTag( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Find one item with multiple elements', () => {
		testArgs = {
			elem: createContainingElementFromString( TEST_PROG_FULL_ELEMENT_1 ),
			arrTagNameAndClassTag: [
				{ tagName: 'p', classTag: [ 'sw-text-long-primer', '!sw-text-secondary' ], retProp: 'primary' },
			],
		};
		expectedResult = {
			primary: createElementOrElementsFromString( TEST_PROG_TEXT_LONG_PRIMER_ELEMENT ),
		};
		actualResult = testModuleObj.getDecendentsByTagNameAndClassTag( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Find multiple items', () => {
		testArgs = {
			elem: createContainingElementFromString( TEST_PROG_FULL_ELEMENT_1 ),
			arrTagNameAndClassTag: [
				{ tagName: 'img',  classTag: 'sw-object-cover',                               retProp: 'image' },
				{ tagName: 'span', classTag: 'sw-text-primary',                               retProp: 'title' },
				{ tagName: 'p',    classTag: [ 'sw-text-long-primer', '!sw-text-secondary' ], retProp: 'primary' },
				{ tagName: 'p',    classTag: 'sw-text-secondary',                             retProp: 'secondary' },
			],
		};
		expectedResult = {
			title:     createElementOrElementsFromString( TEST_PROG_SPAN_PRIMARY_ELEMENT ),
			image:     createElementOrElementsFromString( TEST_PROG_IMG_ELEMENT ),
			primary:   createElementOrElementsFromString( TEST_PROG_TEXT_LONG_PRIMER_ELEMENT ),
			secondary: createElementOrElementsFromString( TEST_PROG_TEXT_SECONDARY_ELEMENT ),
		};
		actualResult = testModuleObj.getDecendentsByTagNameAndClassTag( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Invalid html', () => {
		testArgs = {
			// @ts-expect-error pass in invalid data
			elem: 'Not valid HTML',
			arrTagNameAndClassTag: [
				{ tagName: 'span', classTag: 'sw-text-primary', retProp: 'title' },
			],
		};
		expectedResult = {};
		actualResult   = testModuleObj.getDecendentsByTagNameAndClassTag( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':extractElementText', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let testArgs       : Type_extractElementText_args;
	let actualResult   : Type_extractElementText_ret;
	let expectedResult : Type_extractElementText_ret;
	let testStr        : string;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj  = testModule.privateDefs;
		expectedResult = '';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Array of one element', () => {
		testStr        = `<p>Text 1</p>`;
		testArgs       = createElementsFromString( testStr );
		expectedResult = 'Text 1';
		actualResult   = testModuleObj.extractElementText( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'One element', () => {
		testStr        = `<p>Text 1</p>`;
		testArgs       = createElementsFromString( testStr )[ 0 ];
		expectedResult = 'Text 1';
		actualResult   = testModuleObj.extractElementText( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Two elements', () => {
		testStr        = `<p>Text 1</p><p>Text 2</p>`;
		testArgs       = createElementsFromString( testStr );
		expectedResult = 'Text 1-Text 2';
		actualResult   = testModuleObj.extractElementText( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Three elements', () => {
		testStr        = `<p>Text 1</p><p>Text 2</p><p>Text3</p>`;
		testArgs       = createElementsFromString( testStr );
		expectedResult = 'Text 1-Text 2-Text3';
		actualResult   = testModuleObj.extractElementText( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':extractElementImageURI', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let testArgs       : Type_extractElementImageURI_args;
	let actualResult   : Type_extractElementImageURI_ret;
	let expectedResult : Type_extractElementImageURI_ret;
	let testStr        : string;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj  = testModule.privateDefs;
		expectedResult = '';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Array of one element', () => {
		testStr        = `<img src="https://ichef.bbci.co.uk/images/ic/400x400/p0h7spqk.jpg" width="100" alt="" loading="lazy" class="sw-w-full sw-h-full sw-object-cover">`;
		testArgs       = createElementsFromString( testStr );
		expectedResult = 'https://ichef.bbci.co.uk/images/ic/400x400/p0h7spqk.jpg';
		actualResult   = testModuleObj.extractElementImageURI( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'One element', () => {
		testStr        = `<img src="my-image-url" width="100" alt="" loading="lazy" class="sw-w-full sw-h-full sw-object-cover">`;
		testArgs       = createElementsFromString( testStr )[0];
		expectedResult = 'my-image-url';
		actualResult   = testModuleObj.extractElementImageURI( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

// getProgAttributes is tested by getProgDetailsFromLink
// convertText is tested by cookSynopsis which is called from getProgDetailsFromLink
// cookTitle is tested by getProgDetailsFromLink
// padNumberString is tested by cookEpisode
// padEpisode is tested by cookEpisode
// padSeries is tested by cookEpisode
// formatDashDate is tested by preProcessEpisode

describe(MODULE_NAME + ':preProcessEpisode', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let testArgs       : Type_preProcessEpisode_args;
	let actualResult   : Type_preProcessEpisode_ret;
	let expectedResult : Type_preProcessEpisode_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj  = testModule.privateDefs;
		expectedResult = '';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Just two numbers separated by a slash', () => {
		testArgs       = '01/02';
		expectedResult = testArgs;
		actualResult   = testModuleObj.preProcessEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Two numbers separated by a slash mid-string', () => {
		testArgs       = 'Leading stuff 01/02 trailing stuff.';
		expectedResult = testArgs;
		actualResult   = testModuleObj.preProcessEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Just slash date', () => {
		testArgs       = '15/06/2025';
		expectedResult = '2025-06-15';
		actualResult   = testModuleObj.preProcessEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Slash date, single digits mid-string', () => {
		testArgs       = 'leading stuff 5/6/2025 trailing stuff';
		expectedResult = 'leading stuff 2025-06-05 trailing stuff';
		actualResult   = testModuleObj.preProcessEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Slash date, single digits, two digit year, mid-string', () => {
		testArgs       = 'leading stuff 5/6/25 trailing stuff';
		expectedResult = 'leading stuff 2025-06-05 trailing stuff';
		actualResult   = testModuleObj.preProcessEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Percent sign', () => {
		testArgs       = 'Are 4% of women?';
		expectedResult = 'Are 4 percent of women?';
		actualResult   = testModuleObj.preProcessEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':cookEpisode', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let testArgs       : Type_cookEpisode_args;
	let actualResult   : Type_cookEpisode_ret;
	let expectedResult : Type_cookEpisode_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj  = testModule.privateDefs;
		expectedResult = '';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Just a number', () => {
		testArgs       = '123';
		expectedResult = testArgs;
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'A number mid-string', () => {
		testArgs       = 'Leading stuff 123 trailing stuff';
		expectedResult = testArgs;
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( '4. Super heroes.', () => {
		testArgs       = '4. Super heroes.';
		expectedResult = '04-SuperHeroes';
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Two numbers separated by a dash', () => {
		testArgs       = '1-2';
		expectedResult = '01of02';
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Two numbers separated by a dash mid-string', () => {
		testArgs       = 'Leading stuff 1-02 trailing stuff';
		expectedResult = '01of02-LeadingStuff-TrailingStuff';
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'One number with a leading dash mid-string', () => {
		testArgs       = 'Half-Life-8. A Fracture.';
		expectedResult = '08-Half-Life-AFracture';
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Just two numbers separated by a slash', () => {
		testArgs       = '01/02';
		expectedResult = '01of02';
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Two numbers separated by a slash mid-string', () => {
		testArgs       = 'Leading stuff 01/02 trailing stuff.';
		expectedResult = '01of02-LeadingStuff-TrailingStuff';
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Series text followed by a number dot', () => {
		testArgs       = 'Series 5. 2. My ep';
		expectedResult = 'S05E02-MyEp';
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Just series and episode text', () => {
		testArgs       = 'Series 5. Episode 2.';
		expectedResult = 'S05E02';
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Long series and long episode text', () => {
		testArgs       = 'Leading stuff. Series 125. Episode 234. Trailing stuff.';
		expectedResult = 'S125E234-LeadingStuff-TrailingStuff';
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Series and episode text mid-string', () => {
		testArgs       = 'Leading stuff Series 5. Episode 2. trailing stuff';
		expectedResult = 'S05E02-LeadingStuff-TrailingStuff';
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Series followed by a dash', () => {
		testArgs       = 'Series 8-Spon';
		expectedResult = 'S08-Spon';
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Just slash date', () => {
		testArgs       = '15/06/2025';
		expectedResult = '2025-06-15';
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Slash date mid-string', () => {
		testArgs       = 'leading stuff 2025-06-15 trailing stuff';
		expectedResult = testArgs;
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Percent sign', () => {
		testArgs       = 'Are 4% of women?';
		expectedResult = 'Are 4 percent of women?';
		actualResult   = testModuleObj.cookEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':cookRawEpisode', () => {
	let testModuleObj  : Type_TestModulePrivateDefs;
	let testArgs       : Type_cookRawEpisode_args;
	let actualResult   : Type_cookRawEpisode_ret;
	let expectedResult : Type_cookRawEpisode_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj  = testModule.privateDefs;
		expectedResult = '';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'No preprocessing"', () => {
		testArgs       = [ 'Nothing', 'to preprocess'];
		expectedResult = 'Nothing-to preprocess';
		actualResult   = testModuleObj.cookRawEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'First element ends with "Series XX"', () => {
		testArgs       = [ 'Series 16', `3. 'Gen Ed'.`];
		expectedResult = 'S16E03-GenEd';
		actualResult   = testModuleObj.cookRawEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'First element ends with an acronym with a number', () => {
		testArgs       = [ 'Understanding HS2', `Some more text`];
		expectedResult = 'Understanding HS2;-Some more text'; // Extra punctuation added so that first elemenet does not end with a number
		actualResult   = testModuleObj.cookRawEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Second element ends with a number', () => {
		testArgs       = [ 'Lamentation', `Episode 2`];
		expectedResult = '02-Lamentation';
		actualResult   = testModuleObj.cookRawEpisode( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':cookSynopsis', () => {
	let testModuleObj  : Type_TestModule;
	let testArgs       : Type_cookSynopsis_args;
	let actualResult   : Type_cookSynopsis_ret;
	let expectedResult : Type_cookSynopsis_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj  = testModule;
		expectedResult = '';
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Just text, no replacements', () => {
		testArgs = {
			rawText: 'Nothing to change here',
		};
		expectedResult = 'Nothing to change here.'; // Added trailing dot.
		actualResult   = testModuleObj.cookSynopsis( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Text and episode, no replacements', () => {
		testArgs = {
			rawText: 'Nothing to change here',
			episode: 'No episode changes',
		};
		expectedResult = "No episode changes.\nNothing to change here.";
		actualResult   = testModuleObj.cookSynopsis( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Just text, all replacements', () => {
		testArgs = {
			rawText: "\u{0060}Some poorly quoted &amp;text\u{2019}",
		};
		expectedResult = "'Some poorly quoted &text'.";
		actualResult   = testModuleObj.cookSynopsis( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Text and episode, all replacements', () => {
		testArgs = {
			rawText: "\u{0060}Some poorly quoted &amp;text\u{2019}",
			episode: "Ep \u{0060}quoted &amp;text\u{2019} isode",
		};
		expectedResult = "Ep 'quoted &text' isode.\n'Some poorly quoted &text'.";
		actualResult   = testModuleObj.cookSynopsis( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});

describe(MODULE_NAME + ':getProgDetailsFromLink', () => {
	let testModuleObj  : Type_TestModule;
	let testArgs       : Type_getProgDetailsFromLink_args;
	let actualResult   : Type_getProgDetailsFromLink_ret;
	let expectedResult : Type_getProgDetailsFromLink_ret;

	beforeEach( () => {
		commonBeforeEach();
		testModuleObj = testModule;
	});

	afterEach( () => {
		commonAfterEach();
	});

	test( 'Parse full program item', () => {
		testArgs = TEST_PROG_FULL_ELEMENT_1;
		expectedResult = {
			title:     'ConversationsFromALongMarriage-S06E05-StuckInTheMiddleWithYou',
			synopsis:  "Series 6-5. Stuck in the Middle with You.\nRoger heads for a car wash after a long flight home.",
			image_uri: 'https://ichef.bbci.co.uk/images/ic/400x400/p0h7spqk.jpg',
		};
		actualResult = testModuleObj.getProgDetailsFromLink( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Parse cut down program item - Dance Moves', () => {
		testArgs = TEST_PROG_DANCE_MOVES_1;
		expectedResult = {
			title:     'DanceMoveByWendyErskine-03-Bildungsroman',
			synopsis:  "Episode 3 - Bildungsroman.\nWhilst on his work experience placement, teenager Lee must stay with a complete stranger.",
			image_uri: 'https://ichef.bbci.co.uk/images/ic/400x400/p0d6bs33.jpg',
		};
		actualResult = testModuleObj.getProgDetailsFromLink( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Parse cut down program item - Archers', () => {
		testArgs = TEST_PROG_ARCHERS_1;
		expectedResult = {
			title:     'Archers-2025-06-16',
			synopsis:  "16/06/2025.\nJakob questions his abilities.",
			image_uri: 'https://ichef.bbci.co.uk/images/ic/400x400/p0bzj12m.jpg',
		};
		actualResult = testModuleObj.getProgDetailsFromLink( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Parse cut down program item - Shardlake', () => {
		testArgs = TEST_PROG_SHARDLAKE_1;
		expectedResult = {
			title:     'ShardlakeOmnibus-02-Lamentation',
			synopsis:  "Lamentation-Episode 2.\n1546. Catholic and Protestant factions vie for power at the court of Henry VIII.",
			image_uri: 'https://ichef.bbci.co.uk/images/ic/400x400/p09kwpfd.jpg',
		};
		actualResult = testModuleObj.getProgDetailsFromLink( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});
});
