import React from 'react';
import secrets from './secrets';
import UtilitiesOverviewChart from './UtilitiesOverviewChart';
import styles from './styles.module.css';
const cloneDeep = require('lodash.clonedeep');
var Papa = require('papaparse');
var AWS = require('aws-sdk');
AWS.config.update(
	{
		accessKeyId: secrets.ak,
		secretAccessKey: secrets.sk,
	}
)

class UtilitiesOverviewWrapper extends React.Component {
	constructor(props) {
		super(props);
		this.handleS3DownloadCloser = this.handleS3DownloadCloser.bind(this);
		this.state = {
			propane: {
				type: "expense",
				filename: "propane.csv",
				data: []
			},
			rmp: {
				type: "expense",
				filename: "rmp_bills.csv",
				data: []
			},
			borrow: {
				type: "expense",
				filename: "activity-export-5QN58873.csv",
				data: []
			}
		};
	}
	handleS3DownloadCloser(stateKey) {
		function handleS3Download (error, data) {
			if (error != null) {
				alert("Failed to retrieve an object: " + error);
			} else {
				let parsed_data = Papa.parse(data.Body.toString(), {header: true, dynamicTyping: true, skipEmptyLines: true}).data
				//currently (June 2020) Papa.parse().data is returning an extra item with null values. skipEmptyLines fixes the issue for now...
				this.setState((state, props) => ({
					propane: {
						type: "expense",
						filename: "propane.csv",
						data: stateKey === "propane" ? cloneDeep(parsed_data) : this.state.propane.data
					},
					rmp: {
						type: "expense",
						filename: "rmp_bills.csv",
						data: stateKey === "rmp" ? cloneDeep(parsed_data) : this.state.rmp.data
					},
					borrow: {
						type: "expense",
						filename: "activity-export-5QM34557.csv",
						data: stateKey === "borrow" ? cloneDeep(parsed_data) : this.state.borrow.data
					}
				}));
			}
		}
		handleS3Download=handleS3Download.bind(this);
		return handleS3Download
	}
	componentDidMount () {
		var s3 = new AWS.S3();
		Object.keys(this.state).forEach((key, index) => {
			s3.getObject(
				{ Bucket: "divdata", Key: this.state[key].filename},
				this.handleS3DownloadCloser(key)
			);
		})
	}
	render () {
		return (
			<div className={styles.card}>
				<UtilitiesOverviewChart data={this.state} />
			</div>
		)
	}
}
export default UtilitiesOverviewWrapper
