<?php

require ABSPATH . '/api/class-api.php';

class Api_Controler {

    private $app = null;
    private $apis = [];

    public function __construct($app) {
        $this->app = $app;

        $this->apis = $this->_getApis();
    }

    private function _getApis() {
        $apis = [];
        $apiFiles = glob ( ABSPATH . '/api/*/class-api-*.php');

        foreach ($apiFiles as $key => $apiFile) {
            include_once $apiFile;

            $apiFolders = explode("/", dirname($apiFile) );
            $apiName = array_pop( $apiFolders ) ;
            $apiName = "Api_" . $apiName;
            if (!class_exists($apiName)) {
                die("Api-Class ${pluginName} not exists");
            }
            $api = new $apiName($this->app);

            if ($api->isEnabled()) {
                $apis[] = $api;
            }
        }
        return $apis;
    }

    public function getApis() {
        return $this->apis;
    }

    public function getApi($name = '') {
        $api = array_filter(
            $this->apis,
            function($v) use ($name) {
                return strtolower(get_class($v)) == strtolower("api_$name");
            }
        );
        return array_pop($api);
    }

}

?>