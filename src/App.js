import React from 'react';
import DataAWS from './DataAWS';
import ActivityAWS from './ActivityAWS';
import AWSCostsWrapper from './AWSCostsWrapper';

class App extends React.Component {
	render() {
		// return ( <DataAWS /> )
		return ( <ActivityAWS /> )
		// return ( <AWSCostsWrapper /> )
	}
}
export default App
