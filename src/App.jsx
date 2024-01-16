import React, { useState } from "react";
import backgroundImage from "./assets/image.png"; // Uncommented the image import

const CanvasWithBoxes = () => {
  const canvasSize = 52; // Size of the canvas in cm
  const boxSize = 1; // Size of each small box in cm

  const numberOfBoxesX = Math.floor(canvasSize / boxSize);
  const numberOfBoxesY = Math.floor(canvasSize / boxSize);

  const centerBoxX = Math.floor(numberOfBoxesX / 2);
  const centerBoxY = Math.floor(numberOfBoxesY / 2);

  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const boxes = [];
  for (let i = 0; i < numberOfBoxesX; i++) {
    for (let j = 0; j < numberOfBoxesY; j++) {
      const x = i * boxSize;
      const y = j * boxSize;
      const isCenterLargeBox =
        i >= 1 / boxSize &&
        i <= 51 / boxSize &&
        j >= 1 / boxSize &&
        j <= 51 / boxSize;

      const isCenterSmallBox =
        i === centerBoxX && j === centerBoxY;

      const isSelected = selectedBoxes.some(
        (selectedBox) =>
          selectedBox.x === x &&
          selectedBox.y === y &&
          selectedBox.width === boxSize &&
          selectedBox.height === boxSize
      );

      const selectedColor = isSelected ? selectedBoxes.find(box => box.x === x && box.y === y).color : null;

      boxes.push({
        id: `${i}-${j}`,
        x,
        y,
        width: boxSize,
        height: boxSize,
        isCenterLargeBox,
        isCenterSmallBox,
        isSelected,
        selectedColor,
      });
    }
  }

  // Log the number of small boxes
  console.log("Number of small boxes:", boxes.length);

  const handleBoxClick = (clickedBox) => {
    const isBoxSelected = selectedBoxes.some(
      (box) =>
        box.x === clickedBox.x &&
        box.y === clickedBox.y &&
        box.width === clickedBox.width &&
        box.height === clickedBox.height
    );

    let updatedSelectedBoxes;

    if (isBoxSelected) {
      updatedSelectedBoxes = selectedBoxes.filter(
        (box) =>
          box.x !== clickedBox.x ||
          box.y !== clickedBox.y ||
          box.width !== clickedBox.width ||
          box.height !== clickedBox.height
      );
    } else {
      // Set a default color or you can prompt the user to choose a color
      const color = prompt("Enter color for the box (e.g., red):") || "red";
      clickedBox.color = color;
      updatedSelectedBoxes = [...selectedBoxes, clickedBox];
    }

    setSelectedBoxes(updatedSelectedBoxes);
  };

  const handleMouseDown = () => {
    setIsDrawing(true);
  };

  const handleMouseMove = (event) => {
    if (!isDrawing) return;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const clickedBox = getClickedBox(mouseX, mouseY);

    if (clickedBox) {
      handleBoxClick(clickedBox);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const getClickedBox = (mouseX, mouseY) => {
    const canvas = document.getElementById("canvas");
    const canvasRect = canvas.getBoundingClientRect();
    const mouseXOnCanvas = mouseX - canvasRect.left;
    const mouseYOnCanvas = mouseY - canvasRect.top;

    for (let box of boxes) {
      if (
        mouseXOnCanvas >= box.x &&
        mouseXOnCanvas <= box.x + box.width &&
        mouseYOnCanvas >= box.y &&
        mouseYOnCanvas <= box.y + box.height
      ) {
        return box;
      }
    }

    return null;
  };

  return (
    <div
      style={{ width: "100%", height: "100vh", position: "relative" }}
      id="canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <img
        src={backgroundImage}
        alt="Canvas Background"
        style={{
          position: "absolute",
          width: `${canvasSize}cm`,
          height: `${canvasSize}cm`,
          zIndex: 0,
        }}
      />
      {boxes.map((box) => (
        <div
          key={box.id}
          style={{
            position: "absolute",
            left: `${box.x}cm`,
            top: `${box.y}cm`,
            width: `${box.width}cm`,
            height: `${box.height}cm`,
            backgroundColor: box.isSelected ? box.selectedColor || "green" : "transparent",
            border: box.isCenterLargeBox || box.isSelected ? `1px solid ${box.selectedColor || "red"}` : "1px solid red",
            zIndex: box.isCenterLargeBox ? 1 : 0,
          }}
          onClick={() => handleBoxClick(box)}
        ></div>
      ))}
    </div>
  );
};

export default CanvasWithBoxes;
