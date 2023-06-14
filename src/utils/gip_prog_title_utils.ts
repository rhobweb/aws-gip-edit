/**
 * 
 */

type SearchReplaceTuple = [ ( string | RegExp ), string ];

const ARR_KNOWN_TITLE : SearchReplaceTuple[] = [
  [ /TheArchersOmnibus-([0-9]{2})\/([0-9]{2})\/([0-9]{4})/, "ArchersOmnibus$3$2$1" ],
  [ "TheArchersOmnibus",                                    "ArchersOmnibus"       ],
  [ /TheArchers-([0-9]{2})\/([0-9]{2})\/([0-9]{4})/,        "Archers$3$2$1"        ],
  [ "TheArchers",                                           "Archers"              ],
  [ "DesertIslandDiscsRevisited",                           "DID"                  ],
  [ "DesertIslandDiscs",                                    "DID"                  ],
  [ "ImSorryIHaventAClue-",                                 "Clue"                 ],
  [ "JustAMinute",                                          "Just"                 ],
  [ "Series",                                               "S"                    ],
];

export function convertKnownTitle( rawTitle: string ) {
  let cookedTitle = rawTitle;
  ARR_KNOWN_TITLE.forEach( ( [ search, repl ] ) => {
    cookedTitle = cookedTitle.replace( search, repl );
  } );
  return cookedTitle;
}
