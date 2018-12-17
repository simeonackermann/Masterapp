import React, { Component} from "react";
import moment from 'moment';
import { Checkbox } from 'semantic-ui-react'

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

class JobsListEntry extends Component{

    constructor(props) {
        super(props);

        this.settings = {
            ...settingsDefault,
            ...props.settings
        };

        // this.job = props.job

        const isChildJob = props.isChildJob || false

        this.state = {
            isChildJob: isChildJob,
            job: props.job,
            templates: props.templates,
            nick: ''
        };

        this.handleChangeNick = this.handleChangeNick.bind(this);

        this.handleAddUser = this.handleAddUser.bind(this);
        this.handleRemoveUser = this.handleRemoveUser.bind(this);
        this.handleToggleJobState = this.handleToggleJobState.bind(this);
        this.handleDeleteJob = this.handleDeleteJob.bind(this);
        this.handleEditJob = this.handleEditJob.bind(this);

        this.parentHandlerEditJob = props.parentHandlerEditJob;
        this.parentHandlerAfterUpdate = props.parentHandlerAfterUpdate;
    }

    componentDidMount() {
    }

    handleChangeNick(e) {
        this.setState({nick: e.target.value});
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
        .then(res => {
            this.parentHandlerAfterUpdate(job);
        })
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
        .then(res => {
            this.parentHandlerAfterUpdate(job);
        })
        .catch(error => {
            this.setState({...JSON.parse(prevState)});
            alertError(error);
        })

        e.preventDefault();
    }

    handleToggleJobState(e) {
        const prevState = JSON.stringify(this.state);
        const job = {...this.state.job};
        const newState = job.state == 'public' ? 'private' : 'public';

        job.state = newState;
        this.setState({ job })

        request('jobs', 'update', 'PUT', {id: job.id, state: newState})
        .catch(error => {
            this.setState({...JSON.parse(prevState)});
            alertError(error);
        })

        e.preventDefault();
    }

    handleDeleteJob(e) {
        const job = {...this.state.job};
        const prevState = JSON.stringify(this.state);

        job.state = 'deleted';
        this.setState({ job });

        request('jobs', 'update', 'PUT', {id: job.id, state: "deleted"})
        .catch(error => {
            this.setState({...JSON.parse(prevState)});
            alertError(error);
        })

        e.preventDefault();
    }

    handleEditJob(e) {
        const job = {...this.state.job};
        this.parentHandlerEditJob(e, job);
        e.preventDefault();
    }

    render(){
        const {job, templates, isChildJob, nick} = this.state;
        const childJobs = job.has_jobs || [];

        return(
                <div className={`item job-entry ${isChildJob ? 'child-job' : 'parent-job'} state-${job.state}`}>
                    <div className="content">
                        <div className="header">
                            {job.title}
                            {job.users_required != null &&
                                <span className={`job-users-subscriptions ${job.users_subscribed.length >= job.users_required ? 'good' : 'bad'}`}>
                                    {job.users_subscribed.length} / {job.users_required}
                                </span>
                            }
                        </div>

                        <div className="meta">
                            {! isChildJob &&
                                <div className="actions">
                                    <Checkbox toggle checked={job.state === "public"} className="job-is-public-toggle" onChange={this.handleToggleJobState} />
                                    <a onClick={this.handleEditJob}><i className="edit icon"></i></a>
                                    <a onClick={this.handleDeleteJob}><i className="trash icon"></i></a>
                                </div>
                            }
                            {job.date_start != null &&
                                <div><small>{moment(job.date_start).format("LT [Uhr]")}</small></div>
                            }
                            {job.description != null &&
                                <span>{job.description}</span>
                            }
                        </div>
                        <div className="description">

                            {job.users_required != null &&
                                <div>
                                    {/* <span className={`job-users-subscriptions ${job.users_subscribed.length >= job.users_required ? 'good' : 'bad'}`}>
                                        {job.users_subscribed.length} / {job.users_required}
                                    </span> */}
                                    <form className="ui mini action input" onSubmit={this.handleAddUser}>
                                        <input type="text" placeholder="Name" value={nick} onChange={this.handleChangeNick} />
                                        <button className="ui button" type="submit" disabled={nick == ''} onClick={this.handleAddUser}>Add</button>
                                    </form>
                                    <div className="subscribed_users">
                                        {job.users_subscribed.map((user, uidx) => {
                                            return (
                                                <div className="ui label" key={uidx}>
                                                    {user.nick}
                                                    <i className="delete icon" onClick={e => this.handleRemoveUser(e, uidx)}></i>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            }

                            {this.settings.allow_childJobs &&
                                <div className="ui items child-jobs">
                                    {childJobs.map((childJob, cjidx) => {
                                        return (
                                                <JobsListEntry key={cjidx}
                                                    job={childJob}
                                                    isChildJob={true}
                                                    templates={templates}
                                                    settings={childSettingsDefault}
                                                    parentHandlerAfterUpdate = {this.parentHandlerAfterUpdate}
                                                />
                                        );
                                    })}
                                </div>
                            }

                            <div>
                                {/* <Dropdown text='New Subtask' icon='file' floating labeled button className='icon'>
                                    <Dropdown.Menu>
                                        <Dropdown.Item text="New" value={0} onClick={this.handleAddChildJob} />
                                        <Dropdown.Divider />
                                        <Dropdown.Header content='Based on template:' icon='tags' />
                                        <Dropdown.Menu scrolling>
                                            {templates.map(tml =>
                                                <Dropdown.Item key={tml.id} text={tml.title} value={tml.id} onClick={(e) => this.handleAddChildJob(e, tml)} />
                                            )}
                                        </Dropdown.Menu>
                                    </Dropdown.Menu>
                                </Dropdown> */}
                            </div>

                        </div>
                        {/* <div className="extra"></div> */}
                    </div>
                </div>
        );
  }
}

export default JobsListEntry;