import React, { Component } from 'react';
import d3AWSCosts from './d3AWSCosts';

class AWSCostsChart extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.state = {data: []};
	}
	componentDidMount() {
		d3AWSCosts.create(this.myRef.current, this.props.data);
	}
	componentDidUpdate() {
		if (this.props.data.length > 0) {
			d3AWSCosts.update(this.myRef.current, this.props.data);
		}
	}
	render() { return <svg ref={this.myRef}></svg> }
}
export default AWSCostsChart
