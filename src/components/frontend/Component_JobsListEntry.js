import React, { Component} from "react";
import moment from 'moment';

import {request} from '../../utils/helper';
import { alertError } from '../etc/Error_Tools';

const settingsDefault = {
    // show_fields: [ 'title', '...' ],
    hide_fields: [ 'users_required', 'users_subscribed' ],

    allow_childJobs: false,

}

const childSettingsDefault = {
    hide_fields: [ 'state', 'date_start', 'date_end', 'description' ],
    allow_childJobs: false,
}

class JobsListJob extends Component{

    constructor(props) {
        super(props);

        this.settings = {...settingsDefault, ...props.settings};
        this.isChildJob = props.job.type == "child";
        this.parentIsClosed = props.parentIsClosed || false;

        this.state = {
            job: props.job,
            nick: ''
        };

        this.handleChangeNick = this.handleChangeNick.bind(this);
        this.handleAddUser = this.handleAddUser.bind(this);
        this.handleRemoveUser = this.handleRemoveUser.bind(this);
    }

    componentDidMount() {
    }

    handleChangeNick(event) {
        //console.log("Handle change: ", event.target.value);
        this.setState({nick: event.target.value});
    }

    handleAddUser(e) {
        const job = {...this.state.job};
        const nick = this.state.nick;
        const prevState = JSON.stringify(this.state);

        if (nick == '') {
            alert('Empty nickname!');
            e.preventDefault();
            return;
        }

        job.users_subscribed.push({nick});
        this.setState({
            job,
            nick: ''
        });

        request('jobs', 'addUser', 'post', {id: job.id, user: nick})
        .catch(error => {
            this.setState({...JSON.parse(prevState)});
            alertError(error);
        })

        e.preventDefault();
    }

    handleRemoveUser(e, userId) {
        const job = {...this.state.job};
        const prevState = JSON.stringify(this.state);

        job.users_subscribed.splice(userId, 1);
        this.setState({ job });

        request('jobs', 'removeUser', 'delete', {id: job.id, user: userId})
        .catch(error => {
            this.setState({...JSON.parse(prevState)});
            alertError(error);
        })

        e.preventDefault();
    }

    isClosedJob(job) {
        // TODO make timerange when a job is closed configurable
        const now = moment();
        if (this.parentIsClosed) {
            return true;
        }
        if (job.date_start !== null) {
            return moment(job.date_start).isSame(now, "day");
        }
        return job.state == "public_closed";
    }

    render(){
        const job = this.state.job;
        const childJobs = job.has_jobs || [];
        const isClosed = this.isClosedJob(job);

        return(
            <div className={`item job-entry ${this.isChildJob ? 'child-job' : 'parent-job'} state-${job.state}`}>
                <div className="content">
                    <div className="header">
                        {job.title}
                        {job.users_required != null &&
                            <span className={`job-users-subscriptions ${job.users_subscribed.length >= job.users_required ? 'good' : 'bad'}`}>
                                {job.users_subscribed.length} / {job.users_required}
                            </span>
                        }
                        {!this.isChildJob &&
                            <span className="job-is-closed-icon-wrapper">
                                {isClosed && <i className="lock icon small grey" title="You cannot add/remove users"></i> }
                            </span>
                        }
                    </div>
                    <div className="meta">
                        {job.date_start != null &&
                            <div><small>{moment(job.date_start).format("LT [Uhr]")}</small></div>
                        }
                        {job.description != null &&
                            <span>{job.description}</span>
                        }
                    </div>
                    <div className="description">

                        {(job.users_required != null && isClosed) && <div className="subscribed_users">
                            {job.users_subscribed.map((user, uidx) =>
                                <div className="ui label" key={uidx}>
                                    {user.nick}
                                </div>
                            )}
                        </div> }

                        {/* TODO may authors/admin can also edit closed jobs */}

                        {(job.users_required != null && !isClosed) && <div>
                            <form className="ui mini action input" onSubmit={this.handleAddUser}>
                                <input type="text" placeholder="Name" value={this.state.nick} onChange={this.handleChangeNick} />
                                <button className="ui button" type="submit" disabled={this.state.nick == ''} onClick={this.handleAddUser}>Add</button>
                            </form>
                            <div className="subscribed_users">
                                {job.users_subscribed.map((user, uidx) =>
                                    <div className="ui label" key={uidx}>
                                        {user.nick}
                                        <i className="delete icon" onClick={(e) => this.handleRemoveUser(e, uidx)}></i>
                                    </div>
                                )}
                            </div>
                        </div>}

                        {this.settings.allow_childJobs &&
                            <div className="ui items child-jobs">
                                {childJobs.map((childJob, cjidx) => {
                                    return (
                                            <JobsListJob key={cjidx}
                                                job={childJob}
                                                parentIsClosed={isClosed}
                                                settings={childSettingsDefault}
                                            />
                                    );
                                })}
                            </div>
                        }
                    </div>
                    {/* <div className="extra"></div> */}
                </div>
            </div>
        );
  }
}

export default JobsListJob;