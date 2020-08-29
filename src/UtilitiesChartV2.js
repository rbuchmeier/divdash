import React, { Component } from 'react';
const {d3Chart} = require('./d3UtilitiesV2');

class UtilitiesOverviewChart extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
	}
	componentDidMount() {
		d3Chart.create(this.myRef.current, this.props.dataRequested);
	}
	componentDidUpdate() {
		d3Chart.update(this.myRef.current, this.props.dataRequested);
	}
	render() { return <svg ref={this.myRef}></svg> }
}
export default UtilitiesOverviewChart
