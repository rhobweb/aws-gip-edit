import type {
	Type_ProgramDownloadOptions,
	Nullable,
} from './gip_types.ts';
import type { Type_DbProgramItem }                    from './gip_prog_fields.js';

import { VALUE_STATUS_SUCCESS, VALUE_STATUS_ALREADY } from './gip_prog_fields.js';
import { PROG_FIELD_STATUS, PROG_FIELD_DAY_OF_WEEK }  from './gip_types.js';
import { getCurrentDayOfWeek, isDayOfWeekAvailable  } from './gip_date_utils.js';

const ARR_STATUS_DOWNLOADED = [ VALUE_STATUS_SUCCESS, VALUE_STATUS_ALREADY ];

/**
 * @param object with properties:
 *         - current:     true if the current day is regarded as active, false otherwise;
 *         - day_of_week: either null or the capitalised three character day of the week to check, e.g., 'Mon'.
 * @returns true if the specified day of the week is active, false otherwise.
 */
function isDayActive( { current, day_of_week } : { current: boolean, day_of_week: Nullable<string> } ) : boolean{
	let bActive = true; // If no day_of_week is specified then all days are active.
	if ( day_of_week ) {
		const iOffset = ( current ? 0 : - 1 ); // If ignoring the current day use -1 to get yesterday
		const currDay = getCurrentDayOfWeek( { iOffset } );
		bActive       = isDayOfWeekAvailable( { checkDay: day_of_week, currDay } );
	}
	return bActive;
}

/**
 * @param object with properties:
 *         - programs: array of DB Program Items;
 *         - params:   object with properties:
 *                      - all:        if true do not do any filtering, just return the programs as input;
 *                      - current:    if true include programs for the current day of the week;
 *                      - downloaded: if true include programs that have already been downloaded.
 * @returns filtered array of DB Program Items.
 */
interface Type_filterPrograms_args {
	programs: Type_DbProgramItem[],
	params:   Type_ProgramDownloadOptions,
};
type Type_filterPrograms_ret = Type_DbProgramItem[];
export function filterPrograms( { programs, params } : Type_filterPrograms_args ) : Type_filterPrograms_ret {
	let cookedPrograms : Type_filterPrograms_ret;

	if ( params.all  ) {
		cookedPrograms = programs;
	} else {
		const { current = false, downloaded = false } = params;
		cookedPrograms = programs.filter( prog => {
			let ret = true;
			if ( ARR_STATUS_DOWNLOADED.includes( prog[ PROG_FIELD_STATUS ] ) ) {
				if ( ! downloaded ) {
					ret = false;
				}
			} else if ( ! isDayActive( { current, day_of_week: prog[ PROG_FIELD_DAY_OF_WEEK ] } ) ) {
				ret = false;
			}
			return ret;
		} );
	}
	return cookedPrograms;
}
