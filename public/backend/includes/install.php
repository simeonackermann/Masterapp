<?php

// conn -> query: LOAD DATA INFILE '[the .sql file]' INTO TABLE [whatever]




function install($app) {
    require( ABSPATH . '/includes/db-schema.php' );

    $exampleData = [];

    /*
    v1.0
    $exampleData['Job: Einlass'] = "INSERT INTO Jobs (title, users_required, users_subscribed)
    VALUES ('Einlass', 2, '[{}]');";

    $exampleData['Event-1'] = "INSERT INTO Events (title, jobs)
    VALUES ('Konzert XYZ', '{\"job_id\": 1}');";
    */

    // v2.0
    $exampleData['Job'] = "INSERT INTO Jobs (title)
    VALUES ('Konzert XYZ');";

    /*var_dump($app);
    var_dump($tables);
    var_dump($exampleData);*/

    foreach ($tables as $key => $table) {
        echo "Creating Table " . $key;

        try {
            $app->getDB()->query($table);
            echo " OK";
        } catch(Exception $e) {
            echo " failed. " . $e->getMessage();
        }

        echo "<br />";
    }

    foreach ($exampleData as $key => $data) {

    }

}

?>