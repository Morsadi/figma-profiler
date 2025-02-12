'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaCheck } from 'react-icons/fa';
import { LuFrame } from 'react-icons/lu';
import { IoShieldCheckmarkSharp } from 'react-icons/io5';

import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/base16/ashes.css';
import styles from '../styles/Viewer.module.css';
import StylesPreview from './stylesPreview';
import css from 'highlight.js/lib/languages/css';

// Register the CSS language
hljs.registerLanguage('css', css);

const FigmaViewer = ({ fileKey }) => {
	const [data, setData] = useState(null);
	const [variables, setVariables] = useState(null);
	const [currentNode, setCurrentNode] = useState({});
	const [currentStyle, setCurrentStyle] = useState(null);
	const [path, setPath] = useState([]);
	const [activeNodeId, setActiveNodeId] = useState(null);
	const [clientName, setClientName] = useState(() => {
		const storedClientName = localStorage.getItem('clientName');
		return storedClientName || 'lasvegas-redesign';
	});
	const [site, setSite] = useState(() => {
		const storedSite = localStorage.getItem('site');
		return storedSite || 'primary';
	});

	const [areColorsInSwatches, setAreColorsInSwatches] = useState(() => {
		const storedAreColorsInSwatches = localStorage.getItem('areColorsInSwatches');
		return storedAreColorsInSwatches ? JSON.parse(storedAreColorsInSwatches) : false;
	});

	useEffect(() => {
		localStorage.setItem('clientName', clientName);
		localStorage.setItem('areColorsInSwatches', JSON.stringify(areColorsInSwatches));

		localStorage.setItem('site', site);
		localStorage.setItem('areColorsInSwatches', JSON.stringify(areColorsInSwatches));
	}, [clientName, site, areColorsInSwatches]);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		setCurrentStyle(null);

		try {
			const [data, variables] = await Promise.all([fetchInitialData(), fetchInitialVariables()]);
			setData(data);
			setVariables(variables); // Update variables state
			setCurrentNode(data.document.children[0]); // Setting initial node
			setPath([data.document.children[0]]); // Initialize path with initial node
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			hljs.highlightAll();
		}
	};
	const fetchInitialData = async () => {
		const response = await fetch(`/api/data`);
		return response.json();
	};
	const fetchInitialVariables = async () => {
		const response = await fetch(`/api/variables`, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
			},
			body: JSON.stringify({ clientName, areColorsInSwatches, site }),
		});

		return response.json();
	};

	function findMatchingVariable(value, array) {
		if (!array) {
			return value;
		}

		const match = array.find(([variable, variableValue]) => variableValue === value);

		return match ? `var(${match[0]})` : value;
	}
	function findMatchingFontVariable(fontFamily, array) {
		if (!array) {
			throw new Error('array is null');
		}
		let result = fontFamily;
		try {
			array.forEach(([prop, value]) => {
				if (value && value.indexOf(fontFamily) !== -1) {
					result = `var(${prop})`;
				}
			});
		} catch (error) {
			console.error('Error finding matching font variable:', error);
		}
		return result;
	}

	function handleNodeClick(node) {
		setCurrentNode(node);
		setPath([...path, node]);
		setCurrentStyle(null);
	}

	function truncateTextAt(text, length) {
		return text.length <= length ? text : text.slice(0, length) + '…';
	}

	function handleTextClick(node, updatePath) {
		if (updatePath) {
			const index = path.findIndex((item) => item.id === node.id);
			if (index !== -1) {
				// Trim the path to include only nodes up to the clicked node
				setPath(path.slice(0, index + 1));
				setCurrentNode(node);
				setCurrentStyle(null);
			}
			setActiveNodeId(null);
		} else {
			node.style ? setCurrentStyle(extractTextProps(node)) : setCurrentStyle(node.styles);
			setActiveNodeId(node.id);
		}
	}

	function fontSizeToRems(fontSize) {
		let initialFontSize = `${fontSize / 16}rem`;

		return findMatchingVariable(initialFontSize, variables.fontSizes);
	}

	function letterSpeceToEm(fontSizeInPX, letterSpacingInPx) {
		if (!variables || !variables.letterSpacing) {
			console.error('Variables are not yet loaded');
			return `${Math.round((letterSpacingInPx / fontSizeInPX) * 1000) / 1000}em`;
		}

		const initialLetterSpacing = Math.round((letterSpacingInPx / fontSizeInPX) * 1000) / 1000;

		return (
			findMatchingVariable(`${initialLetterSpacing}em`, variables.letterSpacing) || `${initialLetterSpacing}em`
		);
	}

	function lineHeightPxToEm(lineHeightInPx) {
		if (!variables || !variables.lineHeight) {
			console.error('Variables are not yet loaded');
			return `${parseFloat((lineHeightInPx / 100).toFixed(3))}`;
		}

		const initialLineHeight = `${parseFloat((lineHeightInPx / 100).toFixed(3))}`;
		return findMatchingVariable(initialLineHeight, variables.lineHeight);
	}

	function fontFamilyToVariable(fontFamily) {
		if (!variables || !variables.fontFamily) {
			console.error('Variables are not yet loaded');
			return fontFamily;
		}

		return findMatchingFontVariable(fontFamily.toLowerCase(), variables.fontFamily);
	}

	function rgbToHex({ r, g, b }) {
		return `#${[r, g, b]
			.map((c) =>
				Math.round(c * 255)
					.toString(16)
					.padStart(2, '0')
			)
			.join('')}`;
	}

	const extractTextProps = (node) => {
		const { style } = node;
		const props = {};

		const fontSize = parseFloat(style.fontSize);
		const letterSpacing = parseFloat(style.letterSpacing);
		const lineHeight = parseFloat(style.lineHeightPercentFontSize);
		const fontWeight = parseFloat(style.fontWeight);

		console.log(style);

		if (style.fontFamily) {
			props['font-family'] = fontFamilyToVariable(style.fontFamily);
		}

		if (!isNaN(fontWeight)) {
			props['font-weight'] = fontWeight;
		}

		if (node.fills[0]?.color) {
			let color = rgbToHex(node.fills[0].color);

			if (color === '#ffffff' || color === '#fff') {
				props['color'] = 'var(--white)';
			} else if (color === '#000000' || color === '#000') {
				props['color'] = 'var(--black)';
			} else {
				props['color'] = findMatchingVariable(color, variables.colors);
			}
		}

		if (!isNaN(fontSize)) {
			props['font-size'] = fontSizeToRems(fontSize);
		}

		if (!isNaN(letterSpacing) && letterSpacing !== 0) {
			props['letter-spacing'] = letterSpeceToEm(fontSize, letterSpacing);
		}

		if (!isNaN(lineHeight) && lineHeight !== 0) {
			props['line-height'] = lineHeightPxToEm(lineHeight);
		}

		if (style.textCase === 'UPPER') {
			props['text-transform'] = 'uppercase';
		}

		return props;
	};

	return (
		<section className={styles.mainSection}>
			<div className={styles.settings}>
				<div>
					<input
						placeholder='Client Name'
						value={clientName}
						onChange={(e) => {
							setClientName(e.target.value);
							localStorage.setItem('clientName', e.target.value);
						}}
						type='text'
					/>
					<input
						placeholder='Site'
						value={site}
						onChange={(e) => {
							setSite(e.target.value);
							localStorage.setItem('site', e.target.value);
						}}
						type='text'
					/>
					<button onClick={() => fetchData()}>Find</button>
				</div>
				<div>
					<p>Are colors declared in Swatches?</p>
					<label>
						<input
							type='radio'
							name='ratio'
							checked={!areColorsInSwatches}
							onChange={() => {
								setAreColorsInSwatches(false);
								localStorage.setItem('areColorsInSwatches', 'false');
							}}
						/>
						Variables
					</label>
					<label>
						<input
							type='radio'
							name='ratio'
							checked={areColorsInSwatches}
							onChange={() => {
								setAreColorsInSwatches(true);
								localStorage.setItem('areColorsInSwatches', 'true');
							}}
						/>
						Swatches
					</label>
				</div>
			</div>
			{data ? (
				<div className={styles.container}>
					{variables && (
						<div className={styles.tooltip}>
							<span data-uploaded={variables.error ? false : true}>
								<IoShieldCheckmarkSharp />
								{variables?.clientName} Variables
							</span>
						</div>
					)}

					<nav className={styles.breadcrumb}>
						{path.map((node, index) => (
							<span
								key={node.id}
								onClick={() => handleTextClick(node, true)}>
								{index > 0 && <span> / </span>} {/* Render separator if not first node */}
								{node.name}
							</span>
						))}
					</nav>
					<div className={styles.navigation}>
						<ul>
							{currentNode && currentNode.children ? (
								currentNode.children.map((child) => (
									<li
										data-type={child.type}
										data-children={!!child.children}
										data-active={child.id === activeNodeId}
										className={styles.type}
										key={child.id}
										onClick={
											child.children
												? () => handleNodeClick(child)
												: () => handleTextClick(child, false)
										}
										tooltip={child.type}>
										{child.type !== 'TEXT' && <LuFrame />}
										{/* {child.type === 'VECTOR' && <BsVectorPen />}
											{child.type === 'RECTANGLE' && <FaShapes />} */}
										<span>{truncateTextAt(child.name, 60)}</span>{' '}
										{child.children ? ( // Render arrow icon if children exist
											<FaPlus
												className={styles.arrow}
												onClick={() => handleNodeClick(child)}
											/>
										) : null}
									</li>
								))
							) : (
								// .reverse()
								<li>No children available.</li>
							)}
						</ul>
						{/* <button onClick={handleGoBack}>Go Back</button> */}
					</div>
					{currentStyle && <StylesPreview currentStyle={currentStyle} />}
				</div>
			) : (
				<p>Loading...</p>
			)}
		</section>
	);
};

export default FigmaViewer;
