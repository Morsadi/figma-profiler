const Figma = require('figma-js');
const axios = require('axios');
const https = require('https');

export default async function handler(req, res) {
	// Create an Axios instance with custom HTTPS agent to ignore SSL certificate verification
	const axiosInstance = axios.create({
		httpsAgent: new https.Agent({ rejectUnauthorized: false }),
	});

	// Initialize the Figma client with the custom Axios instance
	const client = Figma.Client({
		personalAccessToken: process.env.ACCESS_TOKEN,
		axios: axiosInstance, // Pass the custom Axios instance here
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
