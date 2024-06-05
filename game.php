<?php
class Baloon {
    public $pos = [];
    public $currDir;
    public $alive = true;
    public $barrel = false;
    public function activateBaloon($gameboard) {
        $pos = $this->pos;
        $obj = [
            "left"=> ($gameboard[$pos[1]][$pos[0] - 1] == 2 ? true : false),
            "up"=> ($gameboard[$pos[1] - 1][$pos[0]] == 2 ? true : false),
            "right"=> ($gameboard[$pos[1]][$pos[0] + 1] == 2 ? true : false),
            "down"=> ($gameboard[$pos[1] + 1][$pos[0]] == 2 ? true : false),
            "dead"=> ($gameboard[$pos[1]][$pos[0]] == 2 ? true : false),
        ];
        $this->moveBaloon($obj);
    }
    private function moveBaloon($obj) {
        $dirs = ["left", "up", "right", "down"];
        if ($obj[$this->currDir]) {
          $this->goTo(
            $this->pos[0] +
              ($this->currDir == "left" ? -1 : ($this->currDir == "right" ? 1 : 0)),
            $this->pos[1] +
              ($this->currDir == "up" ? -1 : ($this->currDir == "down" ? 1 : 0))
          );
        } else {
          $this->currDir = $dirs[random_int(0, 3)];
          return;
        }
        if (random_int(0,9) >= 8) $this->currDir = $dirs[random_int(0, 3)];
    }
      
    public function goTo($x, $y) {
        $this->pos = [$x, $y];
    }
    function __construct() {
      $this->currDir = random_int(0, 1) ? "right" : "left";
    }
}

class Barrel {
  public $pos = [0,0];
  public $currDir;
  public $alive = false;
  public $barrel = true;
  public function activateBarrel($gameboard, $players, $width, $height) {
    $chasedPlrPos = [];
    foreach ($players as $player) {
      if ($player->alive) array_push($chasedPlrPos, $player->pos);
    }
    if (count($chasedPlrPos) > 0) {
      $boardState = $gameboard;
      $pathBoard = $gameboard;
      $start = $this->pos;
      $min = $width*$height;
      $end = [];
      foreach ($chasedPlrPos as $pos) {#najblizszy gracz
        $dist = sqrt(pow($start[0] - $pos[0], 2) + pow($start[1] - $pos[1], 2));
        if ($dist < $min) {
          $min = $dist;
          $end = $pos;
        };
      }
      foreach ($pathBoard as $y=>$row) {
        foreach ($row as $x=>$field) $pathBoard[$y][$x] = [];
      }
      foreach ($boardState as $y=>$row) {
        foreach ($row as $x=>$field) {
          if ($field != 2) $boardState[$y][$x] = "X";
          else $boardState[$y][$x] = 0;
        }
      }
      if ($start[0] == $end[0] && $start[1] == $end[1]) return;
      $boardState[$start[1]][$start[0]] = 0;
      $boardState[$end[1]][$end[0]] = "M";
      $pathBoard[$start[1]][$start[0]] = [];
      $currDist = 0;
      $toCheck = [$start];
      while (true) {
        $currDist++;
        $temp = [];
        $pbMoves = 0;
        foreach ($toCheck as $p) {
          $prev = $pathBoard[$p[1]][$p[0]];
          array_push($prev, $p);
          $surrounds = [
            ["pos" => [$p[0], $p[1] - 1], "dir" => "up"], 
            ["pos" => [$p[0] - 1, $p[1]], "dir" => "left"], 
            ["pos" => [$p[0], $p[1] + 1], "dir" => "down"], 
            ["pos" => [$p[0] + 1, $p[1]], "dir" => "right"]
          ];
          foreach ($surrounds as $field) {
            if ($boardState[$field["pos"][1]][$field["pos"][0]] == "M") {
              if (count($pathBoard[$p[1]][$p[0]]) > 1) $this->pos = $pathBoard[$p[1]][$p[0]][1];
              else if (count($pathBoard[$p[1]][$p[0]]) == 1) $this->pos = [$p[0], $p[1]];
              else $this->pos = [$field["pos"][0], $field["pos"][1]];
              $this->currDir = $field["dir"];
              return;
            } else if ($boardState[$field["pos"][1]][$field["pos"][0]] == 0 && 0 < $field["pos"][1] && 0 < $field["pos"][0] && $field["pos"][1] < $height - 1 && $field["pos"][0] < $width - 1) {
                $boardState[$field["pos"][1]][$field["pos"][0]] = $currDist;
                array_push($temp, [$field["pos"][0], $field["pos"][1]]);
                $pathBoard[$field["pos"][1]][$field["pos"][0]] = $prev;
                $pbMoves++;
            }
          }
        }
        $toCheck = $temp;
        if ($pbMoves == 0) {
          echo "NAH";
          return;
        }
      }
    }
  }
  function __construct() {
    $this->currDir = random_int(0, 1) ? "right" : "left";
  }
}

