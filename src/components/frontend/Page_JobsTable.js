import React, { Component} from "react";
import axios from 'axios';

import JobsTableEntry from './Component_JobsTableEntry';

class Page_JobsTable extends Component{

    constructor(props) {
        super(props);
        this.state = {
            jobs: []
        };
    }

    componentDidMount() {
        axios.get(`http://localhost:8082/public/backend/api/jobs/?path=get`)
        .then(res => {
            const jobs = res.data;
            this.setState({ jobs });
            console.log('Jobs ', res.data);
        })
        .catch(error => {
            console.log("Error occurred while fetching Jobs");
            console.error(error);
        })
    }

    render(){
        const jobs = this.state.jobs;
        return(
            <div className="JobsList">
                <h1>Joblist</h1>


                    {jobs.map((job, jidx) => {
                        return (
                            <JobsTableEntry job={job} key={jidx} />
                        );
                    })}
            </div>
        );
  }
}

export default Page_JobsTable;