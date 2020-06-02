import * as d3 from 'd3';

var d3PriceChart = {};

d3PriceChart.create = (el, state) => {
	const canvasHeight = 400
	const canvasWidth = 600
	const scale = 20
	d3.select(el)
		.attr("width", canvasWidth)
		.attr("height", canvasHeight)
		.style("border", "1px solid black")
}
d3PriceChart.update = (el, state) => {
	const canvasHeight = 400
	const canvasWidth = 600
	const scale = .25;
	let parsed_state = state.map((d) => d["Market Value"]);
	let svg_elem = d3.select(el);
	var price_scale = d3.scaleLinear()
	                    //.domain([d3.min(parsed_state), d3.max(parsed_state)])
											.domain([0, d3.max(parsed_state)])
											.range([0, canvasHeight]);
	svg_elem.selectAll("rect")
		.data(parsed_state).enter()
		.append("rect")
		.attr("width", 40)
		.attr("height", (datapoint) => price_scale(datapoint))
		.attr("fill", "orange")
		.attr("x", (datapoint, iteration) => iteration * 45)
		.attr("y", (datapoint) => canvasHeight - price_scale(datapoint))

};

export default d3PriceChart;
