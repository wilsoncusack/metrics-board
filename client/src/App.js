import React, { Component } from 'react';
import Board from './Board';
import NewBoardForm from './NewBoard';
import $ from 'jquery';
import './App.css';

class Header extends Component {

	renderNewBoardForm(){
		this.props.toggleNewBoard()
	}

	render() {
		var boardChoices = this.props.boards.map(function(boardDict){
			return(
				<option value={boardDict.name} key={boardDict.id} id={boardDict.id}> 
				{boardDict.name} </option>
				)
		});

		return(
			<div id="header">

			<div id="boardButtons">
			<select id="boardChooser" value={this.props.selected} onChange={this.props.changeSelection}>
			{boardChoices}
			</select>
			<div onClick={this.props.toggleNewBoard} id="newBoardButton"> <h1> + </h1> </div>
			</div>



			</div>
			);
	}
}


class App extends Component {

	getBoards(){
		$.ajax({
			url: "api/board",	
			dataType: 'json',
			success: function(data) {
				
				var temp = {}
				for(var i = 0; i < data.length; i++){
					var curr = data[i];
					temp[curr.name] = curr.id;
				}
				this.setState({
					boards: data,
					boardsDict: temp
				})
				
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});

	}

	getEventNames(){
		console.log("in event name")
		$.ajax({
			url: "https://mixpanel.com/api/2.0/events/names/",
			beforeSend: function (xhr) {
				xhr.setRequestHeader ("Authorization", "Basic " + btoa(this.props.mixpanelAPISecret + ":"));
			}.bind(this),	
			dataType: 'json',
			type: 'GET',
			success: function(data) {
				this.setState({eventNames: data})
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	}

	buildDisplayWidget(data, widget){
		var values = data.data.values[widget.event];
		var aKeys = Object.keys(values);
		console.log(aKeys)
		var aData = [];
		var len = aKeys.length;
		for(var i = 0; i < len; i++){
			aData[i] = values[aKeys[i]]
		}
		var thisPeriodValue = aData[0]
		var previousPeriodValue = aData[1]
		var change; 
		if((thisPeriodValue - previousPeriodValue) === 0) {
			change = 0;
		} else {
			change = Math.round(((thisPeriodValue - previousPeriodValue)/previousPeriodValue) * 100)
		}
		
		var displayWidget = {
			title: widget.title, 
			value: thisPeriodValue,
			change: change,
		}
		// console.log(displayWidget)
		// return displayWidget
		var temp = this.state.widgets
		temp.push(displayWidget)
		var temp2 = this.state.widgetsCache;
		temp2[this.state.selection] = temp;
		this.setState({
			widgets: temp,
			widgetsCache: temp2
		})
				
	}

	getWidgetWithProperty(widget){
		console.log("getting widget with property")
		$.ajax({
			url: "https://mixpanel.com/api/2.0/events/properties/",
			beforeSend: function (xhr) {
				xhr.setRequestHeader ("Authorization", "Basic " + btoa(this.props.mixpanelAPISecret + ":"));
			}.bind(this),		
			dataType: 'json',
			type: 'GET',
			data:{event: JSON.stringify([widget.event]), 
				name: widget.name,
				values: widget.values,
				type: widget.type, 
				unit: widget.unit, 
				interval: widget.interval,
				limit: widget.limt,
			},
			success: function(data) {
				this.buildDisplayWidget(data, widget);
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(err.toString());
			}
		});
	}

	getWidgetsData(widget){
		console.log(widget.name)
		if(!!widget.name){
			console.log("IN ALT")
			this.getWidgetWithProperty(widget)
		}
		$.ajax({
			url: "https://mixpanel.com/api/2.0/events/",
			beforeSend: function (xhr) {
				xhr.setRequestHeader ("Authorization", "Basic " + btoa(this.props.mixpanelAPISecret + ":"));
			}.bind(this),		
			dataType: 'json',
			type: 'GET',
			data:{event: JSON.stringify([widget.event]), 
				type: widget.type, 
				unit: widget.unit, 
				interval: widget.interval},
			success: function(data) {
				this.buildDisplayWidget(data, widget);
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(err.toString());
			}
		});
	}

	getWidgets(selection){
		if(!!this.state.widgetsCache[selection]){
			console.log("used cache!")
			console.log(!this.state.widgetsCache[selection])
			this.setState({
				widgets: this.state.widgetsCache[selection]
			})
			return;
		}
		this.setState({
			widgets: []
		})
		$.ajax({
			url: "api/widget",	
			dataType: 'json',
			type: 'GET',
			data:{boardID: selection},
			success: function(data) {
				// this.setState({widgets: data})
				// var dayMetrics = data.filter(function(widget) { return widget.unit === "day"})
				// var weekMetrics = data.filter(function(widget) { return widget.unit === "week"})
				// var monthMetrics = data.filter(function(widget) { return widget.unit === "month"})
				// ^ this isn't working, because the type might be different, but we should cluster
				// by unit and type

				data.map(this.getWidgetsData.bind(this))
				// this.setState({widgets: widgets})
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	}


	constructor(props){
		super(props);
		this.state = {
			// boards: [],
			boards: [],
			selection: 2,
			showNewBoard: false,
			boardsDict: {},
			widgets: [],
			eventNames: [],
			widgetsCache: {}
		}
		this.getBoards()
		this.getWidgets(2)
		this.getEventNames()
		
	}

	submitNewBoard(board){
		$.ajax({
			url: "api/board",	
			type: 'POST',
			dataType: 'json',
			data: board,
			success: function(data) {
				$('#background').remove()
				var boards = this.state.boards;
				boards.push(data)
				var boardsDict = this.state.boardsDict
				boardsDict[data.name] = data.id
				this.setState({
					boards: boards,
					boardsDict: boardsDict,
				})
				// this.changeBoardByID(data.id)
				
				
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	}

	submitNewWidget(widget){
		widget["boardID"] = this.state.selection;
		$.ajax({
			url: "api/widget",	
			type: 'POST',
			dataType: 'json',
			data: widget,
			success: function(data) {
				$('#background').remove()
				this.getWidgetsData(data)
				
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	}

	changeBoardByID(id){
		console.log("selection " + id)
		if(!id){
			return;
		}
		this.setState({
			selection: id
		})
		this.getWidgets(id)
	}

	changeBoard(e){
		console.log("changing")
		this.changeBoardByID(this.state.boardsDict[e.target.value]);
		
	}

	toggleNewBoard(){
		this.setState({
			showNewBoard: !this.state.showNewBoard
		})
	}

	render() {
		return(
			<div>
			<Header boards={this.state.boards} selected={this.state.selected} changeSelection={this.changeBoard.bind(this)} toggleNewBoard={this.toggleNewBoard.bind(this)}/>
			{this.state.showNewBoard ? 
				<NewBoardForm 
				accountAdmin={this.props.accountAdmin} 
				toggleNewBoard={this.toggleNewBoard.bind(this)}
				submit={this.submitNewBoard.bind(this)}/> 
				: ""}
				<Board eventNames={this.state.eventNames} 
				widgets={this.state.widgets} 
				selection={this.state.selection} 
				mixpanelAPISecret={this.props.mixpanelAPISecret}
				submitNewWidjget={this.submitNewWidget.bind(this)}/>
				</div>
				)
	}
}


export default App;
