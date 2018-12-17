var config = {
    production: {
        backend: {
            host: 'http://example.org',
            port: 80,
            path: '/'
        },
    },
    development: {
        backend: {
            host: 'http://localhost',
            port: 8082,
            path: '/public/backend/api/'
        },
    },
    test: {
    }
};

module.exports = config;