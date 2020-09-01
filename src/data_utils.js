const cloneDeep = require('lodash.clonedeep');

function mergeExpensesIntoIncome(expenses, income) {
	let new_array = cloneDeep(expenses);
	let cumulative = cloneDeep(income);
	income.forEach((x, i) => {
		let matching_months = new_array.filter(y => x["Date"] === y["Date"]);
		if (matching_months.length > 0) {
			cumulative[i]["Amount"] += matching_months[0]["Amount"];
		}
	});
	return cumulative;
}

function reduceOngoingData(data) {
	return data.map(
		(d, i, arr) => Object.assign({},
			{"Date": d["Date"]},
			{"Amount": d["Amount"] + arr.slice(0, i).reduce(
				(a, b) =>
				a + b["Amount"]
			, 0)}
		)
	);
}

function getCumulativeFromIncome(exp, inc) {
	let cumulative = mergeExpensesIntoIncome(exp, inc);
	return reduceOngoingData(cumulative);
}


function combineExpenses(...expenses) {
	let finalResult = [{'Date': ''}]; // Remove at end of function
	let type = '';
	let data = [];
	let existingMonthIndex = -1;
	expenses.forEach((expense) => {
		type = expense['type'];
		data = expense['data'];
		data.map((d) => {
			existingMonthIndex = -1;
			finalResult.map((e, i) => {
				if (e['Month'] === d['Date']) {
					existingMonthIndex = i;
				}
			})
			if (existingMonthIndex >= 0) {
				finalResult[existingMonthIndex]['Expenses'][type] = d['Amount'];
			} else {
				finalResult = [...finalResult, Object.assign({}, {'Month': d['Date'], 'Expenses': Object.assign({}, {[type]: d['Amount']})})]
			}
		})
	});
	finalResult.shift();
	return finalResult;
}

module.exports = {
	mergeExpensesIntoIncome: mergeExpensesIntoIncome,
	reduceOngoingData: reduceOngoingData,
	combineExpenses: combineExpenses,
	getCumulativeFromIncome: getCumulativeFromIncome
};

