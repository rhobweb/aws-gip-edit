
exports.serve = async (event, context) => {
	const { serve } = await import('./handler.js');
	return serve(event, context);
}
