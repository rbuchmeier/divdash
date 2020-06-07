import React from 'react';
import DataAWS from './DataAWS';
import ActivityAWS from './ActivityAWS';
import AWSCostsWrapper from './AWSCostsWrapper';
import RMPBillWrapper from './RMPBillWrapper';

class App extends React.Component {
	render() {
		// return ( <DataAWS /> )
		// return ( <ActivityAWS /> )
		// return ( <AWSCostsWrapper /> )
		return ( <RMPBillWrapper /> )
	}
}
export default App
