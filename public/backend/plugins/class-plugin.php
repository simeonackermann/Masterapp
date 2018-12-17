<?php

class Plugin {

    private $app = null;

    public function __construct($app) {
        $this->app = $app;
    }

    protected function getApp() {
        return $this->app;
    }

    protected function getDb() {
        return $this->getApp()->getDb();
    }

}

?>