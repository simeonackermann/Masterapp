import React, { Component} from "react";
import { Link, withRouter } from "react-router-dom";
import moment from 'moment';

class Component_JobsBrowserEntry extends Component{

    constructor(props) {
        super(props);

        const job = props.job;
        // job.users_subscribed = job.users_subscribed == null ? [] : JSON.parse(job.users_subscribed);

        this.state = {
            job,
            nick: ''
        };
    }

    componentDidMount() {
    }

    render(){
        const job = this.state.job;
        let date_start = null;
        if (job.date_start != null) {
            date_start = moment(job.date_start).format('ll LT');

            // date = new Date(job.date);
            // var options = { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' };
            // date = date.toLocaleDateString('de-DE', options);
        }
        const childJobs = job.has_jobs || [];
        return(
            <tbody>
                <tr onClick={() => {console.log('Redirect to edit... (may with "withRouter")')}}>
                    <td>{date_start}</td>
                    <td>{job.state}</td>
                    <td className="selectable">
                        <Link to={`/admin/jobs/edit/${job.id}`}>{job.title}</Link>
                    </td>
                    <td></td>
                    <td >{job.users_required}</td>
                    <td >
                        {job.users_subscribed.map((user, uidx) => {
                            return (
                                <div className="" key={uidx}>
                                    {user.nick}
                                </div>
                            );
                        })}
                    </td>
                    <td >
                        {childJobs.map((childJob, cjidx) => {
                            // childJob.users_subscribed = childJob.users_subscribed == null ? [] : JSON.parse(childJob.users_subscribed);
                            return (
                                <div key={cjidx}>
                                    {childJob.title} ({job.users_subscribed.length} / {childJob.users_required}):
                                    {' '}
                                    {childJob.users_subscribed.map((user, uidx) => {
                                        return (
                                            <span className="" key={uidx}>
                                                {user.nick},
                                                {' '}
                                            </span>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </td>
                </tr>
            </tbody>
        );
  }
}

export default Component_JobsBrowserEntry;