import React, { Component} from "react";
import { Redirect } from "react-router-dom";

import {request} from '../../utils/helper';

import JobsForm from './Component_JobsForm';

class Page_JobsNew extends Component{

    constructor(props) {
        super(props);
        this.state = {
            redirectToEdit: false
        };

        this.formRef = React.createRef();
        this.handleSaveForm = this.handleSaveForm.bind(this);
    }

    componentDidMount() {
    }

    handleSaveForm(e) {
        const values = this.formRef.current.getPreparedValues();
        console.log('Save Job', values);

        request('jobs', 'create', 'post', values)
        .then(result => {
            console.log("Axios result: ", result);
            this.setState({redirectToEdit: result.data})
            // http://localhost:8081/#/admin/jobs/edit/2
        })
        .catch(error => {
            console.log("Axios error: ", error);
        })

        e.preventDefault();
    }

    render(){
        return(
            <div className="adminpage-jobs-new">
                <form className="ui form jobs-form" onSubmit={this.handleSaveForm}>
                    {this.state.redirectToEdit !== false &&
                        <Redirect to={`/admin/jobs/edit/${this.state.redirectToEdit}`} />
                    }
                    <div className="field">
                        <button className="ui button primary" type="submit" onClick={this.handleSaveForm}>Save</button>
                    </div>
                    <JobsForm ref={this.formRef} settings={{allow_childJobs: true}} />
                </form>
            </div>
        );
  }
}

export default Page_JobsNew;