import React, { Component} from "react";

class Page extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(<div>Caldav Settings Page as a Plugin ;) ...</div>);
    }
}


const getMenu = () => {
    return {
        // parent: 'system',
        name: 'CalDAV',
        path: '/admin/caldav',
        component: Page
    };
}

export default () => getMenu();