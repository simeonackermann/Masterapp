<?php

class Plugin_Test extends Plugin {
    private $enabled = true;

    public function __construct($app) {
        parent::__construct($app);

        $this->enabled = true;
    }

    public function enable() {
        // TODO check plugin db values, may create defaults
    }

    public function isEnabled() {
        return $this->enabled;
    }

    public function init() {
        $this->do_stuff();
    }

    private function do_stuff() {
        // do some stuff ...
    }


}

?>