<?php
header('Content-Type: application/json');
echo json_encode([
  'method' => $_SERVER['REQUEST_METHOD'],
  'get' => $_GET,
  'post' => $_POST,
  'raw_input' => file_get_contents('php://input'),
  'server_addr' => $_SERVER['SERVER_ADDR'] ?? 'unknown'
]);
