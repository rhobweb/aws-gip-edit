/**
 * File:        utils/gip_prog_title_utils.ts
 * Description: Convert known program titles into preferred formats.
 */
'use strict';

////////////////////////////////////////////////////////////////////////////////
// Imports

////////////////////////////////////////////////////////////////////////////////
// Types

////////////////////////////////////////
// Imported types

////////////////////////////////////////
// Exported and local types

type SearchReplaceTuple = [ ( string | RegExp ), string ];

export type Type_convertKnownTitle_args = string;
export type Type_convertKnownTitle_ret  = string;

////////////////////////////////////////////////////////////////////////////////
// Constants

// Defines the string and regexp replacements to be made for the known program titles.
const ARR_KNOWN_TITLE : SearchReplaceTuple[] = [
	[ /TheArchersOmnibus-([0-9]{2})\/([0-9]{2})\/([0-9]{4})/, "ArchersOmnibus-$3-$2-$1" ],
	[ "TheArchersOmnibus",                                    "ArchersOmnibus"          ],
	[ /TheArchers-([0-9]{2})\/([0-9]{2})\/([0-9]{4})/,        "Archers-$3-$2-$1"        ],
	[ "TheArchers",                                           "Archers"                 ],
	[ "DesertIslandDiscsRevisited",                           "DID"                     ],
	[ "DesertIslandDiscs",                                    "DID"                     ],
	[ "ImSorryIHaventAClue-",                                 "Clue"                    ],
	[ "JustAMinute",                                          "Just"                    ],
];

////////////////////////////////////////////////////////////////////////////////
// Definitions

////////////////////////////////////////
// Local definitions

////////////////////////////////////////
// Exported definitions

export function convertKnownTitle( rawTitle: Type_convertKnownTitle_args ) : Type_convertKnownTitle_ret {
	let cookedTitle = rawTitle;
	ARR_KNOWN_TITLE.forEach( ( [ search, repl ] ) => {
		cookedTitle = cookedTitle.replace( search, repl );
	} );
	return cookedTitle;
}

////////////////////////////////////////////////////////////////////////////////
// Unit test definitions
