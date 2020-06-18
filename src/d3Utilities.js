import * as d3 from 'd3';
const cloneDeep = require('lodash.clonedeep');
const union = require('lodash/union');
const { mergeExpensesIntoIncome, reduceOngoingData, getCumulativeFromIncome } = require('./data_utils');

var d3Utilities = {};

d3Utilities.create = (el, state) => {
	const canvasHeight = 400;
	const canvasWidth = 3000;
	d3.select(el)
	  .attr("width", canvasWidth)
	  .attr("height", canvasHeight)
}

function rmpDateParse(date) {
	let parseDate = d3.timeParse('%m/%d/%y');
	let formatDate = d3.timeFormat('%b-%y');
	return formatDate(parseDate(date))
}

function dateParse(date) {
	let parseDate = d3.timeParse('%Y-%m-%d');
	let formatDate = d3.timeFormat('%b-%y');
	return formatDate(parseDate(date))
}

function formatBorrowData(data) {
	let borrowData = data.map((d) => Object.assign({},
		{"Date": dateParse(d["Date"])},
		{"Amount": -1 * Number(d["Amount"].replace('(','-').replace(')','').replace('$','').replace(' ',''))}
	));
	return borrowData;
}

function formatRmpData(data) {
	let rmpData = data.map((d) => Object.assign({},
		{"Date": rmpDateParse(d["DATE"])},
		{"Amount": d["AMOUNT"]}
	));
	return rmpData;
}

function formatPropaneData(data) {
	let propaneData = data.map((d) => Object.assign({},
		{"Date": dateParse(d["Date"])},
		{"Amount": d["Amount"]}
	));
		return propaneData;
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
	return bad_amount_divs.map((d) => Object.assign(d, {'Amount': Number(d['Amount'].replace('(','-').replace(')','').replace('$','').replace(' ',''))}));
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
	let borrow_activity = all_activity.filter((activity) => activity['Description'].includes('AVBAL'));
    return borrow_activity;
}

function simplify_borrow(bills) {
	let simplified_bills = bills.map((d) => Object.assign({}, {'Date': d['Trade Date'], 'Amount': d['Net Amount']}));
	return simplified_bills;
}

function getCumulative(net_data) {
	let cumulative = cloneDeep(net_data);
	return cumulative.map(
		(d, i, arr) =>
		d["Amount"] + arr.slice(0, i).reduce(
			(a, b) =>
			a + b["Amount"]
		, 0)
	);
}

function string_to_date(datestr) {
	let parseDate = d3.timeParse('%b-%y');
	return parseDate(datestr);
}

