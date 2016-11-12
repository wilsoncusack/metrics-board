import React, { Component } from 'react';


class Test extends Component {

	checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(`HTTP Error ${response.statusText}`);
    error.status = response.statusText;
    error.response = response;
    console.log(error); // eslint-disable-line no-console
    throw error;
  }
}

	parseJSON(response) {
  		return response.json();
	}

	callBack(response)
	{
		console.log("in callback")
		console.log(response)
		console.log(response.hey)
		return response.hey;
	}

	getData(){
		fetch(`api`, {
    accept: 'application/json',
  	}).then(this.checkStatus).then(this.parseJSON).then(this.callBack);
	}
	
	render() {
		return (
			<div>
			<div> Hi </div>
			</div>
			);
	}
}

export default Test;