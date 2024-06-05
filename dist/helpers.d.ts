export declare class Helper {
    size: number;
    constructor();
    newTile(id: string, clname: string, bkgrd: string, x: number, y: number, size: number): HTMLDivElement;
    checkMoveAvail(hbx1: number, hby1: number, hbx2: number, hby2: number, velo: number, gameBoard: number[][], size: number): number | "stay";
    getNRandomFreePositions(amount: number, width: number, height: number, gameBoard: number[][]): number[][];
    moveChecker(controller: number[], moveBinds: number[], hb: {
        lt: number[];
        lb: number[];
        rt: number[];
        rb: number[];
    }, velocity: number, gameBoard: number[][], dsplySize: number): (number[] | string[])[];
}
