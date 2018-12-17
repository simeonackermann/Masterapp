<?php
/*
// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
*/
class DB {

    private $config = [
        'server' => '',
        'user' => '',
        'password' => '',
        'db' => '',
        'charset' => '',
    ];

    private $conn = null;

    function __construct() {

        $this->config = [
            'server' => DB_HOST,
            'user' => DB_USER,
            'password' => DB_PASSWORD,
            'db' => DB_NAME,
            'charset' => DB_CHARSET,
        ];
    }

    public function connect() {
        $conn = new mysqli(
            $this->config['server'],
            $this->config['user'],
            $this->config['password'],
            $this->config['db']
        );

        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);

        }
        $this->conn = $conn;

        if (!$this->conn->set_charset($this->config['charset'])) {
            throw new Exception("Error on set charset: " . $this->conn->error);
        }

        return $this->conn;
    }

    public function getConnection() {
        return $this->conn;
    }

    public function query($query) {
        /*if (mysqli_query($this->getConnection(), $query)) {
            return true;
        } else {
            throw new Exception("Query failed: " . mysqli_error($this->getConnection()));
        }*/
        $result = $this->getConnection()->query($query);
        if (!$result) {
            throw new Exception("Query failed: " . $this->getConnection()->error);
        }
        if ($result === true) {
            return true;
        }

        return $result;
        /*while ($row = $result->fetch_assoc()) {
            var_dump($row);
        }*/
    }

    public function fetch($result) {

    }

}

?>