import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import getResolvedCount from './resolvedCount';

const DrtChart = ({ recorddata }) => {

    const [currentTime, setCurrentTime] = useState(661);
    const svgRef = useRef();
    const containerRef = useRef();
    // let resolvedCount = 0;
    // let requestCount = 0;

    const { resolvedCount, requestCount } = getResolvedCount(recorddata, currentTime);

    const increaseTime = () => {
        setCurrentTime(currentTime + 1);
    }

    const decreaseTime = () => {
        setCurrentTime(currentTime - 1);
    }

    useEffect(() => {
        clearVisualElements();
        createVisualElements();
    }, [recorddata, currentTime]);

    // console.log(recorddata, timedata);

    const clearVisualElements = () => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
    };

    const createVisualElements = () => {

        let filteredData = recorddata.filter(d => d.time == currentTime);
        let rowCount = 0;
        filteredData.forEach((d, i) => {
            let candidates = d.candidates;
            rowCount += candidates.length;
            // rowCount += 1;
        });

        const svg = d3.select(svgRef.current);
        const spacing = 30;
        const bw = containerRef.current.clientWidth;
        // const bh = containerRef.current.clientHeight;
        const bh = rowCount * spacing + 50;

        svg.attr('width', bw).attr('height', bh);
        // filter는 recorddata에서 timedata와 같은 time을 가진 데이터만 추출

        // console.log(filteredData);
        let xStart = 10;
        let yStart = 10;
        let k = 0;
        let unitW = 50;
        let unitH = 16;
        let ws = 5;
        let xs = 300;
        let yPosition = yStart + k * spacing;
        filteredData.forEach((d, i) => {
            let candidates = d.candidates;
            let chosenID = d.chosen_queue;

            candidates.forEach((candidate, index) => {
                let currID = candidate.id;
                let rqLength = candidate.rq.length;
                yPosition = yStart + k * spacing;
                k += 1;

                if (chosenID == currID) {
                    // resolvedCount += 1;
                    svg.append('rect')
                        .attr('x', 0)
                        .attr('y', yPosition - 4)
                        .attr('width', bw)
                        .attr('height', unitH + 8)
                        .attr('fill', '#F4A460');
                }
                // console.log(k, d.time, rqLength);
                svg.append('text')
                    .attr('x', xStart)
                    .attr('y', yPosition + 12)
                    .attr('font-size', '0.85rem')
                    .text("DRT: " + candidate.drt);

                svg.append('text')
                    .attr('x', xStart + 50)
                    .attr('y', yPosition + 12)
                    .attr('font-size', '0.85rem')
                    .text("Request: " + candidate.req);

                svg.append('text')
                    .attr('x', xStart + 130)
                    .attr('y', yPosition + 12)
                    .attr('font-size', '0.85rem')
                    .text("Cost: " + candidate.cost);

                svg.append('rect')
                    .attr('x', xStart + 190)
                    .attr('y', yPosition + 2)
                    .attr('width', candidate.cost * 5)
                    .attr('height', unitH - 4)
                    .attr('fill', 'skyblue')
                    .attr('stroke', 'black')
                    .attr('stroke-width', 0);

                for (let i = 0; i < rqLength; i++) {
                    let req = candidate.rq[i];
                    svg.append('rect')
                        .attr('x', i * (ws + unitW) + xs * 1.5)
                        .attr('y', yPosition)
                        .attr('width', unitW)
                        .attr('height', unitH)
                        .attr('rx', 4)
                        .attr('ry', 4)
                        .attr('fill', '#F4C430')
                        .attr('stroke', 'black')
                        .attr('stroke-width', () => {
                            if (candidate.req === Math.abs(req)) return 2;
                            else return 0;
                        });

                    svg.append('circle')
                        .attr('cx', i * (ws + unitW) + xs * 1.5 + unitW - 8)
                        .attr('cy', yPosition + unitH / 2)
                        .attr('r', 3)
                        .attr('fill', () => {
                            if (req > 0) return 'red';
                            else return 'blue';
                        });
                }
            });

            console.log(resolvedCount);
            console.log(requestCount);

            svg.append('line')
                .attr('x1', 0)
                .attr('y1', yPosition + unitH * 1.5)
                .attr('x2', bw)
                .attr('y2', yPosition + unitH * 1.5)
                .attr('stroke', 'black')
                .attr('stroke-width', 1);
        });

    };

    return (

        <div className="content-view abs-fill" style={{ display: 'flex', flexDirection: 'column' }}>

            <div class='content-header' style={{ display: 'flex', paddingLeft: '0.5rem' }} >

                <div style={{ marginRight: '20px' }}>
                    <span class='font-view-title font-dark'>DRT Scheduling Process</span>
                </div>

                <div style={{ flexGrow: 1 }}></div>

                <div style={{ marginRight: '1rem' }}>
                    <label>Current Time : </label>
                    <input type="text" value={currentTime} />
                    <button onClick={decreaseTime}> - </button>
                    <button onClick={increaseTime}> + </button>
                </div>

                <div style={{ marginRight: '1rem' }}>
                    <label> Resolved : </label>
                    <span>{resolvedCount}</span>
                    <label> / </label>
                    <label> Requested : </label>
                    <span>{requestCount}</span>
                </div>

            </div>

            <div className='rel' style={{ flexGrow: 1 }}>
                <div className='abs-fill' style={{ overflow: 'auto' }} ref={containerRef}>
                    <svg ref={svgRef}></svg>
                </div>
            </div>

        </div>
    );
};

export default DrtChart;
