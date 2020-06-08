import React from 'react';
import DataAWS from './DataAWS';
import ActivityAWS from './ActivityAWS';
import AWSCostsWrapper from './AWSCostsWrapper';
import RMPBillWrapper from './RMPBillWrapper';
import M1BorrowWrapper from './M1BorrowWrapper';
import DOBillWrapper from './DOBillWrapper';

class App extends React.Component {
	render() {
		// return ( <DataAWS /> )
		// return ( <ActivityAWS /> )
		// return ( <AWSCostsWrapper /> )
		// return ( <RMPBillWrapper /> )
		// return ( <M1BorrowWrapper /> )
		return ( <DOBillWrapper /> )
	}
}
export default App
