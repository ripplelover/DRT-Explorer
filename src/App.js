import React, { useState } from 'react';
import RequestChart from './RequestChart';
import NodeChart from './NodeChart';
import './App.css';
import jsonData from './record_list.json';
import nodeData from './SiouxFalls_node.csv';

function App() {
    const [sortOption, setSortOption] = useState('none');

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    return (
        <div className="App" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            <nav style={{ height: '50px', background: 'white', backgroundColor: 'gray' }}>
                <span style={{ marginLeft: '10px', fontSize: '1.5rem' }}>DRT-Explorer</span>
            </nav>
            {/* <div>
                <label htmlFor="sort">Sort : </label>
                <select id="sort" onChange={handleSortChange} value={sortOption}>
                    <option value="none">none</option>
                    <option value="ascending">ascending</option>
                    <option value="descending">descending</option>
                </select>
            </div> */}

            <div style={{ display: 'flex', flexGrow: '1', backgroundColor: 'yellow' }}>
                <RequestChart recorddata={jsonData} sortOption={sortOption} />
                <NodeChart recorddata={jsonData} nodeData={nodeData} />
            </div>

            <div style={{ height: '100px', backgroundColor: 'red' }}></div>

        </div>
    );
}

export default App;
