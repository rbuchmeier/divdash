import * as d3 from 'd3';
const cloneDeep = require('lodash.clonedeep');
const union = require('lodash/union');

var d3Utilities = {};

d3Utilities.create = (el, state) => {
	const canvasHeight = 400;
	const canvasWidth = 3000;
	d3.select(el)
	  .attr("width", canvasWidth)
	  .attr("height", canvasHeight);
    d3Utilities.update(el); // Remove before Prod TODO
}

function filter_borrow(all_activity) {
    let borrow_activity = all_activity.filter((activity) => activity['Description'].includes('AVBAL'));
	return borrow_activity;
}

function filter_divs(all_activity) {
	let money_movements = all_activity.filter((activity) => activity['Type'] === 'MONEY_MOVEMENTS');
	let stock_movements = money_movements.filter((movement) => movement['Symbol']);
	return stock_movements;
}

function simplify_apex(bills) {
	let simplified_bills = bills.map((d) => Object.assign({}, {'Date': d['Trade Date'], 'Amount': d['Net Amount']}));
	return simplified_bills;
}

function dateParse(date, oldFormat) {
    let parseDate = d3.timeParse(oldFormat);
	let formatDate = d3.timeFormat('%b-%y');
	return formatDate(parseDate(date))
}

function format_apex_data(data) {
    let borrowData = data.map((d) => Object.assign({},
		{"Date": dateParse(d["Date"], '%Y-%m-%d')},
		{"Amount": Number(d["Amount"].replace('(','-').replace(')','').replace('$','').replace(' ',''))}
	));
	return borrowData;
}

function reverse_sign(data) {
    let borrowData = data.map((d) => Object.assign({},
		{"Date": d["Date"]},
		{"Amount": -1 * d["Amount"]}
	));
	return borrowData;
}

function clean_borrow_data(data) {
	data = filter_borrow(data);
	data = simplify_apex(data);
	data = format_apex_data(data);
	data = reverse_sign(data);
	return data
}

function clean_div_data(data) {
	data = filter_divs(data);
	data = simplify_apex(data);
	data = format_apex_data(data, false);
	data = group_divs(data)
	return data
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

function getAmounts(arr_of_objs) {
	return arr_of_objs.map((d) => d['Amount']);
}

function getDates(arr_of_objs) {
	return arr_of_objs.map((d) => d['Date']);
}

function mergeArrays(...arrays) {
    let jointArray = []
	arrays.forEach(array => {
		jointArray = [...jointArray, ...array]
	});
	return Array.from(new Set([...jointArray]))
}

function sortMonths(months) {
	let parseMonth = d3.timeParse("%b-%y");
	let parseTime = d3.timeFormat("%b-%y");
	let dateMonths = months.map((d) => parseMonth(d));
	dateMonths = dateMonths.sort((a, b) => a - b);
	dateMonths = dateMonths.map((d) => parseTime(d));
	return dateMonths;
}

d3Utilities.update = (el) => {
	const canvasHeight = 400;
	const canvasWidth = 3000;
	const xLabelMargin = 20;
	const sketchHeight = canvasHeight - xLabelMargin;
	let svg_elem = d3.select(el);
	let borrowData = JSON.parse(localStorage.getItem('borrow'));
	borrowData = clean_borrow_data(borrowData);
	let divData = JSON.parse(localStorage.getItem('borrow'));
	divData = clean_div_data(divData);
	divData = divData.map((d) => Object.assign(d, {'Amount': d['Amount']}));
	let borrow_months = getDates(borrowData);
	let div_months = getDates(divData);
	let borrow_amounts = getAmounts(borrowData);
	let div_amounts = getAmounts(divData);
	let all_months = mergeArrays(borrow_months, div_months);
	all_months = sortMonths(all_months);
	let largest_month_expense = d3.max(borrow_amounts);
	let largest_month_income = d3.max(div_amounts);
	let month_scale = d3.scaleBand()
						.domain(all_months)
						.range([55,canvasWidth]);
	let y_scale = d3.scaleLinear()
					.domain([-1 * largest_month_expense, largest_month_income])
					.range([0, sketchHeight]);
	let borrow_scale = d3.scaleLinear()
						    .domain([0, d3.max(borrow_amounts)])
						    .range([0, y_scale(0)]);
	let div_scale = d3.scaleLinear()
						    .domain([0, d3.max(div_amounts)])
						    .range([0, sketchHeight - y_scale(0)]);
	svg_elem.selectAll('.borrow')
			.data(borrowData).enter()
			.append('rect')
			.attr('class', 'borrow')
			.attr('width', (canvasWidth-50)/all_months.length - 5)
			.attr('height', (datapoint) => borrow_scale(datapoint['Amount']))
			.attr('fill', 'blue')
			.attr('x', (datapoint, iteration) => month_scale(borrow_months[iteration]))
			.attr('y', (datapoint) => sketchHeight - y_scale(0) );
	svg_elem.selectAll('.income')
			.data(divData).enter()
			.append('rect')
			.attr('class', 'income')
			.attr('width', (canvasWidth-50)/all_months.length - 5)
			.attr('height', (datapoint) => div_scale(datapoint['Amount']))
			.attr('fill', 'green')
			.attr('x', (datapoint, iteration) => month_scale(div_months[iteration]))
			.attr('y', (datapoint) => sketchHeight - y_scale(0) - div_scale(datapoint['Amount']));
	svg_elem.selectAll(".month")
			.data(all_months).enter()
			.append("text")
			.attr("class", "month")
			.attr("x", (datapoint, iteration) => month_scale(datapoint))
			.attr("y", (datapoint) => canvasHeight-5)
			.text((d) => d);
};

export {d3Utilities as d3Chart};
