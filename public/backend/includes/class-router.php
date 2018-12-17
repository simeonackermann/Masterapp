<?php

use \Firebase\JWT\JWT;

class Router {

    private $app = null;


    private $requestedApi = '';
    private $requestedPath = '';
    private $requestedParams = [];
    private $requestedMethod = "GET";
    private $accessToken = null;
    private $user = null;

    // private $api = null;
    private $routes = [];


    function __construct($app) {

        $this->app = $app;

        // set requested path
        if (isset($_REQUEST['path'])) {
            $this->requestedPath = $_REQUEST['path'];
        }

        // set requested method (GET; POST, ...)
        $this->requestedMethod = $_SERVER['REQUEST_METHOD'];

        // set requested api
        $dirnames = explode("/", dirname($_SERVER['REQUEST_URI']));
        $this->requestedApi = array_pop( $dirnames ) ;

        // get requested params from GET/POST/JSON Body
        $phpInput =  json_decode(file_get_contents('php://input'), true);
        $this->requestedParams = array_merge($_REQUEST, $phpInput !== null ? $phpInput : []);

        // set given x-access-token
        if (isset($_SERVER['HTTP_X_ACCESS_TOKEN'])) {
            $this->accessToken = $_SERVER['HTTP_X_ACCESS_TOKEN'];
        }
        else if (isset($this->requestedParams['x-access-token'])) {
            $this->accessToken = $this->requestedParams['x-access-token'];
        }

        if (!empty($this->accessToken)) {
            try {
                $decodedJwt = @JWT::decode($this->accessToken, SECRET, array('HS256'));
                $this->user = $decodedJwt->user;
            } catch (Exception $e) {}
        }

    }

    public function execRoute($route = []) {

        if ($this->requestedPath == "") {
            return;
        }

        $api = $this->app->getApi()->getApi($this->requestedApi);

        if ($api == null) {
            return $this->_404();
        }

        $route = $api->getRoute();

        if (empty($route)) {
            return $this->_404();
        }

        $method = $route['handler'];


        if (!method_exists($api, $method)) {
            return $this->_error(new Error("Handler does not exists"));
        }

        $paramsArr = [];
        $paramsRequired = [];

        // TODO may route requires authentication !!!
        // $this->accessToken

        // build requested params for route handler
        foreach($route['params'] as $param) {
            $required = $param[0] != "?";
            $key = $required ? $param : substr($param, 1);

            //if (isset($this->requestedParams[$key]) && !empty($this->requestedParams[$key])) {
            if (isset($this->requestedParams[$key])) {
                if ($required) {
                    $paramsRequired[] = $this->requestedParams[$key];
                } else {
                    $paramsArr[$key] = $this->requestedParams[$key];
                }
            } else {
                if ($required) {
                    header("HTTP/1.0 400 Bad Request");
                    return;
                } else {
                    $paramsArr[$key] = null;
                }
            }
        }

        if (isset($route['config']) && isset($route['config']['auth'])) {

            $routeAuth = $route['config']['auth'];

            if (empty($this->user) || !isset($this->user->role)) {
                return $this->_401();
            }

            switch ($routeAuth) {

                case 'isAuthenticated':
                    if (!in_array($this->user->role, ["user", "author", "admin"])) {
                        return $this->_401();
                    }
                    break;

                case 'isAuthor':
                    if (!in_array($this->user->role, ["author", "admin"])) {
                        return $this->_401();
                    }
                    break;

                case 'isAdmin':
                    if (!in_array($this->user->role, ["admin"])) {
                        return $this->_401();
                    }
                    break;

                default:
                    return $this->_error(new Error("Unkown route auth config " . $routeAuth));
                    break;
            }
        }

        try {
            if (count($paramsArr) == 0) {
                $results = $api->$method(...$paramsRequired);
            } else {
                $results = $api->$method($paramsArr, ...$paramsRequired);
            }
        } catch(Exception $e) {
            return $this->_error($e);
        }

        header("Content-Type: application/json; charset=UTF-8");
        echo json_encode($results);
    }

    private function _401() {
        header("HTTP/1.0 401 Unauthorized");
        return;
    }

    private function _404() {
        header("HTTP/1.0 404 Not Found");
        return;
    }

    private function _error($e) {
        header("HTTP/1.0 502 Bad Gateway");
        echo "Error: " . $e->getMessage();
        return;
    }

    public function getRequest() {
        return [
            "api" => $this->requestedApi,
            "path" => $this->requestedPath,
            "params" => $this->requestedParams,
            "method" => $this->requestedMethod,
            "token" => $this->accessToken,
            "user" => $this->user
        ];
    }

    public function getUser() {
        return $this->user;
    }



}


?>