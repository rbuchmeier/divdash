import React from 'react';
import secrets from './secrets';
import AWSCostsChart from './AWSCostsChart';
var Papa = require('papaparse');
var AWS = require('aws-sdk');
AWS.config.update(
	{
		accessKeyId: secrets.ak,
		secretAccessKey: secrets.sk,
	}
)

class AWSCostsWrapper extends React.Component {
	constructor(props) {
		super(props);
		this.handleS3Download = this.handleS3Download.bind(this);
		this.state = {data: []};
}
	handleS3Download (error, data) {
		if (error != null) {
			alert("Failed to retrieve an object: " + error);
		} else {
			let parsed_data = Papa.parse(data.Body.toString(), {header: true, dynamicTyping: true, skipEmptyLines: true}).data
			//currently (June 2020) Papa.parse().data is returning an extra item with null values. skipEmptyLines fixes the issue for now...
			this.setState((state, props) => ({
				data: parsed_data
			}));
		}
	}
	componentDidMount () {
		var s3 = new AWS.S3();
		s3.getObject(
			{ Bucket: "divdata", Key: "costs.csv" },
			this.handleS3Download
		);
	}
	render () {
		return (
			<AWSCostsChart data={this.state.data} />
		)
	}
}
export default AWSCostsWrapper
