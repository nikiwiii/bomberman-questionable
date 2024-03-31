import { Helper } from './helpers';
const dsplySize = new Helper().size;
const canSize = 16;

export class Anim {
  private img: CanvasImageSource;
  private tickNumber: number;
  actFrame: number;
  private destId: string;
  private frames: object[];
  private times: number[];
  repeat: boolean;
  pos: number[];
  currDir: string;
  moving: boolean;
  hitbox?: object;
  private currMove;
  private el;
  constructor(
    img: CanvasImageSource,
    ob: { frames: any; times: any; repeat: any },
    destId: string,
    pos: number[],
    currDir: string,
    moving: boolean
  ) {
    this.img = img; // spritesheet
    this.tickNumber = 0; // aktualny tick (u mnie 60/s)
    this.actFrame = 0; // aktualnie renderowana klatka
    this.destId = destId; // id elementu w DOM'ie do wyświetlania klatek (u mnie przez css background-image)
    this.pos = pos;
    this.currDir = currDir;
    this.moving = moving;
    ///// dane z json'a //////
    this.frames = ob.frames; // tablica z klatkami
    this.times = ob.times; // tablica z czasami wyświetleń klatki [u mnie czas w tick'ach]
    this.repeat = ob.repeat; // czy animacja ma się powtarzać

    this.el = document.createElement('canvas');
    this.el.width = canSize;
    this.el.height = canSize;
    if (this.destId === 'player') {
      this.hitbox = {
        lt: [pos[0] * (dsplySize / 2), pos[1] * (dsplySize / 2)],
        rt: [(pos[0] + 1) * (dsplySize / 2), pos[1] * (dsplySize / 2)],
        lb: [pos[0] * (dsplySize / 2), (pos[1] + 1) * (dsplySize / 2)],
        rb: [(pos[0] + 1) * (dsplySize / 2), (pos[1] + 1) * (dsplySize / 2)],
      };
    } else if (this.destId[0] === 'b' && this.destId.length == 7) {
      this.currDir = Math.random() >= 0.5 ? 'right' : 'left';
      this.el.className = 'baloon';
    }
    this.el.id = this.destId;
    this.el.className = !this.el.className
      ? this.destId[0] === 'e'
        ? 'explosion'
        : 'sprite'
      : this.el.className;
    document.querySelectorAll('body')[0].appendChild(this.el);
    this.currMove = this.frames[this.currDir];
    this.goTo(pos[0], pos[1]);
  }

  renderFrame(i: number, dir: string) {
    if (this.moving) {
      let ctx: CanvasRenderingContext2D = this.el.getContext('2d')!;
      ctx.reset();
      this.currMove = this.frames[dir];
      ctx.drawImage(
        this.img,
        this.currMove[i].x0,
        this.currMove[i].y0,
        canSize,
        canSize,
        0,
        0,
        canSize,
        canSize
      );
    }
  }

  goTo(x: number, y: number) {
    if (this.destId == 'player') {
      this.el.style.top = dsplySize * y + 'px';
      this.el.style.left = dsplySize * x + 'px';
    } else {
      const el: HTMLElement = document.getElementById(y + ',' + x)!;
      this.el.style.top = el.style.top;
      this.el.style.left = el.style.left;
    }
    this.pos = [x, y];
  }

  movePlayer(dir: string, xyMove: number[]) {
    let left = parseInt(
      this.el.style.left.substring(0, this.el.style.left.length - 2)
    );
    let top = parseInt(
      this.el.style.top.substring(0, this.el.style.top.length - 2)
    );
    left = left + xyMove[0];
    top = top + xyMove[1];
    this.el.style.left = left + 'px';
    this.el.style.top = top + 'px';
    dir !== 'stay' ? (this.currDir = dir) : null;
    this.pos = [
      Math.round((left + 14) / dsplySize),
      Math.round((top + 14) / dsplySize),
    ];
    this.hitbox = {
      lt: [left, top],
      rt: [left + dsplySize / 2, top],
      lb: [left, top + dsplySize / 1.3],
      rb: [left + dsplySize / 2, top + dsplySize / 1.3],
    };
  }

  moveBaloon(obj: object) {
    if (this.repeat) {
      const dirs = ['left', 'up', 'right', 'down'];
      if (obj[this.currDir]) {
        this.goTo(
          this.pos[0] +
            (this.currDir === 'left' ? -1 : this.currDir === 'right' ? 1 : 0),
          this.pos[1] +
            (this.currDir === 'up' ? -1 : this.currDir === 'down' ? 1 : 0)
        );
      } else {
        this.currDir = dirs[Math.round(Math.random() * 3)];
        return;
      }
      if (Math.random() >= 0.8) {
        this.currDir = dirs[Math.round(Math.random() * 3)];
      }
    }
  }

  goAnim() {
    this.renderFrame(this.actFrame, this.currDir);
    this.tickNumber++;
    if (this.tickNumber == this.times[this.actFrame]) {
      // rotacja klatek
      this.tickNumber = 0;
      this.actFrame++;
    }
    if (this.repeat && this.actFrame == this.currMove.length) {
      this.actFrame = 0;
    } else if (!this.repeat && this.actFrame == this.currMove.length) {
      this.el.style.backgroundImage = 'none';
      this.moving = false;
      this.actFrame = 0;
      this.goTo(0, 0);
      this.el.className === 'baloon' ? this.vanish() : null;
    }
  }
  vanish() {
    this.el.style.display = 'none';
  }
}
