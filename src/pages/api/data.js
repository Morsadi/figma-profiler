const Figma = require('figma-js');

export default async function handler(req, res) {
	const client = Figma.Client({
		personalAccessToken: process.env.ACCESS_TOKEN,
	});

	const fileKey = process.env.FILE_KEY; // should be in the URL
	try {
		const file = await client.file(fileKey);
		const { data = {} } = file;

		if (!data || !data.document || !data.document.children || data.document.children.length === 0) {
			// Handle the case where there is no data or an empty document
			throw new Error('No data available in Figma file.');
		}

		res.status(200).json(data);
	} catch (err) {
		console.error('Error fetching Figma file:', err);
		res.status(500).json({ error: 'Error fetching Figma file', message: err.message });
	}
}
