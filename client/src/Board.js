import React, { Component } from 'react';
import $ from 'jquery';


class Board extends Component {

	getMixpanelData = function(widgetDict){
		// send request to get event data from mixpanel
	}

	getWidgets = function(boardName){
		// $.ajax({
		// 	url: "api/widgets",	
		// 	dataType: 'json',
		// 	data:{board: boardName}
		// 	success: function(data) {
		// 		console.log("success!")
		// 		// console.log(data)
		// 		this.setState({boards: data})
		// 	}.bind(this),
		// 	error: function(xhr, status, err) {
		// 		console.error(this.props.url, status, err.toString());
		// 	}.bind(this)
		// });
	}

	constructor(props){
		super(props);
		this.state = this.getWidgets(this.props.boardName)
	}

	render() {
		return(
			<div>
			{this.props.boardName}
			</div>
			)
	}
}

export default Board;