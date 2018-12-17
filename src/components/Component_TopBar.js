import React, { Component} from "react";
import { Route, Link, Switch } from "react-router-dom";
import { Dropdown, Menu } from 'semantic-ui-react'

class TopBar extends Component{

    constructor(props) {
        super(props);

        this.state = {};

        this.user = props.user;
        this.plugins = props.plugins;
    }

    componentDidMount() {
    }

    render(){
        const isAuthor = this.user.role == "author" || this.user.role == "admin";

        const frontendNavi = () => {
            return (
                <div className="ui container">
                    {isAuthor &&
                        <Link to="/admin/" className="item">Admin</Link>
                    }

                    <Link to="/" className="item">Jobs</Link>
                    {/*<Link to="/jobs/table" className="item">Jobs Table</Link>
                    <Link to="/jobs/calendar" className="item">Jobs Calendar</Link>*/}
                </div>
            );
        };

        const backendNavi = () => {
            return (
                <div className="ui container">
                    <Link to="/" className="header item"><i className="arrow circle left icon"></i> Frontpage</Link>
                    <Link to="/admin/jobs" className="item">Jobs</Link>
                    <Link to="/admin/templates" className="item">Templates</Link>
                    <Link to="/admin/user" className="item">User</Link>
                    <Link to="/admin/system" className="item">System</Link>

                    {this.plugins.map((plugin, i) => {
                        // const entry = plugin.getMenu();
                        return (
                            <Link key={i} to={plugin.path} className="item">{plugin.name}</Link>
                        );
                    })}

                </div>
            );
        }

        return(
            <div className="ui fixed inverted menu">

                {/* <Route path="/admin/" render={() => (
                    <Link to="/" className="header item"><i className="arrow circle left icon"></i> Frontpage</Link>
                )}/> */}

                <Switch>

                    {isAuthor &&
                        <Route path="/admin" component={backendNavi} />
                    }

                    <Route path="/" component={frontendNavi} />

                </Switch>

                <div className="right menu">
                    {/* <Link to="/admin/" className="item">Admin</Link> */}
                    {/* <Link to="/admin/profile" className="item"><i className="user icon"></i></Link> */}
                    <Dropdown icon='user' className='link item'>
                        <Dropdown.Menu>
                            {isAuthor &&
                                <Link to="/" className="item">TODO: admin-settings</Link>
                            }
                            <Link to="/admin/profile" className="item">Profile</Link>
                            <Link to="/logout" className="item">Logout</Link>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        );
  }
}

export default TopBar;