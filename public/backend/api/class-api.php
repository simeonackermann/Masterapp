<?php

abstract class Api {

    private $app = null;
    private $enabled = true;

    public function __construct($app) {
        $this->app = $app;
    }

    protected function getApp() {
        return $this->app;
    }

    // shorthand
    protected function getDb() {
        return $this->getApp()->getDb();
    }

    // shorthand
    protected function getApi($name = "") {
        return $this->getApp()->getApi()->getApi($name);
    }

    public function isEnabled() {
        return $this->enabled;
    }

    public function getRoutes() {
        return $this->routes;
    }

    public function getRoute($path = "", $method = "GET") {
        if (empty($path)) {
            $request = $this->getApp()->getRouter()->getRequest();
            $path = $request['path'];
            $method = $request['method'];
        }
        $route = array_filter(
            $this->routes,
            function($v) use ($path, $method) {
                return $v['path'] == $path && strtolower($v['method']) === strtolower($method);
            }
        );
        return count($route) > 0 ? array_pop( $route ) : [];
    }

    public function getRouteParams($route = null) {

        if (empty($route)) {
            $route = $this->getRoute();
            if (empty($route)) {
                return null;
            }
        }

        $result = [];
        foreach($route['params'] as $param) {
            $required = $param[0] != "?";
            $key = $required ? $param : substr($param, 1);
            $result[$key] = $required;
        }
        return $result;
    }

    public function getIntersectParamsForRoute($route = null, $params = []) {
        $routeParams = $this->getRouteParams($this->getRoute($route["path"], $route["method"]));
        return array_intersect_key($params, $routeParams);
    }

}

?>