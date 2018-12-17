<?php

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'db');

/** MySQL database username */
define('DB_USER', 'user');

/** MySQL database password */
define('DB_PASSWORD', 'user');

/** MySQL hostname */
define('DB_HOST', 'mysql');

define('DB_CHARSET', 'utf8');

// Secret to login user sessions, if you change this, all currently logged in sessions are destroyed
define('SECRET', 'FOOBAR');

// disable api auth config (only for development)
// define('ENABLE_AUTH', false);


if ( !defined('ABSPATH') )
    define('ABSPATH', dirname(__FILE__) . '/');

?>