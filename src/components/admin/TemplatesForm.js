import React, { Component} from "react";
import { Message } from 'semantic-ui-react'

// TODO we can merge job-form componewnt and this component !!!!

class TemplatesForm extends Component{

    constructor(props) {
        super(props);

        const allow_childJobs = props.allow_childJobs || false;

        let values =  {
            title: '',
            description: '',

            has_additionals: [
                {type: 'location', value: ''},
                {type: 'category', value: ''}
            ],

            users_required: '',
            users_subscribed: [],
            has_jobs: [],
        };

        if (typeof props.values !== 'undefined') {
            // manually merge props.values, we need to check for null values
            Object.keys(props.values).forEach(key => {
                if (props.values[key] !== null) {
                    values[key] = props.values[key]
                }
            });
        }

        values.has_jobs = values.has_jobs.map(childJobValues => {
            return {
                ref: React.createRef(),
                inValues: childJobValues
            };
        })


        console.log("TemplatesForm values", values);

        this.state = {
            allow_childJobs,
            values,
            user: {nick: ''}
        };

        this.getPreparedValues = this.getPreparedValues.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.handleAddChildJob = this.handleAddChildJob.bind(this);
        this.handleAddUser = this.handleAddUser.bind(this);
        this.handleRemoveUser = this.handleRemoveUser.bind(this);
    }

    componentDidMount() {
    }

    getPreparedValues() {
        let values = {...this.state.values}; // copy object to avoid affetcs on form values

        let additionals = [];
        values.has_additionals.forEach(entry => {
            const type = `has_additionals[${entry.type}]`;
            if (typeof values[type] !== 'undefined') {
                console.log('values[type]', values[type]);
                values[type].forEach(value => {
                    if (value != "") {
                        additionals.push({
                            type: entry.type,
                            value
                        });
                    }
                })
            }

        })

        values.has_jobs = values.has_jobs.map(entry => {
            return entry.ref.current.getPreparedValues();
        });

        values.users_subscribed = JSON.stringify(values.users_subscribed);

        return values;
    }

    handleAddChildJob(e, childValues = {}) {

        if ("has_jobs" in childValues && childValues.has_jobs.length > 0) {
            alert("Adding Childjobs with childs is currently not implemented...");
            childValues.has_jobs = [];
        }
        // BUGFIX remove templates child id
        // TODO the backend should create a new child job if given child id comes from a template!
        if ("id" in childValues) {
            childValues.id = null;
        }

        const values = this.state.values;
        values.has_jobs.push({
            ref: React.createRef(),
            inValues: childValues
        });
        this.setState({ values });
        e.preventDefault();
    }

    handleRemoveUser(e, uidx) {
        const values = this.state.values;
        values.users_subscribed.splice(uidx, 1);
        this.setState({ values });
        e.preventDefault();

    }

    handleAddUser(e) {
        let user = this.state.user;
        let values = this.state.values;
        values.users_subscribed.push(
            {nick: user.nick}
        );
        user.nick = '';
        this.setState({ values, user });

        e.preventDefault();
    }

    handleChangeInput(e) {
        const values = this.state.values;
        const target = e.target;
        //const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name
        let value = target.value;
        if (target.type === 'checkbox') {
            value = target.checked;
        }
        else if (target.type === 'select-multiple') {
            value = [];
            for (var i = 0, l = target.options.length; i < l; i++) {
                if (target.options[i].selected) {
                  value.push(target.options[i].value);
                }
            }
        }

        if (name == "nick") {
            let user = this.state.user;
            user.nick = value;
            this.setState({user});
            e.preventDefault();
            return;
        }

        values[name] = value;

        this.setState({values});

        e.preventDefault();
    }

    render() {
        const values = this.state.values;

        const errors = this.props.errors;

        return(
            <div className="ui grid jobs-form-component">
                {errors.length > 0 &&
                    <div className="sixteen wide column">
                        {errors.map((error, ei) => {
                            return (
                                <Message key={ei} negative
                                    header='Error'
                                    content={error.message}
                                />
                            )
                        })}
                    </div>
                }
                <div className="ten wide column">
                    <div className="required field">
                        <label>Title</label>
                        <input required={true} type="text" name="title" placeholder="Title" value={values.title} onChange={this.handleChangeInput} />
                    </div>
                    <div className="field">
                        <label>Description</label>
                        <textarea name="description" rows="1" value={values.description} onChange={this.handleChangeInput}></textarea>
                    </div>

                    <div className="field">
                        <label>Required Users</label>
                        <input type="number" name="users_required" value={values.users_required} placeholder="Required Users, e.g. 2" onChange={this.handleChangeInput} />
                    </div>
                    <div className="field">
                        <label>Subscribed Users</label>
                        {values.users_subscribed.map((user, uidx) => {
                            return (
                                <div className="ui label" key={uidx}>
                                    {user.nick}
                                    <i className="delete icon" onClick={(e) => this.handleRemoveUser(e, uidx)}></i>
                                </div>
                            );
                        })}
                        <div className="ui mini action input">
                            <input type="text" name="nick" placeholder="Name" value={this.state.user.nick} onChange={this.handleChangeInput} />
                            <button className="ui button" disabled={this.state.user.nick == ''} onClick={this.handleAddUser}>Add</button>
                        </div>
                    </div>
                    {values.has_jobs.map((childJob, cjidx) => {
                        return (
                            <div className="field has_job" key={cjidx}>
                                <div className="field">
                                    Subtask {1+cjidx}
                                </div>
                                <TemplatesForm ref={childJob.ref}
                                    values={childJob.inValues}
                                    allow_childJobs={false}
                                    errors={[]}
                                />
                            </div>
                        );
                    })}
                    {this.state.allow_childJobs &&
                        <div>
                            <button className="ui button" onClick={this.handleAddChildJob}>Add Subtask {1 + values.has_jobs.length}</button>
                        </div>
                    }
                </div>

                <div className="six wide column">
                    {/* <div className="field">
                        <label>Location</label>
                        <select multiple name="has_additionals[location]" className="ui fluid dropdown" onChange={this.handleChangeInput}>
                            <option value="">Select Location...</option>
                            <option value="3" >Leipzig</option>
                            <option value="4" >Amerika</option>
                        </select>
                    </div>
                    <div className="field">
                        <label>Category</label>
                        <select multiple name="has_additionals[category]" className="ui dropdown" onChange={this.handleChangeInput}>
                            <option value="">Select Category...</option>
                            <option value="1" >Konzert</option>
                            <option value="2" >Lesung</option>
                        </select>
                    </div> */}
                </div>
            </div>

        );
  }
}

export default TemplatesForm;