'use client';

import React, { useState, useEffect } from 'react';
import { FaAngleRight } from 'react-icons/fa'; // Importing arrow icon
import styles from '../styles/Viewer.module.css';
import StylesPreview from './stylesPreview'

const FigmaViewer = ({ fileKey }) => {
	const [data, setData] = useState(null);
	const [currentNode, setCurrentNode] = useState({});
	const [currentStyle, setCurrentStyle] = useState({});
	const [path, setPath] = useState([]);

	useEffect(() => {
		fetchData();
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
        setCurrentStyle({})
	};

	const handleTextClick = (node, updatePath) => {
		if (updatePath) {
			const index = path.findIndex((item) => item.id === node.id);
			if (index !== -1) {
				// Trim the path to include only nodes up to the clicked node
				setPath(path.slice(0, index + 1));
				setCurrentNode(node);
			}

		} else {
			setCurrentStyle(node.style);
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
        setCurrentStyle({})
	};


	return (
		<div>
			{data ? (
				<div>
					<div className={styles.navigation}>
						<nav className={styles.breadcrumb}>
							{path.map((node, index) => (
								<span key={node.id} onClick={() => handleTextClick(node, true)}>
									{index > 0 && <span> / </span>} {/* Render separator if not first node */}
									{node.name}
								</span>
							))}
						</nav>
						<ul>
							{currentNode && currentNode.children ? (
								currentNode.children.map((child) => (
									<li key={child.id}>
										{child.children ? ( // Render arrow icon if children exist
											<FaAngleRight onClick={() => handleNodeClick(child)} />
										) : null}
										<span onClick={() => handleTextClick(child, false)}>{child.name}</span>{' '}
										{/* Render text separately */}
									</li>
								))
							) : (
								<li>No children available.</li>
							)}
						</ul>
						<button onClick={handleGoBack}>Go Back</button>
					</div>
                    <StylesPreview currentStyle={currentStyle}/>
				</div>
			) : (
				<p>Loading...</p>
			)}
		</div>
	);
};

export default FigmaViewer;
