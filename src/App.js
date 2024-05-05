import React, { useState } from 'react';
import RequestChart from './RequestChart';
import NodeChart from './NodeChart';
import './App.css';
import jsonData from './record_list.json';
import nodeData from './SiouxFalls_node.csv';
import DrtChart from './DrtChart';
import drtData from './logs_20_47_25.json';
// import getResolvedCount from './resolvedCount';
// import drtData from './logs_15_24_26.json';

function App() {
    // const [currentTime, setCurrentTime] = useState(661);

    // const { resolvedCount, requestCount } = getResolvedCount(drtData, currentTime);

    // const increaseTime = () => {
    //     setCurrentTime(currentTime + 1);
    // }

    // const decreaseTime = () => {
    //     setCurrentTime(currentTime - 1);
    // }

    return (
        <div className="App" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            <nav style={{ display: 'flex', alignItems: 'center', height: '50px', backgroundColor: '#f8f9fa', color: '#343a40' }}>
                <span style={{ marginLeft: '10px', fontSize: '1.7rem' }}>DRT-Analyzer</span>
            </nav>

            <div style={{ display: 'flex', flexDirection: 'row', flexGrow: '1', margin: '5px' }}>

                <div style={{ width: '50%', display: 'flex', flexGrow: '1', flexDirection: 'column' }}>

                    <div className='rel' style={{ flex: 1 }}>
                        <RequestChart recorddata={jsonData} />
                    </div>

                    <div className='rel' style={{ flex: 1 }}>
                        <NodeChart recorddata={jsonData} nodeData={nodeData} />
                    </div>
                </div>

                <div style={{ width: '50%', flexGrow: '1', display: 'flex', flexDirection: 'column' }}>

                    <div className='rel' style={{ flexGrow: 1 }}>
                        <DrtChart recorddata={drtData} />
                    </div>

                </div>
            </div>

        </div>
    );
}

export default App;
