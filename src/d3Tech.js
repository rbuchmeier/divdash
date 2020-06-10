import * as d3 from 'd3';
const cloneDeep = require('lodash.clonedeep');

var d3Tech = {};

d3Tech.create = (el, state) => {
	const canvasHeight = 400;
	const canvasWidth = 1000;
	d3.select(el)
	  .attr("width", canvasWidth)
	  .attr("height", canvasHeight)
}
function dateParse(date) {
	let parseDate = d3.timeParse('%Y-%m-%d');
	let formatDate = d3.timeFormat('%b-%y');
	return formatDate(parseDate(date))
}

function formatData(data) {
	data.forEach((d) => {
		d["Date"] = dateParse(d["Date"])
		d["Amount"] = typeof d["Amount"] === 'string' ? -1 * Number(d["Amount"].split(" ").pop()) : d["Amount"]
	});
}

function groupData(arr1, arr2) {
	let new_array = cloneDeep(arr1);
	arr2.forEach((x) => {
		let matching_months = [...new_array.filter(y => x["Date"] === y["Date"])];
		if (matching_months.length === 0) {
			new_array.push(Object.assign({}, x));
		} else {
			matching_months[0]["Amount"] += x["Amount"];
		}
	});
	return new_array;
}

function filter_dividends(all_activity) {
	let money_movements = all_activity.filter((activity) => activity['Type'] === 'MONEY_MOVEMENTS');
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
	return semi_grouped_divs.findIndex((d) => d['Date'] === key_div['Date']);
}

function group_divs(ungrouped_divs) {
	let grouped_divs = cloneDeep(ungrouped_divs);
	let first_item = grouped_divs.shift();
	let myindex = 0;
	return grouped_divs.reduce((acc, div) => {
		myindex = get_index_of_month(acc, div);
		if (myindex >= 0) {
			acc[myindex]['Amount'] += div['Amount'];
		} else {
			acc.push(div);
		}
		return acc;
	}, [first_item]);
	
}

function filter_borrow(all_activity) {
    return all_activity.filter((activity) => activity['Description'].includes('AVBAL'));
}

function simplify_borrow(bills) {
	let simplified_bills = bills.map((d) => Object.assign({}, {'Date': d['Trade Date'], 'Amount': d['Net Amount']}));
	return simplified_bills;
}


d3Tech.update = (el, state) => {
	const canvasHeight = 400;
	const canvasWidth = 1000;
	let doData = [...state.digitalocean.data];
	let awsData = [...state.aws.data];
	let borrowData = [...state.borrow.data];
	let divData = [...state.borrow.data];
	borrowData = filter_borrow(borrowData);
	borrowData = simplify_borrow(borrowData);
	let raw_divs = filter_dividends(divData);
	let simple_divs = simplify_divs(raw_divs);
	let formatted_dividends = format_divs(simple_divs);
	let dividends = group_divs(formatted_dividends);
	formatData(doData);
	formatData(awsData);
	formatData(borrowData);
	let expenses = groupData(doData, awsData);
	expenses = groupData(expenses, borrowData);
	let all_data = groupData(expenses, dividends);
	let months = expenses.map((d) => d["Date"]);
	let income_months = dividends.map((d) => d["Date"]);
	let amounts = expenses.map((d) => -d["Amount"]);
	let income = dividends.map(d => d["Amount"]);
	let svg_elem = d3.select(el);
	let y_scale = d3.scaleLinear()
					.domain([d3.max(income), d3.min(amounts)])
					.range([0, canvasHeight - 25]);
	let amount_scale = d3.scaleLinear()
				  		 .domain([d3.min(amounts), 0])
						 .range([canvasHeight - y_scale(0) - 20, 0]);
	let income_scale = d3.scaleLinear()
				  		 .domain([0, d3.max(income)])
						 .range([0, y_scale(0)-20]);
	let y_axis = d3.axisLeft().scale(y_scale);
	let month_scale = d3.scaleBand()
	                    .domain(months)
						.range([55,canvasWidth]);
	svg_elem.selectAll(".expense")
			.data(amounts).enter()
			.append("rect")
			.attr("class", "expense")
			.attr("width", (canvasWidth-50)/months.length - 5)
			.attr("height", (datapoint) => amount_scale(datapoint))
			.attr("fill", "orange")
			.attr("x", (datapoint, iteration) => month_scale(months[iteration]))
			.attr("y", (datapoint) => y_scale(0) + 10);
	svg_elem.selectAll(".income")
			.data(income).enter()
			.append("rect")
			.attr("class", "income")
			.attr("width", (canvasWidth-50)/months.length - 5)
			.attr("height", (datapoint) => income_scale(datapoint))
			.attr("fill", "blue")
			.attr("x", (datapoint, iteration) => month_scale(income_months[iteration]))
			.attr("y", (datapoint) => y_scale(0) - income_scale(datapoint) + 10);
	svg_elem.selectAll(".exp_amount")
			.data(amounts).enter()
			.append("text")
			.attr("class", "exp_amount")
			.attr("x", (datapoint, iteration) => month_scale(months[iteration]))
			.attr("y", (datapoint) => amount_scale(datapoint) + y_scale(0))
			.text((d) => d3.format("$.2f")(d));
	svg_elem.selectAll(".inc_amount")
			.data(income).enter()
			.append("text")
			.attr("class", "inc_amount")
			.attr("x", (datapoint, iteration) => month_scale(income_months[iteration]))
			.attr("y", (datapoint) =>  y_scale(0) - income_scale(datapoint))
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

export default d3Tech;
