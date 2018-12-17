import React, { Component} from "react";
import axios from 'axios';

/**
 * TODO implement
 */
const settings = {
    jobs: {
        fields: ['title', 'description', '...'],
        // oder
        showRequiredUsers: false
    },
    childJobs: {
        fields: ['title', 'required_users', '...'],
        // oder
        showDate: false,
        showDescription: false,
    }
};

class JobsAdd extends Component{

    constructor(props) {
        super(props);

        const isRootJob = props.isRootJob || false;
        const childId = typeof props.childId !== 'undefined' ? props.childId : null;

        this.state = {
            isRootJob: isRootJob,
            values: [],
            childId: childId,
            childJobs: [],
        };

        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.handleAddChildJob = this.handleAddChildJob.bind(this);
        this.handleSaveForm = this.handleSaveForm.bind(this);
        this.parentUpdateChildStore = typeof props.parentUpdateChildStore !== 'undefined'
            ? props.parentUpdateChildStore
            : this.parentUpdateChildStore.bind(this);
    }

    componentDidMount() {
    }

    parentUpdateChildStore(childState) {
        const childJobs = this.state.childJobs;
        childJobs[childState.childId] = childState;
        this.setState({childJobs});
    }

    handleAddChildJob(e) {
        const childJobs = this.state.childJobs;
        childJobs.push({});
        this.setState({childJobs});
        e.preventDefault();
    }

    handleChangeInput(e) {
        const self = this;
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        const values = this.state.values;
        values[name] = value;
        this.setState({values});

        if (!this.state.isRootJob) {
            setTimeout(() => {
                self.parentUpdateChildStore(self.state);
            }, 0)
        }
    }

    getValuesAsFormData(values) {
        const formData = new FormData();

        if (typeof values['date'] !== 'undefined') {
            values['date'] = new Date(
                typeof values['time'] !== 'undefined'
                    ? values['date'] + ' ' + values['time']
                    : values['date']
            )
            .toISOString().slice(0, 19).replace('T', ' '); // convert to mysql datetime format
            delete values['time'];
            console.log("Generated date: ", values['date']);
        }

        for (let name in values) {
            formData.set(name, values[name]);
        }
        return formData;
    }

    handleSaveForm(e) {
        const self = this;
        console.log("Save form", this.state);

        let jobRes = null;
        const childPrms = [];

        this.state.childJobs.forEach(childJob => {
            const formData = this.getValuesAsFormData(childJob.values);

            childPrms.push(axios({
                method: 'post',
                url: 'http://localhost:8082/public/backend/api/jobs/?path=create',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }));
        })

        const formData = this.getValuesAsFormData(this.state.values);
        axios({
            method: 'post',
            url: 'http://localhost:8082/public/backend/api/jobs/?path=create',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(res => {
            jobRes = res;
            console.log("Created job res", res);
            return Promise.all(childPrms);
        })
        .then(childsRes => {
            console.log("Created Child IDS:", childsRes);
            const jobHasJobPrms = [];
            childsRes.forEach(childRes => {
                jobHasJobPrms.push(
                    axios.post(`http://localhost:8082/public/backend/api/jobs/?path=createJobHasJob&job=${jobRes.data}&child_job=${childRes.data}`)
                );
            });
            return Promise.all(jobHasJobPrms);
        })
        .then(res => {
            console.log('job has job res', res);
        })
        .catch(error => {
            console.log(error);
        })


        e.preventDefault();
    }

    render() {

        // TODO template settings/conf (eg json), keine description/date/... für subjobs!

        const formHtml = (<div>
            <div className="field">
                        <label>Title</label>
                        <input type="text" name="title" placeholder="Title" onChange={this.handleChangeInput} />
                    </div>
                    <div className="field">
                        <label>Description</label>
                        <textarea name="description" rows="1" onChange={this.handleChangeInput}></textarea>
                    </div>
                    <div className="two fields">
                        <div className="field">
                            <label>Date</label>
                            <input type="date" name="date" placeholder="Date - YYYY/MM/DD" onChange={this.handleChangeInput} />
                        </div>
                        <div className="field">
                            <label>Time</label>
                            <input type="time" name="time" placeholder="Time - HH:TT" onChange={this.handleChangeInput} />
                        </div>
                    </div>
                    <div className="field">
                        <label>Required Users</label>
                        <input type="number" name="users_required" placeholder="Required Users, e.g. 2" onChange={this.handleChangeInput} />
                    </div>
                    {this.state.childJobs.map((childJob, cjidx) => {
                        return (
                            <JobsAdd key={cjidx} childId={cjidx} isRootJob={false} parentUpdateChildStore={this.parentUpdateChildStore} />
                        );
                    })}
                    {this.state.isRootJob &&
                        <div className="field">
                            <button className="ui button" onClick={this.handleAddChildJob}>Add Child-Job</button>
                        </div>
                    }
                    {this.state.isRootJob &&
                        <div>
                            <button className="ui button" type="submit" onClick={this.handleSaveForm}>Save</button>
                            <button className="ui button">Save as Template</button>
                        </div>
                    }
        </div>);

        return(
            <div>
                {this.state.isRootJob &&
                    <form className="ui form" onSubmit={this.handleSaveForm}>
                        {formHtml}
                    </form>
                }
                {!this.state.isRootJob &&
                    <div>
                        {formHtml}
                    </div>
                }
            </div>
        );
  }
}

export default JobsAdd;