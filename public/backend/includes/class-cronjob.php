<?php

class Cronjob {

    private $app = null;

    private $jobs = [];

    public function __construct($app) {
        $this->app = $app;

        // TODO use cronjtab interpreter
        // https://github.com/mtdowling/cron-expression
    }

    public function mayExecAll() {
        $time = time();

        foreach ($this->jobs as $key => $job) {
            if ($time - $job["period"] < $job["lastExec"]) {
                continue;
            }
            // TODO call it as async background job
            // https://github.com/asyncphp/doorman
            call_user_func($job["handler"]);
            $this->updateLastExec($job["id"], $time);

        }
    }

    public function register(callable $handler = null, $period = 0) {
        // if not exists in DB -> set lastExec time = 0
        // add id+handler to this

        // var_dump($handler);

        // call_user_func($handler);

        // var_dump(  is_callable($handler) );

        if (!is_callable($handler)) {
            ob_start();
            var_dump($handler);
            $handlerStr = ob_get_contents();
            ob_end_clean();
            throw new Exception("Given cronjob handler is no callable. Handler: " . $handlerStr);
        }

        $id = get_class($handler[0]) . "." . $handler[1];
        $lastExec = $this->getLastExec($id);

        if (!isset($lastExec)) {
            $db = $this->app->getDb();
            $data = [
                "name" => "cronjob-" . $id . "-last-update",
                "value" => 0
            ];
            if (!$db->insert ('system', $data)) {
                throw new Exception($db->getLastError());
            }
            $lastExec = 0;
        }

        $this->jobs[] = [
            "id" => $id,
            "handler" => $handler,
            "period" => $period,
            "lastExec" => $lastExec
        ];
    }

    private function getLastExec($jobId) {
        $db = $this->app->getDb();

        $db->where ("name", "cronjob-" . $jobId . "-last-update");
        $lastUpdate = $db->getOne ("system");

        return $lastUpdate["value"];
    }

    private function updateLastExec($jobId, $value = 0) {
        $db = $this->app->getDb();
        $value = [
            'value' => $value
        ];
        $db->where ("name", "cronjob-" . $jobId . "-last-update");
        if (!$db->update ('system', $value)) {
            throw new Exception($db->getLastError());
        }
        return true;
    }

}

?>