<?php

error_reporting(E_ALL);

require( dirname( __FILE__ ) . '/config.php' );

require( ABSPATH . '/includes/class-app.php' );

/**
 * ERROR LOGGING ...
 */
// ob_start();
// var_dump(debug_backtrace());
// $debugBacktrace = ob_get_contents();
// ob_end_clean();

// error_log("TEsfehler!" . $debugBacktrace, 0);

// class A {

//     function add(callable $fx) {
//         var_dump($fx);
//         //$fx();
//         var_dump( get_class($fx[0]) );
//         var_dump( $fx[1] );
//         return true;
//     }

// }

// class B {

//     function __construct() {
//         $b = new A();
//         $b->add([$this, 'bar']);
//     }

//     function bar() {
//         echo "bar";
//     }

// }

// $b = new B();
// $start = date('Ymd\T000000\Z');
// $end = date('Ymt\T000000\Z', strtotime("+2 months", strtotime($start)));

// echo $start;
// echo "<br />";
// echo $end;

$app = new App();
$app->init();

?>