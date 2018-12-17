<?php

class Activity {

    private $app = null;

    public function __construct($app) {
        $this->app = $app;
    }

    public function get($params = []) {
        $db = $this->app->getDb();

        foreach ($params as $key => $value) {
            $db->where($key, $value);
        }

        $activities = $db->get("activity");

        if (!empty($activities)) {
            foreach ($activities as $key => $activity) {
                $db->where("id", $activity["user"]);
                $activities[$key]["user"] = $db->getOne("users", "id, name, fullname");
            }
        }

        return $activities;
    }

    public function add(string $targetType = "", int $targetId = null, string $message = "") {
        $db = $this->app->getDb();

        $user = $this->app->getRouter()->getUser();
        $userId = $user !== null ? $user->id : null;

        $data = [
            "user" => $userId,
            "target_type" => $targetType,
            "target_id" => $targetId,
            "message" => $message
        ];

        $id = $db->insert ('activity', $data);
        if (!$id) {
            throw new Exception($db->getLastError());
        }

        return $id;

    }

}


?>