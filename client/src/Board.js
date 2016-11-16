import React, { Component } from 'react';
import $ from 'jquery';
// import Numeric from './Widget';
import './Board.css';
import './Widget.css'

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
					{/*<div className={(this.props.change > 0) ? "arrow-down" : "arrow-up"} > </div>*/}
					<h3 className={(this.props.change > 0) ? "positive" : "negative"}> 
						{this.props.change}% 
					</h3>
				</div>
			</div>

			)
	}
}

class NewWidgetModule extends Component {

	constructor(props){
		super(props);
		this.state = {
			properties: [], // kind of a misnomer, this is indeed an array of properties, but we refer to this by "name" when 
							// sending to the mixpanel API
			valuesChoices:[],

			title: "",
			event: "",
			name: "",
			type: "general",
			unit: "day",
			values: "", // TODO: should allow multiple in the future, mixpanel takes an array
			interval: 2, // TODO: not currently allowing people to edit this
			limit: "255"
		}
	}


	getValues(event, name){
		console.log("in event name")
		$.ajax({
			url: "https://mixpanel.com/api/2.0/events/properties/values/",
			beforeSend: function (xhr) {
				xhr.setRequestHeader ("Authorization", "Basic " + btoa(this.props.mixpanelAPISecret + ":"));
			}.bind(this),
			data: {event: event, name: name},	
			dataType: 'json',
			type: 'GET',
			success: function(data) {
				data.push("")
				this.setState({valuesChoices: data})
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	}

	getProperties(event){
		console.log("in event name")
		$.ajax({
			url: "https://mixpanel.com/api/2.0/events/properties/top/",
			beforeSend: function (xhr) {
				xhr.setRequestHeader ("Authorization", "Basic " + btoa(this.props.mixpanelAPISecret + ":"));
			}.bind(this),
			data: {event: event},	
			dataType: 'json',
			type: 'GET',
			success: function(data) {
				var properties = Object.keys(data);
				properties.push("");
				console.log(properties)
				this.setState({properties: properties})
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	}

	titleChange(e){
		this.setState({title: e.target.value})
	}

	eventChange(e){
		this.setState({event: e.target.value})
		this.getProperties(e.target.value)
		// if we made this an array, would have to adjust the DB, than we could sum multiple values
	}

	nameChange(e){
		this.setState({name: e.target.value})
		this.getValues(this.state.event,e.target.value)
		// if we made this an array, would have to adjust the DB, than we could sum multiple values
	}

	typeChange(e){
		this.setState({type: e.target.value})
	}

	unitChange(e){
		this.setState({unit: e.target.value})
	}

	valuesChange(e){
		// this.setState({values: e.target.value.split(",").map(s => {return s.trim()})})
		// console.log(this.state.values)
		this.setState({values: e.target.value})
	}

	intervalChange(e){
		this.setState({interval: e.target.value})
	}

	limitChange(e){
		this.setState({limit: e.target.value})
	}

	backgroundClick(e){
		if(e.target.id !== "background"){
			return
		}
		this.props.toggleVisible()
	}

	submit(){
		console.log(this.state.title)
		var title = this.state.title.trim();
		var event = this.state.event
		var limit = parseInt(this.state.limit.trim())
		var name = this.state.name;
		if(this.state.name === ""){
			name = null;
		}
		var type = this.state.type;
		var unit = this.state.unit;
		var values;
		if(this.state.values === ""){
			values = [];
		} else {
			values = [this.state.values];
		}
		
		var interval;
		if(unit === "day"){ interval =  1; } else { interval = this.state.interval };
		if(!title || !limit){
			return;
		}
		var obj = {title: title, name: name, type: type, unit: unit, values: values, interval: interval, limit: limit, event}
		this.props.submitNew(obj)
		
	}

	render(){
		var events = this.props.eventNames.map(function(event){
			return(
				<option value={event}> {event} </option>
				)
		});
		var properties = this.state.properties.map(function(property){
			return(
				<option value={property}> {property} </option>
				)
		});
		var valuesChoices = this.state.valuesChoices.map(function(value){
			return(
				<option value={value}> {value} </option>
				)
		});
		return(
			<div onClick={this.backgroundClick.bind(this)} id="background">
			<div id="newWidgetContainer">
			<h3> Title </h3>
			<input 
			type="text" 
			placeholder="Title" 
			onChange={this.titleChange.bind(this)}
			/>
			<h3> Event </h3>
			<select onChange={this.eventChange.bind(this)}>
			{events}
			</select>
			<h3> Property Name </h3>
			<select onChange={this.nameChange.bind(this)}>
			{properties}
			</select>
			<h3> Values </h3>
			<select onChange={this.valuesChange.bind(this)}>
			{valuesChoices}
			</select>
			
			
			<h3> Type </h3>
			<select onChange={this.typeChange.bind(this)}>
				<option value="general"> general </option>
				<option value="unique"> unique </option>
				<option value="unique"> average </option>
			</select>
			<h3> Unit </h3>
			<select onChange={this.unitChange.bind(this)}>
				<option value="day"> day </option>
				<option value="week"> week </option>
				<option value="month"> month </option>
			</select>
			
			
			
			<h3> Limit </h3>
			<input 
			type="text" 
			value="255"
			onChange={this.limitChange.bind(this)}
			/>
			<div id="widgetSubmit" onClick={this.submit.bind(this)}> <h3> submit </h3> </div>
			</div>
			</div>
			);
	}
}

class NewWidgetWidget extends Component {
	
	render() {
		return (
			<div className="numericWidget">
				<div onClick={this.props.toggleVisible} id="newWidgetButton"> <h1> + </h1> </div>
			</div>

			)
	}
}

class Board extends Component {	

	constructor(props){
		super(props);
		this.state = {
			newWidgetModuleVisible: false
		}
	}

	toggleVisible(){
		this.setState({
			newWidgetModuleVisible: !this.state.newWidgetModuleVisible
		})
	}

	render() {
		console.log(this.props.widgets)
		var widgets = this.props.widgets.map(widget => {
			return(
				<NumericWidget title={widget.title} value={widget.value} change={widget.change} />
				)
		
		});
		return(
			<div id="widgetsContainer">
				{widgets}
				<NewWidgetWidget toggleVisible={this.toggleVisible.bind(this)}/>
				{this.state.newWidgetModuleVisible ? 
					<NewWidgetModule 
					toggleVisible={this.toggleVisible.bind(this)}
					eventNames={this.props.eventNames}
					mixpanelAPISecret={this.props.mixpanelAPISecret}
					submitNew={this.props.submitNewWidjget}/> 
					: ""}
			</div>
			)
	}
}

export default Board;