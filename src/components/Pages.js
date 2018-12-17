import React, { Component} from "react";
import { Route, Redirect, Switch } from "react-router-dom";

import Component_TopBar from "./Component_TopBar";
import Page_AdminIndex from "./admin/Page_AdminIndex";
import Page_JobsList from "./frontend/Page_JobsList";

class Pages extends Component{

    constructor(props) {
        super(props);

        this.state = {
            redirectToLogin: false
        };

        this.user = props.user;
        this.plugins = props.plugins;

    }

    componentDidMount() {
    }

    render(){
        const props = this.props;
        console.log("PAges props", this.props);

        const isAuthor = this.user.role == "author" || this.user.role == "admin";

        if (!this.user.isAuthenticated) {
            return (
                <Redirect to={{
                    pathname: "/login",
                    state: { from: this.props.location }
                  }}
                />
            );
        }

        return(
            <div>
                <Component_TopBar {...props} />

                <main className="ui container">

                <Switch>

                    {isAuthor &&
                        <Route path="/admin/" render={() =>
                            <Page_AdminIndex {...props} />
                        } />
                    }

                    <Route path="/" exact component={Page_JobsList} />

                <Route render={props =>
                        <div>Not found...</div>
                    } />

                </Switch>

                </main>

            </div>
        );
  }
}

export default Pages;