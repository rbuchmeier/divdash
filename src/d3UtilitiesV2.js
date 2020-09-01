import * as d3 from 'd3';
const cloneDeep = require('lodash.clonedeep');
const union = require('lodash/union');
const { combineExpenses, reduceOngoingData, getCumulativeFromIncome } = require('./data_utils');

var d3Utilities = {};

d3Utilities.create = (el, dataRequested) => {
    d3Utilities.update(el, dataRequested); // Remove before Prod TODO
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

function updateExpenses(svge, dataRequested, yScale, barWidth, month_scale, sketchHeight) {
	let borrow = JSON.parse(localStorage.getItem('borrow'));
	borrow = clean_borrow_data(borrow);
	let borrow_months = getDates(borrow);
	let borrow_amounts = getAmounts(borrow);
	let borrow_scale = d3.scaleLinear()
						.domain([0, d3.max(borrow_amounts)])
						.range([0, yScale(0)]);
	if (dataRequested['borrow']) {
		svge.selectAll('.borrow')
			.data(borrow).enter()
			.append('rect')
			.attr('class', 'borrow')
			.attr('width', barWidth)
			.attr('height', (datapoint) => borrow_scale(datapoint['Amount']))
			.attr('fill', 'blue')
			.attr('x', (datapoint, iteration) => month_scale(borrow_months[iteration]))
			.attr('y', (datapoint) => sketchHeight - yScale(0) )
			.on('mouseover', () => tooltip.style("display", null))
			.on('mouseout', () => tooltip.style("display", "none"))
			.on("mousemove", function(d) {
				let xPosition = d3.mouse(this)[0] - 15;
				let yPosition = d3.mouse(this)[1] - 25;
				tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
				tooltip.select("text").text(d3.format("$.2f")(d['Amount']));
			});
	} else {
		svge.selectAll('.borrow')
			.remove();
	}
	let tooltip = svge.append("g")
					.attr("class", "tooltip")
					.style("display", "none");
	tooltip.append("rect")
			.attr("width", 30)
			.attr("height", 20)
			.attr("fill", "white")
			.style("opacity", 0.5);
	tooltip.append("text")
			.attr("x", 15)
			.attr("dy", "1.2em")
			.style("text-anchor", "middle")
			.attr("font-size", "12px")
			.attr("font-weight", "bold");
}

function getLargestExpense() {
	let borrow = JSON.parse(localStorage.getItem('borrow'));
	borrow = clean_borrow_data(borrow);
	let expenses = combineExpenses({'type': 'borrow', 'data': borrow});
	let largestExpense = 0;
	let currentExpense = 0;
	expenses.map((e) => {
		currentExpense = Object.values(e['Expenses']).reduce((a, b) => a + b);
		largestExpense = (currentExpense > largestExpense ? currentExpense : largestExpense);
	});
	console.log(largestExpense);
	return largestExpense;
}

d3Utilities.update = (el, dataRequested) => {
	const canvasHeight = 400;
	const canvasWidth = 1000;
	d3.select(el)
	  .attr("width", canvasWidth)
	  .attr("height", canvasHeight);
	const xLabelMargin = 20;
	const sketchHeight = canvasHeight - xLabelMargin;
	let svg_elem = d3.select(el);
	let divData = JSON.parse(localStorage.getItem('borrow'));
	divData = clean_div_data(divData);
	divData = divData.map((d) => Object.assign(d, {'Amount': d['Amount']}));
	let income_months = getDates(divData);
	let div_amounts = getAmounts(divData);
	income_months = sortMonths(income_months);
	let largest_month_expense = getLargestExpense();
	let largest_month_income = d3.max(div_amounts);
	let month_scale = d3.scaleBand()
						.domain(income_months)
						.range([55,canvasWidth]);
	let y_scale = d3.scaleLinear()
					.domain([-1 * largest_month_expense, largest_month_income])
					.range([0, sketchHeight]);
	let div_scale = d3.scaleLinear()
						    .domain([0, d3.max(div_amounts)])
						    .range([0, sketchHeight - y_scale(0)]);
	let barWidth = (canvasWidth-50)/income_months.length - 5;
	svg_elem.selectAll('.income')
			.data(divData).enter()
			.append('rect')
			.attr('class', 'income')
			.attr('width', barWidth)
			.attr('height', (datapoint) => div_scale(datapoint['Amount']))
			.attr('fill', 'green')
			.attr('x', (datapoint, iteration) => month_scale(income_months[iteration]))
			.attr('y', (datapoint) => sketchHeight - y_scale(0) - div_scale(datapoint['Amount']))
			.on('mouseover', () => tooltip.style("display", null))
			.on('mouseout', () => tooltip.style("display", "none"))
			.on("mousemove", function(d) {
				let xPosition = d3.mouse(this)[0] - 15;
				let yPosition = d3.mouse(this)[1] - 25;
				tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
				tooltip.select("text").text(d3.format("$.2f")(d['Amount']));
			})
	svg_elem.selectAll(".month")
			.data(income_months).enter()
			.append("text")
			.attr("class", "month")
			.attr("x", (datapoint, iteration) => month_scale(datapoint))
			.attr("y", (datapoint) => canvasHeight-5)
			.text((d) => d);
	// Prep the tooltip bits, initial display is hidden
	let tooltip = svg_elem.append("g")
					.attr("class", "tooltip")
					.style("display", "none");
	tooltip.append("rect")
			.attr("width", 30)
			.attr("height", 20)
			.attr("fill", "white")
			.style("opacity", 0.5);
	tooltip.append("text")
			.attr("x", 15)
			.attr("dy", "1.2em")
			.style("text-anchor", "middle")
			.attr("font-size", "12px")
			.attr("font-weight", "bold");
	updateExpenses(svg_elem, dataRequested, y_scale, barWidth, month_scale, sketchHeight);
};

export {d3Utilities as d3Chart};

