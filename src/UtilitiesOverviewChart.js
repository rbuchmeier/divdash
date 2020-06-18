import React, { Component } from 'react';
const {d3Chart} = require('./d3Utilities');

class UtilitiesOverviewChart extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.state = {data: []};
	}
	componentDidMount() {
		d3Chart.create(this.myRef.current, this.props.data);
	}
	componentDidUpdate() {
		if (this.props.data.propane.data.length > 0 &&
			this.props.data.rmp.data.length > 0 &&
			this.props.data.borrow.data.length > 0 ) {
			d3Chart.update(this.myRef.current, this.props.data);
		}
	}
	render() { return <svg ref={this.myRef}></svg> }
}
export default UtilitiesOverviewChart
