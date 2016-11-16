import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
// import './Login.css';
import App from './App';

class LoginForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '', 
      login: ''
    };
  }

  handleUsernameChange(e) {
    this.setState({username: e.target.value});
  }

  handlePasswordChange(e){
    this.setState({password: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    var username = this.state.username.trim();
    var password = this.state.password.trim();
    if (!username || !password) {
      return;
    }
    this.props.onLoginSubmit({username: username, password: password});
    
  }
  render() {
    return (
     <form className="loginForm" onSubmit={this.handleSubmit.bind(this)}>
     <input 
     type="password" 
     placeholder="user name" 
     onChange={this.handleUsernameChange.bind(this)}
     />
     <input 
     type="password" 
     placeholder="password" 
     onChange={this.handlePasswordChange.bind(this)}
     />
     <input type="submit" value="Submit" />
     </form>
     );
  }

}


class Login extends Component {

  handleLoginSubmit(login){
    $.ajax({
      url: "/api/login",
      // url: "http://localhost:5000/2LsYxrXd4K2B2bXTZZGMn4LkW4fH81Xh7qXGkytm8Bk=/admin/login",
      xhrFields: {
        withCredentials: true
      },
      dataType: 'json',
      type: 'POST',
      data: login,
      success: function(data) {
        if(data.userID != null){
          console.log("here!")
          $('.loginForm').remove()
          ReactDOM.render(
            <App userID={data.userID} accountID={data.accountID} accountAdmin={data.accountAdmin} mixpanelAPISecret={data.mixpanelAPISecret}/>,
            document.getElementById('root')
            );
        } else {
          console.log ("Error")
        }

      },
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }
  render() {
    this.handleLoginSubmit()
    return (
      <div className="login">
      <LoginForm onLoginSubmit={this.handleLoginSubmit.bind(this)} />
      </div>
      );
  }

}

export default Login;
