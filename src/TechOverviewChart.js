import React, { Component } from 'react';
import d3Tech from './d3Tech';

class TechOverviewChart extends Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.state = {data: []};
	}
	componentDidMount() {
		d3Tech.create(this.myRef.current, this.props.data);
	}
	componentDidUpdate() {
		if (this.props.data.digitalocean.data.length > 0) {
			d3Tech.update(this.myRef.current, this.props.data);
		}
	}
	render() { return <svg ref={this.myRef}></svg> }
}
export default TechOverviewChart
