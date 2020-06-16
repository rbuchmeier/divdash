import React from 'react';
import DataAWS from './DataAWS';
import ActivityAWS from './ActivityAWS';
import AWSCostsWrapper from './AWSCostsWrapper';
import RMPBillWrapper from './RMPBillWrapper';
import M1BorrowWrapper from './M1BorrowWrapper';
import DOBillWrapper from './DOBillWrapper';
import TechOverviewWrapper from './TechOverviewWrapper';
import TechOverviewUI from './TechOverviewUI';

class App extends React.Component {
	render() {
		// return ( <DataAWS /> )
		// return ( <ActivityAWS /> )
		// return ( <AWSCostsWrapper /> )
		// return ( <RMPBillWrapper /> )
		// return ( <M1BorrowWrapper /> )
		// return ( <DOBillWrapper /> )
		// return ( <TechOverviewWrapper /> )
		return ( <TechOverviewUI /> )
	}
}
export default App
