import React, { Component} from "react";
import moment from 'moment';
import {request} from '../../utils/helper';

class Component_JobsForm extends Component{

    constructor(props) {
        super(props);

        // const isRootJob = props.isRootJob || false;

        // const parentHandleSaveForm = typeof props.parentHandleSaveForm !== 'undefined' ? props.parentHandleSaveForm : () => {};
        const allow_childJobs = props.allow_childJobs || false;
        //const childId = typeof props.childId !== 'undefined' ? props.childId : null;


        // we need to define all default values
        // let adds = [
        //     'category',
        // ]

        let values =  {
            state: 'private',
            title: '',
            description: '',
            date_start: '',
            time_start: '',
            date_end: '',
            time_end: '',

            has_additionals: [
                {type: 'location', value: ''},
                {type: 'category', value: ''}
            ],
            // location: [],
            // category: [],

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

        if (values.date_start !== '') {
            values.time_start = moment(values.date_start).format("HH:mm");
            values.date_start = moment(values.date_start).format("YYYY-MM-DD");
        }
        if (values.date_end !== '') {
            values.time_end = moment(values.date_end).format("HH:mm");
            values.date_end = moment(values.date_end).format("YYYY-MM-DD");
        }

        // if (values.users_subscribed.length > 0) {
        //     values.users_subscribed = JSON.parse(values.users_subscribed);
        // }

        // TODO handle user_subscribed json...

        console.log("JobsForm values", values);

        this.state = {
            //parentHandleSaveForm,
            allow_childJobs,
            //isRootJob,
            values,
            //childId,
            //childJobs: [],
            user: {nick: ''},

            templates: []
        };

        //this.parentHandleSaveForm = parentHandleSaveForm;
        this.getPreparedValues = this.getPreparedValues.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.handleAddChildJob = this.handleAddChildJob.bind(this);
        this.handleAddUser = this.handleAddUser.bind(this);
        this.handleRemoveUser = this.handleRemoveUser.bind(this);
        //this.handleSaveForm = this.handleSaveForm.bind(this);
        // this.parentUpdateChildStore = typeof props.parentUpdateChildStore !== 'undefined'
        //     ? props.parentUpdateChildStore
        //     : this.parentUpdateChildStore.bind(this);
    }

    componentDidMount() {

        request('templates', 'get')
        .then(res => {
            const templates = res.data;
            this.setState({ templates });
            console.log('templates', templates);
        })
        .catch(error => {
            console.log("Error occurred while fetching Job");
            console.error(error);
        })

    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     console.log('shouldComponentUpdate', nextProps, nextState);

    //     return true;
    // }

    // componentDidUpdate(prevProps, prevState) {
    //     console.log('componentDidUpdate', prevProps, prevState);
    // }

    // parentUpdateChildStore(childState) {
    //     console.log('parentUpdateChildStore', childState);
    //     // TODO is in values[has_jobs]
    //     // const childJobs = this.state.childJobs;
    //     // childJobs[childState.childId] = childState;
    //     // this.setState({childJobs});
    // }


    getPreparedValues() {
        let values = {...this.state.values}; // copy object to avoid affetcs on form values

        if (values.date_start != '') {
            // TODO try/catch date creation... eg with moment().isValid()
            values.date_start = new Date(
                values.time_start != ''
                    ? values.date_start + ' ' + values.time_start
                    : values.date_start
            )
            .toISOString().slice(0, 19).replace('T', ' '); // convert to mysql datetime format
            delete values.time_start;
        }

        if (values.date_end != '') {
            // TODO try/catch date creation... eg with moment().isValid()
            values.date_end = new Date(
                values.time_end != ''
                    ? values.date_end + ' ' + values.time_end
                    : values.date_end
            )
            .toISOString().slice(0, 19).replace('T', ' '); // convert to mysql datetime format
            delete values.time_end;
        }

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
                // additionals.push({
                //     type: entry.type
                // });
            }
            // ...

        })
        console.log("additionals: ", additionals);

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
        const self = this;
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
            // for (const option in target.options) {
            //     if (option.selected) {
            //         value.push(option.value);
            //     }
            // }
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

        // if (name.indexOf("has_additionals") >= 0) {
        //     const key = name.match(new RegExp(/\[(\w+)\]/))
        //     console.log('Handle additionals: ', key, value);
        //     values['has_additionals'][key] = value;
        // }
        // else {
        //     values[name] = value;
        // }

        values[name] = value;

        this.setState({values});

        // if (this.state.childId !== null) {
        //     // this.parentUpdateChildStore(this.state);
        //     // setTimeout(() => {
        //     //     //self.parentUpdateChildStore(self.state);
        //     // }, 0)
        // }
        e.preventDefault();
    }

    render() {

        // TODO template settings/conf (eg json), keine description/date/... für subjobs!

        const values = this.state.values;
        const templates = this.state.templates;

        return(
            <div className="field jobs-form-component">
                <div className="field">
                    <label>Title</label>
                    <input required={true} type="text" name="title" placeholder="Title" value={values.title} onChange={this.handleChangeInput} />
                </div>
                <div className="field">
                    <label>State</label>
                    <select className="ui dropdown" value={values.state} name="state" onChange={this.handleChangeInput}>
                        <option value="">State</option>
                        <option value="private" >Private</option>
                        <option value="public">Public</option>
                    </select>
                </div>
                <div className="field">
                    <label>Description</label>
                    <textarea name="description" rows="1" value={values.description} onChange={this.handleChangeInput}></textarea>
                </div>
                <div className="four fields">
                    {/*
                        TODO add handler onUpdateDate to auto-generate the other date (eg. date end 1 hour after date start)
                    */}
                    <div className="field">
                        <label>Date Start</label>
                        <input type="date" name="date_start" value={values.date_start} placeholder="Date - YYYY/MM/DD" onChange={this.handleChangeInput} />
                    </div>
                    <div className="field">
                        <label>Time</label>
                        <input type="time" name="time" value={values.time_start} placeholder="Time - HH:TT" onChange={this.handleChangeInput} />
                    </div>
                    <div className="field">
                        <label>Date End</label>
                        <input type="date" name="date_end" value={values.date_end} placeholder="Date - YYYY/MM/DD" onChange={this.handleChangeInput} />
                    </div>
                    <div className="field">
                        <label>Time</label>
                        <input type="time" name="time" value={values.time_end} placeholder="Time - HH:TT" onChange={this.handleChangeInput} />
                    </div>
                </div>
                <div className="field">
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
                            <Component_JobsForm ref={childJob.ref} values={childJob.inValues} allow_childJobs={false} />
                        </div>
                    );
                })}
                {this.state.allow_childJobs &&
                    <div>
                        <div className="ui compact menu">
                            <div className="ui simple dropdown item">
                                Add Subtask {1 + values.has_jobs.length}
                                <i className="dropdown icon"></i>
                                <div className="menu">
                                    <div className="item" onClick={this.handleAddChildJob}>New</div>
                                    <div className="ui dropdown item">
                                        <i className="dropdown icon"></i>
                                        From Template
                                        <div className="menu">
                                            <div className="header">Template</div>
                                            {templates.map((template, tidx) => {
                                                return (
                                                    <a key={tidx} className="item" onClick={(e) => this.handleAddChildJob(e, template)}>{template.title}</a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
  }
}

export default Component_JobsForm;