import axios from 'axios';

const env = process.env.NODE_ENV || 'production';
const config = require('../config')[env];

let accessToken = null;

export const getAccessToken = () => {
    return accessToken;
}

export const setAccessToken = (token = '') => {
    accessToken = token;
}


export const request = (model = '', path = '', type = 'get', data = {}) => {
    let url = `${config.backend.host}:${config.backend.port}${config.backend.path}${model}/?path=${path}`;
    if (type.toUpperCase() === 'GET' && Object.keys(data).length > 0) {
        for (const key in data) {
            url = `${url}&${key}=${data[key]}`;
        }
    }
    const token = getAccessToken();
    // data = token === null
    //     ? data
    //     : {...data, ...{'x-access-token': token}};

    // console.log("request data", data);

    // return axios({
    //     method: type,
    //     url: url,
    //     data: data,
    //     headers: {
    //         'x-access-token': token
    //     }
    // })

    return new Promise((resolve, reject) => {
        axios({
            method: type,
            url: url,
            data: data,
            headers: {
                'x-access-token': token
            }
        })
        .then(res => {
            resolve(res);
        })
        .catch(error => {
            console.error("Axios error", error);

            if (error.response) {
                console.log("Axios response", error.response);
                if (error.response.status == 401) {
                    // reject "unauthorized" ...
                }
                reject(error.response);

            } else if (error.request) {
                console.log("Axios request", error.request);
                reject(error.request);
            } else {
                reject(error.message);
            }
            console.log("Axios error.config", error.config);
        })
    });
}