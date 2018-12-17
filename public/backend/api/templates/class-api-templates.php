<?php

class Api_Templates extends Api {

    protected $routes = [
        [
            'path' => 'get',
            'method' => 'GET',
            'params' => ['?order_by', '?order', '?limit'],
            'handler' => 'getTmls',
            'config' => [ ]
        ],
        [
            'path' => 'getOne',
            'method' => 'GET',
            'params' => ['id'],
            'handler' => 'getOneTml',
            'config' => []
        ],
        [
            'path' => 'create',
            'method' => 'POST',
            'params' => ['title', '?type', '?description', '?users_required', '?users_subscribed', '?has_jobs', '?has_additionals'],
            'handler' => 'createTml',
            'config' => [ ]
        ],
        [
            'path' => 'addTmlHasTml',
            'method' => 'POST',
            'params' => ['tml', 'child_tml'],
            'handler' => 'addTmlHasTml',
            'config' => []
        ],
        [
            'path' => 'update',
            'method' => 'PUT',
            'params' => ['id', 'title', '?description', '?users_required', '?users_subscribed', '?has_jobs', '?has_additionals'],
            'handler' => 'updateTml',
            'config' => []
        ],
        [
            'path' => 'remove',
            'method' => 'DELETE',
            'params' => ['id'],
            'handler' => 'removeTml'
        ],
    ];

    public function getTmls($params = []) {
        $db = $this->getDb();
        $jobsApi = $this->getApi("jobs");
        $params = array_merge([
            "type" => "template-parent",
            "state" => [NULL, "IS"]
        ], $params);
        if (!isset($params["order_by"])) {
            $params["order_by"] = "modified_at";
        }
        return $jobsApi->getJobs($params);
    }

    public function getOneTml(int $id = null) {
        $db = $this->getDb();
        $db->where("(type = ? OR type = ? )", ["template-parent", "template-child"]);
        $jobsApi = $this->getApi("jobs");
        return $jobsApi->getOneJob($id);
    }

    public function createTml($params = [], string $title = '') {
        $db = $this->getDb();
        $params = $this->getIntersectParamsForRoute(["path" => "create", "method" => "POST"], $params);

        $data = [
            "state" => NULL,
            "title" => $title
        ];

        foreach ($params as $key => $value) {
            if ($key == "has_jobs" || $key == "has_additionals") {
                continue;
            }
            if ($key == "users_subscribed" && !is_string($value)) {
                $value = json_decode($value, true);
            }
            if ($value != null) {
                $data[$key] = $value;
            }
        }

        //  TODO check if may given type is valid (template-parent or template-child)
        if (!isset($data["type"])) {
            $data["type"] = "template-parent";
        }

        $id = $db->insert ('jobs', $data);
        if (!$id) {
            throw new Exception($db->getLastError());
        }

        if (isset($params['has_jobs']) && is_array($params['has_jobs'])) {
            $childIds = [];
            foreach($params['has_jobs'] as $key => $childJob) {
                $childIds[] = $this->createChildTml($childJob);
            }
            foreach($childIds as $key => $childId) {
                $this->addTmlHasTml($id, $childId);
            }
        }

        return $id;
    }

    private function createChildTml($params = []) {
        if (isset($params['has_jobs'])) {
            unset($params['has_jobs']);
        }
        $params['type'] = 'template-child';
        return $this->createTml($params, $params['title']);
    }

    public function addTmlHasTml(int $tml = null, int $childTml = null) {
        $db = $this->getDb();
        $id = $db->insert ('job_has_job', [
            'parent_job_id' => $tml,
            'child_job_id' => $childTml,
        ]);
        if (!$id) {
            throw new Exception($db->getLastError());
        }
        return $id;
    }

    public function updateTml($params = [], int $id = null, string $title = ''){
        $db = $this->getDb();

        $params = $this->getIntersectParamsForRoute(["path" => "update", "method" => "PUT"], $params);
        $data = [
            "state" => NULL,
            "title" => $title
        ];

        // TODO add commit/rollback

        foreach ($params as $key => $value) {
            if ($key == "has_jobs" || $key == "has_additionals") {
                continue;
            }
            if ($key == "users_subscribed" && !is_string($value)) {
                $value = json_decode($value, true);
            }
            if ($value != null) {
                $data[$key] = $value;
            }
        }

        $db->where('id', $id);
        if (!$db->update ('jobs', $data)) {
            throw new Exception($db->getLastError());
        }

        // TODO add try/catch

        if (isset($params['has_jobs']) && is_array($params['has_jobs'])) {
            $childIds = [];
            foreach($params['has_jobs'] as $key => $childJob) {
                // create or update child job
                $existing = !isset($childJob['id']) ? null : $this->getOneTml($childJob['id']);
                if ($existing !== null) {
                    $this->updateTml($childJob, $childJob['id'], $childJob['title']);
                } else {
                    $childIds[] = $this->createChildTml($childJob);
                }
            }
            foreach($childIds as $key => $childId) {
                $this->addTmlHasTml($id, $childId);
            }
        }

        // TODO may cleanup old existing job_has_job relations

        return true;
    }

    public function removeTml(int $id = null) {
        $db = $this->getDb();

        $db->where('id', $id);
        $db->where("(type = ? OR type = ? )", ["template-parent", "template-child"]); // ensure that it does not delete a job

        if (!$db->delete('jobs')) {
            throw new Exception($db->getLastError());
        }

        $db->where('parent_job_id', $id);
        if (!$db->delete('job_has_job')) {
            throw new Exception($db->getLastError());
        }

        $db->where('job_id', $id);
        if (!$db->delete('job_has_add')) {
            throw new Exception($db->getLastError());
        }

        $db->where('job_id', $id);
        if (!$db->delete('job_meta')) {
            throw new Exception($db->getLastError());
        }

        return true;
    }

}

?>