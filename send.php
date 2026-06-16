<?php
$TOKEN = '8927896544:AAEPtPLdDFFev0GeJV0_yyjgZBZy1o-4FYQ';
$CHAT_ID = '5892298817';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) $data = $_POST;

if (empty($data['name'])) {
    echo json_encode(['status' => 'error', 'msg' => 'no data']);
    exit;
}

$isSolo = ($data['role'] ?? '') === 'solo';
$text = "🔔 <b>Новая заявка</b>\n\n";
$text .= "👤 Имя: " . ($data['name'] ?? '') . "\n";
$text .= "📞 Контакт (" . ($data['contactType'] ?? 'telegram') . "): " . ($data['contact'] ?? '') . "\n";
if ($isSolo) {
    $text .= "🎯 Роль: Соло\n🎭 Позиция: " . ($data['soloRole'] ?? 'не указана') . "\n🏆 Рейтинг: " . ($data['soloRating'] ?? 'не указан') . "\n📝 О себе: " . ($data['about'] ?? 'не указано') . "\n";
} else {
    $text .= "🏷 Команда: " . ($data['brand'] ?? '') . "\n👥 Состав: " . ($data['roster'] ?? 'не указан') . "\n🏆 Рейтинг: " . ($data['teamRating'] ?? 'не указан') . "\n";
}
$text .= "🕐 Время: " . ($data['time'] ?? '');

$payload = json_encode(['chat_id' => $CHAT_ID, 'text' => $text, 'parse_mode' => 'HTML']);
$url = "https://api.telegram.org/bot{$TOKEN}/sendMessage";

$ok = false;
$http_code = 0;
$desc = '';

// Сначала пробуем curl (3 попытки)
for ($i = 0; $i < 3; $i++) {
    $ch = curl_init($url);
    if ($ch === false) continue;
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $resp = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    $result = json_decode($resp, true);
    if ($result && isset($result['ok']) && $result['ok'] === true) {
        $ok = true;
        break;
    }
    $desc = $result['description'] ?? $err;
    if ($i < 2) usleep(500000);
}

// Если curl не сработал — пробуем file_get_contents
if (!$ok) {
    $opts = ['http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $payload,
        'timeout' => 15,
        'ignore_errors' => true,
    ]];
    $ctx = stream_context_create($opts);
    $resp2 = @file_get_contents($url, false, $ctx);
    if ($resp2 !== false) {
        $result2 = json_decode($resp2, true);
        if ($result2 && isset($result2['ok']) && $result2['ok'] === true) {
            $ok = true;
        } else {
            $desc = $result2['description'] ?? 'file_get_contents failed';
        }
    } else {
        $desc = 'file_get_contents returned false';
    }
}

if ($ok) {
    echo json_encode(['status' => 'ok']);
} else {
    $log = date('Y-m-d H:i:s') . " http=$http_code desc=" . json_encode($desc) . "\n";
    @file_put_contents(__DIR__ . '/send_error.log', $log, FILE_APPEND);
    echo json_encode(['status' => 'error', 'http' => $http_code, 'desc' => $desc]);
}
