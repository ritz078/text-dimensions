function assert(value: unknown, message = ''): asserts value {
  if (!value) {
    throw Error(message);
  }
}

interface ITextDimensions {
  width: number;
  height: number;
}

const textMetrics = Object.keys(TextMetrics.prototype);

const isMetricsSupported =
  textMetrics.includes('actualBoundingBoxAscent') &&
  textMetrics.includes('actualBoundingBoxDescent');

function isRowBlank(imageData: ImageData, width: number, y: number) {
  for (let x = 0; x < width; ++x) {
    if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
  }
  return true;
}

function isColumnBlank(
  imageData: ImageData,
  width: number,
  x: number,
  top: number,
  bottom: number
) {
  for (let y = top; y < bottom; ++y) {
    if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
  }
  return true;
}

export default class TextDimensions {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  canvasElem?: HTMLCanvasElement;
  font: string;

  constructor(font = '') {
    if ('OffscreenCanvas' in window && typeof OffscreenCanvas === 'function') {
      const canvas = new OffscreenCanvas(1000, 100);
      this.ctx = canvas.getContext('2d');
    } else {
      this.canvasElem = document.createElement('canvas');
      document.body.appendChild(this.canvasElem);
      this.ctx = this.canvasElem.getContext('2d');

      assert(this.ctx);
      this.ctx.canvas.width = 1000;
      this.ctx.canvas.height = 1000;
    }

    this.font = font;

    assert(this.ctx);
    this.ctx.font = font;
  }

  private calculateBoundingBox = (text: string): number => {
    assert(this.ctx);
    this.ctx.fillText(text, 0, 0);
    const { width, height } = this.ctx.canvas;
    const imageData = this.ctx.getImageData(0, 0, width, height);
    let top = 0,
      bottom = imageData.height,
      left = 0,
      right = imageData.width;

    while (top < bottom && isRowBlank(imageData, width, top)) ++top;
    while (bottom - 1 > top && isRowBlank(imageData, width, bottom - 1))
      --bottom;
    while (left < right && isColumnBlank(imageData, width, left, top, bottom))
      ++left;
    while (
      right - 1 > left &&
      isColumnBlank(imageData, width, right - 1, top, bottom)
    )
      --right;

    return bottom - top;
  };

  public measureText = (text: string, font = this.font): ITextDimensions => {
    assert(this.ctx);
    this.ctx.font = font;
    const {
      width,
      actualBoundingBoxAscent,
      actualBoundingBoxDescent,
    } = this.ctx.measureText(text);

    const height = isMetricsSupported
      ? actualBoundingBoxAscent + actualBoundingBoxDescent
      : this.calculateBoundingBox(text);

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  };

  public clean = () => {
    if (this.canvasElem) {
      document.body.removeChild(this.canvasElem);
    }
  };
}
