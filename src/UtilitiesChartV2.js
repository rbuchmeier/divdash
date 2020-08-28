import React, { Component } from 'react';
const {d3Chart} = require('./d3UtilitiesV2');

class UtilitiesOverviewChart extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
	}
	componentDidMount() {
		d3Chart.create(this.myRef.current);
	}
	componentDidUpdate() {
		d3Chart.update(this.myRef.current);
	}
	render() { return <svg ref={this.myRef}></svg> }
}
export default UtilitiesOverviewChart
