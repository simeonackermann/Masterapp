import React, { Component} from "react";
import {request} from '../../utils/helper';
import moment from 'moment';
import { Dropdown, Modal, Dimmer, Loader, Segment, Transition } from 'semantic-ui-react'

import { getJobsAtDate, getJobsInDates, getDays, MonthListDay } from '../etc/Calendar_Helper';

// import Component_JobsBrowserEntry from './Component_JobsBrowserEntry';
import JobsListEntry from './Component_JobsBrowserEntryNew';
import JobsForm from './Component_JobsForm';

import { alertError } from '../etc/Error_Tools';

class Page_JobsBrowser extends Component{

    constructor(props) {
        super(props);

        this.formRef = React.createRef();

        this.state = {
            startDate: moment(),

            jobs: [],
            templates: [],
            nextOpenJobs: [],
            loadingJobs: true,

            newFormOpen: false,
            editFormOpen: false,
            editFormValues: {}
        };

        this.getNextOpenJobs = this.getNextOpenJobs.bind(this);

        this.handleNextMonth = this.handleNextMonth.bind(this);
        this.handlePrevMonth = this.handlePrevMonth.bind(this);

        this.handleOpenNewForm = this.handleOpenNewForm.bind(this);
        this.handleCloseNewForm = this.handleCloseNewForm.bind(this);
        this.handleSaveNewForm = this.handleSaveNewForm.bind(this);

        this.handleOpenEditForm = this.handleOpenEditForm.bind(this);
        this.handleCloseEditForm = this.handleCloseEditForm.bind(this);
        this.handleSaveEditForm = this.handleSaveEditForm.bind(this);

        this.handlerAfterUpdate = this.handlerAfterUpdate.bind(this);
    }

    componentDidMount() {
        // TODO may get only jobs in future for some months, dynamically load later/earlier jobs
        // get jobs
        request('jobs', 'get', 'GET', {order: 'desc'})
        .then(res => {
            const jobs = res.data;
            this.setState({ jobs, loadingJobs: false });
        })
        .catch(error => {
            alertError(error);
        })

        // get templates
        request('templates', 'get', 'GET')
        .then(res => {
            const templates = res.data;
            this.setState({ templates });
        })
        .catch(error => {
            alertError(error);
        })
    }

    getNextOpenJobs(jobs) {
        const from = moment();
        const to = from.clone().add(1, "weeks");
        const nextJobs = getJobsInDates(jobs, from, to);
        const nextOpenJobs = nextJobs.filter(job => {
            if (job.users_required != null && job.users_required > job.users_subscribed.length) {
                return true;
            }
            const openChilds = job.has_jobs.filter(childJob => {
                if (childJob.users_required != null && childJob.users_required > childJob.users_subscribed.length) {
                    return true;
                }
                return false;
            })
            return openChilds.length > 0;
        })
        return nextOpenJobs;
    }

    handleNextMonth(e) {
        const current = this.state.startDate;
        const next = current.clone().add(1, "months").startOf('month');
        this.setState({
            startDate: next
        });
        e.preventDefault();
    }

    handlePrevMonth(e) {
        const current = this.state.startDate;
        const prev = current.clone().subtract(1, "months").startOf('month');
        this.setState({
            startDate: prev
        });
        e.preventDefault();
    }

    handleOpenNewForm(e, template = {}, date = null) {
        let values = {...template, ...{id: null, type: null, date_start: date}};
        this.setState({
            newFormOpen: true,
            editFormValues: values
        });
        e.preventDefault()
    }

    handleSaveNewForm(e) {
        const self = this;
        const values = this.formRef.current.getPreparedValues();
        const jobs = [...self.state.jobs];

        request('jobs', 'create', 'POST', values)
        .then(result => {
            const newId = result.data;

            request('jobs', 'getOne', 'GET', {id: newId})
            .then(result => {
                jobs.push(result.data);
                self.setState({ jobs });
                self.handleCloseNewForm();
            })
            .catch(error => {
                alertError(error);
            })
        })
        .catch(error => {
            alertError(error);
        })

        e.preventDefault()
    }

    handleCloseNewForm(e) {
        this.setState({ newFormOpen: false })
        if (typeof e !== "undefined") {
            e.preventDefault()
        }
    }


    handleOpenEditForm(e, job = {}) {
        // console.log('handleOpenEditForm', e, job);
        this.setState({
            editFormOpen: true,
            editFormValues: job
        })
        e.preventDefault()
    }

    handleSaveEditForm(e) {
        const self = this;
        const values = this.formRef.current.getPreparedValues();
        const jobId = values.id;
        const jobs = [...this.state.jobs];

        request('jobs', 'update', 'PUT', values)
        .then(result => {

            // we need to update the state heir with remove job
            // otherwise the job-entry component will not update!
            const i = jobs.findIndex(j => j.id === jobId);
            jobs.splice(i, 1);
            self.setState({ jobs });

            request('jobs', 'getOne', 'GET', {id: jobId})
            .then(result => {
                jobs.splice(i, 0, result.data);
                self.setState({ jobs });
                self.handleCloseEditForm();
            })
            .catch(error => {
                alertError(error);
            })
        })
        .catch(error => {
            alertError(error);
        })

        e.preventDefault()
    }

    handleCloseEditForm(e) {
        this.setState({ editFormOpen: false })

        if (typeof e !== "undefined") {
            e.preventDefault()
        }
    }

    handlerAfterUpdate(job) {
        const jobs = [...this.state.jobs];

        // update current state
        this.setState({jobs});
    }

