import React, { Component } from 'react';
import d3PriceChart from './d3PriceChart';

class PriceChart extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.state = {data: []};
	}
	componentDidMount() {
		const data = [ 2, 4, 2, 6, 8 ]
		d3PriceChart.create(this.myRef.current, data);
	}
	componentDidUpdate() {
		if (this.props.data.length > 0) {
			d3PriceChart.update(this.myRef.current, this.props.data);
		}
	}
	render() { return <svg ref={this.myRef}></svg> }
}
export default PriceChart
