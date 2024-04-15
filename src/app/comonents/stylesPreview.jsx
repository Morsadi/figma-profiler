import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ghcolors as theme } from 'react-syntax-highlighter/dist/esm/styles/prism';

const StylesPreview = ({ currentStyle }) => {
	return (
		<>
			{currentStyle ? (
				<SyntaxHighlighter
					language='css'
					style={theme}>
					{Object.entries(currentStyle)
						.map(([property, value]) => `${property}: ${value};\n`)
						.join('')}
				</SyntaxHighlighter>
			) : (
				<p>No style selected.</p>
			)}
		</>
	);
};

export default StylesPreview;
