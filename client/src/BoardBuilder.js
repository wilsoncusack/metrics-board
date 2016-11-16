import React, { Component } from 'react';
import './styles/BoardBuilder.css';



class BoardBuilder extends Component {
	constructor(props){
		super(props);
		this.state = {
			boardName: "",
			visibleToAllAccount: false
		}
	}

	handleNameChange(e){
		this.setState({boardName: e.target.value})
	}

	backgroundClick(e){
		if(e.target.id !== "background"){
			return
		}
		this.props.toggleBoardBuilder()
	}

	toggleVisible(){
		this.setState({
			visibleToAllAccount: !this.state.visibleToAllAccount
		})
	}

	submit(){
		var boardName = this.state.boardName.trim();
		if(!boardName){
			return;
		}
		this.props.submit({name: boardName, visibleToAllAccount: this.state.visibleToAllAccount})
	}

	render(){
		return(
			<div onClick={this.backgroundClick.bind(this)} id="background">
			<div id="boardBuilderContainer">
			<input id="boardNameInput"
			type="text" 
			placeholder="Board Name" 
			onChange={this.handleNameChange.bind(this)}
			/>
			{this.props.accountAdmin ? 
				<div className={this.state.visibleToAllAccount ? "selected" : "" } 
				onClick={this.toggleVisible.bind(this)} 
				id="visibleToAllButton"> 
					<h3> visible to all account </h3> 
				</div> 
			: ""}
			<div id="boardSubmit" onClick={this.submit.bind(this)}> <h3> submit </h3> </div>
			</div>
			</div>
			);
	}


}



export default BoardBuilder;