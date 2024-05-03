import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DrtChart = ({ recorddata, timedata }) => {
    const svgRef = useRef();
    const containerRef = useRef();
    let resolvedCount = 0;
    let requestCount = 0;

    useEffect(() => {
            clearVisualElements();
            createVisualElements();
    }, [recorddata, timedata]);

    // console.log(recorddata, timedata);

    const clearVisualElements = () => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
    };

    const createVisualElements = () => {
        
        let filteredData = recorddata.filter(d => d.time == timedata);
        let rowCount = 0;
        filteredData.forEach((d, i) => {
            let candidates = d.candidates;
            rowCount += candidates.length;
            // rowCount += 1;
        });

        const svg = d3.select(svgRef.current);
        const spacing = 26;
        const bw = containerRef.current.clientWidth; 
        // const bh = containerRef.current.clientHeight; 
        const bh = rowCount * spacing + 50;

        svg.attr('width', bw).attr('height', bh);
        // filter는 recorddata에서 timedata와 같은 time을 가진 데이터만 추출
        
        // console.log(filteredData);
        let k = 0;
        let unitW = 50;
        let unitH = 16;
        let ws = 5;
        let xs = 300;
        let yPosition = k * spacing;
        filteredData.forEach((d, i) => {
            let candidates = d.candidates;
            let chosenID = d.chosen_queue;

            candidates.forEach((candidate, index) => {
                let currID = candidate.id;
                let rqLength = candidate.rq.length;
                yPosition = k * spacing;
                k += 1;

                if (chosenID == currID) {
                    resolvedCount += 1;
                    svg.append('rect')
                        .attr('x', 0)
                        .attr('y', yPosition)
                        .attr('width', bw)
                        .attr('height', unitH)
                        .attr('fill', '#F4A460');
                }
                // console.log(k, d.time, rqLength);
                svg.append('text')
                .attr('x', 0)
                .attr('y', yPosition + 12)
                .attr('font-size', '12px')
                .text("DRT: " + candidate.drt + " Request: " + candidate.req + ", Cost: " + candidate.cost);

                svg.append('rect')
                    .attr('x', 180)
                    .attr('y', yPosition + 2)
                    .attr('width', candidate.cost * 5)
                    .attr('height', unitH - 4)
                    .attr('fill', 'skyblue');

                for (let i = 0 ; i < rqLength ; i++) {
                    let req = candidate.rq[i];
                    svg.append('rect')
                        .attr('x', i * (ws + unitW) + xs*1.5)
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
                        .attr('cx', i * (ws + unitW) + xs*1.5 + unitW - 8)
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
                .attr('y1', yPosition + unitH)
                .attr('x2', bw)
                .attr('y2', yPosition + unitH)
                .attr('stroke', 'black')
                .attr('stroke-width', 1);
        });

    };

    return (
        <div style={{ display: 'flex', flexGrow: '1', overflow: 'auto' }} ref={containerRef}>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default DrtChart;