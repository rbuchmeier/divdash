import React, { Component } from 'react';
import d3HistDiv from './d3HistDiv';

class HistDivChart extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.state = {data: []};
	}
	componentDidMount() {
		d3HistDiv.create(this.myRef.current, this.props.data);
	}
	componentDidUpdate() {
		if (this.props.data.length > 0) {
			d3HistDiv.update(this.myRef.current, this.props.data);
		}
	}
	render() { return <svg ref={this.myRef}></svg> }
}
export default HistDivChart
