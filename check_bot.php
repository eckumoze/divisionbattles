<?php
$TOKEN = '8927896544:AAEPtPLdDFFev0GeJV0_yyjgZBZy1o-4FYQ';
$CHAT_ID = '5892298817';

header('Content-Type: text/plain; charset=utf-8');

$testUrl = "https://api.telegram.org/bot{$TOKEN}/getMe";

echo "=== Проверка соединения с Telegram ===\n\n";

// 1. file_get_contents
echo "1. file_get_contents:\n";
$ctx = stream_context_create(['http' => ['timeout' => 15, 'method' => 'GET']]);
$resp = @file_get_contents($testUrl, false, $ctx);
if ($resp === false) {
    echo "   ОШИБКА: не удалось подключиться\n";
} else {
    $d = json_decode($resp, true);
    echo "   " . ($d['ok'] ? 'УСПЕХ' : 'ОШИБКА') . ": " . ($d['description'] ?? '') . "\n";
}

// 2. curl
echo "2. curl:\n";
if (function_exists('curl_init')) {
    $ch = curl_init($testUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $resp = curl_exec($ch);
    $info = curl_getinfo($ch);
    $err = curl_error($ch);
    curl_close($ch);
    if ($resp === false) {
        echo "   ОШИБКА curl: $err\n";
    } else {
        $d = json_decode($resp, true);
        echo "   HTTP " . $info['http_code'] . ": " . ($d['ok'] ? 'УСПЕХ' : 'ОШИБКА') . " - " . ($d['description'] ?? '') . "\n";
    }
} else {
    echo "   curl не установлен\n";
}

// 3. Попытка отправить тестовое сообщение
echo "\n3. Отправка тестового сообщения:\n";
$text = "🧪 Тест с сервера " . date('Y-m-d H:i:s');
$payload = json_encode(['chat_id' => $CHAT_ID, 'text' => $text, 'parse_mode' => 'HTML']);

if (function_exists('curl_init')) {
    $ch = curl_init("https://api.telegram.org/bot{$TOKEN}/sendMessage");
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
    curl_close($ch);
    $d = json_decode($resp, true);
    if ($d && $d['ok']) {
        echo "   ✅ УСПЕХ\n";
    } else {
        echo "   ❌ ОШИБКА: " . ($d['description'] ?? 'нет ответа') . " (HTTP " . $info['http_code'] . ")\n";
    }
}
