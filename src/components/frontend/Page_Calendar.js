import React, { Component} from "react";
import moment from 'moment';

import {request} from '../../utils/helper';

class JobsList extends Component{

    constructor(props) {
        super(props);
        this.state = {
            jobs: [],

            currentView: '2weeks',

        };
    }

    componentDidMount() {
        const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
        const endOfMonth   = moment().endOf('month').format('YYYY-MM-DD');

        request('jobs', 'get', 'get', {state: 'public', from_date: startOfMonth, to_date: endOfMonth})
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

        const day = (date, jobs) => {
            return (<div class="two wide column jobs-calendar-day">eins</div>);
        }

        const week = () => {
            return(
                <div>{day()}</div>
            );
        }



        return(
            <div className="jobs-calendar-wrapper">
                <h2>{moment().format("MMMM")}</h2>

                <div class="ui grid jobs-calendar">
                    <div class="two wide column">eins</div>
                    <div class="two wide column">zwei</div>
                    <div class="two wide column">drei</div>
                    <div class="two wide column">view</div>
                    <div class="two wide column">fünf</div>
                    <div class="two wide column">sechs</div>
                    <div class="two wide column">sieben</div>
                </div>

                 <div id="calendar"></div>

            </div>
        );
  }
}

export default JobsList;