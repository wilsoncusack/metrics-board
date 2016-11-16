import React, { Component } from 'react';
import $ from 'jquery';
// import Numeric from './Widget';
import './styles/Board.css';
import './styles/Widget.css'
import NewWidgetWidget from './Widgets/New';
import NumericWidget from './Widgets/Numeric';
import WidgetBuilder from './WidgetBuilder';





class Board extends Component {	

	constructor(props){
		super(props);
		this.state = {
			WidgetBuilderVisible: false
		}
	}

	toggleVisible(){
		this.setState({
			WidgetBuilderVisible: !this.state.WidgetBuilderVisible
		})
	}

	render() {
		var widgets = this.props.widgets.map(function(widget, count) {
			return(
				<NumericWidget title={widget.title} value={widget.value} change={widget.change} key={count}/>
				)
		
		});
		return(
			<div id="widgetsContainer">
				{widgets}
				<NewWidgetWidget toggleVisible={this.toggleVisible.bind(this)}/>
				{this.state.WidgetBuilderVisible ? 
					<WidgetBuilder 
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