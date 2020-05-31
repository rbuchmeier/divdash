import React from 'react';
import BarChart from './BarChart';
import PriceChart from './PriceChart';
import DataAWS from './DataAWS';

class App extends React.Component {
	render() {
		// return ( <PriceChart /> )
		return ( <DataAWS /> )
	}
}
export default App
