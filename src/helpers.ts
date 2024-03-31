export class Helper {
  public size = 54;
  constructor() {}
  newTile(
    id: string,
    clname: string,
    bkgrd: string,
    x: number,
    y: number,
    size: number
  ) {
    const el = document.createElement('div');
    el.id = id;
    el.className = clname;
    el.style.backgroundImage = "url('" + bkgrd + "')";
    el.style.top = `${y * size}px`;
    el.style.left = `${x * size}px`;
    return el;
  }
  checkMoveAvail(
    hbx1: number,
    hby1: number,
    hbx2: number,
    hby2: number,
    velo: number,
    gameBoard: number[][],
    size: number
  ) {
    if (
      ![2, 5, 6].includes(
        gameBoard[Math.round(hbx1 / size)][Math.round(hby1 / size)]
      ) ||
      ![2, 5, 6].includes(
        gameBoard[Math.round(hbx2 / size)][Math.round(hby2 / size)]
      )
    ) {
      return 'stay';
    } else {
      return velo;
    }
  }
  getNRandomFreePositions(
    amount: number,
    width: number,
    height: number,
    gameBoard: number[][]
  ) {
    let count = amount;
    let pos: number[][] = [];
    let busy: string = '';
    while (count >= 0) {
      const x: number = Math.floor(Math.random() * (width - 1));
      const y: number = Math.floor(Math.random() * (height - 1));
      if (gameBoard[y][x] == 2 && x + y > 3 && !busy.includes(`${x},${y};`)) {
        pos.push([x, y]);
        busy += `${x},${y};`;
        count--;
      }
    }
    return pos;
  }
}
