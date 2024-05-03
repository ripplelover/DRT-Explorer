import React, { useState } from 'react';
import RequestChart from './RequestChart';
import NodeChart from './NodeChart';
import './App.css';
import jsonData from './record_list.json';
import nodeData from './SiouxFalls_node.csv';
import DrtChart from './DrtChart';
import drtData from './logs_20_47_25.json';
import getResolvedCount from './resolvedCount';
// import drtData from './logs_15_24_26.json';

function App() {
    const [sortOption, setSortOption] = useState('none');
    const [currentTime, setCurrentTime] = useState(661);

    const { resolvedCount, requestCount } = getResolvedCount(drtData, currentTime);

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const increaseTime = () => {
        setCurrentTime(currentTime + 1);
    }

    const decreaseTime = () => {
        setCurrentTime(currentTime - 1);
    }

    return (
        <div className="App" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            <nav style={{ height: '50px', background: 'white', backgroundColor: 'gray' }}>
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

            <div style={{ display: 'flex', flexDirection: 'row', flexGrow: '1', height: 'calc(100% - 50px)' }}>
                <div style={{ width: '50%', display: 'flex', flexDirection: 'column'}}>
                    <div style={{ flex: 1, backgroundColor: 'white' }}>
                        <RequestChart recorddata={jsonData} sortOption={sortOption} />
                    </div>
                    <div style={{ flex: 1, backgroundColor: 'white' }}>
                        <NodeChart recorddata={jsonData} nodeData={nodeData} />
                    </div>
                </div>
                <div style={{ width: '50%', backgroundColor: 'white', display: 'flex', flexDirection: 'column'}}>
                    <div>
                        <label>  현재 Time : </label> 
                        <input type="text" value={currentTime}/>
                        <button onClick={decreaseTime}> - </button>
                        <button onClick={increaseTime}> + </button>
                        <label> resolved : </label>
                        <span>{resolvedCount}</span>
                        <label> / </label>
                        <label> requested : </label>
                        <span>{requestCount}</span>
                        
                        <h4></h4>
                    </div>
                    <DrtChart recorddata={drtData} timedata={currentTime} />
                </div>
            </div>

        </div>
    );
}

export default App;
