<?php

class Api_Users extends Api {

    protected $routes = [
        [
            'path' => 'create',
            'method' => 'POST',
            'params' => ['name', 'email', 'role', 'password', '?fullname'],
            'handler' => 'createUser',
            'config' => [
                'auth' => 'isAuthor',
            ]
        ]
    ];

    public function createUser($params = [], string $name = '', string $email = '', string $role = '', string $password = '') {
        $db = $this->getDb();

        // TODO test params (role, mail, password strength...)

        if (empty($name) || empty($email) || empty($role) || empty($password)) {
            throw new Exception("Empty name, mail, role or password given");
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid mail");
        }

        $data = [
            "name" => $name,
            "email" => $email,
            "role" => $role
        ];

        if (isset($params["fullname"])) {
            $data["fullname"] = $params["fullname"];
        }

        $data["password"] = password_hash($password, PASSWORD_DEFAULT );

        $id = $db->insert ('users', $data);
        if (!$id) {
            throw new Exception($db->getLastError());
        }

        return $id;
    }
}

?>