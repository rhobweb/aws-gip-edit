

//const programs = async () => {
//  const programs = (await import( './programs.js' )).default;
//  return programs;
//}

console.log( "progs.cjs*********************" );

exports.handler = async (...args) => {
  console.log( "progs.cjs: try to import programs.js *********************" );
	const { handler } = (await import('./programs.js')).default;
	return handler(...args);
}


//const programs = require( './programs' );
//console.log( `Programs: ${typeof programs}: `, { keys: Object.keys( programs ) } );
//exports = { handler: programs.handler };
