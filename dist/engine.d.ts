export declare class Anim {
    private img;
    private tickNumber;
    actFrame: number;
    private destId;
    private frames;
    private times;
    repeat: boolean;
    pos: number[];
    currDir: string;
    moving: boolean;
    hitbox?: object;
    private currMove;
    private el;
    left: number;
    top: any;
    constructor(img: CanvasImageSource, ob: {
        frames: any;
        times: any;
        repeat: any;
    }, destId: string, pos: number[], currDir: string, moving: boolean, cName: String, sheetPose: number);
    renderFrame(i: number): void;
    goTo(x: number, y: number): void;
    movePlayer(dir: string, xyMove: number[]): void;
    moveBaloon(obj: object): void;
    goAnim(): void;
    vanish(): void;
    turnOff(): void;
    turnOn(repeat: boolean): void;
}
