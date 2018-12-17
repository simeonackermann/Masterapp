import React, { Component} from "react";

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

class JobsForm extends Component{

    constructor(props) {
        super(props);

        const isRootJob = props.isRootJob || false;
        const childId = typeof props.childId !== 'undefined' ? props.childId : null;

        console.log("JobsForm props", props);

        const values = [];
        if (typeof props.job !== 'undefined') {
            values['title'] = props.job.title;
        }

        this.state = {
            isRootJob,
            values,
            childId,
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


        e.preventDefault();
    }

    render() {

        // TODO template settings/conf (eg json), keine description/date/... für subjobs!

        const formHtml = (<div>
            <div className="field">
                        <label>Title</label>
                        <input type="text" name="title" placeholder="Title" value={this.state.values['title']} onChange={this.handleChangeInput} />
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
                            <JobsForm key={cjidx} childId={cjidx} isRootJob={false} parentUpdateChildStore={this.parentUpdateChildStore} />
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

export default JobsForm;