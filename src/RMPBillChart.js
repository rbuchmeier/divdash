import React, { Component } from 'react';
import d3RMPBills from './d3RMPBills';

class RMPBillChart extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.state = {data: []};
	}
	componentDidMount() {
		d3RMPBills.create(this.myRef.current, this.props.data);
	}
	componentDidUpdate() {
		if (this.props.data.length > 0) {
			d3RMPBills.update(this.myRef.current, this.props.data);
		}
	}
	render() { return <svg ref={this.myRef}></svg> }
}
export default RMPBillChart
