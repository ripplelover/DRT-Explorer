import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

let nodeDict = {};

const NodeChart = ({ recorddata, nodeData }) => {
    const nodeRef = useRef();
    const containerRef = useRef();

    useEffect(() => {
        createVisualElements();
    }, []);

    const createVisualElements = () => {
        let svg = d3.select(nodeRef.current);
        let bw = containerRef.current.clientWidth;
        let bh = containerRef.current.clientHeight;

        svg.attr('width', bw).attr('height', bh);

        svg
            .append('text')
            .attr('transform', 'translate(100,0)')
            .attr('x', bw / 4)
            .attr('y', 50)
            .attr('font-size', '24px')
            .style('text-anchor', 'center')
            .text('Node-Link View');

        d3.csv(nodeData).then((data) => {
            const minX = d3.min(data, (d) => d.X / 1000);
            const minY = d3.min(data, (d) => d.Y / 1000);
            const maxX = d3.max(data, (d) => d.X / 1000);
            const maxY = d3.max(data, (d) => d.Y / 1000);

            const xScaleFactor = (bw - 100) / (maxX - minX);
            const yScaleFactor = (bh - 150) / (maxY - minY);

            data.forEach((d) => {
                d.X = (d.X / 1000 - minX) * xScaleFactor + 50;
                d.Y = (d.Y / 1000 - minY) * yScaleFactor + 100;
                nodeDict[d.Node] = d;
            });

            console.log(nodeDict);

            svg
                .selectAll('.link')
                .data(recorddata)
                .enter()
                .append('line')
                .classed('link', true)
                .attr('x1', (d) => nodeDict[d.from_node_id].X)
                .attr('y1', (d) => nodeDict[d.from_node_id].Y)
                .attr('x2', (d) => nodeDict[d.to_node_id].X)
                .attr('y2', (d) => nodeDict[d.to_node_id].Y)
                .attr('stroke-width', 1)
                .attr('stroke', '#97c1a9');

            svg
                .selectAll('circle')
                .data(data)
                .enter()
                .append('circle')
                .attr('cx', (d) => d.X)
                .attr('cy', (d) => d.Y)
                .attr('r', 10)
                .attr('fill', '#abdee6');

            svg
                .selectAll('text.node-text')
                .data(data)
                .enter()
                .append('text')
                .attr('class', 'node-text')
                .attr('x', (d) => d.X)
                .attr('y', (d) => d.Y + 3)
                .text((d) => d.Node)
                .attr('font-size', '10px')
                .attr('fill', 'black')
                .attr('text-anchor', 'middle');
        });
    };

    return (
        <div style={{ display: 'flex', flexGrow: '1', width: '100%' }} ref={containerRef}>
            <svg ref={nodeRef}></svg>
        </div>
    );
};

export default NodeChart;
