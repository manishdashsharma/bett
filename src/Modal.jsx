/* eslint-disable react/prop-types */
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.css';
import { useState } from 'react';


export const ModalComponent = ({
   showModal, handleClose, selectedCells,
   clearSelectionByCells, selectionColors,
  currentSelection, setSelectionColors,
   coordinates, cellCoords }) => {

  const handleClearSelection = () => {
    clearSelectionByCells(selectedCells);
    handleClose(); // Close the modal after clearing the selection
  };

  const [ standNumber, setStandNumber ] = useState('')
  const [selectionOption, setSelectionOption] = useState('');
  const [ loading, setLoading] = useState(false)

  // const [ boxId, setBoxId ] = useState('')

  function hexToRGBA(hex, opacity) {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
  
    if (opacity) {
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } else {
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  

  const handleOptionChange = (e) => {
    setSelectionOption(e.target.value);
    const colorMap = {
      stand: hexToRGBA('#00FFFF', 0.5), // cyan with 50% opacity
      passage: hexToRGBA('#9e9e9e', 0.5), // grey with 50% opacity
      inactive: hexToRGBA('#ffffff', 0.5), // white with 50% opacity
    };
    const newColors = [...selectionColors];
    newColors[currentSelection] = colorMap[e.target.value];
    setSelectionColors(newColors);
  };


  const handleSubmit = async () => {
    console.log("selectionPoints", coordinates)
    setLoading(true)
    
    for (const { x, y } of cellCoords) {
      const data = {
        color_code: selectionColors[currentSelection],
        colm_number: `c${x}`,
        row_number: `r${y}`,
        stand_number: standNumber,
        type_of_place: selectionOption,
        box_id: `C${x + 1000}R${y + 1000}`
      };
    
      console.log(data);
  
      const response = await fetch('https://100085.pythonanywhere.com/api/v1/bett_event/65a927adc5b56cc2cab795f2/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        console.error('Failed to submit data for coordinates', x, y, response);
        // Optionally break the loop if you want to stop sending requests after the first failure
        break;
      }
    }
    setLoading(false)
  };

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Selection Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* <Form.Group className="mb-3" controlId="formStandNumber">
            <Form.Label>Box Id</Form.Label>
            <Form.Control 
              type="text" 
              value={boxId} 
            />
          </Form.Group> */}

          

          <Form.Group className="mb-3" controlId="formSelectionOption">
            <Form.Label>Selection Option</Form.Label>
            <Form.Control as="select" value={selectionOption} onChange={handleOptionChange}>
              <option value="">Select Selection Type</option>
              <option value="stand">Stand</option>
              <option value="passage">Passage</option>
              <option value="inactive">Inactive</option>
            </Form.Control>
          </Form.Group>

          { selectionOption === "stand" && 
            <Form.Group className="mb-3" controlId="formStandNumber">
              <Form.Label>Stand Number</Form.Label>
              <Form.Control type="text" placeholder="Enter stand number" value={standNumber} onChange={(e) => setStandNumber(e.target.value)} />
            </Form.Group>
          }

          <Form.Group className="mb-2" controlId="formCoordinates">
            <Form.Label>Selection Coordinates</Form.Label>
            <Form.Control as="textarea" readOnly value={JSON.stringify(cellCoords)} />
          </Form.Group>

          {/* <Form.Group controlId="formCoordinates">
            <Form.Label>Selected Cells</Form.Label>
            <Form.Control as="textarea" readOnly value={JSON.stringify(selectedCells)} />
          </Form.Group> */}
        </Form>
          
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleClearSelection}>
          Clear
        </Button>
        <Button variant="success" onClick={handleSubmit}>
          {loading ? 'submitting..' : 'submit'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};