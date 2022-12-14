import React, { useState, useEffect, useCallback } from "react"
import * as d3 from "d3"

function Data_sum(props) {
    const [statesData, setStatesData] = useState([]);     //react用来注释数据
    const ref = React.useRef(null)
    // const [selectedVar, setSelectedVar] = useState("Case Number")
    // const [var2, setVar2] = useState("Killed")
    // const [var3, setVar3] = useState("Injured")
    // console.log(data)
    const [size, setSize] = useState({
        width: document.documentElement.clientWidth,
        hieght: document.documentElement.clientHeight
    })

    const onResize = useCallback(() => {
        setSize({
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
        })
    }, [])

    useEffect(() => {
        (async () => {
            window.addEventListener('resize', onResize);
            // set the dimensions and margins of the graph
            const margin = { top: 100, right: 0, bottom: 0, left: 0 },
                width = ref.current.clientWidth - 30,
                height = width * 1.4 - margin.top - margin.bottom,
                innerRadius = 150,
                outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border

            const svgEL = d3.select(ref.current);
            svgEL.selectAll("*").remove();

            // append the svg object to the body of the page
            const svg = svgEL
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

            d3.csv("./data/state_sum.csv").then(function (data) {

                // X scale: common for 2 data series
                const x = d3.scaleBand()
                    .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
                    .align(0)                  // This does nothing
                    .domain(data.map(d => d.state)); // The domain of the X axis is the list of states.

                // Y scale outer variable
                const y = d3.scaleRadial()
                    .range([innerRadius, outerRadius])   // Domain will be define later.
                    .domain([0, 2000]); // Domain of Y is from 0 to the max seen in the data

                // Second barplot Scales
                const ybis = d3.scaleRadial()
                    .range([innerRadius, 5])   // Domain will be defined later.
                    .domain([0, 2000]);

                // Add the bars
                svg.append("g")
                    .selectAll("path")
                    .data(data)
                    .join("path")
                    .attr("fill", "#a52723")
                    .attr("class", "yo")
                    .attr("d", d3.arc()     // imagine your doing a part of a donut plot
                        .innerRadius(innerRadius)
                        .outerRadius(d => y(d.KI))
                        .startAngle(d => x(d.state))
                        .endAngle(d => x(d.state) + x.bandwidth())
                        .padAngle(0.01)
                        .padRadius(innerRadius))

                // Add the labels
                svg.append("g")
                    .selectAll("g")
                    .data(data)
                    .join("g")
                    .attr("text-anchor", function (d) { return (x(d.state) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
                    .attr("transform", function (d) { return "rotate(" + ((x(d.state) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d.KI) + 10) + ",0)"; })
                    .append("text")
                    .text(d => d.state)
                    .attr("transform", function (d) { return (x(d.state) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
                    .style("font-size", "11px")
                    .attr("alignment-baseline", "middle")

                // Add the second series
                svg.append("g")
                    .selectAll("path")
                    .data(data)
                    .join("path")
                    .attr("fill", "grey")
                    .attr("d", d3.arc()     // imagine your doing a part of a donut plot
                        .innerRadius(d => ybis(0))
                        .outerRadius(d => ybis(d.KI))
                        .startAngle(d => x(d.state))
                        .endAngle(d => x(d.state) + x.bandwidth())
                        .padAngle(0.01)
                        .padRadius(innerRadius))

            });
            return (() => {
                window.removeEventListener('resize', onResize)
            })
        })();
    }, [statesData.length, size.width]
    )
    return (
        <div className="down-chart-container">
            <div className="chart-title">SUM of GUN HOLD POLICY in each STATE</div>
            <div viewBox="0 0 960 600" className="usData_sum" ref={ref}></div>
            {/* <div className="down-chart-example"><img src="./profile.svg" height="150px"/> </div> */}
        </div>
    )
}

export default Data_sum