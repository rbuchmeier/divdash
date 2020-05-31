import React from 'react';
import secrets from './secrets';
import BarChart from './BarChart';
import PriceChart from './PriceChart';
var Papa = require('papaparse');
var AWS = require('aws-sdk');
AWS.config.update(
	{
		accessKeyId: secrets.ak,
		secretAccessKey: secrets.sk,
	}
)

class DataAWS extends React.Component {
	constructor(props) {
		super(props);
		this.handleS3Download = this.handleS3Download.bind(this);
		this.state = {data: []};
}
	handleS3Download (error, data) {
		if (error != null) {
			alert("Failed to retrieve an object: " + error);
		} else {
			this.setState((state, props) => ({
				data: Papa.parse(data.Body.toString(), {header: true, dynamicTyping: true}).data
			}));
		}
	}
	componentDidMount () {
		var s3 = new AWS.S3();
		s3.getObject(
			{ Bucket: "divdata", Key: "positions-export-5QN58873.csv" },
			this.handleS3Download
		);
	}
	render () {
		return (
			<PriceChart data={this.state.data} />
		)
	}
}
export default DataAWS
