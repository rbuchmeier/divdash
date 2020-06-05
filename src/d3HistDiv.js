import * as d3 from 'd3';

var d3HistDiv = {};

d3HistDiv.create = (el, state) => {
	const canvasHeight = 400;
	const canvasWidth = 1000;
	d3.select(el)
	  .attr("width", canvasWidth)
	  .attr("height", canvasHeight)
}
function filter_dividends(all_activity) {
	let money_movements = all_activity.filter((activity) => activity['Type'] == 'MONEY_MOVEMENTS');
	let stock_movements = money_movements.filter((movement) => movement['Symbol']);
	return stock_movements;
}
function simplify_divs(divs) {
	let simplified_divs = divs.map((d) => Object.assign({}, {'Date': d['Trade Date'], 'Amount': d['Net Amount']}));
	return simplified_divs;
}
let parseDate = d3.timeParse('%Y-%m-%d');
let formatDate = d3.timeFormat('%b-%y');
function format_divs(divs) {
	let date_formatted_divs = format_dates(divs);
	return format_amounts(date_formatted_divs);
}
function format_dates(bad_date_divs) {
	return bad_date_divs.map((d) => Object.assign(d, {'Date': formatDate(parseDate(d['Date']))}));
}
function format_amounts(bad_amount_divs) {
	return bad_amount_divs.map((d) => Object.assign(d, {'Amount': Number(d['Amount'].split(' ').pop())}));
}
function get_index_of_month(semi_grouped_divs, key_div) {
	return semi_grouped_divs.findIndex((d) => d['Date'] == key_div['Date']);
}
function group_divs(ungrouped_divs) {
	let grouped_divs = [...ungrouped_divs];
	grouped_divs.unshift([]);
	return grouped_divs.reduce((acc, div) => {
		let myindex = get_index_of_month(acc, div);
		if (myindex >= 0) {
			acc[myindex]['Amount'] += div['Amount'];
		} else {
			acc.push(div);
		}
		return acc;
	});
}
d3HistDiv.update = (el, state) => {
	const canvasHeight = 400;
	const canvasWidth = 1000;
	let raw_dividends = filter_dividends(state);
	let simple_dividends = simplify_divs(raw_dividends);
	let formatted_dividends = format_divs(simple_dividends);
	let dividends = group_divs(formatted_dividends);
	let months = dividends.map((d) => d['Date']);
	let amounts = dividends.map((d) => d['Amount']);
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
			.attr("width", (canvasWidth-50)/months.length - 10)
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

export default d3HistDiv;
