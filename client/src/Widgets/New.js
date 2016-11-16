import React, { Component } from 'react';

class NewWidgetWidget extends Component {
	
	render() {
		return (
			<div className="numericWidget">
				<div onClick={this.props.toggleVisible} id="newWidgetButton"> <h1> + </h1> </div>
			</div>

			)
	}
}

export default NewWidgetWidget;