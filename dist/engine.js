import { Helper } from './helpers.js';
const dsplySize = new Helper().size;
const canSize = 16;
export class Anim {
    constructor(img, ob, destId, pos, currDir, moving, cName, sheetPose) {
        Object.defineProperty(this, "img", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tickNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "actFrame", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "destId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "frames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "times", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "repeat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pos", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currDir", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "moving", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hitbox", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currMove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "el", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "left", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "top", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.img = img;
        this.tickNumber = 0;
        this.actFrame = 0;
        this.destId = destId;
        this.pos = pos;
        this.currDir = currDir;
        this.moving = moving;
        this.frames = ob.frames;
        this.times = ob.times;
        this.repeat = ob.repeat;
        this.left = dsplySize;
        this.top = dsplySize;
        this.el = document.createElement('canvas');
        this.el.width = canSize;
        this.el.height = canSize;
        this.el.id = this.destId;
        this.el.className = cName;
        const unfuckPosition = cName === "otherplayer" ? [16, 12] : [0, 0];
        if (this.el.id === 'player') {
            this.hitbox = {
                lt: [pos[0] * (dsplySize / 2), pos[1] * (dsplySize / 2)],
                rt: [(pos[0] + 1) * (dsplySize / 2), pos[1] * (dsplySize / 2)],
                lb: [pos[0] * (dsplySize / 2), (pos[1] + 1) * (dsplySize / 2)],
                rb: [(pos[0] + 1) * (dsplySize / 2), (pos[1] + 1) * (dsplySize / 2)],
            };
        }
        else
            this.el.style.transform = `translateY(${-sheetPose * dsplySize + unfuckPosition[0]}px) translateX(${unfuckPosition[1]}px)`;
        if (cName === 'baloon')
            this.currDir = Math.random() >= 0.5 ? 'right' : 'left';
        cName !== 'player' ? document.querySelector('#sprites').appendChild(this.el) : document.querySelector('#app').appendChild(this.el);
        this.currMove = this.frames[this.currDir];
        this.goTo(pos[0], pos[1]);
    }
    renderFrame(i) {
        let ctx = this.el.getContext('2d');
        ctx.reset();
        ctx.drawImage(this.img, this.currMove[i].x0, this.currMove[i].y0, canSize, canSize, 0, 0, canSize, canSize);
    }
    goTo(x, y) {
        if (this.destId != 'player') {
            this.el.style.left = `${x * dsplySize}px`;
            this.el.style.top = `${y * dsplySize}px`;
            this.pos = [x, y];
        }
    }
    movePlayer(dir, xyMove) {
        this.left = this.left + xyMove[0];
        this.top = this.top + xyMove[1];
        document.querySelector('#test').style.marginLeft = `calc(50vw + ${-this.left}px)`;
        document.querySelector('#test').style.marginTop = `calc(50vh + ${-this.top}px)`;
        dir !== 'stay' ? (this.currDir = dir) : null;
        this.pos = [
            Math.round((this.left + 14) / dsplySize),
            Math.round((this.top + 14) / dsplySize),
        ];
        this.hitbox = {
            lt: [this.left, this.top],
            rt: [this.left + dsplySize / 2, this.top],
            lb: [this.left, this.top + dsplySize / 1.3],
            rb: [this.left + dsplySize / 2, this.top + dsplySize / 1.3],
        };
    }
    moveBaloon(obj) {
        if (this.repeat) {
            const dirs = ['left', 'up', 'right', 'down'];
            if (obj[this.currDir]) {
                this.goTo(this.pos[0] + (this.currDir === 'left' ? -1 : this.currDir === 'right' ? 1 : 0), this.pos[1] + (this.currDir === 'up' ? -1 : this.currDir === 'down' ? 1 : 0));
            }
            else {
                this.currDir = dirs[Math.round(Math.random() * 3)];
                return;
            }
            if (Math.random() >= 0.8)
                this.currDir = dirs[Math.round(Math.random() * 3)];
        }
    }
    goAnim() {
        if (this.moving) {
            this.currMove = this.frames[this.currDir];
            if (this.el.className.includes("player"))
                this.actFrame >= this.currMove.length ? this.actFrame = 0 : null;
            this.renderFrame(this.actFrame);
            this.tickNumber++;
            if (this.tickNumber == this.times[this.actFrame]) {
                this.tickNumber = 0;
                this.actFrame++;
            }
            if (this.repeat && this.actFrame == this.currMove.length)
                this.actFrame = 0;
            else if (!this.repeat && this.actFrame == this.currMove.length) {
                this.turnOff();
                this.actFrame = 0;
            }
        }
    }
    vanish() {
        this.el.style.display = 'none';
    }
    turnOff() {
        this.el.getContext('2d').reset();
        this.moving = false;
        this.el.className === "baloon" ? this.goTo(0, 0) : null;
        if (this.el.className == "otherplayer") {
            this.tickNumber = 0;
            this.actFrame = 0;
        }
    }
    turnOn(repeat) {
        this.tickNumber = 0;
        this.actFrame = 0;
        this.repeat = repeat;
        this.moving = true;
    }
}
