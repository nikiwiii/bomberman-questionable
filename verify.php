<?php
header('Access-Control-Allow-Origin: *');
echo preg_match('/^[a-zA-Z0-9_.-]*$/', $_GET["login"]) ? "ight" : "nah";