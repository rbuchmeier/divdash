const { mergeExpensesIntoIncome, reduceOngoingData, getCumulativeFromIncome } = require('./data_utils');

test('combines amounts', () => {
	let expenses = [{"Date": "Jan-19", "Amount": -10}]
	let income = [{"Date": "Jan-19", "Amount": 20}]
	let expected = [{"Date": "Jan-19", "Amount": 10}]
	expect(mergeExpensesIntoIncome(expenses, income)).toStrictEqual(expected);
});

test('only combines since income', () => {
	let expenses = [{"Date": "Jan-19", "Amount": -10}, {"Date": "Feb-19", "Amount": -10}]
	let income = [{"Date": "Feb-19", "Amount": 20}]
	let expected = [{"Date": "Feb-19", "Amount": 10}]
	expect(mergeExpensesIntoIncome(expenses, income)).toStrictEqual(expected);
});

test('adds data together', () => {
	let data = [{"Date": "Jan-19", "Amount": 25}, {"Date": "Feb-19", "Amount": 20}]
	let expected = [{"Date": "Jan-19", "Amount": 25}, {"Date": "Feb-19", "Amount": 45}]
	expect(reduceOngoingData(data)).toStrictEqual(expected);
});

test('gets cumulative data', () => {
	let expenses = [{"Date": "Jan-19", "Amount": -10}, {"Date": "Feb-19", "Amount": -10}]
	let income = [{"Date": "Feb-19", "Amount": 25}, {"Date": "Mar-19", "Amount": 20}]
	let expected = [{"Date": "Feb-19", "Amount": 15}, {"Date": "Mar-19", "Amount": 35}]
	expect(getCumulativeFromIncome(expenses, income)).toStrictEqual(expected);
});