    render(){
        const {jobs, templates, startDate, loadingJobs} = this.state;
        const days = getDays(startDate);
        const nextOpenJobs = this.getNextOpenJobs(jobs);

        const modalFormNew = (
            <Modal
                open={this.state.newFormOpen}
                onClose={this.handleCloseNewForm}
                closeOnDimmerClick={false}
                closeOnEscape={false}
            >
                <Modal.Header>
                    <div className="">
                        <button className="ui button right floated" onClick={this.handleCloseNewForm}>Cancel</button>
                        <button className="ui button primary right floated" type="submit" onClick={this.handleSaveNewForm}>Save</button>
                    </div>
                    New Job
                </Modal.Header>
                <Modal.Content scrolling>
                    <form className="ui form jobs-form" onSubmit={this.handleSaveNewForm}>
                        <JobsForm ref={this.formRef}
                            settings={{allow_childJobs: true}}
                            templates={templates}
                            values={this.state.editFormValues}
                        />
                    </form>
                </Modal.Content>
            </Modal>
        );

        const modalFormEdit = (
            <Modal
                open={this.state.editFormOpen}
                onClose={this.handleCloseEditForm}
                closeOnDimmerClick={false}
                closeOnEscape={false}
            >
                <Modal.Header>
                    <div className="">
                        <button className="ui button right floated" onClick={this.handleCloseEditForm}>Cancel</button>
                        <button className="ui button primary right floated" type="submit" onClick={this.handleSaveEditForm}>Save</button>
                    </div>
                    Edit Job
                </Modal.Header>
                <Modal.Content scrolling>
                    <form className="ui form jobs-form" onSubmit={this.handleSaveEditForm}>
                        <JobsForm ref={this.formRef}
                            settings={{allow_childJobs: true}}
                            templates={templates}
                            values={this.state.editFormValues}
                        />
                    </form>
                </Modal.Content>
            </Modal>
        );

        return(
            <div className="jobs-list-wrapper">

                {modalFormNew}
                {modalFormEdit}

                {/* TODO: how to show jobs without date ??? -> als sub-menu (filter "jobs without date") */}

                <Transition visible={nextOpenJobs.length > 0} animation='slide down' duration={500}>
                    <div className="ui warning message">
                        <h3>You have open jobs next week in:</h3>
                        {nextOpenJobs.map(openJob =>
                            <div key={openJob.id}>{openJob.title}</div>
                        )}
                    </div>
                </Transition>

                <div className="jobs-list-action-panel">
                    {/* <Link className="ui button" to={`/admin/jobs/new`}>New</Link>
                    <Link className="ui button" to={`/admin/jobs/new`}>New (from Template)</Link> */}
                    <Dropdown text='New Job' icon='file' labeled button className='icon'>
                        <Dropdown.Menu>
                            <Dropdown.Item text="New" value={0} onClick={this.handleOpenNewForm} />
                            <Dropdown.Divider />
                            <Dropdown.Header content='Based on template:' icon='tags' />
                            <Dropdown.Menu scrolling>
                                {templates.map(tml =>
                                    <Dropdown.Item key={tml.id} text={tml.title} value={tml.id} onClick={this.handleOpenNewForm} />
                                )}
                            </Dropdown.Menu>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                <div className="jobs-list-navigation">
                    <button className="left attached ui basic icon button" onClick={this.handlePrevMonth}><i className="angle left icon"></i></button>
                    {<div>{startDate.format("MMMM")}</div>}
                    <button className="right attached ui basic icon button" onClick={this.handleNextMonth}><i className="angle right icon"></i></button>
                </div>

                <Dimmer.Dimmable as={Segment} dimmed={loadingJobs} className="grid">
                    {days.map((day, i) => {
                        const jobsAt = getJobsAtDate(jobs, day);
                        const newEventDate = moment(day).add(1, "hours").minutes(0);

                        return (
                            <MonthListDay key={i} date={day}>
                                <div className="one wide column">
                                    <Dropdown icon='plus' floating button basic className='icon'>
                                        <Dropdown.Menu>
                                            <Dropdown.Item text="New" value={0} onClick={e => this.handleOpenNewForm(e, null, newEventDate)} />
                                            <Dropdown.Divider />
                                            <Dropdown.Header content='Based on template:' icon='tags' />
                                            <Dropdown.Menu scrolling>
                                                {templates.map(tml =>
                                                    <Dropdown.Item key={tml.id} text={tml.title} value={tml.id} onClick={e => this.handleOpenNewForm(e, tml, newEventDate)} />
                                                )}
                                            </Dropdown.Menu>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div className="fourteen wide column content-wrapper">
                                    <div className="ui items">
                                        {jobsAt.map(job => {
                                            return (
                                                <JobsListEntry
                                                    key={job.id}
                                                    settings={{allow_childJobs: true}}
                                                    job={job}
                                                    templates={templates}
                                                    parentHandlerEditJob={this.handleOpenEditForm}
                                                    parentHandlerAfterUpdate = {this.handlerAfterUpdate}
                                                />
                                            )
                                        })}
                                    </div>
                                </div>
                            </MonthListDay>
                        );
                    })}
                    <Dimmer active={loadingJobs} inverted verticalAlign='top'>
                        <Loader>Loading</Loader>
                    </Dimmer>
                </Dimmer.Dimmable>

                {/* <table className="ui selectable celled table">
                    <thead>
                        <tr><th>Date</th>
                        <th>State</th>
                        <th>Title</th>
                        <th>Creator</th>
                        <th>Users Required</th>
                        <th>Users Subscribed</th>
                        <th>Tasks</th>
                    </tr></thead>
                    {jobs.map((job, jidx) => {
                        return (
                            <Component_JobsBrowserEntry job={job} key={jidx} />
                        );
                    })}
                </table> */}

            </div>
        );
  }
}

export default Page_JobsBrowser;