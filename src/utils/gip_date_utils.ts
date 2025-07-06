/**
 * File:       utils/gip_date_utils.ts
 * Description Day of the week utility functions.
 */
'use strict';

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Exported and local types

export type Type_DayOfWeek = typeof ARR_DAY_OF_WEEK[number];

export type Type_dayOfWeekToIndex_args = string;
export type Type_dayOfWeekToIndex_ret  = number;
export interface Type_getCurrentDayOfWeek_args {
	iOffset?: number;
	dt?:      Date;
};
export type Type_getCurrentDayOfWeek_ret  = string;
export type Type_dayOfWeekDiff_ret = number;
export interface Type_isDayOfWeekAvailable_args {
	checkDay          : string,
	currDay?          : string,
	numDaysThreshold? : number,
};
export type Type_isDayOfWeekAvailable_ret = boolean;

////////////////////////////////////////////////////////////////////////////////
// Constants

const ARR_DAY_OF_WEEK  = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
const NUM_DAYS_IN_WEEK = ARR_DAY_OF_WEEK.length;

// Number of days to regard a day of the week as being in the past and available.
// e.g., if today is Mon and the threshold is 2, then Sat and Sun are available, but Fri is not.
const DEFAULT_DAYS_THRESHOLD = 2;

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

/**
 * @param d - capitalised three character day of week, e.g., 'Mon';
 * @returns the associated day index 0 = Sun, 6 = Sat, -1 = invalid.
 */
function dayOfWeekToIndex( d : Type_dayOfWeekToIndex_args ) : Type_dayOfWeekToIndex_ret {
	const iDay = ARR_DAY_OF_WEEK.indexOf( d );
	return iDay;
}

/**
 * @param d1 : capitalised three character day of week, e.g., 'Mon';
 * @param d2 : capitalised three character day of week, e.g., 'Mon';
 * @returns the number of days until the next d2 after d1, zero if the days are the same.
 */
function dayOfWeekDiff( d1 : Type_DayOfWeek, d2 : Type_DayOfWeek ) : Type_dayOfWeekDiff_ret {
	const iVal1 = dayOfWeekToIndex( d1 );
	let   iVal2 = dayOfWeekToIndex( d2 );

	if ( iVal1 > iVal2 ) {
		iVal2 += NUM_DAYS_IN_WEEK;
	}

	return iVal2 - iVal1;
}

////////////////////////////////////////
// Exported definitions

/**
 * @param {Object} - with properties:
 *                    - iOffset: offset in days, defaults to zero;
 *                    - dt:      optional DateTime object, if not specified defaults to the current date;
 * @returns capitalised three character day of week, e.g., 'Mon';
 */
export function getCurrentDayOfWeek( { iOffset = 0, dt } : Type_getCurrentDayOfWeek_args = {} ) : Type_getCurrentDayOfWeek_ret {
	dt = dt ?? new Date();

	iOffset = ( ( iOffset % NUM_DAYS_IN_WEEK ) + NUM_DAYS_IN_WEEK ) % NUM_DAYS_IN_WEEK; // Convert negative offsets to positive

	const iDay = ( dt.getDay() + iOffset ) % NUM_DAYS_IN_WEEK;

	return ARR_DAY_OF_WEEK[ iDay ];
}

/**
 * @param {Object} with properties:
 *          - checkDay:         the day of the week to check, e.g., 'Mon';
 *          - currDay:          the day of the week to check against, e.g., 'Mon', defaults to the current day of the week;
 *          - numDaysThreshold: a number of days after the current day, defaults to DEFAULT_DAYS_THRESHOLD;
 * @returns true if checkDay is within the specified number of days after currDay, false otherwise.
 */
export function isDayOfWeekAvailable( { checkDay, currDay, numDaysThreshold = DEFAULT_DAYS_THRESHOLD } : Type_isDayOfWeekAvailable_args ) : Type_isDayOfWeekAvailable_ret {
	currDay = currDay ?? getCurrentDayOfWeek();

	const daysDiff   = dayOfWeekDiff( checkDay, currDay );
	const bAvailable = ( daysDiff <= numDaysThreshold );

	return bAvailable;
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions

const privateDefs = {};

if ( process.env.NODE_ENV === 'test-unit' ) {
	Object.assign( privateDefs, {
		dayOfWeekToIndex,
		dayOfWeekDiff,
	} );
}

export { privateDefs };
