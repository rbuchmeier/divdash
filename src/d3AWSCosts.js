import * as d3 from 'd3';

var d3AWSCosts = {};

d3AWSCosts.create = (el, state) => {
	const canvasHeight = 400;
	const canvasWidth = 500;
	d3.select(el)
	  .attr("width", canvasWidth)
	  .attr("height", canvasHeight)
}
d3AWSCosts.update = (el, state) => {
	const canvasHeight = 400;
	const canvasWidth = 500;
	let parseDate = d3.utcParse('%Y-%m-%d');
	let formatDate = d3.timeFormat('%b-%y');
	let months = state.map((d) => formatDate(parseDate(d["Month"])));
	let amounts = state.map((d) => d["Amount"]);
	let svg_elem = d3.select(el);
	let amount_scale = d3.scaleLinear()
				  		 .domain([0, d3.max(amounts)])
						 .range([0, canvasHeight - 25]);
	let y_scale = d3.scaleLinear()
					.domain([0, d3.max(amounts)])
					.range([canvasHeight - 25, 0]);
	let y_axis = d3.axisLeft().scale(y_scale);
	let month_scale = d3.scaleBand()
	                    .domain(months)
						.range([55,canvasWidth]);
	svg_elem.selectAll("rect")
			.data(amounts).enter()
			.append("rect")
			.attr("width", (canvasWidth-50)/months.length)
			.attr("height", (datapoint) => amount_scale(datapoint))
			.attr("fill", "orange")
			.attr("x", (datapoint, iteration) => month_scale(months[iteration]))
			.attr("y", (datapoint) => canvasHeight - amount_scale(datapoint) - 15);
	svg_elem.selectAll(".amount")
			.data(amounts).enter()
			.append("text")
			.attr("class", "amount")
			.attr("x", (datapoint, iteration) => month_scale(months[iteration]))
			.attr("y", (datapoint) => canvasHeight - amount_scale(datapoint) - 15)
			.text((d) => d3.format("$.2f")(d));
	svg_elem.selectAll(".month")
			.data(months).enter()
			.append("text")
			.attr("class", "month")
			.attr("x", (datapoint, iteration) => month_scale(datapoint))
			.attr("y", (datapoint) => canvasHeight)
			.text((d) => d);
	svg_elem.append("g")
	        .attr("transform", "translate(50, 10)")
	        .call(y_axis);
};

export default d3AWSCosts;
