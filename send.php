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

// Чистый curl — как в check_bot.php
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => false,
]);
$resp = curl_exec($ch);
$info = curl_getinfo($ch);
$err = curl_error($ch);
curl_close($ch);

$result = json_decode($resp, true);
if ($result && isset($result['ok']) && $result['ok'] === true) {
    echo json_encode(['status' => 'ok']);
} else {
    echo json_encode(['status' => 'error', 'http' => $info['http_code'], 'desc' => $result['description'] ?? $err]);
}
