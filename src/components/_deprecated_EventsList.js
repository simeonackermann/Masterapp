import React, { Component} from "react";

import axios from 'axios';

class EventsList extends Component{

    constructor(props) {
        super(props);
        this.state = {
            events: []
        };

        this.handleAddUser = this.handleAddUser.bind(this);
    }

    componentDidMount() {

        axios.get(`http://localhost:8082/rest/index.php?path=getEvents`)
        .then(res => {
            const events = res.data;
            this.setState({ events });
            console.log('Events ', res.data);
        })
        .catch(error => {
            console.log("Error occurred while fetching Events");
            console.error(error);
        })
    }

    handleAddUser(event, task, user) {
        console.log("Add user", event, user);
    }

    render(){
        const events = this.state.events;
        return(
            <div className="EventsList">
                <h1 className="ui header">List of Events</h1>
                {events.map((event, eidx) => {
                    const jobs = event.jobs;
                    return(
                        <div key={eidx} className="ui items">
                            <div className="item">
                                <div className="content">
                                    <a className="header">{event.title}</a>
                                    <div className="meta">
                                        <span>Description</span>
                                    </div>
                                    <div className="description">
                                        {jobs.map((job, jidx) => {
                                            return (
                                                <div key={jidx}>
                                                    <h4>{job.title}</h4>
                                                    <p>{job.usersSubscribed.length} / {job.usersRequired}</p>
                                                    <button className="ui button tiny" onClick={(e) => this.handleAddUser(eidx, jidx, null)}>Add</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="extra">
                                        Additional Details
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
  }
}

export default EventsList;