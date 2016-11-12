import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Board from './Board';
import NewBoardForm from './NewBoard';
import $ from 'jquery';
import './App.css';

class Header extends Component {

	renderNewBoardForm(){
		
		<NewBoardForm />
        );
	}

	render() {
		var boardChoices = this.props.boards.map(function(boardDict){
			return(
				<option value={boardDict.name} key={boardDict.id}> 
				{boardDict.name} </option>
			)
		});

		return(
			<div id="header">

				<div id="boardButtons">
					<select id="boardChooser" value={this.props.selected} onChange={this.props.changeSelection}>
						{boardChoices}
					</select>
					<div onClick={this.renderNewBoardForm} id="newBoardButton"> <h1> + </h1> </div>
				</div>



			</div>
			);
	}
}


class App extends Component {

	getBoards(){
		// $.ajax({
		// 	url: "api/boardNames",	
		// 	dataType: 'json',
		// 	success: function(data) {
		// 		console.log("success!")
		// 		// console.log(data)
		// 		this.setState({boards: data})
		// 	}.bind(this),
		// 	error: function(xhr, status, err) {
		// 		console.error(this.props.url, status, err.toString());
		// 	}.bind(this)
		// });
		this.setState({
			boards: [{id: 1, name: "operations"}, {id: 2, name: "marketplace kpis"}]
		});
		console.log(this.state)
	}


	constructor(props){
		super(props);
		this.state = {
			// boards: [],
			boards: [{id: 1, name: "operations"}, {id: 2, name: "marketplace kpis"}],
			selection: "operations"
		}
		this.getBoards()
		
	}

	changeBoard(e){
		this.setState({
			selection: e.target.value
		})
	}

	render() {
		return(
			<div>
			<Header boards={this.state.boards} selected={this.state.selected} changeSelection={this.changeBoard.bind(this)}/>
			<Board boardName={this.state.selection} />
			</div>
			)
	}
}


export default App;
