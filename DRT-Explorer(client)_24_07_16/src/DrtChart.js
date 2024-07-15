import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import getResolvedCount from './getResolvedCount';

const DrtChart = ({ recorddata, recordList }) => {
    const [currentTime, setCurrentTime] = useState(661);
    const svgRef = useRef();
    const containerRef = useRef();
    const lineChartRef = useRef(); // Ref for the line chart
    const tooltipRef = useRef(); // Ref for the tooltip

    const { resolvedCount, requestCount } = getResolvedCount(recorddata, currentTime);

    const increaseTime = () => {
        setCurrentTime(prevTime => prevTime + 1);
    }

    const decreaseTime = () => {
        setCurrentTime(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
    }

    useEffect(() => {
        clearVisualElements();
        createVisualElements();
        createLineChart(); // Create the line chart
    }, [recorddata, currentTime]);

    const clearVisualElements = () => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        const lineChartSvg = d3.select(lineChartRef.current);
        lineChartSvg.selectAll('*').remove();
    };

    const getPopulation = (reqId) => {
        const record = recordList.find(r => r.id === reqId);
        return record ? record.population : 1; // Default to 1 if not found
    };

    const calculateOpacity = (reqId) => {
        const population = getPopulation(reqId);
        return Math.min(0.1 + (population / 10), 1); // Calculate opacity based on population size
    };

    const createVisualElements = () => {
        let filteredData = recorddata.filter(d => d.time === currentTime);
        let rowCount = 0;
        filteredData.forEach(d => {
            rowCount += d.candidates.length;
        });

        const svg = d3.select(svgRef.current);
        const spacing = 30;
        const bw = containerRef.current.clientWidth;
        const bh = rowCount * spacing + 50;

        svg.attr('width', bw).attr('height', bh);

        let xStart = 10;
        let yStart = 10;
        let k = 0;
        let unitW = 50;
        let unitH = 16;
        let ws = 5;
        let xs = 300;
        let yPosition = yStart + k * spacing;

        filteredData.forEach(d => {
            let candidates = d.candidates;
            let chosenID = d.chosen_queue;

            candidates.forEach((candidate, index) => {
                let currID = candidate.id;
                let rqLength = candidate.rq.length;
                yPosition = yStart + k * spacing;
                k += 1;

                if (chosenID === currID) {
                    svg.append('rect')
                        .attr('x', 0)
                        .attr('y', yPosition - 4)
                        .attr('width', bw)
                        .attr('height', unitH + 8)
                        .attr('fill', '#F4A460');
                }

                svg.append('text')
                    .attr('x', xStart)
                    .attr('y', yPosition + 12)
                    .attr('font-size', '0.85rem')
                    .text(`DRT: ${candidate.drt}, Request: ${candidate.req}, Cost: ${candidate.cost}`);

                svg.append('rect')
                    .attr('x', xStart + 200)
                    .attr('y', yPosition + 2)
                    .attr('width', candidate.cost * 5)
                    .attr('height', unitH - 4)
                    .attr('fill', 'skyblue')
                    .attr('stroke', 'black')
                    .attr('stroke-width', 0);

                for (let i = 0; i < rqLength; i++) {
                    let req = candidate.rq[i];
                    const opacity = calculateOpacity(Math.abs(req)); // Calculate opacity based on population size

                    svg.append('rect')
                        .attr('x', i * (ws + unitW) + xs * 1.5)
                        .attr('y', yPosition)
                        .attr('width', unitW)
                        .attr('height', unitH)
                        .attr('rx', 4)
                        .attr('ry', 4)
                        .attr('fill', `rgba(244, 196, 48, ${opacity})`) // Adjust fill color based on opacity
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

            svg.append('line')
                .attr('x1', 0)
                .attr('y1', yPosition + unitH * 1.5)
                .attr('x2', bw)
                .attr('y2', yPosition + unitH * 1.5)
                .attr('stroke', 'black')
                .attr('stroke-width', 1);
        });
    };

    const createLineChart = () => {
        const lineChartSvg = d3.select(lineChartRef.current);
        const tooltip = d3.select(tooltipRef.current);
        const width = containerRef.current.clientWidth - 40; // Adjust for padding
        const height = 160;
        const margin = { top: 5, right: 5, bottom: 5, left: 5 }; // Add margin to all sides

        const chartGroup = lineChartSvg.attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        let timeData = d3.range(661, 719, 1); // Updated to range from 661 to 718
        let resolvedCounts = timeData.map(time => getResolvedCount(recorddata, time).resolvedCount);

        const xScale = d3.scaleLinear()
            .domain([661, 718]) // Updated domain to match time range
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(resolvedCounts)])
            .range([height, 0]);

        // Add X-axis
        chartGroup.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        // Add Y-axis
        chartGroup.append('g')
            .call(d3.axisLeft(yScale));

        // Add the line
        const line = d3.line()
            .x((d, i) => xScale(timeData[i]))
            .y(d => yScale(d));

        chartGroup.append('path')
            .datum(resolvedCounts)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2)
            .attr('d', line);

        // Add the vertical line for current time
        const verticalLine = chartGroup.append('line')
            .attr('x1', xScale(currentTime))
            .attr('x2', xScale(currentTime))
            .attr('y1', 0)
            .attr('y2', height)
            .attr('stroke', 'red')
            .attr('stroke-width', 2)
            .attr('id', 'vertical-line');

        // Add circles
        chartGroup.selectAll('circle')
            .data(resolvedCounts)
            .enter()
            .append('circle')
            .attr('cx', (d, i) => xScale(timeData[i]))
            .attr('cy', d => yScale(d))
            .attr('r', 3)
            .attr('fill', 'black')
            .attr('id', (d, i) => `circle-${timeData[i]}`) // Assign id based on time value
            .on('mouseover', function(event, d) {
                const [x, y] = d3.mouse(lineChartSvg.node());
                const timeIndex = +this.id.split('-')[1] - 661; // Adjust the index based on the id
                const time = timeData[timeIndex]; // Extract time from timeData using the index
                tooltip.style('left', `${x + 5}px`)
                    .style('top', `${y - 28}px`)
                    .style('display', 'inline-block')
                    .html(`Time: ${time}<br>Resolved: ${resolvedCounts[timeIndex]}`); // Use resolvedCounts for the y value
            })
            .on('mouseout', () => tooltip.style('display', 'none'))
            .on('click', function(event, d) {
                const timeIndex = +this.id.split('-')[1] - 661; // Adjust the index based on the id
                const time = timeData[timeIndex]; // Extract time from timeData using the index
                setCurrentTime(time);
            });

        // Add drag behavior to the vertical line
        const drag = d3.drag()
            .on('drag', function(event) {
                const newTime = Math.round(xScale.invert(d3.mouse(this)[0]));
                if (newTime >= 661 && newTime <= 718) {
                    setCurrentTime(newTime);
                    d3.select('#vertical-line')
                        .attr('x1', xScale(newTime))
                        .attr('x2', xScale(newTime));
                }
            });

        verticalLine.call(drag);
    };

    return (
        <div className="content-view abs-fill" style={{ display: 'flex', flexDirection: 'column' }}>

            <div className='content-header' style={{ display: 'flex', paddingLeft: '0.5rem' }} >

                <div style={{ marginRight: '20px' }}>
                    <span className='font-view-title font-dark'>DRT Scheduling Process</span>
                </div>

                <div style={{ flexGrow: 1 }}></div>

                <div style={{ marginRight: '1rem' }}>
                    <label>Current Time : </label>
                    <input type="text" value={currentTime.toString()} readOnly />
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

            <div className='line-chart' style={{ height: '180px', position: 'relative' }}>
                <svg ref={lineChartRef}></svg>
                <div ref={tooltipRef} style={{ position: 'absolute', display: 'none', background: '#fff', border: '1px solid #ccc', padding: '5px', borderRadius: '3px', pointerEvents: 'none' }}></div>
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
