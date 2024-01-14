let nodeList;
let nodeDict = {};
let recordList;

async function readData([data1, data2]) {
    data1.forEach(d => {
        d.X = d.X / 1000 + 300;
        d.Y = d.Y / 1000 + 150;
        nodeDict[d.Node] = d;
    });
    nodeList = data1;

    data2.forEach(d => {
        d.d_diff = d.d2_hour * 60 + d.d2_min - d.d1_hour * 60 - d.d1_min;
        d.a_diff = d.a2_hour * 60 + d.a2_min - d.a1_hour * 60 - d.a1_min;
        d.a_diff2 = d.a1_hour * 60 + d.a1_min - 660;
        d.hovered = false;
    });
    recordList = data2;
}

function updateSort() {
    let sortOption = document.getElementById("sort").value;
    if (sortOption == "ascending") {
        recordList.sort((a, b) => a.request_min - b.request_min);
    }
    else if (sortOption == "descending") {
        recordList.sort((a, b) => b.request_min - a.request_min);
    }

    else if (sortOption == "none") {
        recordList.sort((a, b) => a.id - b.id);
    }
        
    renderRequest();
    updateLink();
}

function renderRequest() {
    d3.select("#request").selectAll("*").remove();

    let svg = d3.select("#request");

    let svgNode = svg.node();
    let bound = svgNode.getBoundingClientRect();
    let bw = bound.width;
    let bh = bound.height;

    let margin = { top: 100, right: 50, bottom: 50, left: 50 };

    let width = bw - margin.left - margin.right;
    let height = bh - margin.top - margin.bottom;

    svg.append("text")
        .attr("transform", "translate(100,0)")
        .attr("x", width / 2)
        .attr("y", 50)
        .attr("font-size", "24px")
        .style("text-anchor", "middle")
        .text("Request Distribution");

    let xScale = d3.scaleLinear().range([0, width]);
    let yScale = d3.scaleLinear().range([height, 0]);

    xScale.domain([0, 100]);
    yScale.domain([81, 0]);

    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(20));

    g.append("g")
        .call(d3.axisLeft(yScale).tickValues(d3.range(1, 81)));

    let tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    g.selectAll('.request-line')
        .data(recordList)
        .enter()
        .append('line')
        .attr("x1", d => xScale(d.request_min))
        .attr("y1", (d, i) => yScale(i + 1) - (height / 120))
        .attr("x2", d => xScale(d.request_min))
        .attr("y2", (d, i) => yScale(i + 1) + (height / 120))
        .attr("stroke-width", 4)
        .attr("stroke", "#c6dbda")
        .on("mouseover", function (d) {
            d3.select(this).attr("stroke", "#fed7c3");

            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html("Request Time: " + d.request_hour + ":" + d.request_min + "<br/>")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 35) + "px");

            d.hovered = true;
            updateLink();
        })
        .on("mouseout", function (d) {
            d3.select(this).attr("stroke", "#c6dbda");

            tooltip.transition().duration(500).style("opacity", 0);

            d.hovered = false;
            updateLink();
        });

    g.selectAll('.d-line')
        .data(recordList)
        .enter()
        .append('line')
        .classed("d-line", true)
        .attr("x1", d => xScale(d.request_min))
        .attr("y1", (d, i) => yScale(i + 1))
        .attr("x2", d => xScale(d.request_min + d.d_diff))
        .attr("y2", (d, i) => yScale(i + 1))
        .attr("stroke-width", 4)
        .attr("stroke", "#ecd5e3")
        .on("mouseover", function (d) {
            d3.select(this).attr("stroke", "#fed7c3");

            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html("D1 Time: " + d.d1_hour + ":" + d.d1_min + "<br/> D2 Time: " + d.d2_hour + ":" + d.d2_min + "<br/>")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 35) + "px");

            d.hovered = true;
            updateLink();
        })
        .on("mouseout", function (d) {
            d3.select(this).attr("stroke", "#ecd5e3");

            tooltip.transition().duration(500).style("opacity", 0);

            d.hovered = false;
            updateLink();
        });

    g.selectAll('.a-line')
        .data(recordList)
        .enter()
        .append('line')
        .classed("a-line", true)
        .attr("x1", d => xScale(d.a_diff2))
        .attr("y1", (d, i) => yScale(i + 1) + (height / 200))
        .attr("x2", d => xScale(d.a_diff2 + d.a_diff))
        .attr("y2", (d, i) => yScale(i + 1) + (height / 200))
        .attr("stroke-width", 4)
        .attr("stroke", "#f6eac2")
        .on("mouseover", function (d) {
            d3.select(this).attr("stroke", "#fed7c3");

            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html("A1 Time: " + d.a1_hour + ":" + d.a1_min + "<br/> A2 Time: " + d.a2_hour + ":" + d.a2_min + "<br/>")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 35) + "px");

            d.hovered = true;
            updateLink();
        })
        .on("mouseout", function (d) {
            d3.select(this).attr("stroke", "#f6eac2");

            tooltip.transition().duration(500).style("opacity", 0);

            d.hovered = false;
            updateLink();
        });
}

function renderNodeLink() {
    d3.select("#node-link").selectAll("*").remove();
    let svg = d3.select("#node-link");

    let svgNode = svg.node();
    let bound = svgNode.getBoundingClientRect();
    let bw = bound.width;
    let bh = bound.height;

    let margin = { top: 100, right: 50, bottom: 50, left: 50 };

    let width = bw - margin.left - margin.right;
    let height = bh - margin.top - margin.bottom;

    svg.append("text")
        .attr("transform", "translate(100,0)")
        .attr("x", width / 2)
        .attr("y", 50)
        .attr("font-size", "24px")
        .style("text-anchor", "middle")
        .text("Node-Link Distribution");

    svg.selectAll(".link")
        .data(recordList)
        .enter()
        .append("line")
        .classed("link", true)
        .attr("x1", d => nodeDict[d.from_node_id].X)
        .attr("y1", d => nodeDict[d.from_node_id].Y)
        .attr("x2", d => nodeDict[d.to_node_id].X)
        .attr("y2", d => nodeDict[d.to_node_id].Y)
        .attr("stroke-width", 1)
        .attr("stroke", "#97c1a9");

    svg.selectAll("circle")
        .data(nodeList)
        .enter()
        .append("circle")
        .attr("cx", d => d.X)
        .attr("cy", d => d.Y)
        .attr("r", 10)
        .attr("fill", "#abdee6");

    svg.selectAll("nodetext")
        .data(nodeList)
        .enter()
        .append("text")
        .attr("x", d => d.X)
        .attr("y", d => d.Y + 3)
        .text(d => d.Node)
        .attr("font-size", "10px")
        .style("text-anchor", "middle")
        .attr("fill", "white");
}

function updateLink() {
    d3.selectAll(".link")
        .data(recordList)
        .attr("stroke-width", d => {
            if (d.hovered) return 3;
            else return 1;
        });
}

async function render() {
    renderRequest();
    renderNodeLink();
}

document.addEventListener('DOMContentLoaded', (event) => {
    Promise.all([
        d3.csv("SiouxFalls_node.csv"),
        d3.json("record_list.json")])
        .then(readData)
        .then(render);
});

