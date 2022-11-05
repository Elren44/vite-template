import { resolve } from 'path';
import * as fs from 'fs';

function pictureRender(url, imgTag) {
  if (imgTag.indexOf('data-src') > 0) {
    imgTag = imgTag.replace(
      '<img',
      '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" ',
    );
    return `<picture><source data-srcset="${url}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" type="image/webp">${imgTag}</picture>`;
  } else {
    return `<picture><source srcset="${url}" type="image/webp">${imgTag}</picture>`;
  }
}
function getSrcUrl(markup, attr) {
  let srcArr = [];
  const rexp = new RegExp(`${attr}=\"(.*?)\"`, 'i');
  markup.split(' ').forEach((item, index, arr) => {
    if (attr && item.includes(attr)) {
      srcArr.push(item);
      srcArr.push(arr[index + 1]);
    }
  });
  return srcArr.join(' ').match(rexp)[1];
}

const createPicture = (html) => {
  const extensions = ['.jpg', '.png', '.jpeg', '.GIF', '.gif', '.JPG', '.PNG', '.JPEG'];

  let inPicture = false;
  const data = html
    .toString()
    .split('\n')
    .map(function (line) {
      // Вне <picture/>?
      if (line.indexOf('<picture') + 1) inPicture = true;
      if (line.indexOf('</picture') + 1) inPicture = false;
      // Проверяем есть ли <img/>
      if (line.indexOf('<img') + 1 && !inPicture) {
        // Новый урл с .webp
        const Re = /<img([^>]*)src=\"(\S+)\"([^>]*)>/gi;
        let regexpItem,
          regexArr = [],
          imgTagArr = [],
          newUrlArr = [],
          newHTMLArr = [];
        while ((regexpItem = Re.exec(line))) {
          regexArr.push(regexpItem);
        }
        regexArr.forEach((item) => {
          if (item[0].includes('srcset=')) {
            newUrlArr.push(`${item[2]}, ${getSrcUrl(item[0], 'srcset')}`);
          } else {
            newUrlArr.push(item[2]);
          }
          imgTagArr.push(item[0]);
        });
        // Если в урле есть .gif или .svg, пропускаем
        for (let i = 0; i < newUrlArr.length; i++) {
          if (newUrlArr[i].includes('.svg') || newUrlArr[i].includes('.gif')) {
            newHTMLArr.push(imgTagArr[i]);
            continue;
          } else {
            for (let k of extensions) {
              k = new RegExp(k, 'g');
              newUrlArr[i] = newUrlArr[i].replace(k, '.webp');
            }
            newHTMLArr.push(pictureRender(newUrlArr[i], imgTagArr[i]));
          }
          line = line.replace(imgTagArr[i], newHTMLArr[i]);
        }
        return line;
      }
      return line;
    })
    .join('\n');
  return data;
};

export default function viteWebpHtml() {
  return {
    name: 'vite_webP_html',
    writeBundle() {
      let html = '';
      try {
        html = fs.readFileSync(resolve('./dist/index.html'), 'utf8');
      } catch (err) {
        console.error(err);
      }
      const newHtml = createPicture(html);
      try {
        setTimeout(() => {
          fs.writeFileSync(resolve('./dist/index.html'), newHtml);
          console.log('> tags Img converted to tags Picture successfully');
        }, '1000');
      } catch (err) {
        console.error(err);
      }
    },
  };
}
