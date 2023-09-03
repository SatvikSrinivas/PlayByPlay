import React, { useState, useEffect } from 'react';
import './ToggleButton.css'; // Import your CSS file

function ToggleButton({ onToggle }) {
    const [currentState, setCurrentState] = useState('Down');

    const toggleState = () => {
        const newState = currentState === 'Down' ? 'Quarter' : 'Down';
        setCurrentState(newState);
        onToggle(newState);
    };

    return (
        <div className="toggle-button-container">
            <button className="toggle-button" onClick={toggleState}>{currentState}</button>
        </div>
    );
}

export default ToggleButton;
