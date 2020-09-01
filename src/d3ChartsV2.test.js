const { combineExpenses } = require('./data_utils');

test('true is true', () => {
	expect(true).toStrictEqual(true);
});

test('reformats single entry', () => {
	let sampleBorrow = [{"Date": "Jan-19", "Amount": 10}]
	let expected = [{"Month": "Jan-19", "Expenses": {"borrow": 10}}]
	expect(combineExpenses({'type': 'borrow', 'data': sampleBorrow})).toStrictEqual(expected);
});

test('combines two months of same expense', () => {
	let sampleBorrow = [{"Date": "Jan-19", "Amount": 10}, {"Date": "Feb-19", "Amount": 11}]
	let expected = [{"Month": "Jan-19", "Expenses": {"borrow": 10}},{"Month": "Feb-19", "Expenses": {"borrow": 11}}]
	let result = combineExpenses({'type': 'borrow', 'data': sampleBorrow})
	expect(result).toStrictEqual(expected);
});

test('combines multiple entries of multiple expenses', () => {
	let sampleBorrow = [{"Date": "Jan-19", "Amount": 10}, {"Date": "Feb-19", "Amount": 11}]
	let sampleRMP = [{"Date": "Feb-19", "Amount": 40}, {"Date": "Mar-19", "Amount": 51}]
	let expected = [{"Month": "Jan-19", "Expenses": {"borrow": 10}}, {"Month": "Feb-19", "Expenses": {"borrow": 11, "rmp": 40}}, {"Month": "Mar-19", "Expenses": {"rmp": 51}}]
	let result = combineExpenses({'type': 'borrow', 'data': sampleBorrow}, {'type': 'rmp', 'data': sampleRMP});
	expect(result).toStrictEqual(expected);
});

