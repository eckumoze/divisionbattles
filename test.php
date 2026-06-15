<?php
echo '<pre>';
echo 'POST: ';
print_r($_POST);
echo "RAW: " . file_get_contents('php://input') . "\n";
echo 'SERVER: ' . $_SERVER['REQUEST_METHOD'] . "\n";
echo '</pre>';
