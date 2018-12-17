<?php

$tables = [];

// v1.0
/*
$tables['Events'] = 'CREATE TABLE IF NOT EXISTS Events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(250) NOT NULL,
    description VARCHAR(250),
    created_at TIMESTAMP,
    creator INT UNSIGNED,
    jobs VARCHAR(250)
)';

$tables['Users'] = 'CREATE TABLE IF NOT EXISTS Users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
)';

$tables['Jobs'] = 'CREATE TABLE IF NOT EXISTS Jobs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(250) NOT NULL,
    users_required INT UNSIGNED,
    users_subscribed VARCHAR(250)
)';
*/

/*$tables['RelationEventJobs'] = 'CREATE TABLE IF NOT EXISTS RelationEventJobs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id INT UNSIGNED,
    job_id INT UNSIGNED
)';*/

// v.2.0

$tables['markets'] = 'CREATE TABLE IF NOT EXISTS markets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL
)';

// TODO may column "type"s value is "job" or "template"
$tables['jobs'] = 'CREATE TABLE IF NOT EXISTS jobs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NULL DEFAULT "parent",
    state VARCHAR(20) NULL DEFAULT "private",
    date_start DATETIME NULL,
    date_end DATETIME NULL,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT NULL,
    market INT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creator INT UNSIGNED NULL,
    users_required INT UNSIGNED NULL,
    users_subscribed LONGTEXT NULL
)';

$tables['job has job'] = 'CREATE TABLE IF NOT EXISTS job_has_job (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_job_id INT UNSIGNED NOT NULL,
    child_job_id INT UNSIGNED NOT NULL,
    job_order INT NULL
)';

// $tables['templates'] = 'CREATE TABLE IF NOT EXISTS templates (
//     id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
//     job_id INT UNSIGNED NOT NULL,
//     name VARCHAR(255) NOT NULL,
//     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
// )';

$tables['users'] = 'CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(65) NOT NULL,
    fullname VARCHAR(255) NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT "authenticated",
    password VARCHAR(255)
)';

$tables['additionals'] = 'CREATE TABLE IF NOT EXISTS additionals (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20),
    value VARCHAR(65),
    meta LONGTEXT
)';

$tables['job has add'] = 'CREATE TABLE IF NOT EXISTS job_has_add (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    job_id INT UNSIGNED,
    add_id INT UNSIGNED
)';

$tables['system'] = 'CREATE TABLE IF NOT EXISTS system (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(65),
    value LONGTEXT
)';

$tables['job_meta'] = 'CREATE TABLE IF NOT EXISTS job_meta (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    job_id INT UNSIGNED NOT NULL,
    meta_key VARCHAR(65) NOT NULL,
    meta_value LONGTEXT
)';

$tables['activity'] = 'CREATE TABLE IF NOT EXISTS activity (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    date_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user INT UNSIGNED NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id INT UNSIGNED,
    message VARCHAR(255)
)';

?>