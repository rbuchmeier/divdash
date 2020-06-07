import React, { Component } from 'react';
import d3M1Borrow from './d3M1Borrow';

class M1BorrowChart extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.state = {data: []};
	}
	componentDidMount() {
		d3M1Borrow.create(this.myRef.current, this.props.data);
	}
	componentDidUpdate() {
		if (this.props.data.length > 0) {
			d3M1Borrow.update(this.myRef.current, this.props.data);
		}
	}
	render() { return <svg ref={this.myRef}></svg> }
}
export default M1BorrowChart
