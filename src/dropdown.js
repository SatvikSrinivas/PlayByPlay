import React, { useState } from 'react';
import './dropdown.css';
import DataView from './DataView';

function Dropdown(props) {
    const header = props.header;
    const info = props.info;
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="Container">
            <button className="teamDropdown" onClick={toggleDropdown}>
                {header}
            </button>
            {isOpen && (
                <div>
                    <DataView info={info} />
                </div>
            )}
        </div>
    );
}

export default Dropdown;
