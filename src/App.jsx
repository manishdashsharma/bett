/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { throttle } from 'lodash'; // Ensure lodash is installed
import map from "./assets/image3.png"
const App = () => {
  const canvasSize = 520; // in centimeters
  const boxSize = 1; // in centimeters
  const numBoxes = Math.floor(canvasSize / boxSize);

  // Using a Set to track selected cells for more efficient updates
  const [selectedCells, setSelectedCells] = useState(new Set());
  // Additional state to track cells that are highlighted during dragging
  const [highlightedCells, setHighlightedCells] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const startCellIndexRef = useRef(null);
  const endCellIndexRef = useRef(null);

  // useMemo to avoid recalculating grid cells unless numBoxes changes
  const gridCells = useMemo(() => Array.from({ length: numBoxes * numBoxes }), [numBoxes]);


  // calculate the corners of the selected area
  const calculateCorners = (start, end) => {
    const startRow = Math.floor(start / numBoxes);
    const startCol = start % numBoxes;
    const endRow = Math.floor(end / numBoxes);
    const endCol = end % numBoxes;

    const topLeft = Math.min(startRow, endRow) * numBoxes + Math.min(startCol, endCol);
    const topRight = Math.min(startRow, endRow) * numBoxes + Math.max(startCol, endCol);
    const bottomLeft = Math.max(startRow, endRow) * numBoxes + Math.min(startCol, endCol);
    const bottomRight = Math.max(startRow, endRow) * numBoxes + Math.max(startCol, endCol);

    return { topLeft, topRight, bottomLeft, bottomRight };
  };

  // State to track the color of each selected cell
  const [cellColors, setCellColors] = useState({});

  // Function to generate a random color
  const getRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  const toggleCellSelection = useCallback(() => {
    setSelectedCells((prevSelectedCells) => {
      const newSelection = new Set(prevSelectedCells);
      const start = startCellIndexRef.current;
      const end = endCellIndexRef.current;

      const startRow = Math.floor(start / numBoxes);
      const startCol = start % numBoxes;
      const endRow = Math.floor(end / numBoxes);
      const endCol = end % numBoxes;

      const newCellColors = { ...cellColors };

      // Get a random color for the new selection
      const selectionColor = getRandomColor(); 

      for (let i = Math.min(startRow, endRow); i <= Math.max(startRow, endRow); i++) {
        for (let j = Math.min(startCol, endCol); j <= Math.max(startCol, endCol); j++) {
          const cellIndex = i * numBoxes + j;
          if (newSelection.has(cellIndex)) {
            newSelection.delete(cellIndex);
            delete newCellColors[cellIndex]; // Remove color when unselected
          } else {
            newSelection.add(cellIndex);
            newCellColors[cellIndex] = selectionColor; // Assign color when selected
          }
        }
      }

      setCellColors(newCellColors);
      return newSelection;
    });

    // Calculate and log the corners of the selected area
    const corners = calculateCorners(startCellIndexRef.current, endCellIndexRef.current);
    console.log('Corners:', corners);
    // After selection, clear the highlighted cells
    setHighlightedCells(new Set());
  }, [numBoxes, cellColors]);

  const updateHighlightedCells = useCallback((cellIndex) => {
    const newHighlightedCells = new Set();
    const start = startCellIndexRef.current;
    const end = cellIndex;

    const startRow = Math.floor(start / numBoxes);
    const startCol = start % numBoxes;
    const endRow = Math.floor(end / numBoxes);
    const endCol = end % numBoxes;

    for (let i = Math.min(startRow, endRow); i <= Math.max(startRow, endRow); i++) {
      for (let j = Math.min(startCol, endCol); j <= Math.max(startCol, endCol); j++) {
        newHighlightedCells.add(i * numBoxes + j);
      }
    }

    setHighlightedCells(newHighlightedCells);
  }, [numBoxes]);

  const handleMouseDown = useCallback((cellIndex) => {
    setIsDragging(true);
    startCellIndexRef.current = cellIndex;
    // Highlight the initial cell on mouse down
    setHighlightedCells(new Set([cellIndex]));
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    toggleCellSelection();
    // Clear highlighted cells on mouse up
    setHighlightedCells(new Set());
  }, [toggleCellSelection]);

  // Throttle the mouse enter event to improve performance
  const throttledMouseEnter = useCallback(throttle((cellIndex) => {
    if (isDragging) {
      endCellIndexRef.current = cellIndex;
      updateHighlightedCells(cellIndex);
    }
  }, 10), [isDragging, updateHighlightedCells]);

  const gridStyle = useMemo(() => ({
    position: 'relative',
    gridTemplateColumns: `repeat(${numBoxes}, ${boxSize}cm)`,
    gridTemplateRows: `repeat(${numBoxes}, ${boxSize}cm)`,
  }), [numBoxes, boxSize]);

  const canvasStyle = useMemo(() => ({
    position: 'relative',
    width: `${canvasSize}cm`, // Set the width of the canvas
    height: `${canvasSize}cm`, // Set the height of the canvas
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }), [canvasSize]);

  const imageStyle = {
    position: 'absolute',
    maxWidth: '100%',
    maxHeight: '100%',
    // border: "3px solid #000000",
  };

  return (

    <div style={canvasStyle}>
    <img
      src={map}
      alt="Background"
      style={imageStyle}
    />
    <div
      className="grid"
      style={gridStyle}
      onMouseUp={handleMouseUp}
    >
      {gridCells.map((_, index) => (
        <div
          key={index}
          className={`box ${selectedCells.has(index) ? 'selected' : ''} ${highlightedCells.has(index) ? 'highlighted' : ''}`}
          style={{ backgroundColor: cellColors[index] }} // Apply the color
          onMouseDown={() => handleMouseDown(index)}
          onMouseEnter={() => throttledMouseEnter(index)}
        />
      ))}
    </div>
  </div>
  );
};

export default App;