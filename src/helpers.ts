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
  moveChecker(controller: number[], moveBinds: number[], hb: { lt: number[]; lb: number[]; rt: number[]; rb: number[]; }, velocity: number, gameBoard: number[][], dsplySize: number) {
    let directions: string[] = ['left', 'up', 'right', 'down'];
    let xyMove = [0,0]
    controller.forEach((key: any) => {
        let temp: string | number;
        switch (key) {
          case moveBinds[0]:
            temp = this.checkMoveAvail(
              hb.lt[1],
              hb.lt[0] - 2 * velocity,
              hb.lb[1],
              hb.lb[0] - 2 * velocity,
              -velocity,
              gameBoard,
              dsplySize
            );
            if (typeof temp === 'string') directions[0] = temp;
            else xyMove[0] = temp;
            break;
          case moveBinds[1]:
            temp = this.checkMoveAvail(
              hb.lt[1] - 2 * velocity,
              hb.lt[0],
              hb.rt[1] - 2 * velocity,
              hb.rt[0],
              -velocity,
              gameBoard,
              dsplySize
            );
            if (typeof temp === 'string') directions[1] = temp;
            else xyMove[1] = temp;
            break;
          case moveBinds[2]:
            temp = this.checkMoveAvail(
              hb.rt[1],
              hb.rt[0] + velocity,
              hb.rb[1],
              hb.rb[0] + velocity,
              velocity,
              gameBoard,
              dsplySize
            );
            if (typeof temp === 'string') directions[2] = temp;
            else xyMove[0] = temp;
            break;
          case moveBinds[3]:
            temp = this.checkMoveAvail(
              hb.lb[1] + velocity,
              hb.lb[0],
              hb.rb[1] + velocity,
              hb.rb[0],
              velocity,
              gameBoard,
              dsplySize
            );
            if (typeof temp === 'string') directions[3] = temp;
            else xyMove[1] = temp;
            break;
        }
      })
      return [directions, xyMove]
  }
}
