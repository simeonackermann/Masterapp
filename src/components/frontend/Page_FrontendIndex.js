import React, { Component} from "react";
import { Route, Link } from "react-router-dom";

import {request, getAccessToken, setAccessToken} from "../../utils/helper";

class Page_FrontendIndex extends Component{

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        // console.log('getAccessToken', getAccessToken());
    }

    render(){
        return(
            <div>
                Frontpage Dashboard ...
            </div>
        );
  }
}

export default Page_FrontendIndex;