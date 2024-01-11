document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    
    let svg = d3.select("#request");

    let svgNode = svg.node();
    let bound = svgNode.getBoundingClientRect();
    let bw = bound.width;
    let bh = bound.height;

    margin = {top: 100, right: 50, bottom: 50, left: 50};

    width = bw - margin.left - margin.right;
    height = bh - margin.top - margin.bottom;

    svg.append("text")
        .attr("transform", "translate(100,0)")
        .attr("x", width / 2)
        .attr("y", 50)
        .attr("font-size", "24px")
        .style("text-anchor", "middle")
        .text("Request Distribution");

    let xScale = d3.scaleLinear().range([0, width]),
        yScale = d3.scaleLinear().range([height, 0]);

    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("record_list_10.json", function (data) {
        console.log(data);
        xScale.domain([0, 100]);
        yScale.domain([11, 1]);
    
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).ticks(20));
    
        g.append("g")
            .call(d3.axisLeft(yScale).tickValues(d3.range(1, 11)));
        
        let tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    
        for (let i = 0; i < 10; i++) {
            g.append("line")
                .attr("x1", function (d) { return xScale(data[i].request_min); })
                .attr("y1", function (d) { return yScale(i + 1) - (height / 40); })
                .attr("x2", function (d) { return xScale(data[i].request_min); })
                .attr("y2", function (d) { return yScale(i + 1) + (height / 40); })
                .attr("stroke-width", 2)
                .attr("stroke", "red")
                .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke", "orange");
                let lineId = i + 1;
                d3.select("#node-link").select("[id='" + lineId + "']").attr("stroke", "orange");
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html("Request Time: " + data[i].request_hour + ":" + data[i].request_min + "<br/>")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 35) + "px");
                })
                .on("mouseout", function (d) {
                    d3.select(this).attr("stroke", "red");
                    let lineId = i + 1;
                    d3.select("#node-link").select("[id='" + lineId + "']").attr("stroke", "green");
                    tooltip.transition().duration(500).style("opacity", 0);
                });
                
        }
    
        for (let i = 0; i < 10; i++) {
            data[i].diff = data[i].d2_hour * 60 + data[i].d2_min - data[i].d1_hour * 60 - data[i].d1_min;
        }
    
        for (let i = 0; i < 10; i++) {
            g.append("line")
                .attr("class","test")
                .attr("x1", function (d) { return xScale(data[i].request_min); })
                .attr("y1", function (d) { return yScale(i + 1); })
                .attr("x2", function (d) { return xScale(data[i].request_min + data[i].diff); })
                .attr("y2", function (d) { return yScale(i + 1); })
                .attr("stroke-width", 1)
                .attr("stroke", "blue")
                .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke", "orange");
                let lineId = i + 1;
                d3.select("#node-link").select("[id='" + lineId + "']").attr("stroke", "orange");
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html("D1 Time: " + data[i].d1_hour + ":" + data[i].d1_min + "<br/> D2 Time: " + data[i].d2_hour + ":" + data[i].d2_min + "<br/>")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 35) + "px");
                })
                .on("mouseout", function (d) {
                    d3.select(this).attr("stroke", "blue");
                    let lineId = i + 1;
                    d3.select("#node-link").select("[id='" + lineId + "']").attr("stroke", "green");
                    tooltip.transition().duration(500).style("opacity", 0);
                });
        }
    
        for(let i = 0; i < 10; i++) {
            data[i].diff = data[i].a2_hour * 60 + data[i].a2_min - data[i].a1_hour * 60 - data[i].a1_min;
            data[i].diff2 = data[i].a1_hour * 60 + data[i].a1_min - 660;
        }
    
        for (let i = 0; i < 10; i++) {
            g.append("line")
                .attr("class","test")
                .attr("x1", function (d) { return xScale(data[i].diff2); })
                .attr("y1", function (d) { return yScale(i + 1) + (height / 200); })
                .attr("x2", function (d) { return xScale(data[i].diff2+data[i].diff); })
                .attr("y2", function (d) { return yScale(i + 1) + (height / 200); })
                .attr("stroke-width", 1)
                .attr("stroke", "red")
                .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke", "orange");
                let lineId = i + 1;
                d3.select("#node-link").select("[id='" + lineId + "']").attr("stroke", "orange");
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html("A1 Time: " + data[i].a1_hour + ":" + data[i].a1_min + "<br/> A2 Time: " + data[i].a2_hour + ":" + data[i].a2_min + "<br/>")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 35) + "px");
            })
            .on("mouseout", function (d) {
                d3.select(this).attr("stroke", "red");
                let lineId = i + 1;
                d3.select("#node-link").select("[id='" + lineId + "']").attr("stroke", "green");
                tooltip.transition().duration(500).style("opacity", 0);
            });
        }
    });
});


document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    let svg = d3.select("#node-link");

    svg.append("text")
        .attr("transform", "translate(100,0)")
        .attr("x", width / 2)
        .attr("y", 50)
        .attr("font-size", "24px")
        .style("text-anchor", "middle")
        .text("Node-Link Distribution");

    d3.csv("SiouxFalls_node.csv", function (data) {
        for (let i = 0; i < data.length; i++) {
            data[i].X = +data[i].X;
            data[i].Y = +data[i].Y;
        }
        console.log(data);

        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return d.X / 1000 + 300; })
            .attr("cy", function (d) { return d.Y / 1000 + 150; })
            .attr("r", 10)
            .attr("fill", "blue");

        svg.selectAll("nodetext")
            .data(data)
            .enter()
            .append("text")
            .attr("x", function (d) { return d.X / 1000 + 300; })
            .attr("y", function (d) { return d.Y / 1000 + 153; })
            .text(function (d) { return d.Node; })
            .attr("font-size", "10px")
            .style("text-anchor", "middle")
            .attr("fill", "white");
        
    });
    
    let from_node_id_list = [];
    let to_node_id_list = [];
    let num = 1;
    d3.json("record_list_10.json", function (data) {
        for (let i = 0; i < data.length; i++) {
            from_node_id_list.push(data[i].from_node_id);
            to_node_id_list.push(data[i].to_node_id);
        }
        console.log(from_node_id_list);
        console.log(to_node_id_list);

        d3.csv("SiouxFalls_node.csv", function (data) {
            for (let i = 0; i < data.length; i++) {
                data[i].X = +data[i].X;
                data[i].Y = +data[i].Y;
            }

            for (let i = 0; i < from_node_id_list.length; i++) {
                for (let j = 0; j < data.length; j++) {
                    if (from_node_id_list[i] == data[j].Node) {
                        var from_node_x = data[j].X;
                        var from_node_y = data[j].Y;
                    }
                    if (to_node_id_list[i] == data[j].Node) {
                        var to_node_x = data[j].X;
                        var to_node_y = data[j].Y;
                    }
                }
                svg.append("line")
                    .attr("class","testing")
                    .attr("id", num++)
                    .attr("x1", function (d) { return from_node_x / 1000 + 300; })
                    .attr("y1", function (d) { return from_node_y / 1000 + 150; })
                    .attr("x2", function (d) { return to_node_x / 1000 + 300; })
                    .attr("y2", function (d) { return to_node_y / 1000 + 150; })
                    .attr("stroke-width", 1)
                    .attr("stroke", "green");
            }
        });

    });
});