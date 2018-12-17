<?php

class Api_Jobs extends Api {

    protected $routes = [
        // [
        //     'path' => 'getPublic',
        //     'method' => 'GET',
        //     'params' => ['?order_by', '?order', '?limit'],
        //     'handler' => 'getPublicJobs',
        //     'config' => [
        //         'auth' => 'any'
        //     ]
        // ],
        [
            'path' => 'get',
            'method' => 'GET',
            'params' => ['?type', '?state', '?from_id', '?to_id', '?from_date', '?to_date', '?order_by', '?order', '?limit'],
            'handler' => 'getJobs',
            'config' => [
                'auth' => 'isAuthenticated', // isAuthenticated / isAuthor / isAdmin
            ]
        ],
        [
            'path' => 'getOne',
            'method' => 'GET',
            'params' => ['id'],
            'handler' => 'getOneJob',
            'config' => [
                'auth' => 'isAuthenticated',
            ]
        ],
        [
            'path' => 'create',
            'method' => 'POST',      // TODO title is required param
            'params' => ['?type', '?state', '?title', '?description', '?date_start', '?date_end', '?users_required', '?users_subscribed', '?has_jobs'],
            'handler' => 'createJob',
            'config' => [
                'auth' => 'isAuthor',
            ]
        ],
        [
            'path' => 'addJobHasJob',
            'method' => 'POST',
            'params' => ['job', 'child_job'],
            'handler' => 'addJobHasJob',
            'config' => [
                'auth' => 'isAuthor',
            ]
        ],
        [
            'path' => 'update',
            'method' => 'PUT',         // TODO title is required param
            'params' => ['id', '?type', '?state', '?title', '?description', '?date_start', '?date_end', '?users_required', '?users_subscribed', '?has_jobs'],
            'handler' => 'updateJob',
            'config' => [
                'auth' => 'isAuthor',
            ]
        ],
        [
            'path' => 'delete',
            'method' => 'DELETE',
            'params' => ['id'],
            'handler' => 'deleteJob',
            'config' => [
                'auth' => 'isAuthor',
            ]
        ],
        [
            'path' => 'addUser',
            'method' => 'POST',
            'params' => ['id', 'user'],
            'handler' => 'addUser',
            'config' => [
                'auth' => 'isAuthenticated',
            ]
        ],
        [
            'path' => 'removeUser',
            'method' => 'DELETE',
            'params' => ['id', 'user'],
            'handler' => 'removeUser',
            'config' => [
                'auth' => 'isAuthenticated',
            ]
        ],
        [
            'path' => 'renameUser',
            'method' => 'DELETE',
            'params' => ['id', 'userId', 'newNick'],
            'handler' => 'renameUser',
            'config' => [
                'auth' => 'isAuthenticated',
            ]
        ],
        [
            'path' => 'activity',
            'method' => 'GET',
            'params' => ['id'],
            'handler' => 'getJobActivity',
            'config' => [
                'auth' => 'isAuthenticated',
            ]
        ],
    ];

    public function getJobs($params = []) {
        $db = $this->getDb();
        $jobs = [];

        if (isset($params['type'])) {
            $db->where("type", $params['type']);
        } else {
            $db->where("type", "parent");
        }
        if (isset($params['state'])) {
            if (is_string($params['state'])) {
                $db->where("state", $params['state']);
            }
            else if (is_array($params['state'])) {
                $db->where("state", $params['state'][0], $params['state'][1]);
            }
        } else {
            $db->where("state", "deleted", "!=");
        }
        if (isset($params['from_date'])) {
            $db->where("date_start", $params['from_date'], ">=");
        }
        if (isset($params['to_date'])) {
            $db->where("date_start", $params['to_date'], "<=");
        }
        $db->orderBy(
            isset($params['order_by']) ? $db->escape($params['order_by']) : "case when date_start is null then 0 else 1 end, date_start",
            isset($params['order']) ? $params['order'] : "asc"
        );
        $limit = isset($params['limit']) ? isset($params['limit']) : null;
        $jobs = $db->get("jobs", $limit);

        foreach ($jobs as $key => $job) {
            $jobs[$key] = $this->_buildJobResult($job, $params);
        }

        return $jobs;
    }