d3Utilities.update = (el, state) => {
	const canvasHeight = 400;
	const canvasWidth = 3000;
	let propaneData = [...state.propane.data];
	let rmpData = [...state.rmp.data];
	let borrowData = [...state.borrow.data];
	let divData = [...state.borrow.data];
	borrowData = filter_borrow(borrowData);
	borrowData = simplify_borrow(borrowData);
	let raw_divs = filter_dividends(divData);
	let simple_divs = simplify_divs(raw_divs);
	let formatted_dividends = format_divs(simple_divs);
	let dividends = group_divs(formatted_dividends);
	propaneData = formatPropaneData(propaneData);
	rmpData = formatRmpData(rmpData);
	borrowData = formatBorrowData(borrowData);
	let expenses = groupData(propaneData, rmpData);
	expenses = groupData(expenses, borrowData);
	expenses.sort((a, b) => {
		let a_date = string_to_date(a["Date"]);
		let b_date = string_to_date(b["Date"]);
		return a_date < b_date ? -1 : a_date > b_date ? 1 : 0;
	});
	let neg_expenses = expenses.map((d) => Object.assign({}, {"Date": d["Date"]}, {"Amount": -1 * d["Amount"]}));
	let all_data = groupData(neg_expenses, dividends);
	let cumulative = getCumulativeFromIncome(neg_expenses, dividends);
	let cumulative_amounts = cumulative.map((d) => d["Amount"]);
	let cumulative_months = cumulative.map((d) => d["Date"]);
	let months = expenses.map((d) => d["Date"]);
	let income_months = dividends.map((d) => d["Date"]);
	let all_months = union([...months], [...income_months]);
	let amounts = expenses.map((d) => d["Amount"]);
	let expense_amounts = neg_expenses.map((d) => d["Amount"]);
	let propane_amounts = propaneData.map((d) => d["Amount"]);
	let propane_months = propaneData.map((d) => d["Date"]);
	let rmp_amounts = rmpData.map((d) => d["Amount"]);
	let rmp_months = rmpData.map((d) => d["Date"]);
	let borrow_amounts = borrowData.map((d) => d["Amount"]);
	let borrow_months = borrowData.map((d) => d["Date"]);
	let income = dividends.map(d => d["Amount"]);
	let svg_elem = d3.select(el);
	let y_scale = d3.scaleLinear()
					.domain([d3.max([d3.max(cumulative_amounts), d3.max(income)]), d3.min([d3.min(cumulative_amounts), d3.min(expense_amounts)])])
					.range([0, canvasHeight - 25]);
	let expense_scale = d3.scaleLinear()
				  		 .domain([d3.min([d3.min(cumulative_amounts), d3.min(expense_amounts)]), 0])
						 .range([canvasHeight - y_scale(0), 0]);
	let income_scale = d3.scaleLinear()
				  		 .domain([0, d3.max([d3.max(cumulative_amounts), d3.max(income)])])
						 .range([0, y_scale(0)]);
	let y_axis = d3.axisLeft().scale(y_scale);
	let month_scale = d3.scaleBand()
	                    .domain(all_months)
						.range([55,canvasWidth]);
	let getRMPHeight = (month => {
		let chart_month_index = all_months.findIndex(m => m === month);
		let propane_index = propane_months.findIndex(m => m === all_months[chart_month_index]);
		let propane_amount = propane_amounts[propane_index];
		let y_value = 0;
		if (propane_amount) {
			y_value = expense_scale(propane_amount);
		}
		return y_value;
	});
	svg_elem.selectAll(".propanedata")
			.data(propane_amounts).enter()
			.append("rect")
			.attr("class", "propanedata")
			.attr("width", (canvasWidth-50)/all_months.length - 5)
			.attr("height", (datapoint) => expense_scale(-1 * datapoint))
			.attr("fill", "orange")
			.attr("x", (datapoint, iteration) => month_scale(propane_months[iteration]))
			.attr("y", (datapoint) => y_scale(0) + 10);
	svg_elem.selectAll(".rmpdata")
			.data(rmp_amounts).enter()
			.append("rect")
			.attr("class", "rmpdata")
			.attr("width", (canvasWidth-50)/all_months.length - 5)
			.attr("height", (datapoint) => expense_scale(-1 * datapoint))
			.attr("fill", "darkseagreen")
			.attr("x", (datapoint, iteration) => month_scale(rmp_months[iteration]))
			.attr("y", (datapoint, iteration) => y_scale(0) + getRMPHeight(rmp_months[iteration]) + 10);
	svg_elem.selectAll(".borrowdata")
			.data(borrow_amounts).enter()
			.append("rect")
			.attr("class", "borrowdata")
			.attr("width", (canvasWidth-50)/all_months.length - 5)
			.attr("height", (datapoint) => expense_scale(-1 * datapoint))
			.attr("fill", "pink")
			.attr("x", (datapoint, iteration) => month_scale(borrow_months[iteration]))
			.attr("y", (datapoint, iteration) => y_scale(0) + getRMPHeight(borrow_months[iteration]) + 10);
	svg_elem.selectAll(".income")
			.data(income).enter()
			.append("rect")
			.attr("class", "income")
			.attr("width", (canvasWidth-50)/all_months.length - 5)
			.attr("height", (datapoint) => income_scale(datapoint))
			.attr("fill", "blue")
			.attr("x", (datapoint, iteration) => month_scale(income_months[iteration]))
			.attr("y", (datapoint) => y_scale(0) - income_scale(datapoint) + 10);
	svg_elem.selectAll(".exp_amount")
			.data(amounts).enter()
			.append("text")
			.attr("class", "exp_amount")
			.attr("x", (datapoint, iteration) => month_scale(all_months[iteration]))
			.attr("y", (datapoint) => expense_scale(-1 * datapoint) + y_scale(0) + 10)
			.text((d) => d3.format("$.2f")(d));
	svg_elem.selectAll(".inc_amount")
			.data(income).enter()
			.append("text")
			.attr("class", "inc_amount")
			.attr("x", (datapoint, iteration) => month_scale(income_months[iteration]))
			.attr("y", (datapoint) =>  y_scale(0) - income_scale(datapoint))
			.text((d) => d3.format("$.2f")(d));
	svg_elem.selectAll(".month")
			.data(all_months).enter()
			.append("text")
			.attr("class", "month")
			.attr("x", (datapoint, iteration) => month_scale(datapoint))
			.attr("y", (datapoint) => canvasHeight)
			.text((d) => d);
	svg_elem.append("path")
			.datum(cumulative)
			.attr("fill", "none")
			.attr("stroke", "steelblue")
			.attr("stroke-width", 1.5)
			.attr("d", d3.line()
						 .x((d, i) => month_scale(d["Date"]) + (canvasWidth-50)/cumulative.length/2 - 5)
						 .y(d => y_scale(0) - income_scale(d["Amount"]) + 15));
	svg_elem.append("g")
	        .attr("transform", "translate(50, 10)")
	        .call(y_axis);
};

export {d3Utilities as d3Chart, getCumulativeFromIncome as funcToTest};
//export let getCumulativeFromIncome = getCumulativeFromIncome;
