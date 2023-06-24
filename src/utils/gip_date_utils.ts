
const ARR_DAY_OF_WEEK        = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
const NUM_DAYS_IN_WEEK       = 7;
const DEFAULT_DAYS_THRESHOLD = 2;

/**
 * @param d - capitalised three character day of week, e.g., 'Mon';
 * @returns the associated day index 0 = Sun, 6 = Sat, -1 = invalid.
 */
function dayOfWeekToIndex( d : string ) {
  const iDay = ARR_DAY_OF_WEEK.indexOf( d );
  return iDay;
}

/**
 * @param {Object} - with properties:
 *                    - iOffset: offset in days, defaults to zero;
 *                    - dt:      optional DateTime object, if not specified defaults to the current date;
 * @returns capitalised three character day of week, e.g., 'Mon';
 */
export function getCurrentDayOfWeek( { iOffset = 0, dt } : { iOffset?: number, dt?: Date } = {} ) {
  if ( ! dt ) {
    dt = new Date();
  }

  iOffset = ( ( iOffset % NUM_DAYS_IN_WEEK ) + NUM_DAYS_IN_WEEK ) % NUM_DAYS_IN_WEEK;

  const iDay = ( dt.getDay() + iOffset ) % NUM_DAYS_IN_WEEK;

  return ARR_DAY_OF_WEEK[ iDay ];
}

/**
 * @param d1 : capitalised three character day of week, e.g., 'Mon';
 * @param d2 : capitalised three character day of week, e.g., 'Mon';
 * @returns the number of days until the next d2 after d1, zero if the days are the same.
 */
function dayOfWeekDiff( d1 : string, d2 : string ) {
  const iVal1 = dayOfWeekToIndex( d1 );
  let   iVal2 = dayOfWeekToIndex( d2 );

  if ( iVal1 > iVal2 ) {
    iVal2 += NUM_DAYS_IN_WEEK;
  }

  return iVal2 - iVal1;
}

/**
 * @param {Object} with properties:
 *          - checkDay:         the day of the week to check, e.g., 'Mon';
 *          - currDay:          the day of the week to check against, e.g., 'Mon', defaults to the current day of the week;
 *          - numDaysThreshold: a number of days after the current day, defaults to DEFAULT_DAYS_THRESHOLD;
 * @returns true if checkDay is within the specified number of days after currDay, false otherwise.
 */
export function isDayOfWeekAvailable( { checkDay, currDay, numDaysThreshold = DEFAULT_DAYS_THRESHOLD } : { checkDay: string, currDay?: string, numDaysThreshold?: number } ) {
  if ( currDay === undefined ) {
    currDay = getCurrentDayOfWeek();
  }
  const daysDiff   = dayOfWeekDiff( checkDay, currDay );
  const bAvailable = ( daysDiff <= numDaysThreshold );

  return bAvailable;
}
