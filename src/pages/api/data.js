const Figma = require('figma-js');
const flatted = require('flatted');

export default async function handler(req, res) {
	const client = Figma.Client({
		personalAccessToken: process.env.ACCESS_TOKEN,
	});

	const fileKey = 'eG9oxCYlvvYWDraiQUzalz'; // should be in the URL
	const pageFrame = 'library-lg';
	const widgetFrame = 'testing';

	try {
		const file = await client.file(fileKey);
		const { data = {} } = file;

		if (!data || !data.document || !data.document.children || data.document.children.length === 0) {
			// Handle the case where there is no data or an empty document
			throw new Error('No data available in Figma file.');
		}

		let board = data.document.children[0];
		let page = board.children.filter((val) => val.name === pageFrame)[0];

		if (!page || !page.children || page.children.length === 0) {
			// Handle the case where there are no pages or an empty page
			throw new Error('No page or empty page found.');
		}

		let widget = page.children.filter((val) => val.name === widgetFrame)[0];

		if (!widget || !widget.children || widget.children.length === 0) {
			// Handle the case where there are no widgets or an empty widget
			throw new Error('No widget or empty widget found.');
		}

		res.status(200).json(data);
	} catch (err) {
		console.error('Error fetching Figma file:', err);
		res.status(500).json({ error: 'Error fetching Figma file', message: err.message });
	}
}
