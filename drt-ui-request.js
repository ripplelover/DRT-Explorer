
document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    
    let svg = d3.select("svg");

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
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html("Request Time: " + data[i].request_hour + ":" + data[i].request_min + "<br/>")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 35) + "px");
                })
                .on("mouseout", function (d) {
                    d3.select(this).attr("stroke", "red");
                    tooltip.transition().duration(500).style("opacity", 0);
                });
        }
    
        for (let i = 0; i < 10; i++) {
            data[i].diff = data[i].d2_hour * 60 + data[i].d2_min - data[i].d1_hour * 60 - data[i].d1_min;
        }
    
        for (let i = 0; i < 10; i++) {
            g.append("line")
                .attr("x1", function (d) { return xScale(data[i].request_min); })
                .attr("y1", function (d) { return yScale(i + 1); })
                .attr("x2", function (d) { return xScale(data[i].request_min + data[i].diff); })
                .attr("y2", function (d) { return yScale(i + 1); })
                .attr("stroke-width", 1)
                .attr("stroke", "blue")
                .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke", "orange");
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html("D1 Time: " + data[i].d1_hour + ":" + data[i].d1_min + "<br/> D2 Time: " + data[i].d2_hour + ":" + data[i].d2_min + "<br/>")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 35) + "px");
                })
                .on("mouseout", function (d) {
                    d3.select(this).attr("stroke", "blue");
                    tooltip.transition().duration(500).style("opacity", 0);
                });
        }
    
        for(let i = 0; i < 10; i++) {
            data[i].diff = data[i].a2_hour * 60 + data[i].a2_min - data[i].a1_hour * 60 - data[i].a1_min;
            data[i].diff2 = data[i].a1_hour * 60 + data[i].a1_min - 660;
        }
    
        for (let i = 0; i < 10; i++) {
            g.append("line")
                .attr("x1", function (d) { return xScale(data[i].diff2); })
                .attr("y1", function (d) { return yScale(i + 1) + (height / 200); })
                .attr("x2", function (d) { return xScale(data[i].diff2+data[i].diff); })
                .attr("y2", function (d) { return yScale(i + 1) + (height / 200); })
                .attr("stroke-width", 1)
                .attr("stroke", "red")
                .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke", "orange");
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html("A1 Time: " + data[i].a1_hour + ":" + data[i].a1_min + "<br/> A2 Time: " + data[i].a2_hour + ":" + data[i].a2_min + "<br/>")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 35) + "px");
            })
            .on("mouseout", function (d) {
                d3.select(this).attr("stroke", "red");
                tooltip.transition().duration(500).style("opacity", 0);
            });
        }
    });
});


