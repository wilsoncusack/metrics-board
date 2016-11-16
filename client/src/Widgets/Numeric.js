import React, { Component } from 'react';


class NumericWidget extends Component {
	
	render() {
		return (
			<div className="numericWidget">
				<div className="title">
					<h3> {this.props.title} </h3>
				</div>

				<div className="value">
					<h2> {this.props.value} </h2>
				</div>

				<div className="change">
					
					<h3 className={(this.props.change > 0) ? "positive" : "negative"}> 
						{this.props.change} % 
					</h3>
				</div>
			</div>

			)
	}
}


export default NumericWidget;