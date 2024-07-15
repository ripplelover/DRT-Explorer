import React, { useState, useEffect } from 'react';
import RequestChart from './RequestChart';
import NodeChart from './NodeChart';
import DrtChart from './DrtChart';
import './App.css';
import getResolvedCount from './getResolvedCount';  // Import the function to calculate resolvedCount

function App() {
    const [refresh, setRefresh] = useState(0);
    const [jsonData, setJsonData] = useState(null);
    const [nodeData, setNodeData] = useState(null);
    const [drtData, setDrtData] = useState(null);
    const [resolvedData, setResolvedData] = useState({ resolvedCount: 0, requestCount: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jsonResponse = await fetch('http://localhost:8664/api/record_list');
                const jsonResult = await jsonResponse.json();
                setJsonData(jsonResult);

                const nodeResponse = await fetch('http://localhost:8664/api/node_data');
                const nodeResult = await nodeResponse.text();  // CSV data is text
                setNodeData(nodeResult);

                const drtResponse = await fetch('http://localhost:8664/api/drt_data');
                const drtResult = await drtResponse.json();
                setDrtData(drtResult);

                // Calculate resolvedCount and requestCount
                const currentTime = 'desired_time_value';  // Replace with the appropriate time value
                const resolvedCountData = getResolvedCount(drtResult, currentTime);
                setResolvedData(resolvedCountData);

                setRefresh(prev => prev + 1);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    if (!jsonData || !nodeData || !drtData) {
        return <div>Loading...</div>;
    }

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
                        <DrtChart recorddata={drtData} recordList={jsonData} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
