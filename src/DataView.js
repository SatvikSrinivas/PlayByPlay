import React, { useState } from 'react';
import './dropdown.css';
import DataTable from './DataTable';
import ToggleButton from './ToggleButton';

const overview = ['Plays', 'Yards', 'Rush', 'Rush Yards', 'Pass', 'Pass Yards', 'Shotgun', 'No Huddle'];
const run = ['left end', 'left tackle', 'left guard', 'up the middle', 'right guard', 'right tackle', 'right end'];
const pass = ['short left', 'short middle', 'short right', 'deep left', 'deep middle', 'deep right'];
const DOWN = 'Down';
const QUARTER = 'Quarter';

function DataView(props) {
    const [toggleState, setToggleState] = useState('Down');
    const info = props.info;

    const handleToggle = (newState) => {
        setToggleState(newState);
    };

    return (
        <div className="Container">
            <div>
                <ToggleButton onToggle={handleToggle} />
                {toggleState === 'Down' && (
                    <>
                        <DataTable title={'Overall'} name={info.Name} data={info.Down} headers={[DOWN, ...overview]} />
                        <DataTable title={'Run'} name={info.Name} data={info.Down} headers={[DOWN, ...run]} />
                        <DataTable title={'Pass'} name={info.Name} data={info.Down} headers={[DOWN, ...pass]} />
                    </>
                )}
                {toggleState === 'Quarter' && (
                    <>
                        <DataTable title={'Overall'} name={info.Name} data={info.Quarter} headers={[QUARTER, ...overview]} />
                        <DataTable title={'Run'} name={info.Name} data={info.Quarter} headers={[QUARTER, ...run]} />
                        <DataTable title={'Pass'} name={info.Name} data={info.Quarter} headers={[QUARTER, ...pass]} />
                    </>
                )}
            </div>
        </div>
    );
}

export default DataView;
