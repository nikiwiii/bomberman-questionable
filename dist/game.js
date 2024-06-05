// const wsUri = "ws://dygsow.ct8.pl:23641/webtest/websocket.php";
// const websocket = new WebSocket(wsUri);
// export class Game {
//   public gameBoard
//   public baloons
//   public powUpPose
//   public players
//   private initiatedGame
//   public height
//   public width
//   public urGamerTag
//   public initiateGame = (nick) => {
//     websocket.onerror = (ev) => console.log(ev)
//     websocket.onmessage = (ev) => {
//       try {
//         if (ev.data.includes("| NEW")) newPlayer(JSON.parse(ev.data.substring(0, ev.data.indexOf("|"))))
//         else if (ev.data.includes("| LEFT")) playerGone(ev.data.substring(0, ev.data.indexOf("|")))
//         else {
//           const newData = JSON.parse(ev.data);
//           this.gameBoard = newData[0]
//           this.baloons = newData[1]
//           this.powUpPose = newData[2]
//           this.players = newData[3]
//           this.urGamerTag = nick
//           if (!this.initiatedGame) {
//             this.send('login', this.urGamerTag)
//             this.height = this.gameBoard.length
//             this.width = this.gameBoard[0].length
//             this.createGameBoard();
//             this.createSprites()
//           } else {
//             this.updateGameBoard()
//             this.updateBaloons()
//             this.updatePlayers()
//           }
//         }
//       } catch (error) {throw error}
//     }
//   };
//   public send = (key: string, val: any) => websocket.send(JSON.stringify({key: key, contents: val}));
//   public newPlayer = (npi: { nick: string; data: any; }) => {
//     if (npi.nick != this.urGamerTag) {
//       this.players[npi.nick] = npi.data
//       let img = new Image();
//       img.src = '../img/sheet.png';
//       img.onload = () => allSprites.otherPlayers[npi.nick] = new Anim(img, data.player, "_"+npi.nick, players[npi.nick].pos, 'right', true)
//     }
//   }
//   public playerGone = (thatUser: string) => {
//     console.log(thatUser+" is gone");
//     players = Object.keys(players).filter(key =>
//       key !== thatUser).reduce((newObj, key) =>
//       {
//           newObj[key] = players[key];
//           return newObj;
//       }, {}
//     );
//     allSprites.otherPlayers[thatUser].vanish()
//   }
// } 
