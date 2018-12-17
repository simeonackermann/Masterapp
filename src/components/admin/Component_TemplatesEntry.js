import React, { Component} from "react";
import { Link, withRouter } from "react-router-dom";
import moment from 'moment';

class Component_TemplatesEntry extends Component{

    constructor(props) {
        super(props);

        this.handleOpenEditForm = props.handleOpenEditForm;
        this.handleDeleteTemplate = props.handleDeleteTemplate;
    }

    componentDidMount() {
    }

    render(){
        const template = this.props.template;
        const childTemplates = template.has_jobs || [];
        return(
            <tbody>
                <tr>
                    <td><a href="#" onClick={(e) => this.handleDeleteTemplate(e, template.id)}><i className="trash icon red"></i></a></td>
                    <td className="selectable">
                        <Link to={`/admin/templates/edit/${template.id}`} onClick={(e) => this.handleOpenEditForm(e, template)}>{template.title}</Link>
                    </td>
                    <td >{template.users_required}</td>
                    <td >
                        {template.users_subscribed.map((user, uidx) => {
                            return (
                                <div className="" key={uidx}>
                                    {user.nick}
                                </div>
                            );
                        })}
                    </td>
                    <td >
                        {childTemplates.map((childTemplate, cjidx) => {
                            return (
                                <div key={cjidx}>
                                    {childTemplate.title} ({template.users_subscribed.length} / {childTemplate.users_required}):
                                    {' '}
                                    {childTemplate.users_subscribed.map((user, uidx) => {
                                        return (
                                            <span className="" key={uidx}>
                                                {user.nick},
                                                {' '}
                                            </span>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </td>
                </tr>
            </tbody>
        );
  }
}

export default Component_TemplatesEntry;