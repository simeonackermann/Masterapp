import React, { Component} from "react";
import axios from 'axios';

class JobsTableEntry extends Component{

    constructor(props) {
        super(props);

        const job = props.job;
        // job.users_subscribed = job.users_subscribed == null ? [] : JSON.parse(job.users_subscribed);

        this.state = {
            job,
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
        console.log("Add user", this.state.job.id, this.state.nick);

        const job = this.state.job;
        const nick = this.state.nick;

        if (nick == '') {
            alert('Empty nickname!');
            e.preventDefault();
            return;
        }

        axios.post(`http://localhost:8082/public/backend/api/jobs/?path=addUser&id=${job.id}&user=${nick}`)
        .then(res => {
            console.log('red ', res);
            job.users_subscribed.push({nick});
            this.setState({
                job,
                nick: ''
            });
        })
        .catch(error => {
            console.log("Error occurred while adding user to job");
            console.error(error);
        })

        e.preventDefault();
    }

    handleRemoveUser(e, jobId, userId) {
        console.log("Remove User", e, jobId, userId);

        const job = this.state.job;

        axios.post(`http://localhost:8082/public/backend/api/jobs/?path=removeUser&id=${jobId}&user=${userId}`)
        .then(res => {
            console.log('red ', res);
            job.users_subscribed.splice(userId, 1);
            this.setState({ job });
        })
        .catch(error => {
            console.log("Error occurred while removing user from job");
            console.error(error);
        })

        e.preventDefault();
    }

    render(){
        const job = this.state.job;
        let date = null;
        if (job.date != null) {
            date = new Date(job.date);
            var options = { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' };
            date = date.toLocaleDateString('de-DE', options);
        }
        const childJobs = job.has_jobs || [];
        return(
            <div className="">
                <div><small>{date}</small></div>
                <h3>{job.title}</h3>
                {job.description != null &&
                    <div>{job.description}</div>
                }

                {job.users_required != null &&

                                <div>
                                    <p>{job.users_subscribed.length} / {job.users_required}</p>
                                    <div className="">
                                        {job.users_subscribed.map((user, uidx) => {
                                            return (
                                                <div className="ui label" key={uidx}>
                                                    {user.nick}
                                                    <i className="delete icon" onClick={(e) => this.handleRemoveUser(e, job.id, uidx)}></i>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <form className="ui mini action input" onSubmit={this.handleAddUser}>
                                        <input type="text" placeholder="Name" value={this.state.nick} onChange={this.handleChangeNick} />
                                        <button className="ui button" type="submit" disabled={this.state.nick == ''} onClick={this.handleAddUser}>Add</button>
                                    </form>
                                </div>
                }

                <div>

                    {childJobs.map((childJob, cjidx) => {
                                    return (
                                            <JobsTableEntry job={childJob} key={cjidx} />
                                    );
                                })}

                </div>
            </div>
        );
  }
}

export default JobsTableEntry;