class Game
{
    private $width = 21;
    private $height = 11;
    private $brickCount = 20;
    public $barrelOut = false;
    public $bCount = 10;
    public $baloons = [];
    public $gameboard = [];
    public $powUpPose;
    public $players = [];
    public function initiate()
    {
        for ($i = 0; $i < $this->height; $i++) {
          $temp = [];
            for ($j = 0; $j < $this->width; $j++) {
              $el = 0;
                if (
                    $i === 0 ||
                    $i === $this->height - 1 ||
                    $j === 0 ||
                    $j === $this->width - 1 ||
                    ($i % 2 === 0 && $j % 2 === 0)
                ) {
                    $el = 3;
                } else {
                    $el = 2;
                }
                array_push($temp, $el);
            }
            array_push($this->gameboard, $temp);
        }
        $n = $this->brickCount;
        $poses = getNRandomFreePositions($n, $this->width, $this->height, $this->gameboard);
        $this->powUpPose = $poses[random_int(0, $n-1)];
        forEach($poses as $e) $this->gameboard[$e[1]][$e[0]] = 4;
        $baloonPoses = getNRandomFreePositions(
            $this->bCount,
            $this->width,
            $this->height,
            $this->gameboard
          );
        for ($i = 0; $i < $this->bCount; $i++) {
            array_push($this->baloons, new Baloon($this->width, $this->height));
            $this->baloons[$i]->goTo($baloonPoses[$i][0], $baloonPoses[$i][1]);
            $this->baloons[$i]->activateBaloon($this->gameboard);
        }
        array_push($this->baloons, new Barrel());
        return $this->gameboard;
    }
    public function moveShits() {
        foreach($this->baloons as $e) {
          if ($e->alive) {
            $e->barrel ? $e->activateBarrel($this->gameboard, $this->players, $this->width, $this->height) : $e->activateBaloon($this->gameboard);
          }
        }
    }
    public function releaseTheBarrel() {
      $this->barrelOut = true;
      $this->baloons[count($this->baloons)-1]->alive = true;
      $this->baloons[count($this->baloons)-1]->pos = [19,9];
    }
    public function getGame() {
        return [$this->gameboard, $this->baloons, $this->powUpPose, $this->players];
    }
}

Class Player {
    public $x = "54px";
    public $y = "54px";
    public $alive = true;
    public $powered = false;
    public $moving = false;
    public $currDir = "right";
    public $color = "hue-rotate(0deg)";
    public $deaths = 0;
    public $kills = 0;
    public $pos = [];
    function __construct($color) {
      $this->color = $color;
      echo $this->color;
    }
}

function getNRandomFreePositions(
    $amount,
    $width,
    $height,
    $gameBoard
  ) {
    $count = $amount;
    $pos = [];
    $busy = '';
    while ($count > 0) {
      $x = random_int(0, $width-1);
      $y = random_int(0, $height-1);
      if ($gameBoard[$y][$x] == 2 && $x + $y > 3 && !str_contains($busy,"$x,$y;")) {
        array_push($pos,[$x, $y]);
        $busy .= "$x,$y;";
        $count--;
      }
    }
    return $pos;
}