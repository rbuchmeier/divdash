import * as d3 from 'd3';

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
	});
}

function groupData(arr1, arr2) {
	let new_array = [...arr1];
	arr2.forEach((x) => {
		let matching_months = new_array.filter(y => x["Date"] == y["Date"]);
		if (matching_months.length === 0) {
			new_array.push(x);
		} else {
			matching_months[0]["Amount"] += x["Amount"];
		}
	});
	return new_array;
}

d3Tech.update = (el, state) => {
	const canvasHeight = 400;
	const canvasWidth = 1000;
	let doData = [...state.digitalocean.data];
	let awsData = [...state.aws.data];
	formatData(doData);
	formatData(awsData);
	let data = groupData(doData, awsData);
	console.log(data);
	let do_months = doData.map((d) => d["Date"]);
	let aws_months = awsData.map((d) => d["Date"]);
	let months = Array.from(new Set([...do_months,...aws_months]));
	let do_amounts = doData.map((d) => d["Amount"]);
	let aws_amounts = awsData.map((d) => d["Amount"]);
	let scale_amounts = do_amounts.concat(aws_amounts);
	let svg_elem = d3.select(el);
	let amount_scale = d3.scaleLinear()
				  		 .domain([0, d3.max(do_amounts)])
						 .range([0, canvasHeight - 25]);
	let y_scale = d3.scaleLinear()
					.domain([0, d3.max(do_amounts)])
					.range([canvasHeight - 25, 0]);
	let y_axis = d3.axisLeft().scale(y_scale);
	let month_scale = d3.scaleBand()
	                    .domain(months)
						.range([55,canvasWidth]);
	svg_elem.selectAll("rect")
			.data(do_amounts).enter()
			.append("rect")
			.attr("width", (canvasWidth-50)/months.length - 5)
			.attr("height", (datapoint) => amount_scale(datapoint))
			.attr("fill", "orange")
			.attr("x", (datapoint, iteration) => month_scale(months[iteration]))
			.attr("y", (datapoint) => canvasHeight - amount_scale(datapoint) - 15);
	svg_elem.selectAll(".amount")
			.data(do_amounts).enter()
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

export default d3Tech;
