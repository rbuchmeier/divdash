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
	let parseDate = d3.timeParse('%Y-%m-%d');
	let formatDate = d3.timeFormat('%b-%y');
	let months = state.map((d) => formatDate(parseDate(d["Date"])));
	let ends = state.map((d) => parseDate(d["End"]));
	let amounts = state.map((d) => d["Amount"]);
	let svg_elem = d3.select(el);
	let last_cost_date = new Date();
	let first_month_day = new Date();
	let last_month_day = new Date();
	let estimated_unbilled_cost = 0;
	if (formatDate(parseDate(months[months.length-1]['Date']))===formatDate(parseDate(months[months.length-1]['End']))) {
		let last_cost = amounts[amounts.length-1]
		last_cost_date = ends[ends.length-1];
		first_month_day = new Date(last_cost_date.getFullYear(), last_cost_date.getMonth(), 1);
		last_month_day = new Date(last_cost_date.getFullYear(), last_cost_date.getMonth() + 1, 0);
		// One day Time in ms (milliseconds)
		let one_day = 1000 * 60 * 60 * 24
		let billed_days = (last_cost_date.getTime() - first_month_day.getTime())/one_day + 1;
		let unbilled_days = (last_month_day - last_cost_date.getTime())/one_day;
		estimated_unbilled_cost = unbilled_days/billed_days*last_cost;
	} else {
		console.log('check this logic...should not have happened');
	}
	let scale_ref_amounts = [...amounts];
	scale_ref_amounts[scale_ref_amounts.length - 1] = scale_ref_amounts[scale_ref_amounts.length - 1] + estimated_unbilled_cost;
	let amount_scale = d3.scaleLinear()
				  		 .domain([0, d3.max(scale_ref_amounts)])
						 .range([0, canvasHeight - 25]);
	let y_scale = d3.scaleLinear()
					.domain([0, d3.max(scale_ref_amounts)])
					.range([canvasHeight - 25, 0]);
	let y_axis = d3.axisLeft().scale(y_scale);
	let month_scale = d3.scaleBand()
	                    .domain(months)
						.range([55,canvasWidth]);
	svg_elem.selectAll("rect")
			.data(amounts).enter()
			.append("rect")
			.attr("width", (canvasWidth-50)/months.length - 10)
			.attr("height", (datapoint) => amount_scale(datapoint))
			.attr("fill", "orange")
			.attr("x", (datapoint, iteration) => month_scale(months[iteration]))
			.attr("y", (datapoint) => canvasHeight - amount_scale(datapoint) - 15);
	svg_elem.append("rect")
			.attr("class", "unbilled")
			.attr("width", (canvasWidth-50)/months.length - 10)
			.attr("height", amount_scale(estimated_unbilled_cost))
			.attr("x", month_scale(months[months.length - 1]))
			.attr("y", canvasHeight - amount_scale(scale_ref_amounts[scale_ref_amounts.length - 1]) - 15)
			.attr("fill", "cornflowerBlue")
	svg_elem.selectAll(".amount")
			.data(amounts).enter()
			.append("text")
			.attr("class", "amount")
			.attr("x", (datapoint, iteration) => month_scale(months[iteration]))
			.attr("y", (datapoint) => canvasHeight - amount_scale(datapoint) - 15)
			.text((d) => d3.format("$.2f")(d));
	svg_elem.append("text")
			.attr("class", "unbilled_amount")
			.attr("x", month_scale(months[months.length - 1]))
			.attr("y", canvasHeight - amount_scale(scale_ref_amounts[scale_ref_amounts.length - 1]) - 15)
			.text(d3.format("$.2f")(scale_ref_amounts[scale_ref_amounts.length - 1]));
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
