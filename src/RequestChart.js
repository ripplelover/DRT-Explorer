import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RequestChart = ({ recorddata, sortOption }) => {
    const requestRef = useRef();

    useEffect(() => {
        createVisualElements();
    }, []);

    const createVisualElements = () => {
        let svg = d3.select(requestRef.current);
        let bw = 950;
        let bh = 700;
        let margin = { top: 100, right: 50, bottom: 50, left: 50 };

        let width = bw - margin.left - margin.right;
        let height = bh - margin.top - margin.bottom;

        svg.attr('width', bw).attr('height', bh);

        svg
            .append('text')
            .attr('transform', 'translate(100,0)')
            .attr('x', bw / 4)
            .attr('y', 50)
            .attr('font-size', '24px')
            .style('text-anchor', 'center')
            .text('Request View');

        let xScale = d3.scaleLinear().range([0, width]);
        let yScale = d3.scaleLinear().range([height, 0]);

        xScale.domain([0, 100]);
        yScale.domain([81, 0]);

        let g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        g.append('g').attr('transform', 'translate(0,' + height + ')').call(d3.axisBottom(xScale).ticks(20));

        g.append('g').call(d3.axisLeft(yScale).tickValues(d3.range(1, 81)));

        g.selectAll('.d-line')
        .data(recorddata)
        .append('line')
            .classed('d-line', true)
            .attr('x1', (d) => xScale(d.request_min))
            .attr('y1', (d, i) => yScale(i + 1))
            .attr('x2', (d) => xScale(d.request_min + (d.d2_hour * 60 + d.d2_min - d.d1_hour * 60 - d.d1_min)))
            .attr('y2', (d, i) => yScale(i + 1))
            .attr('stroke-width', 4)
            .style('opacity', 0.3)
            .attr('stroke', d3.schemeCategory10[0])
            .on('mouseover', function () {
                d3.select(this).attr('stroke', 'green');
            })
            .on('mouseout', function () {
                d3.select(this).attr('stroke', d3.schemeCategory10[0]);
            });

        g.selectAll('.a-line')
            .data(recorddata)
            .enter()
            .append('line')
            .classed('a-line', true)
            .attr('x1', (d) => xScale(d.a1_hour * 60 + d.a1_min - 660))
            .attr('y1', (d, i) => yScale(i + 1))
            .attr('x2', (d) => xScale((d.a1_hour * 60 + d.a1_min - 660) + (d.a2_hour * 60 + d.a2_min - d.a1_hour * 60 - d.a1_min)))
            .attr('y2', (d, i) => yScale(i + 1))
            .attr('stroke-width', 4)
            .style('opacity', 0.3)
            .attr('stroke', d3.schemeCategory10[1])
            .on('mouseover', function () {
                d3.select(this).attr('stroke', 'green');
            })
            .on('mouseout', function () {
                d3.select(this).attr('stroke', d3.schemeCategory10[1]);
            });

        g.selectAll('request-line')
            .data(recorddata)
            .enter()
            .append('line')
            .classed('request-line', true)
            .attr('x1', (d) => xScale(d.request_min))
            .attr('y1', (d, i) => yScale(i + 1))
            .attr('x2', (d) => xScale(d.request_min) + 5)
            .attr('y2', (d, i) => yScale(i + 1))
            .attr('stroke-width', 4)
            .attr('stroke', 'red')
            .on('mouseover', function () {
                d3.select(this).attr('stroke', 'green');
            })
            .on('mouseout', function () {
                d3.select(this).attr('stroke', 'red');
            });
    };

    const updateSort = () => {
        if (sortOption === 'ascending') {
            recorddata.sort((a, b) => a.request_min - b.request_min);
        } else if (sortOption === 'descending') {
            recorddata.sort((a, b) => b.request_min - a.request_min);
        } else if (sortOption === 'none') {
            recorddata.sort((a, b) => a.id - b.id);
        }
        updateVisualElements();
    };

    const updateVisualElements = () => {
        let svg = d3.select(requestRef.current);

        let bw = 950;
        let bh = 700;
        let margin = { top: 100, right: 50, bottom: 50, left: 50 };

        let width = bw - margin.left - margin.right;
        let height = bh - margin.top - margin.bottom;

        let xScale = d3.scaleLinear().range([0, width]);
        let yScale = d3.scaleLinear().range([height, 0]);
        xScale.domain([0, d3.max(recorddata, (d) => d.request_min)]);
        yScale.domain([81, 0]);

        let g = svg.select('g');

        let updateD = g.selectAll('.d-line').data(recorddata, d => d.id);
        updateD
            .transition()
            .duration(1000)
            .delay(200)
            .attr("y1", (d, i) => yScale(i + 1))
            .attr("y2", (d, i) => yScale(i + 1))

        let updateA = g.selectAll('.a-line').data(recorddata, d => d.id);
        updateA
            .transition()
            .duration(1000)
            .delay(200)
            .attr("y1", (d, i) => yScale(i + 1))
            .attr("y2", (d, i) => yScale(i + 1))

        let updateRequest = g.selectAll('.request-line').data(recorddata, d => d.id);
        updateRequest
            .transition()
            .duration(1000)
            .delay(200)
            .attr("y1", (d, i) => yScale(i + 1))
            .attr("y2", (d, i) => yScale(i + 1))
    };

    useEffect(() => {
        updateSort();
    }, [sortOption, recorddata]);

    return <svg ref={requestRef}></svg>;
};

export default RequestChart;