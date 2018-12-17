<?php

require ABSPATH . '/vendor/autoload.php';

// require ABSPATH . '/api/class-api.php';
require ABSPATH . '/includes/class-router.php';
require ABSPATH . '/plugins/class-plugin.php';
require ABSPATH . '/includes/class-api-controler.php';
require ABSPATH . '/includes/class-adapter.php';
require ABSPATH . '/includes/class-cronjob.php';
require ABSPATH . '/includes/class-activity.php';


class App {

    /**
     * Database handler
     */
    private $db = null;

    /**
     * Routing controler/handler
     */
    private $router = null;

    /**
     * Api controler
     */
    private $api = null;

    /**
     * Cronjob handler
     */
    private $cronjob = null;

    /**
     * Activity handler
     */
    private $activity = null;

    /**
     * Array of enabled plugins
     */
    private $plugins = [];

    /**
     * Array of enabled adapters
     */
    private $adapters = [];



    // private $settings = [];

    function __construct() {

        $this->db = new MysqliDb ([
            'host' => DB_HOST,
            'username' => DB_USER,
            'password' => DB_PASSWORD,
            'db'=> DB_NAME,
            'charset' => DB_CHARSET
        ]);

        $this->activity = new Activity($this);

        $this->plugins = $this->_getPlugins();
        foreach ($this->plugins as $key => $plugin) {
            // TODO may do not enable more than once
            $plugin->enable();
        }

        $this->adapters = $this->_getAdapters();
        foreach ($this->adapters as $key => $adapter) {
            // TODO may do not enable more than once
            $adapter->enable();
        }

        $this->api = new Api_Controler($this);

        $this->router = new Router($this);

        $this->cronjob = new Cronjob($this);

        // $this->settings = [
        //     'frontend' => [
        //         'job' => [
        //             'allow_child_job' => true,
        //         ],
        //         'child_jobs' => [
        //             'show_date' => false,
        //         ]
        //     ]
        // ];

    }

    public function init() {

        header("Access-Control-Allow-Origin: *");
        // header("Access-Control-Content-Type: application/json");
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, X-Access-Token, Content-Type, Accept");
        header("Access-Control-Allow-Methods: OPTIONS, GET, POST, PUT, DELETE");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            // TODO may return route config (see router)
            return;
        }

        foreach ($this->plugins as $key => $plugin) {
            $plugin->init();
        }

        foreach ($this->adapters as $key => $adapter) {
            $adapter->init();
        }

        $this->cronjob->mayExecAll();

        // TODO handle direct access on index.php
        $this->router->execRoute();

    }

    public function getDb() {
        return $this->db;
    }

    public function getRouter() {
        return $this->router;
    }



    // public function getSettings() {
    //     return $this->settings;
    // }


    public function install() {
        require( ABSPATH . '/includes/install.php' );
        install($this);
    }

    public function getPlugins() {
        return $this->plugins;
    }

    private function _getPlugins() {
        $plugins = [];
        $pluginFiles = glob ( ABSPATH . '/plugins/*/index.php');

        foreach ($pluginFiles as $key => $pluginFile) {
            $pluginFolders = explode("/", dirname($pluginFile) );
            $pluginName = array_pop( $pluginFolders ) ;
            include_once $pluginFile;
            $pluginName = "Plugin_" . $pluginName;
            if (!class_exists($pluginName)) {
                die("Plugin-Class ${pluginName} not exists");
            }
            $plugin = new $pluginName($this);

            if ($plugin->isEnabled()) {
                $plugins[] = $plugin;
            }
        }
        return $plugins;
    }

    private function _getAdapters() {
        $adapters = [];
        $adapterFiles = glob ( ABSPATH . '/includes/adapter/*/index.php');

        foreach ($adapterFiles as $key => $adapterFile) {
            $adapterFolders = explode("/", dirname($adapterFile) );
            $adapterName = array_pop( $adapterFolders ) ;
            include_once $adapterFile;
            $adapterName = "Adapter_" . $adapterName;
            if (!class_exists($adapterName)) {
                die("Adapter-Class ${adapterName} not exists");
            }
            $adapter = new $adapterName($this);

            if ($adapter->isEnabled()) {
                $adapters[] = $adapter;
            }
        }

        return $adapters;
    }

    public function getApi() {
        return $this->api;
    }

    public function getCronjob() {
        return $this->cronjob;
    }

    public function getActivity() {
        return $this->activity;
    }

}

?>