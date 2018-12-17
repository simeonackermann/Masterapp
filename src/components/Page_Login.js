import React, { Component} from "react";
import { Redirect } from "react-router-dom";

import {request} from "../utils/helper";
import { alertError } from './etc/Error_Tools';

class PageLogin extends Component{

    constructor(props) {
        super(props);

        this.state = {
            loginError: false,
            redirectTo: false
        };

        this.parentHandleLogin = props.handleLogin;
        // this.handleLogin = this.handleLogin.bind(this);

        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.handleSubmitForm = this.handleSubmitForm.bind(this);
        this.closeError = this.closeError.bind(this);
    }

    componentDidMount() {
    }

    handleChangeInput(e) {
        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({[name]: value});
    }

    handleSubmitForm(e) {
        request('system', 'login', 'POST', this.state)
        .then(result => {
            console.log("Login result: ", result);
            if (result.data == false) {
                this.setState({loginError: "Wrong user or password. Please try again"})
            } else {
                //this.handleLogin(result.data);
                this.parentHandleLogin(result.data, () => {
                    this.setState({redirectTo: '/'});
                })
            }
        })
        .catch(error => {
            alertError(new Error(error))
        })

        e.preventDefault();
    }

    closeError(e) {
        this.setState({loginError: false});
        e.preventDefault();
    }

    render(){
        let { from } = this.props.location.state || { from: { pathname: "/" } };

        // console.log("Login props: ", this.props, this.state);
        console.log("Redirect to!", from, this.props)


        if (this.state.redirectTo) {
            return (<Redirect to={from} />);
        }

        return(
            <main className="ui container">
                <h2>Login</h2>

                {this.state.loginError !== false &&
                    <div className="ui negative message">
                        <i className="close icon" onClick={this.closeError}></i>
                        <div className="header">Error</div>
                        <p>{this.state.loginError}</p>
                    </div>
                }

                <form className="ui form">
                    <div className="field">
                        <label>User</label>
                        <input type="text" name="user" placeholder="Username" onChange={this.handleChangeInput} />
                    </div>
                    <div className="field">
                        <label>Password</label>
                        <input type="password" name="password" placeholder="Password" onChange={this.handleChangeInput} />
                    </div>
                    <div className="field">
                        <button className="ui button primary" type="submit" onClick={this.handleSubmitForm}>Login</button>
                    </div>
                </form>
            </main>
        );
  }
}

export default PageLogin;