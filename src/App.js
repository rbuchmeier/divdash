import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';

import DataAWS from './DataAWS';
import ActivityAWS from './ActivityAWS';
import AWSCostsWrapper from './AWSCostsWrapper';
import RMPBillWrapper from './RMPBillWrapper';
import M1BorrowWrapper from './M1BorrowWrapper';
import DOBillWrapper from './DOBillWrapper';
import TechOverviewWrapper from './TechOverviewWrapper';
import TechOverviewUI from './TechOverviewUI';
import UtilitiesOverviewUI from './UtilitiesOverviewUI';
import UtilitiesV2 from './UtilitiesOverviewV2';


class App extends React.Component {
	render() {
		// return ( <DataAWS /> )
		// return ( <ActivityAWS /> )
		// return ( <AWSCostsWrapper /> )
		// return ( <RMPBillWrapper /> )
		// return ( <M1BorrowWrapper /> )
		// return ( <DOBillWrapper /> )
		return ( 
		    <Router>
			    <div>
				    <Switch>
					    <Route exact path='/'>
							<h1>FooBar</h1>
					    </Route>
					    <Route path='/technology'>
				            <TechOverviewUI />
					    </Route>
					    <Route path='/utilities'>
				            <UtilitiesOverviewUI />
					    </Route>
					    <Route path='/utilitiesv2'>
				            <UtilitiesV2 />
					    </Route>
				    </Switch>
			    </div>
		    </Router>
		)
	}
}
export default App
