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
    <div>
      <nav style={{ height: '50px', background: 'white', margin: '4px' }}>
        <span style={{ marginLeft: '10px', fontSize: '1.5rem' }}>DRT-Explorer</span>
      </nav>
      <div>
        <label htmlFor="sort">Sort : </label>
        <select id="sort" onChange={handleSortChange} value={sortOption}>
          <option value="none">none</option>
          <option value="ascending">ascending</option>
          <option value="descending">descending</option>
        </select>
      </div>
      <div
        className="App"
        style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
      >
        <RequestChart recorddata={jsonData} sortOption={sortOption} />
        <NodeChart recorddata={jsonData} nodeData={nodeData} />
      </div>
      <div style={{ display: 'flex' , height: '100px'}}></div>

    </div>
  );
}

export default App;