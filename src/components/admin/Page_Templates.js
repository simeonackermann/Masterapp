import React, { Component} from "react";
import {request} from '../../utils/helper';
import { Route, Link } from "react-router-dom";
import { Modal } from 'semantic-ui-react'


import Component_TemplatesEntry from './Component_TemplatesEntry';
import TemplatesForm from './TemplatesForm';

class Page_Templates extends Component{

    constructor(props) {
        super(props);

        this.formRef = React.createRef();

        this.state = {
            templates: [],
            newFormOpen: false,
            editFormOpen: false,

            formErrors: [],

            editTemplateValues: {}
        };

        this.handleOpenNewForm = this.handleOpenNewForm.bind(this);
        this.handleCloseNewForm = this.handleCloseNewForm.bind(this);
        this.handleSaveNewForm = this.handleSaveNewForm.bind(this);

        this.handleOpenEditForm = this.handleOpenEditForm.bind(this);
        this.handleCloseEditForm = this.handleCloseEditForm.bind(this);
        this.handleSaveEditForm = this.handleSaveEditForm.bind(this);

        this.handleDeleteTemplate = this.handleDeleteTemplate.bind(this);
    }

    componentDidMount() {
        request('templates', 'get', 'GET', {order: 'desc'})
        .then(res => {
            const templates = res.data;
            this.setState({ templates });
        })
        .catch(error => {
            console.error(error);
        })
    }

    handleOpenNewForm(e) {
        this.setState({ newFormOpen: true })
        e.preventDefault()
    }

    handleCloseNewForm() {
        this.setState({ newFormOpen: false })
    }

    handleSaveNewForm(e) {
        const self = this;
        const values = this.formRef.current.getPreparedValues();
        let templates = [...this.state.templates];

        // TODO disable form / loading state !

        request('templates', 'create', 'POST', values)
        .then(res => {
            const newId = res.data;
            request('templates', 'getOne', 'GET', {id: newId})
            .then(res => {
                const newTemplate = res.data;
                templates = [newTemplate].concat(templates);
                self.setState({ templates });
                self.handleCloseNewForm();
            })
            .catch(error => {
                console.error(error);
            })
        })
        .catch(error => {
            console.error(error);
        })

        e.preventDefault();
    }

    handleOpenEditForm(e, template) {
        this.setState({
            editFormOpen: true,
            editTemplateValues: template
        })
        e.preventDefault()
    }

    handleCloseEditForm() {
        this.setState({ editFormOpen: false })
    }

    handleSaveEditForm(e) {
        const self = this;
        const values = this.formRef.current.getPreparedValues();
        console.log('Update Template', values);

        const tmlId = values.id;
        const templates = [...this.state.templates];
        const formErrors = [...this.state.formErrors];

        request('templates', 'update', 'PUT', values)
        .then(result => {

            // we need to update the state heir with remove job
            // otherwise the job-entry component will not update!
            const i = templates.findIndex(j => j.id === tmlId);
            templates.splice(i, 1);
            self.setState({ templates });

            request('templates', 'getOne', 'GET', {id: tmlId})
            .then(result => {
                templates.splice(i, 0, result.data);
                self.setState({ templates });
                self.handleCloseEditForm();
            })
            .catch(error => {
                formErrors.push(error);
                self.setState({ formErrors });
            })
        })
        .catch(error => {
            formErrors.push(error);
            self.setState({ formErrors });
        })

        e.preventDefault();
    }

    handleDeleteTemplate(e, tmlId) {
        const templates = [...this.state.templates];

        request('templates', 'remove', 'DELETE', {id: tmlId})
        .then(result => {

            const i = templates.findIndex(j => j.id === tmlId);
            templates.splice(i, 1);
            this.setState({ templates });
            this.handleCloseEditForm();

        })
        .catch(error => {
            // formErrors.push(error);
            // self.setState({ formErrors });
            console.log(error);
        })

        e.preventDefault();
    }

    render(){
        const templates = this.state.templates;

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
                    New Template
                </Modal.Header>
                <Modal.Content scrolling>
                    <form className="ui form jobs-form" onSubmit={this.handleSaveNewForm}>
                        <TemplatesForm ref={this.formRef}
                            allow_childJobs={true}
                            values={{}}
                            errors={this.state.formErrors}
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
                    Edit Template
                </Modal.Header>
                <Modal.Content scrolling>
                    <form className="ui form jobs-form" onSubmit={this.handleSaveEditForm}>
                        <TemplatesForm ref={this.formRef}
                            allow_childJobs={true}
                            values={this.state.editTemplateValues}
                            errors={this.state.formErrors}
                        />
                    </form>
                </Modal.Content>
            </Modal>
        );

        return(
            <div className="">

                {modalFormNew}
                {modalFormEdit}

                <Route path="/admin/templates" exact={true} render={(props) => {
                    return (
                    <div>
                        <div>
                            <Link className="ui button" to={`/admin/templates/new`} onClick={this.handleOpenNewForm}>New Template</Link>
                        </div>
                        <table className="ui selectable celled table">
                            <thead>
                                <tr>
                                <th></th>
                                <th>Title</th>
                                <th>Users Required</th>
                                <th>Users Subscribed</th>
                                <th>Tasks</th>
                            </tr></thead>
                            {templates.map((template, jidx) => {
                                return (
                                    <Component_TemplatesEntry key={template.id}
                                        template={template}
                                        handleOpenEditForm={this.handleOpenEditForm}
                                        handleDeleteTemplate={this.handleDeleteTemplate}
                                    />
                                );
                            })}
                        </table>
                    </div>
                )}} />

                <Route path="/admin/templates/new" render={(props) => {
                    return (
                        <form className="ui form jobs-form" onSubmit={this.handleSaveNewForm}>
                            <button className="ui button " onClick={this.handleCloseNewForm}>Cancel</button>
                            <button className="ui button primary" type="submit" onClick={this.handleSaveNewForm}>Save</button>
                            <TemplatesForm ref={this.formRef}
                                allow_childJobs={true}
                                values={{}}
                                errors={this.state.formErrors}
                            />
                        </form>
                    );
                }} />

                <Route path="/admin/templates/edit/:id" render={(props) => {
                    const tmlId = props.match.params.id;
                    const template = this.state.templates.find(el => {
                        return el.id == tmlId;
                    })

                    if (typeof template === "undefined") {
                        return (
                            <form className="ui loading form">
                                <TemplatesForm ref={this.formRef} allow_childJobs={true} />
                            </form>
                        );
                    }

                    return (
                        <form className="ui form jobs-form" onSubmit={this.handleSaveEditForm}>
                            <div className="field">
                                <button className="ui button primary" type="submit" onClick={this.handleSaveEditForm}>Apply</button>
                                <button className="ui button " onClick={this.handleCloseNewForm}>Cancel</button>
                            </div>
                            <TemplatesForm ref={this.formRef} allow_childJobs={true} values={template} />
                        </form>
                    );
                }} />


            </div>
        );
  }
}

export default Page_Templates;