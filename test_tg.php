<?php
echo "VER:2\n";
echo "METHOD: " . ($_SERVER['REQUEST_METHOD'] ?? 'none') . "\n";

$raw = file_get_contents('php://input');
echo "RAW: [" . $raw . "]\n";

// Test Telegram connectivity
$TOKEN = '8927896544:AAEPtPLdDFFev0GeJV0_yyjgZBZy1o-4FYQ';
$url = "https://api.telegram.org/bot{$TOKEN}/getMe";

$ctx = stream_context_create(['http' => ['timeout' => 10, 'method' => 'GET']]);
$resp = @file_get_contents($url, false, $ctx);
if ($resp === false) {
  echo "TG_CONNECT: FAIL (file_get_contents)\n";
} else {
  $d = json_decode($resp, true);
  echo "TG_CONNECT: " . ($d['ok'] ? 'OK' : 'FAIL') . " - " . ($d['description'] ?? '') . "\n";
}

if (function_exists('curl_init')) {
  $ch = curl_init($url);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_SSL_VERIFYPEER => false]);
  $resp = curl_exec($ch);
  curl_close($ch);
  $d = json_decode($resp, true);
  echo "TG_CURL: " . ($d['ok'] ? 'OK' : 'FAIL') . " - " . ($d['description'] ?? '') . "\n";
} else {
  echo "TG_CURL: NO_CURL\n";
}
