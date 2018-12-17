import React, { Component} from "react";
import { Redirect, Link } from "react-router-dom";

import {request} from '../../utils/helper';

import JobsForm from './Component_JobsForm';

class JobsEditor extends Component{

    constructor(props) {
        super(props);

        const jobId = props.match.params.id;
        this.formRef = React.createRef();

        this.state = {
            redirectTo: false,
            jobId: jobId,
            values: {}
        };

        this.handleSaveForm = this.handleSaveForm.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        request('jobs', 'getOne', 'GET', {id: this.state.jobId})
        .then(res => {
            const values = res.data;
            this.setState({ values });
        })
        .catch(error => {
            console.log("Error occurred while fetching Job");
            console.error(error);
        })
    }

    handleSaveForm(e) {
        const values = this.formRef.current.getPreparedValues();
        console.log('Save Job', values);

        request('jobs', 'update', 'PUT', {id: this.state.jobId, ...values})
        .then(result => {
            console.log("Axios result: ", result);
        })
        .catch(error => {
            console.log("Axios error: ", error);
        })

        e.preventDefault();
    }

    handleDelete(e) {
        console.log('Delete Job', this.state.jobId);

        request('jobs', 'update', 'PUT', {id: this.state.jobId, state: "deleted"})
        .then(result => {
            console.log("Axios result: ", result);
            this.setState({redirectTo: "/admin/jobs"})
        })
        .catch(error => {
            console.log("Axios error: ", error);
        })

        e.preventDefault();

    }

    render(){
        const job = Object.keys(this.state.values).length > 0 ? this.state.values : false;
        return(
            <div className="adminpage-jobs-edit">
                {this.state.redirectTo !== false &&
                    <Redirect to={this.state.redirectTo} />
                }
                {!job &&
                    <form className="ui loading form">
                        <JobsForm ref={this.formRef} allow_childJobs={true} />
                    </form>
                }
                {job &&
                    <form className="ui form jobs-form">
                        <div className="field">
                            <button className="ui button primary" type="submit" onClick={this.handleSaveForm}>Apply</button>
                            <Link className="ui button" to={`/admin/jobs`}>Cancel</Link>
                            <button className="ui button" onClick={this.handleDelete}>Delete</button>
                        </div>
                        <JobsForm ref={this.formRef} allow_childJobs={true} values={job} />
                    </form>
                }
            </div>

        );
  }
}

export default JobsEditor;