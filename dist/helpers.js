export class Helper {
    constructor() {
        Object.defineProperty(this, "size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 54
        });
    }
    newTile(id, clname, bkgrd, x, y, size) {
        const el = document.createElement('div');
        el.id = id;
        el.className = clname;
        el.style.backgroundImage = "url('" + bkgrd + "')";
        el.style.top = `${y * size}px`;
        el.style.left = `${x * size}px`;
        return el;
    }
    checkMoveAvail(hbx1, hby1, hbx2, hby2, velo, gameBoard, size) {
        if (![2, 5, 6].includes(gameBoard[Math.round(hbx1 / size)][Math.round(hby1 / size)]) ||
            ![2, 5, 6].includes(gameBoard[Math.round(hbx2 / size)][Math.round(hby2 / size)])) {
            return 'stay';
        }
        else {
            return velo;
        }
    }
    getNRandomFreePositions(amount, width, height, gameBoard) {
        let count = amount;
        let pos = [];
        let busy = '';
        while (count >= 0) {
            const x = Math.floor(Math.random() * (width - 1));
            const y = Math.floor(Math.random() * (height - 1));
            if (gameBoard[y][x] == 2 && x + y > 3 && !busy.includes(`${x},${y};`)) {
                pos.push([x, y]);
                busy += `${x},${y};`;
                count--;
            }
        }
        return pos;
    }
    moveChecker(controller, moveBinds, hb, velocity, gameBoard, dsplySize) {
        let directions = ['left', 'up', 'right', 'down'];
        let xyMove = [0, 0];
        controller.forEach((key) => {
            let temp;
            switch (key) {
                case moveBinds[0]:
                    temp = this.checkMoveAvail(hb.lt[1], hb.lt[0] - 2 * velocity, hb.lb[1], hb.lb[0] - 2 * velocity, -velocity, gameBoard, dsplySize);
                    if (typeof temp === 'string')
                        directions[0] = temp;
                    else
                        xyMove[0] = temp;
                    break;
                case moveBinds[1]:
                    temp = this.checkMoveAvail(hb.lt[1] - 2 * velocity, hb.lt[0], hb.rt[1] - 2 * velocity, hb.rt[0], -velocity, gameBoard, dsplySize);
                    if (typeof temp === 'string')
                        directions[1] = temp;
                    else
                        xyMove[1] = temp;
                    break;
                case moveBinds[2]:
                    temp = this.checkMoveAvail(hb.rt[1], hb.rt[0] + velocity, hb.rb[1], hb.rb[0] + velocity, velocity, gameBoard, dsplySize);
                    if (typeof temp === 'string')
                        directions[2] = temp;
                    else
                        xyMove[0] = temp;
                    break;
                case moveBinds[3]:
                    temp = this.checkMoveAvail(hb.lb[1] + velocity, hb.lb[0], hb.rb[1] + velocity, hb.rb[0], velocity, gameBoard, dsplySize);
                    if (typeof temp === 'string')
                        directions[3] = temp;
                    else
                        xyMove[1] = temp;
                    break;
            }
        });
        return [directions, xyMove];
    }
}
