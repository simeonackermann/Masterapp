<?php

use \Firebase\JWT\JWT;

// - POST endpunkt "login" returns access-token, user, role

class Api_System extends Api {

    protected $routes = [
        [
            'method' => 'GET',
            'path' => 'settings',
            'params' => [],
            'handler' => 'getSettings',
            'config' => [
                'auth' => 'isAuthenticated',
            ]
        ],
        [
            'method' => 'POST',
            'path' => 'login',
            'params' => ['user', 'password'],
            'handler' => 'login'
        ],
        [
            'method' => 'POST',
            'path' => 'userInfo',
            'params' => [],
            'handler' => 'getUserInfo',
            'config' => [
                'auth' => 'isAuthenticated',
            ]
        ],
        [
            'method' => 'GET',
            'path' => 'logout',
            'params' => [],
            'handler' => 'logout'
        ],
    ];

    public function getSettings() {
        return [];
    }

    public function login($user = '', $password = '') {
        $db = $this->getDb();

        $db->where("name", $user);
        $db->orWhere("email", $user);
        $user = $db->getOne('users');

        if (null == $user)  {
            // throw new Exception("User not found");
            return false;
        }

        if (password_verify($password, $user['password'])) {
            $issuedAt = time();
            $payload = [
                'user' => $user,
                'iat' => $issuedAt, // issued at time
                // 'exp' => $issuedAt + 60 // expiration time
            ];
            $key = SECRET;

            return [
                'user' => $user['name'],
                'role' => $user['role'],
                'access_token' => JWT::encode($payload, $key, 'HS256'),
            ];
        } else {
            // throw new Exception("Wrong password");
            return false;
        }
    }

    public function getUserInfo() {
        return  $this->getApp()->getRouter()->getUser();
    }

    public function logout() {
        //return session_destroy();
        return false;
    }
}

?>