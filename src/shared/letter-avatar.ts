interface I {
  initials: string;
  background: string;
  bold: boolean;
  color: string;
  rounded: boolean;
  size: number;
}

const genSvg = ({ initials, background, bold, color, rounded, size }: I) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${size} ${size}" version="1.1">${
    rounded
      ? `<circle fill="${background}" cx="${
          size / 2
        }" width="${size}" height="${size}" cy="${size / 2}" r="${size / 2}"/>`
      : `<rect fill="${background}" width="${size}" height="${size}"/>`
  }<text x="50%" y="50%" style="color: ${color}; line-height: 1;font-family: Arial;" alignment-baseline="middle" text-anchor="middle" font-size="${Math.floor(
    0.44 * size
  )}" font-weight="${
    bold ? 600 : 500
  }" dy=".1em" dominant-baseline="middle" fill="${color}">${initials}</text></svg>`;
};

const drawCircle = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  background: string
) => {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width / 2;
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = background;
  context.fill();
};

const drawSquare = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  background: string
) => {
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
};

const genPng = ({ initials, background, bold, color, rounded, size }: I) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (rounded) {
    drawCircle(canvas, context, background);
  } else {
    drawSquare(canvas, context, background);
  }

  context.font = `${bold ? 'bold' : ''} ${Math.round(
    canvas.width / 2
  )}px Arial`;
  context.textAlign = 'center';
  context.fillStyle = color;
  context.fillText(initials, size / 2, size / 1.5);
  return canvas.toDataURL();
};

const getInitial = (name: string, uppercase: boolean) => {
  const i = name.indexOf(' ') + 1;
  const j = i ? name[0] + name[i] : name[0];
  return uppercase ? j.toUpperCase() : j;
};

export const LetterAvatar = ({
  name = '?',
  background = '#9C27B0',
  bold = false,
  color = '#FFF',
  format = 'png',
  rounded = false,
  size = 128,
  uppercase = true,
} = {}) => {
  if (window.devicePixelRatio) {
    size = size * window.devicePixelRatio;
  }
  const initials = getInitial(name, uppercase);
  const options: I = { initials, background, bold, color, rounded, size };
  return format === 'svg' ? genSvg(options) : genPng(options);
};

export const dataURLToFile = async (v: string) => {
  const data = await fetch(v);
  const buffer = await data.arrayBuffer();
  return new File([buffer], 'avatar.png', { type: 'image/png' });
};

/* Example
https://ui-avatars.com/api/?name=a&background=9c27b0&bold=true&color=fff&format=svg&rounded=true&size=128&uppercase=false
*/
