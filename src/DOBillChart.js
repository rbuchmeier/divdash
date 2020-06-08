import React, { Component } from 'react';
import d3DOBills from './d3DOBills';

class DOBillChart extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.state = {data: []};
	}
	componentDidMount() {
		d3DOBills.create(this.myRef.current, this.props.data);
	}
	componentDidUpdate() {
		if (this.props.data.length > 0) {
			d3DOBills.update(this.myRef.current, this.props.data);
		}
	}
	render() { return <svg ref={this.myRef}></svg> }
}
export default DOBillChart
