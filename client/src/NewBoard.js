import React, { Component } from 'react';
import './NewBoard.css';
import $ from 'jquery';



class NewBoardForm extends Component {
	constructor(props){
		super(props);
		this.state = {
			name: ""
		}
	}

	handleNameChange(e){
		this.setState({name: e.target.value})
	}

	createNewBoard(e) {
	    e.preventDefault();
	    var name = this.state.name.trim();
	    if (!name) {
	      return;
	    }
	    console.log("submit board")
	    $('#newBoardContainer').remove()
	}

	render(){
		return(
			<div id="newBoardContainer">
			<form id="newBoardForm" onSubmit={this.createNewBoard.bind(this)}>
			<input 
			type="text" 
			placeholder="Board Name" 
			onChange={this.handleNameChange.bind(this)}
			/>
			</form>
			</div>
			);
	}


}



export default NewBoardForm;