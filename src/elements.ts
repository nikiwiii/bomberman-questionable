export class Elements {
  public stoneUrl?: string;
  public grassUrl?: string;
  public brickUrl?: string;
  public powerUrl?: string;
  constructor() {
    let img: CanvasImageSource = new Image();
    img.src = '../img/sheet.png';
    let canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    let ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    img.onload = () => {
      ctx.drawImage(img, 48, 48, 16, 16, 0, 0, 16, 16);
      this.stoneUrl = canvas.toDataURL();
      ctx.reset();
      ctx.drawImage(img, 0, 65, 16, 16, 0, 0, 16, 16);
      this.grassUrl = canvas.toDataURL();
      ctx.reset();
      ctx.drawImage(img, 64, 48, 16, 16, 0, 0, 16, 16);
      this.brickUrl = canvas.toDataURL();
      ctx.reset();
      ctx.drawImage(img, 16, 224, 16, 16, 0, 0, 16, 16);
      this.powerUrl = canvas.toDataURL();
    };
  }
}
