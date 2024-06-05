import { Elements } from './elements.js';
import { Anim } from './engine.js';
import { Helper } from './helpers.js';
//@ts-ignore
import frameData from './data.json' assert { type: "json" };
let body;
let gameBoard = [];
let height;
let width;
let allSprites; // tablica z animacjami
let data;
let controller = [];
let exploding = false;
let isDead = true;
let movePlayer = false;
let powered = false;
let initiatedGame = false;
let controlActive = true;
let desBrickCount = 0;
let currKey;
let powUpPose;
let baloons = [];
let urGamerTag;
let flameFields = [[], [], [], [], [], [], [], [], []];
let players = {};
let deadBaloons = [];
let urStyle = "";
let spriteCount = 0;
let deaths = 0;
let kills = 0;
const wsUri = "ws://dygsow.ct8.pl:23641/webtest/websocket.php";
const websocket = new WebSocket(wsUri);
const elements = new Elements();
const helper = new Helper();
const dsplySize = helper.size;
const $ = (id) => { return document.getElementById(id); };
window.onload = () => {
    document.querySelector('#app').innerHTML = `<div id="test"><div id="sprites"></div></div>`;
    body = $("test");
    const input = $('nick');
    $('submit-btn').addEventListener('click', () => enterGamertag(input.value));
    $('slider').addEventListener('input', (e) => {
        //@ts-ignore
        urStyle = "hue-rotate(" + e.target.value + "deg)";
        $("preview").style.filter = urStyle;
    });
    input.addEventListener('keypress', (e) => e.key === "Enter" ? enterGamertag(input.value) : null);
};
const enterGamertag = async (nick) => {
    if (nick) {
        document.querySelector('#submit-btn').disabled = true;
        const res = await fetch(`http://d3bomb.ct8.pl/webtest/verify.php?login=${nick}`);
        const verified = await res.text();
        if (verified == "ight") {
            document.querySelector('.form').style.opacity = '0';
            document.querySelector('#submit-btn').style.opacity = '0';
            await new Promise((r) => setTimeout(r, 500));
            document.querySelector('.form').style.display = 'none';
            document.querySelector('#submit-btn').style.display = 'none';
            urGamerTag = nick;
            initiateGame();
        }
        else {
            alert("Popraw gamer-tag (tylko litery, cyfry, nie może być pusty)");
            document.querySelector('#submit-btn').disabled = false;
        }
    }
};
const send = (key, val) => websocket.send(JSON.stringify({ key: key, contents: val }));
const initiateGame = () => {
    websocket.onmessage = (ev) => {
        try {
            if (ev.data.includes("| NEW"))
                newPlayer(JSON.parse(ev.data.substring(0, ev.data.indexOf("|"))));
            else if (ev.data.includes("| LEFT"))
                playerGone(ev.data.substring(0, ev.data.indexOf("|")));
            else {
                const newData = JSON.parse(ev.data);
                gameBoard = newData[0];
                baloons = newData[1];
                powUpPose = newData[2];
                players = newData[3];
                if (!initiatedGame) {
                    send('login', { nick: urGamerTag, color: urStyle });
                    height = gameBoard.length;
                    width = gameBoard[0].length;
                    createGameBoard();
                    createSprites();
                }
                else {
                    updateGameBoard();
                    updateBaloons();
                    updatePlayers();
                }
            }
        }
        catch (error) {
            throw error;
        }
    };
    websocket.onerror = (ev) => console.log(ev);
};
const newPlayer = (npi) => {
    if (npi.nick != urGamerTag) {
        players[npi.nick] = npi.data;
        let img = new Image();
        img.src = '../img/sheet.png';
        img.onload = () => {
            allSprites.otherPlayers[npi.nick] = new Anim(img, data.player, "_" + npi.nick, [1, 1], 'right', true, "otherplayer", spriteCount);
            spriteCount++;
            $("_" + npi.nick).style.filter = "drop-shadow(2px 2px 1px black)" + npi.data.color;
        };
    }
};
const playerGone = (thatUser) => {
    console.log(thatUser + " is gone");
    document.removeChild($(thatUser));
    players = Object.keys(players).filter(key => key !== thatUser).reduce((newObj, key) => {
        newObj[key] = players[key];
        return newObj;
    }, {});
    allSprites.otherPlayers[thatUser].turnOff();
};
const createGameBoard = () => {
    console.log(powUpPose);
    for (let y = 0; y < height; y++) {
        const container = document.createElement('div');
        const tileTypes = [elements.grassUrl, elements.stoneUrl, elements.brickUrl, elements.powerUrl];
        container.className = 'container';
        for (let x = 0; x < width; x++) {
            const el = x === powUpPose[0] && y === powUpPose[1] && x !== 0 ? 5 : gameBoard[y][x];
            const field = helper.newTile(`${x},${y}`, 'field', tileTypes[el - 2], x, y, dsplySize);
            el === 3 ? field.classList.add('stone') : null;
            el === 4 ? field.classList.add('brick') : null;
            container.appendChild(field);
        }
        body.appendChild(container);
    }
    initiatedGame = true;
};
const createSprites = () => {
    data = frameData;
    let img = new Image();
    img.src = '../img/sheet.png';
    img.onload = async () => {
        let balooImgs = [];
        let otherPlayers = {};
        let flames = [];
        const expDir = ['left', 'top', 'right', 'down', 'middle', 'midleft', 'midtop', 'midright', 'middown'];
        baloons.forEach((e, i) => {
            balooImgs.push(new Anim(img, e.barrel ? data.barrel : data.baloon, `baloon${i}`, e.alive ? e.pos : [0, 0], e.currDir, e.alive, "baloon", spriteCount));
            spriteCount++;
        });
        Object.keys(players).forEach((e) => {
            otherPlayers[e] = new Anim(img, data.player, "_" + e, [1, 1], 'right', true, "otherplayer", spriteCount);
            spriteCount++;
        });
        expDir.forEach((e, i) => {
            flames.push(new Anim(img, data.explosion, `explosion${i + 1}`, [0, 0], e, false, "explosion", spriteCount));
            spriteCount++;
        });
        const player = new Anim(img, data.player, 'player', [1, 1], 'right', true, "player", 0);
        const bomb = new Anim(img, data.bomb, 'bomb', [0, 0], 'right', false, "bomb", spriteCount);
        spriteCount++;
        const desBricks = [
            new Anim(img, data.brick_des, `desbrick1`, [0, 0], 'right', false, "desbrick", spriteCount),
            new Anim(img, data.brick_des, `desbrick2`, [0, 0], 'right', false, "desbrick", spriteCount + 1),
            new Anim(img, data.brick_des, `desbrick3`, [0, 0], 'right', false, "desbrick", spriteCount + 2),
            new Anim(img, data.brick_des, `desbrick4`, [0, 0], 'right', false, "desbrick", spriteCount + 3),
        ];
        spriteCount += 4;
        allSprites = {
            player: player,
            baloons: balooImgs,
            bomb: bomb,
            flames: flames,
            desBrick: desBricks,
            otherPlayers: otherPlayers
        };
        allSprites.player.renderFrame(0);
        allSprites.player.moving = false;
        $('player').style.filter = "drop-shadow(2px 2px 1px black)" + urStyle;
        Object.keys(players).forEach((e) => $("_" + e).style.filter = "drop-shadow(2px 2px 1px black) " + players[e].color);
        animate();
        activateControls();
        immortal();
    };
};
let tickCounter = 0;
const animate = () => {
    tickCounter++;
    allSprites.player.goAnim();
    Object.keys(allSprites.otherPlayers).forEach((e) => allSprites.otherPlayers[e].goAnim());
    allSprites.baloons.forEach((e) => e.goAnim());
    allSprites.bomb.moving ? allSprites.bomb.goAnim() : null;
    if (movePlayer && controlActive)
        allatPlayerMoveShi(); //movement
    if (exploding) {
        let booms = 0;
        allSprites.flames.forEach((e) => {
            e.goAnim();
            e.moving === true ? booms++ : null;
        });
        exploding = booms === 0 ? false : true;
    }
    for (let i = 0; i < desBrickCount; i++) {
        if (!allSprites.desBrick[i].moving) {
            desBrickCount = 0;
            break;
        }
        allSprites.desBrick[i].goAnim();
    }
    if (tickCounter == 5) { // co x/30s wyslij
        send('playerState', { nick: urGamerTag, state: { x: allSprites.player.left + "px", y: allSprites.player.top + "px", moving: allSprites.player.moving, currDir: allSprites.player.currDir, powered: powered, alive: !isDead, color: urStyle, deaths: deaths, kills: kills, pos: allSprites.player.pos } });
        tickCounter = 0;
    }
    setTimeout(window.requestAnimationFrame, 1000 / 30, animate); // ~30 klatek/s
};
const updateGameBoard = () => {
    gameBoard.forEach((yE, y) => {
        yE.forEach((xE, x) => {
            const tileTypes = [elements.grassUrl, elements.stoneUrl, elements.brickUrl];
            if (xE == 6) {
                allSprites.bomb.moving = true;
                allSprites.bomb.goTo(x, y);
            }
            else if (xE >= 10) {
                allSprites.bomb.moving ? allSprites.bomb.turnOff() : null;
                exploding = true;
                allSprites.flames[xE - 10].goTo(x, y);
                allSprites.flames[xE - 10].moving = true;
                if (allSprites.player.pos[0] == x && allSprites.player.pos[1] == y)
                    killPlayer();
            }
            else {
                if (xE == 2)
                    $(`${x},${y}`).className = "";
                $(`${x},${y}`).style.backgroundImage = `url('${tileTypes[xE - 2]}')`;
            }
        });
    });
    if (gameBoard[powUpPose[1]][powUpPose[0]] != 4 && powUpPose[0] !== 0) {
        $(`${powUpPose[0]},${powUpPose[1]}`).classList.remove("brick");
        $(`${powUpPose[0]},${powUpPose[1]}`).style.backgroundImage = `url('${elements.powerUrl}')`;
    }
};
const updateBaloons = () => {
    baloons.forEach((e, i) => {
        if (allSprites.baloons[i].currDir != "dead") {
            allSprites.baloons[i].currDir = e.currDir;
            console.log(e);
            if (!e.alive && !e.barrel) {
                allSprites.baloons[i].actFrame = 0;
                allSprites.baloons[i].repeat = false;
            }
            else {
                if (e.barrel && e.alive)
                    allSprites.baloons[i].moving = true;
                allSprites.baloons[i].goTo(e.pos[0], e.pos[1]);
                if (allSprites.baloons[i].pos[0] === allSprites.player.pos[0] && allSprites.baloons[i].pos[1] === allSprites.player.pos[1] && e.alive)
                    killPlayer();
            }
        }
    });
};
const updatePlayers = () => {
    Object.keys(players).forEach((e) => {
        const nick = e === urGamerTag ? e + "<span style='color:yellow'>(you)</span>" : e;
        if ($(e))
            $(e).innerHTML = nick + " deaths:" + players[e].deaths + " kills:" + players[e].kills;
        else
            $("glist").innerHTML += "<div id='" + e + "' style='filter: " + players[e].color + "'>" + nick + " deaths:" + players[e].deaths + " kills:" + players[e].kills + "</div>";
        if (e != urGamerTag) {
            if (allSprites.otherPlayers[e].currDir != "dead" || players[e].alive) {
                allSprites.otherPlayers[e].currDir = players[e].currDir;
                if (players[e].alive) {
                    allSprites.otherPlayers[e].repeat = true;
                    allSprites.otherPlayers[e].moving = players[e].moving;
                    allSprites.otherPlayers[e].el.style.left = players[e].x;
                    allSprites.otherPlayers[e].el.style.top = players[e].y;
                    players[e].powered ? allSprites.otherPlayers[e].el.style.filter = 'drop-shadow(yellow 0px 0px 5px) ' + players[e].color : allSprites.otherPlayers[e].el.style.filter = 'drop-shadow(black 2px 2px 1px) ' + players[e].color;
                }
                else {
                    allSprites.otherPlayers[e].actFrame = 0;
                    allSprites.otherPlayers[e].repeat = false;
                    allSprites.otherPlayers[e].moving = true;
                }
            }
        }
    });
};
const moveBinds = [65, 87, 68, 83];
const activateControls = () => {
    addEventListener('keypress', handleBinds);
    addEventListener('keyup', handleKeyUp);
};
const handleKeyUp = (e) => {
    if (moveBinds.includes(e.which)) {
        controller.splice(controller.indexOf(e.which), 1);
        if (controller.length == 0)
            movePlayer = false;
        allSprites.player.moving = false;
    }
};
const handleBinds = (e) => {
    const prKey = e.which - 32;
    if (moveBinds.includes(prKey)) { //wasd
        currKey = prKey;
        controller.includes(currKey) ? null : controller.push(currKey);
        movePlayer = true;
    }
    else if (prKey == 90 && !exploding && !allSprites.bomb.moving)
        explode(allSprites.player.pos[0], allSprites.player.pos[1]);
};
const allatPlayerMoveShi = () => {
    const velocity = Math.round(dsplySize / 9);
    const moveData = helper.moveChecker(controller, moveBinds, allSprites.player.hitbox, velocity, gameBoard, dsplySize);
    allSprites.player.moving = true;
    allSprites.player.movePlayer(moveData[0][moveBinds.indexOf(currKey)], moveData[1]);
    allSprites.baloons.forEach((e) => {
        if (e.pos[0] === allSprites.player.pos[0] && e.pos[1] === allSprites.player.pos[1])
            killPlayer();
        else if (gameBoard[allSprites.player.pos[1]][allSprites.player.pos[0]] > 10)
            killPlayer();
    });
    if (powUpPose[0] === allSprites.player.pos[0] && powUpPose[1] === allSprites.player.pos[1]) {
        $(`${powUpPose[0]},${powUpPose[1]}`).style.backgroundImage = `url('${elements.grassUrl}')`;
        $('player').style.filter = 'drop-shadow(yellow 0px 0px 5px) ' + urStyle;
        send("powupGone", true);
        powered = true;
    }
};
const explode = async (x, y) => {
    send('bPose', [x, y]);
    allSprites.bomb.moving = true;
    allSprites.bomb.goTo(x, y);
    gameBoard[y][x] = 6;
    await new Promise((e) => setTimeout(e, 2500));
    tileExplosion(x, y, 4);
    if (powered) {
        if (tileExplosion(x - 1, y, 5))
            tileExplosion(x - 2, y, 0);
        if (tileExplosion(x, y - 1, 6))
            tileExplosion(x, y - 2, 1);
        if (tileExplosion(x + 1, y, 7))
            tileExplosion(x + 2, y, 2);
        if (tileExplosion(x, y + 1, 8))
            tileExplosion(x, y + 2, 3);
    }
    else {
        tileExplosion(x - 1, y, 0);
        tileExplosion(x, y - 1, 1);
        tileExplosion(x + 1, y, 2);
        tileExplosion(x, y + 1, 3);
    }
    send('putFlames', flameFields);
    clearFlames();
    exploding = true;
};
const tileExplosion = (x, y, i) => {
    if (gameBoard[y][x] !== 3 && x > 0 && y > 0 && x < width && y < height) {
        if (gameBoard[y][x] == 4) {
            if (x == powUpPose[0] && y == powUpPose[1])
                $(`${powUpPose[0]},${powUpPose[1]}`).style.backgroundImage = `url('${elements.powerUrl}')`;
            $(`${x},${y}`).style.backgroundImage = `url('${elements.grassUrl}')`;
            $(`${x},${y}`).classList.remove("brick");
            gameBoard[y][x] = 2;
            allSprites.desBrick[desBrickCount].goTo(x, y);
            allSprites.desBrick[desBrickCount].moving = true;
            desBrickCount++;
        }
        allSprites.flames[i].goTo(x, y);
        flameFields[i] = [x, y];
        allSprites.flames[i].moving = true;
        if (allSprites.player.pos[0] == x && allSprites.player.pos[1] == y)
            killPlayer();
        allSprites.baloons.forEach((e) => e.pos[0] == x && e.pos[1] == y ? killBaloon(e) : null);
        gameBoard[y][x] = 10 + i;
    }
    return gameBoard[y][x] !== 3;
};
const clearFlames = async () => {
    await new Promise((r) => setTimeout(r, 700));
    flameFields.forEach((e) => e.length !== 0 ? gameBoard[e[1]][e[0]] = 2 : null);
    send('clearFlames', flameFields);
    flameFields = [[], [], [], [], [], [], [], [], []];
    await new Promise((r) => setTimeout(r, 200));
    send('baloonsDead', deadBaloons);
    deadBaloons = [];
};
const killPlayer = async () => {
    if (!isDead) {
        deaths++;
        controller = [];
        isDead = true;
        removeEventListener('keypress', handleBinds);
        removeEventListener('keyup', handleKeyUp);
        controlActive = false;
        allSprites.player.currDir = 'dead';
        allSprites.player.actFrame = 0;
        allSprites.player.repeat = false;
        allSprites.player.moving = true;
        $("test").style.opacity = ".2";
        $("dead_label").style.top = "50%";
        await new Promise((e) => setTimeout(e, 2000));
        $("reset_btn").style.top = "40%";
        $("reset_btn").addEventListener("click", realive);
    }
};
const killBaloon = async (e) => {
    kills++;
    e.currDir = 'dead';
    e.actFrame = 0;
    e.repeat = false;
    deadBaloons.push(allSprites.baloons.indexOf(e));
};
const realive = async () => {
    powered = false;
    $('player').style.filter = "drop-shadow(2px 2px 1px black)" + urStyle;
    $("test").style.opacity = "1";
    $("dead_label").style.top = "-50%";
    $("reset_btn").style.top = "-40%";
    allSprites.player.currDir = "right";
    allSprites.player.turnOn(true);
    allSprites.player.goTo(1, 1);
    addEventListener('keypress', handleBinds);
    addEventListener('keyup', handleKeyUp);
    controlActive = true;
    immortal();
};
const immortal = async () => {
    for (let i = 0; i < 4; i++) {
        await new Promise((e) => setTimeout(e, 300));
        allSprites.player.el.style.opacity = "0";
        await new Promise((e) => setTimeout(e, 300));
        allSprites.player.el.style.opacity = "1";
    }
    isDead = false;
};
