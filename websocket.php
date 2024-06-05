<?php
include "game.php";

$game = new Game();
$game->initiate();
  
$host = "dygsow.ct8.pl"; // moja domena w ct8.pl
$port = 23641; // zarezerwowany w panelu port
$transport = "http";
$server = stream_socket_server("tcp://dygsow.ct8.pl:23641", $errno, $errstr);
if (!$server) {
    die("$errstr ($errno)");
}
$clients = array($server); // tablica klientów
$write  = NULL;
$except = NULL;
$connects = [];
$btime = microtime(true);
$ctime = microtime(true);

while (true) {
    $changed = $clients;
    stream_select($changed, $write, $except, 1); // 1s - TICKI!!!!!
 
    if (in_array($server, $changed)) {
        $client = @stream_socket_accept($server);
        if (!$client) {
            continue;
        }
        array_push($clients, $client);
        $ip = stream_socket_get_name($client, true);
        echo "New Client connected from $ip\n";

        stream_set_blocking($client, true);
        $headers = fread($client, 1500);
        handshake($client, $headers, $host, $port);
        stream_set_blocking($client, false);

        $found_socket = array_search($server, $changed);
        unset($changed[$found_socket]);

        usleep(200000);
        send_message($clients, mask(json_encode($game->getGame())));
    }

    foreach ($changed as $changed_socket) {   // wiadomość od klienta
        $ip = stream_socket_get_name($changed_socket, true);
        $buffer = stream_get_contents($changed_socket);
        if ($buffer == false) {
            echo "Client Disconnected from $ip\n";
            if (isset($connects[$ip])) {
                unset($game->players[$connects[$ip]]);
                send_message($clients, mask("$connects[$ip]| LEFT"));
                echo "teraz tyle: ".json_encode($game->players)."\n";
            }
            @fclose($changed_socket);
            $found_socket = array_search($changed_socket, $clients);
            unset($clients[$found_socket]);
        }
        $unmasked = unmask($buffer);
        if ($unmasked != "" && !str_contains($unmasked, "playerState")) {
            echo "\nReceived a Message from $ip:\n\"$unmasked\" \n";
        }
        if (str_contains($unmasked, '{')) {
            $cli_mes = json_decode($unmasked);
            switch ($cli_mes->key) {
                case "playerState":
                    $game->players[$cli_mes->contents->nick] = $cli_mes->contents->state;
                    // $game->barrelOut ? null : $game->releaseTheBarrel();
                    break;
                case "login":
                    $game->players[$cli_mes->contents->nick] = new Player($cli_mes->contents->color);
                    $connects[$ip] = $cli_mes->contents->nick;
                    send_message($clients, mask(json_encode(["nick"=>$cli_mes->contents->nick, "data"=>$game->players[$cli_mes->contents->nick]])."| NEW"));
                    break;
                case "bPose":
                    $game->gameboard[$cli_mes->contents[1]][$cli_mes->contents[0]] = 6;
                    break;
                case "putFlames":
                    foreach($cli_mes->contents as $key=>$pos) {
                        if (count($pos) != 0) {
                            echo "field explosion at ".$pos[0].",".$pos[1]."\n";
                            $game->gameboard[$pos[1]][$pos[0]] = $key + 10;
                        }
                    }
                    break;
                case "clearFlames":
                    foreach($cli_mes->contents as $key=>$pos) {
                        if (count($pos) != 0) {
                            $game->gameboard[$pos[1]][$pos[0]] = 2;
                        }
                    }
                    break;
                case "baloonsDead":
                    foreach ($cli_mes->contents as $key=>$index) {
                        $game->baloons[$index]->alive = false;
                        $game->baloons[$index]->currDir = "dead";
                        $game->bCount--;
                        echo "\nbaloon $index dead\n";
                    }
                    if ($game->bCount == 0) {
                        $game->barrelOut ? null : $game->releaseTheBarrel();
                    } 
                    break;
                case "powupGone":
                    $game->powUpPose = [0,0];
                    echo "\nPOWRUP GONE: $game->powUpPose\n";
                    break;
                default:
                    break;
            }
        }
    }
    if (microtime(true) - $btime > .9) {
        $game->moveShits();
        $btime = microtime(true);
    }
    if (microtime(true) - $ctime > .1) {
        send_message($clients, mask(json_encode($game->getGame())));
        $ctime = microtime(true);
    }
}
fclose($server);

function unmask($text)
{
    $length = @ord($text[1]) & 127;
    if ($length == 126) {
        $masks = substr($text, 4, 4);
        $data = substr($text, 8);
    } elseif ($length == 127) {
        $masks = substr($text, 10, 4);
        $data = substr($text, 14);
    } else {
        $masks = substr($text, 2, 4);
        $data = substr($text, 6);
    }
    $text = "";
    for ($i = 0; $i < strlen($data); ++$i) {
        $text .= $data[$i] ^ $masks[$i % 4];
    }
    return $text;
}

function mask($text)
{
    $b1 = 0x80 | (0x1 & 0x0f);
    $length = strlen($text);
    if ($length <= 125)
        $header = pack("CC", $b1, $length);
    elseif ($length > 125 && $length < 65536)
        $header = pack("CCn", $b1, 126, $length);
    elseif ($length >= 65536)
        $header = pack("CCNN", $b1, 127, $length);
    return $header . $text;
}

function handshake($client, $rcvd, $host, $port)
{
    $headers = array();
    $lines = preg_split("/\r\n/", $rcvd);
    foreach ($lines as $line) {
        $line = rtrim($line);
        if (preg_match("/\A(\S+): (.*)\z/", $line, $matches)) {
            $headers[$matches[1]] = $matches[2];
        }
    }
    $secKey = $headers["Sec-WebSocket-Key"];
    $secAccept = base64_encode(pack("H*", sha1($secKey . "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")));
    //hand shaking header
    $upgrade  = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
        "Upgrade: websocket\r\n" .
        "Connection: Upgrade\r\n" .
        "WebSocket-Origin: $host\r\n" .
        "WebSocket-Location: ssl://$host:$port\r\n" .
        "Sec-WebSocket-Version: 13\r\n".
        "Sec-WebSocket-Accept:$secAccept\r\n\r\n";
    fwrite($client, $upgrade);
}

function send_message($clients, $msg)
{
    foreach ($clients as $changed_socket) {
        @fwrite($changed_socket, $msg);
    }
}