    public function getOneJob(int $id = null) {
        $db = $this->getDb();

        $db->where('id', $id);
        $job = $db->getOne("jobs");

        if ($job == null) { return null; }

        $job = $this->_buildJobResult($job);

        return $job;
    }

    private function getChildJobs(int $parentId = null, $params = []) {
        $db = $this->getDb();

        $hasJobs = $db->subQuery();
        $hasJobs->where("parent_job_id", $parentId);
        $hasJobs->get('job_has_job', null, 'child_job_id');

        $db->where("id", $hasJobs, 'in');
        $db->orderBy(
            isset($params['order_by']) ? $db->escape($params['order_by']) : "case when date_start is null then 0 else 1 end, date_start",
            isset($params['order']) ? $params['order'] : "asc"
        );
        $childs = $db->get("jobs");

        foreach ($childs as $key => $job) {
            $childs[$key] = $this->_buildJobResult($job, $params);
        }

        return $childs;
    }

    private function _buildJobResult(array $job = null, $params = []) {
        $db = $this->getDb();

        if ($job['creator'] !== null && !empty($job['creator'])) {
            $db->where('id', $job['creator']);
            $job['creator'] = $db->getOne("users", "id, name, fullname");
        }
        $job['users_subscribed'] = $job['users_subscribed'] ? json_decode($job['users_subscribed'], true) : [];

        $job['has_jobs'] = $this->getChildJobs($job['id'], $params);
        $job['has_additionals'] = $this->getAdditionals($job['id']);

        // TODO may add additionals as own fields, eg jobs -> category -> ...
        // $jobAdds = $db->subQuery();
        // $jobAdds->where("job_id", $job['id'], "=");
        // $jobAdds->get('job_has_add', null, 'add_id');

        // $db->where("id", $jobAdds, 'in');
        // $db->orderBy("type, value");
        // $adds = $db->get("additionals");
        // foreach ($adds as $key => $add) {
        //     # code...
        // }

        return $job;
    }

    private function getAdditionals(int $id = null) {
        $db = $this->getDb();

        $jobAdds = $db->subQuery();
        $jobAdds->where("job_id", $id, "=");
        $jobAdds->get('job_has_add', null, 'add_id');

        $db->where("id", $jobAdds, 'in');
        $db->orderBy("type, value");
        $adds = $db->get("additionals");

        return $adds;
    }

    public function createJob($params = []) {
        $db = $this->getDb();
        $params = $this->getIntersectParamsForRoute(["path" => "create", "method" => "POST"], $params);
        $data = [];

        // TODO may create commit and rollback on failure

        // TODO may check params type = parent|child, state = public|private|deleted ... ?!

        // TODO add 'creator' user from access-token

        // TODO add 'has_additionals'

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

        if (!isset($data['type'])) {
            $data['type'] = "parent";
        }

        $id = $db->insert ('jobs', $data);
        if (!$id) {
            throw new Exception($db->getLastError());
        }

        // may add child jobs
        // and job_has_job relations
        // TODO check if job has job is allowed! (also for the child job)
        if (isset($params['has_jobs']) && is_array($params['has_jobs'])) {
            $childIds = [];
            foreach($params['has_jobs'] as $key => $childJob) {
                $childIds[] = $this->createChildJob($childJob);
            }
            foreach($childIds as $key => $childId) {
                $this->addJobHasJob($id, $childId);
            }
        }

        return $id;
    }

