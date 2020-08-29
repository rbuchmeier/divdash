import React from 'react';

import secrets from './secrets';
import UtilitiesChartV2 from './UtilitiesChartV2';
import styles from './styles.module.css';

const OPTIONS = ["rmp", "propane", "borrow"];
const FILENAMES = {
	"rmp": "rmp_bills.csv",
	"propane": "propane.csv",
	"borrow": "activity-export-5QM34557.csv"
}

var Papa = require('papaparse');
var AWS = require('aws-sdk');
AWS.config.update(
    {
		accessKeyId: secrets.ak,
		secretAccessKey: secrets.sk,
	}
)

class UtilitiesOverviewV2 extends React.Component {
	constructor(props) {
		super(props);
		let keys = OPTIONS.filter((x) => localStorage.getItem(x));
		this.state = {
			activeKeys: keys,
			checkboxes: OPTIONS.reduce(
				(options, option) => ({
					...options,
					[option]: true
				}),
				{}
			)
		}
		this.handleS3DownloadCloser = this.handleS3DownloadCloser.bind(this);
	}
	handleCheckboxChange = (changeEvent) => {
		let name = changeEvent.target["name"];
		this.setState(prevState => ({
			checkboxes: {
				...prevState.checkboxes,
				[name]: !prevState.checkboxes[name]
			}
		}));
	}
	createCheckbox = (option) =>  {
		let inLocalStorage = this.state.activeKeys.includes(option);
		return (
			<label key={option}>
				<input
					type="checkbox"
					name={option}
					checked={this.state.checkboxes[option]}
					onChange={this.handleCheckboxChange}
					disabled={!inLocalStorage}
				/>
				<span>
					{option}
				</span>
			</label>
		);
	}
	createCheckBoxes = () => OPTIONS.map(this.createCheckbox);
	refreshData = () => {
		var s3 = new AWS.S3();
		OPTIONS.forEach((key, index) => {
			if (FILENAMES.hasOwnProperty(key)) {
				s3.getObject(
					{ Bucket: "divdata", Key: FILENAMES[key]},
					this.handleS3DownloadCloser(key)
				);
			}
		})
	}
	handleS3DownloadCloser(stateKey) {
		function handleS3Download (error, data) {
			if (error != null) {
				alert("Failed to retrieve an object: " + error);
			} else {
				//currently (June 2020) Papa.parse().data is returning an extra item with null values. skipEmptyLines fixes the issue for now...
				let parsed_data = Papa.parse(data.Body.toString(), {header: true, dynamicTyping: true, skipEmptyLines: true}).data
				localStorage.setItem(stateKey, JSON.stringify(parsed_data));
			}
		}
		handleS3Download=handleS3Download.bind(this);
		return handleS3Download
	}
	render () {
		return (
			<div>
				<div>
					<form>
						{this.createCheckBoxes()}
					</form>
					<button onClick={this.refreshData}>
						Refresh
					</button>
				</div>
				<UtilitiesChartV2 dataRequested={this.state.checkboxes}/>
			</div>
		)
	}
}
export default UtilitiesOverviewV2
