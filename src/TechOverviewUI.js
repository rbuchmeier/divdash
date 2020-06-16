import React from 'react';
import TechOverviewWrapper from './TechOverviewWrapper';
import styles from './styles.module.css';

class TechOverviewUI extends React.Component {
	constructor(props) {
		super(props);
	}
	render () {
		return (
			<div>
				<TechOverviewWrapper />
			</div>
		)
	}
}
export default TechOverviewUI
