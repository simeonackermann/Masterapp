let errorHandler = null;
const errors = [];

export const setErrorHandler = (handler) => {
    errorHandler = handler;
}

export const getErrors = () => {
    return errors;
}

// export const addError = (type = 'Error', title = '', message = '', data = {}) => {
//     errors.push({
//         type, title, message, data
//     });
// }

export const addError = (error = null) => {

    console.error(error);

    errors.push(error);
}

export const alertError = (error = null) => {

    // if (typeof error === "string") {
    //     error = {message: error}
    // } else if (typeof error === "object") {
    //     if ("data" in error && "status" in error && "statusText" in error) {
    //         error = {message: `${data} ${status} ${statusText}`}
    //     } else {
    //         error = {message: JSON.stringify(error)}
    //     }
    // } else {
    //     error = {message: JSON.stringify(error)}
    // }

    error = {message: JSON.stringify(error)}

    addError(error);

    if (errorHandler !== null) {
        errorHandler(error);
    }
}
