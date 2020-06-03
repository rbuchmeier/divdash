import * as d3 from 'd3';

var d3PriceChart = {};

d3PriceChart.create = (el, state) => {
	const canvasHeight = 400
	const canvasWidth = 3500
	const scale = 20
	d3.select(el)
		.attr("width", canvasWidth)
		.attr("height", canvasHeight)
		//.style("border", "1px solid black")
}
d3PriceChart.update = (el, state) => {
	const canvasHeight = 400;
	const canvasWidth = 3500;
	let parsed_state = state.map((d) => d["Market Value"]);
	let symbol_data = state.map((d) => d["Symbol"]);
	let svg_elem = d3.select(el);
	let price_scale = d3.scaleLinear()
											.domain([0, d3.max(parsed_state)+100])
											.range([0, canvasHeight - 25]);
	let y_scale = d3.scaleLinear()
											.domain([0, d3.max(parsed_state)+100])
											.range([canvasHeight - 25, 0]);
	let y_axis = d3.axisLeft().scale(y_scale);
	let stock_scale = d3.scaleBand()
	                    .domain(symbol_data)
											.range([55,canvasWidth]);
	svg_elem.selectAll("rect")
		.data(parsed_state).enter()
		.append("rect")
		.attr("width", canvasWidth/symbol_data.length)
		.attr("height", (datapoint) => price_scale(datapoint))
		.attr("fill", "orange")
		.attr("x", (datapoint, iteration) => stock_scale(symbol_data[iteration]))
		.attr("y", (datapoint) => canvasHeight - price_scale(datapoint) - 15);
		svg_elem.selectAll(".price")
			.data(symbol_data).enter()
			.append("text")
			.attr("class", "price")
			.attr("x", (datapoint, iteration) => stock_scale(symbol_data[iteration]))
			.attr("y", (datapoint) => canvasHeight)
			.text((d) => d);
		svg_elem.selectAll(".symbol")
			.data(parsed_state).enter()
			.append("text")
			.attr("class", "symbol")
			.attr("x", (datapoint, iteration) => stock_scale(symbol_data[iteration]))
			.attr("y", (datapoint) => canvasHeight - price_scale(datapoint) - 15)
			.text((d) => d3.format("$.2f")(d));
	svg_elem.append("g")
	        .attr("transform", "translate(50, 10)")
	        .call(y_axis);
};

export default d3PriceChart;
