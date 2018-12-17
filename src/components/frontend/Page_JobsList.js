import React, { Component} from "react";
import { Dimmer, Loader, Segment } from 'semantic-ui-react'
import moment from 'moment';

import {request} from '../../utils/helper';
import { getJobsAtDate, getDays, MonthListDay } from '../etc/Calendar_Helper';
import { alertError } from '../etc/Error_Tools';

import JobsListEntry from './Component_JobsListEntry';

moment.locale("de");

class JobsList extends Component{

    constructor(props) {
        super(props);
        this.state = {
            jobs: [],
            loadingJobs: true,
            // groupByDate: 'month' // false | daily | weekly | monthly

            startDate: moment()
        };

        this.handleNextMonth = this.handleNextMonth.bind(this);
        this.handlePrevMonth = this.handlePrevMonth.bind(this);
    }

    componentDidMount() {
        // TODO get jobs from date depends on groupByDate (get from 1. month / only this week / ...)
        const startOfMonth = moment().format('YYYY-MM-DD');
        const endOfMonth   = moment().add(1, 'months').format('YYYY-MM-DD');

        request('jobs', 'get', 'get', {state: 'public', from_date: startOfMonth, to_date: endOfMonth})
        .then(res => {
            const jobs = res.data;
            this.setState({ jobs, loadingJobs: false });
        })
        .catch(error => {
            alertError(error);
        })
    }

    handleNextMonth(e) {
        const current = this.state.startDate.clone();
        const next = current.add(1, "months").startOf('month');
        this.setState({ startDate: next });
        e.preventDefault();
    }

    handlePrevMonth(e) {
        const current = this.state.startDate.clone();
        let prev = current.subtract(1, "months");

        prev = moment().month() == prev.month()
            ? moment()
            : prev.startOf('month');
        this.setState({ startDate: prev });
        e.preventDefault();
    }

    render(){
        const {jobs, startDate, loadingJobs} = this.state;
        const days = getDays(startDate);

        return(
            <div className="jobs-list-wrapper">
                <div className="jobs-list-navigation">
                    {startDate > moment() &&
                        <button className="left attached ui basic icon button" onClick={this.handlePrevMonth}><i className="angle left icon"></i></button>
                    }
                    {<div>{startDate.format("MMMM")}</div>}
                    <button className="right attached ui basic icon button" onClick={this.handleNextMonth}><i className="angle right icon"></i></button>
                </div>

                {/* <div className="ui grid">
                    {days(jobs)}
                </div> */}

                <Dimmer.Dimmable as={Segment} dimmed={loadingJobs} className="grid">
                    {days.map((day, i) => {
                        const jobsAt = getJobsAtDate(jobs, day);

                        return (
                            <MonthListDay key={i} date={day}>
                                <div className="fourteen wide column content-wrapper">
                                    <div className="ui items">
                                        {jobsAt.map((job, j) =>
                                            <JobsListEntry key={j}
                                                job={job}
                                                settings={{allow_childJobs: true}}
                                            />
                                        )}
                                    </div>
                                </div>
                            </MonthListDay>
                        );
                    })}
                    <Dimmer active={loadingJobs} inverted verticalAlign='top'>
                        <Loader>Loading</Loader>
                    </Dimmer>
                </Dimmer.Dimmable>

                {/* <div className="ui items jobs-list">
                jobs.map((job, jidx) => {
                    return (
                        <JobsListEntry job={job} key={jidx} />
                    );
                })
                </div> */}
            </div>
        );
  }
}

export default JobsList;