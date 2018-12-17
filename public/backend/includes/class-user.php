<?php

class User {

    private $user = [];

    private $roles = [
        'admin', 'author', 'authenticated', 'any'
    ];

    public function __construct($user) {
        $this->user = $user;
    }

    public function getRoles() {
        return $this->roles;
    }

    public function can($user = [], $action = '', $object = '') {
        if ($user->isAdmin) {
            return true;
        }
        return false;
    }

    public function isAdmin() {
        return $this->user['role'] == 'admin';
    }

    public function isAuthor() {
        return $this->user['role'] == 'author';
    }

    public function isAuthenticated() {
        return $this->user['role'] == 'authenticated';
    }

    public function isAny() {
        return $this->user['role'] == 'any';
    }
}

?>