'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaShapes } from 'react-icons/fa';
import { LuFrame } from 'react-icons/lu';
import { BsVectorPen } from 'react-icons/bs';

import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/base16/ashes.css';
import styles from '../styles/Viewer.module.css';
import StylesPreview from './stylesPreview';
import css from 'highlight.js/lib/languages/css';

// Register the CSS language
hljs.registerLanguage('css', css);

const FigmaViewer = ({ fileKey }) => {
	const [data, setData] = useState(null);
	const [currentNode, setCurrentNode] = useState({});
	const [currentStyle, setCurrentStyle] = useState(null);
	const [path, setPath] = useState([]);

	useEffect(() => {
		fetchData();
		hljs.highlightAll();
	}, []);

	const fetchData = async () => {
		try {
			const initialData = await fetchInitialData(fileKey);
			setData(initialData);
			setCurrentNode(initialData.document.children[0]); // Setting initial node
			setPath([initialData.document.children[0]]); // Initialize path with initial node
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	};

	const fetchInitialData = async (fileKey) => {
		const response = await fetch(`/api/data`);
		return response.json();
	};

	const handleNodeClick = (node) => {
		setCurrentNode(node);
		setPath([...path, node]);
		setCurrentStyle(null);
	};

	const truncateTextAt = (text, length) => {
		return text.length <= length ? text : text.slice(0, length) + '…';
	};

	const handleTextClick = (node, updatePath) => {
		if (updatePath) {
			const index = path.findIndex((item) => item.id === node.id);
			if (index !== -1) {
				// Trim the path to include only nodes up to the clicked node
				setPath(path.slice(0, index + 1));
				setCurrentNode(node);
				setCurrentStyle(null);
			}
		} else {
			node.style ? setCurrentStyle(node.style) : setCurrentStyle(node.styles);
			console.log(node);
		}
	};

	const handleGoBack = () => {
		if (path.length > 1) {
			const newPath = [...path];
			newPath.pop(); // Remove the current node from the path
			const previousNode = newPath[newPath.length - 1]; // Get the previous node
			setCurrentNode(previousNode); // Set the current node to the previous node
			setPath(newPath); // Update the path
		}
		setCurrentStyle(null);
	};

	return (
		<>
			{data ? (
				<div className={styles.container}>
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
										className={styles.type}
										key={child.id}
										tooltip={child.type}>
										{child.type === 'FRAME' && <LuFrame />}
										{child.type === 'VECTOR' && <BsVectorPen />}
										{child.type === 'RECTANGLE' && <FaShapes />}
										<span
											onClick={
												child.children
													? () => handleNodeClick(child)
													: () => handleTextClick(child, false)
											}>
											{truncateTextAt(child.name, 120)}
										</span>{' '}
										{child.children ? ( // Render arrow icon if children exist
											<FaPlus
												className={styles.arrow}
												onClick={() => handleNodeClick(child)}
											/>
										) : null}
										{/* Render text separately */}
									</li>
								))
							) : (
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
		</>
	);
};

export default FigmaViewer;