    public function updateJob($params = [], int $id = null){
        $db = $this->getDb();
        $data = [];
        $params = $this->getIntersectParamsForRoute(["path" => "update", "method" => "PUT"], $params);

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
                // TODO may check if given childJob id is not a template
                // TODO could be done with mysql replace()
                // create or update child job
                $existing = !isset($childJob['id']) ? null : $this->getOneJob($childJob['id']);
                if ($existing !== null) {
                    $this->updateJob($childJob, $childJob['id']);
                } else {
                    $childIds[] = $this->createChildJob($childJob);
                }
            }
            foreach($childIds as $key => $childId) {
                $this->addJobHasJob($id, $childId);
            }
        }

        // TODO may cleanup old existing job_has_job relations

        return true;
    }

    private function createChildJob($params = []) {
        // TODO check if childjob may can hav child jobs..
        // workaround: simply remove any
        if (isset($params['has_jobs'])) {
            unset($params['has_jobs']);
        }
        $params['type'] = 'child';
        return $this->createJob($params);
    }

    public function addJobHasJob(int $job = null, int $childJob = null) {
        $db = $this->getDb();
        $id = $db->insert ('job_has_job', [
            'parent_job_id' => $job,
            'child_job_id' => $childJob,
        ]);
        if (!$id) {
            throw new Exception($db->getLastError());
        }
        return $id;
    }

    public function deleteJob(int $id = null) {
        $db = $this->getDb();

        $db->where('id', $id);

        if (!$db->delete('jobs')) {
            throw new Exception($db->getLastError());
        }

        // TODO may remove job_has_job relations and child jobs (only if not somewhere else required)

        return true;
    }

    private function deleteJobHasJob(int $parent_job = null, int $child_job = null) {
        // TODO
    }

    public function addUser(int $jobId = null, string $userNick = '') {
        $db = $this->getDb();

        $job = $this->getOneJob($jobId);

        if ($job == null) {
            throw new Exception("Job not found");
        }

        $job['users_subscribed'][] = ['nick' => $userNick];
        $data = [
            'users_subscribed' => json_encode($job['users_subscribed'])
        ];

        $db->where('id', $jobId);
        if (!$db->update ('jobs', $data)) {
            throw new Exception($db->getLastError());
        }

        $activity = $this->getApp()->getActivity();
        $activity->add("job", $jobId, "Add subscriber $userNick");

        return true;
    }

    public function removeUser(int $jobId = null, int $userId = null) {
        $db = $this->getDb();

        $job = $this->getOneJob($jobId);

        if ($job == null) {
            throw new Exception("Job not found");
        }
        if (!isset($job['users_subscribed'][$userId])) {
            throw new Exception('User not found');
        }

        $userNick = $job['users_subscribed'][$userId]['nick'];
        array_splice($job['users_subscribed'], $userId, 1);
        $data = [
            'users_subscribed' => json_encode($job['users_subscribed'])
        ];

        $db->where('id', $jobId);
        if (!$db->update ('jobs', $data)) {
            throw new Exception($db->getLastError());
        }

        $activity = $this->getApp()->getActivity();
        $activity->add("job", $jobId, "Remove subscriber $userNick");

        return true;
    }

    public function renameUser(int $jobId = null, int $userId = null, string $newUserNick = '') {
        $db = $this->getDb();

        $job = $this->getOneJob($jobId);

        if ($job == null) {
            throw new Exception("Job not found");
        }
        if (!isset($job['users_subscribed'][$userId])) {
            throw new Exception('User not found');
        }

        $oldUserNick = $job['users_subscribed'][$userId]['nick'];
        $job['users_subscribed'][$userId] = ['nick' => $newUserNick];
        $data = [
            'users_subscribed' => json_encode($job['users_subscribed'])
        ];

        $db->where('id', $jobId);
        if (!$db->update ('jobs', $data)) {
            throw new Exception($db->getLastError());
        }

        $activity = $this->getApp()->getActivity();
        $activity->add("job", $jobId, "Rename subscriber from $oldUserNick to $newUserNick");

        return true;
    }

    public function getJobActivity(int $jobId = null) {
        $db = $this->getDb();
        $acHandler = $this->getApp()->getActivity();
        $activity = [];

        $job = $this->getOneJob($jobId);

        if ($job == null) {
            throw new Exception("Job not found");
        }

        $activity = $acHandler->get([
            "target_type" => "job",
            "target_id" => $jobId
        ]);

        // TODO may get recursive child job activities
        foreach ($job['has_jobs'] as $key => $childJob) {
            $activity = $activity + $acHandler->get([
                "target_type" => "job",
                "target_id" => $childJob["id"]
            ]);
        }

        return $activity;
    }

}

?>