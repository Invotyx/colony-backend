import * as marked from 'marked';

marked.setOptions({ headerIds: false, xhtml: true });
export const MarkDown = (
  content: string,
  options?: marked.MarkedOptions
): Promise<string> => {
  return new Promise((res, rej) => {
    marked.parse(content, options || {}, (err, data) => {
      if (err) rej(err);
      else res(data);
    });
  });
};
