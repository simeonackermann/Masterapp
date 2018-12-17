import React, { Component} from "react";
import { Link } from "react-router-dom";

class Navigation extends Component{

    constructor(props) {
        super(props);

        this.plugins = props.plugins;
        this.state = {};
    }

    componentDidMount() {
    }

    render(){
        return(
            <div className="ui visible left vertical thin sidebar menu inverted">

                {/* <div className="item">
                    Jobs
                    <div className="menu">
                        <Link to="/admin/jobs/new" className="item">New</Link>
                        <Link to="/admin/jobs" className="item">Browse</Link>
                        <Link to="/admin/templates" className="item">Templates</Link>
                    </div>
                </div> */}
                <Link to="/admin/jobs" className="item">Jobs</Link>
                <Link to="/admin/templates" className="item">Templates</Link>
                <Link to="/admin/user" className="item">User</Link>
                <Link to="/admin/system" className="item">System {/* (Mail-Reminder, Plugins, Settings) */}</Link>

                {this.plugins.map((plugin, i) => {
                    // const entry = plugin.getMenu();
                    return (
                        <Link key={i} to={plugin.path} className="item">{plugin.name}</Link>
                    );
                })}

            </div>
        );
  }
}

export default Navigation;