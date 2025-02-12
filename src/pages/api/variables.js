// pages/api/variables.js

import fs from 'fs';

export default function handler(req, res) {
	const { clientName, areColorsInSwatches, site = '' } = req.body;

	// const clientName = process.env.CLIENT_NAME;
	const clientsFolderPath = process.env.CLIENTS_FOLDER_PATH;

	if (!clientName) {
		return res.status(500).json({ error: 'Client name not configured' });
	}

	if (!clientsFolderPath) {
		return res.status(500).json({ error: 'Clients folder path not configured' });
	}

	// If stored under primary instead of global folder
	const clientFolderPath = site
		? `${clientsFolderPath}/${clientName}/sites/${site}/node_modules/plugins_extended/common/virtuals/css`
		: `${clientsFolderPath}/${clientName}/node_modules/plugins_extended/common/virtuals/css`;

		
	if (!fs.existsSync(clientFolderPath)) {
		return res.status(404).json({ error: 'Client folder not found' });
	}

	console.log(clientsFolderPath);

	const variablesPath = `${clientFolderPath}/variables.css`;
	const swatchesPath = `${clientFolderPath}/swatches.css`;

	if (!fs.existsSync(variablesPath)) {
		return res.status(404).json({ error: 'Variables file not found for this client' });
	}

	if (!fs.existsSync(swatchesPath)) {
		return res.status(404).json({ error: 'Swatches file not found for this client' });
	}

	try {
		const variablesContent = fs.readFileSync(variablesPath, 'utf8');
		const swatchesContent = fs.readFileSync(swatchesPath, 'utf8');

		const fontFamily = extractStylesFromPrefix(variablesContent, '--font-');
		const fontSizes = extractStylesFromPrefix(variablesContent, '--text-');
		const letterSpacing = extractStylesFromPrefix(variablesContent, '--tracking-');
		const lineHeight = extractStylesFromPrefix(variablesContent, '--leading-');
		const colors = extractColorsFromSwatches(areColorsInSwatches ? swatchesContent : variablesContent);

		const anyEmpty = [fontFamily, fontSizes, letterSpacing, lineHeight, colors].some((arr) => !arr.length);
		if (anyEmpty) return res.status(404).json({ error: 'No variables found for this client' });

		return res.status(200).send({
			fontFamily,
			fontSizes,
			letterSpacing,
			lineHeight,
			colors,
			clientName,
			anyEmpty,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: 'Failed to read variables and/or swatches files. Please check the files are present and the path is correct.',
		});
	}
}

function extractStylesFromPrefix(cssContent, stylePrefix) {
	return cssContent
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.startsWith(stylePrefix))
		.map((line) => line.split(/:\s*/).map((part) => part.trim()))
		.map(([variableName, value]) => [variableName, value?.toLowerCase().replace(';', '')]);
}

function extractColorsFromSwatches(swatchesContent, stylePrefix = '--') {
	return swatchesContent
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.startsWith(stylePrefix) && !line.startsWith('--sw'))
		.map((line) => line.split(/:\s*/).map((part) => part.trim()))
		.map(([variableName, value]) => [variableName, value?.toLowerCase().replace(';', '')]);
}
