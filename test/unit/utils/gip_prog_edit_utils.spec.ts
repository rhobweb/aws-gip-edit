/**
 * DESCRIPTION:
 * Unit Tests for utils/gip_prog_edit_utils.ts.
 */
const REL_SRC_PATH     = '../../../src/utils/';
const MODULE_NAME      = 'gip_prog_edit_utils.ts';
const TEST_MODULE_PATH = REL_SRC_PATH + MODULE_NAME;

import type {
	Type_convertToCamelCase_args,
	Type_convertToCamelCase_ret,
	Type_elementClassTagMatches_args,
	Type_elementClassTagMatches_ret,
	Type_getProgDetailsFromLink_args,
	Type_getProgDetailsFromLink_ret,
	Type_getDecendentsByTagNameAndClassTag_args,
	Type_getDecendentsByTagNameAndClassTag_ret,
} from '../../../src/utils/gip_prog_edit_utils';

interface Type_TestModulePrivateDefs {
	convertToCamelCase:                (args: Type_convertToCamelCase_args)                 => Type_convertToCamelCase_ret,
	elementClassTagMatches:            (args: Type_elementClassTagMatches_args)             => Type_elementClassTagMatches_ret,
	getDecendentsByTagNameAndClassTag: (args: Type_getDecendentsByTagNameAndClassTag_args ) => Type_getDecendentsByTagNameAndClassTag_ret,
};

interface Type_TestModule {
	privateDefs: Type_TestModulePrivateDefs,
	getProgDetailsFromLink: (args: Type_getProgDetailsFromLink_args) => Type_getProgDetailsFromLink_ret,
};

import * as TEST_MODULE from '../../../src/utils/gip_prog_edit_utils';
const testModule = TEST_MODULE as unknown as Type_TestModule;

// Full link element
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
							<p class="sw-text-secondary sw-text-brevier sw-mt-1 sw-hidden m:sw-block">Roger heads for a car wash after a long flight home.</p>
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

function commonBeforeEach() : void { // eslint-disable-next @typescript-eslint/no-empty-function
}

function commonAfterEach() : void {
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

	test( 'All properties specified', () => {
		actualResult = testModuleObj.convertToCamelCase( testArgs );
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

	test( 'Parse full program item', () => {
		testArgs = {
			elem: JSON.parse(TEST_PROG_FULL_ELEMENT_1 ) as Element,
			arrTagNameAndClassTag: [
				{
					tagName:  'span',
					classTag: 'sw-text-primary',
					retProp:  'title',
				},
			],
		};
		expectedResult = {
			title: 'ConversationsFromALongMarriage-S6E05',
		};
		actualResult = testModuleObj.getDecendentsByTagNameAndClassTag( testArgs );
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
			title:     'ConversationsFromALongMarriage-S6E05',
			synopsis:  "Series 6-5. Stuck in the Middle with You.\nRoger heads for a car wash after a long flight home.",
			image_uri: 'https://ichef.bbci.co.uk/images/ic/400x400/p0h7spqk.jpg',
		};
		actualResult = testModuleObj.getProgDetailsFromLink( testArgs );
		expect( actualResult ).toEqual( expectedResult );
	});

	test( 'Parse cut down program item - Dance Moves', () => {
		testArgs = TEST_PROG_DANCE_MOVES_1;
		expectedResult = {
			title:     'DanceMoveByWendyErskine-3',
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
});
