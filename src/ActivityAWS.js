import React from 'react';
import secrets from './secrets';
import HistDivChart from './HistDivChart';
var Papa = require('papaparse');
var AWS = require('aws-sdk');
AWS.config.update(
	{
		accessKeyId: secrets.ak,
		secretAccessKey: secrets.sk,
	}
)

class ActivityAWS extends React.Component {
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
			{ Bucket: "divdata", Key: "activity-export-5QM34557.csv" },
			this.handleS3Download
		);
	}
	render () {
		return (
			<HistDivChart data={this.state.data} />
		)
	}
}
export default ActivityAWS
