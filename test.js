import React from 'react';
import * as d3 from 'd3';

const DrtChart = ({ recorddata }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            {recorddata.map((record, index) => (
                <div key={index} style={{ marginRight: '20px' }}>
                    <h3>Record {index + 1}</h3>
                    <ul>
                        <li>Chosen DRT: {record.chosen_drt}</li>
                        <li>Chosen Request: {record.chosen_request}</li>
                        <li>Time: {record.time}</li>
                        <h4>Candidates:</h4>
                        <ul>
                            {record.candidates.map((candidate, idx) => (
                                <li key={idx}>
                                    <p>DRT: {candidate.drt}</p>
                                    <p>Request: {candidate.req}</p>
                                    <p>Cost: {candidate.cost}</p>
                                    <p>RQ: {candidate.rq.join(',')}</p>
                                </li>
                            ))}
                        </ul>
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default DrtChart;
