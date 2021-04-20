/**
 * Convert a literal string to dynamically add variables passed in params object
 * @param {String} literal Literal string having named variables as ${variable}
 * @param {Object} params  Params object having named properties for literal string
 * @example <caption>Example usage of template.</caption>
 * // return Hello Robert, you have 12 unread messages
 * template('Hello ${name}, you have ${count} unread messages', {
 *  name: 'Robert',
 *  count: 12,
 * })
 * @returns {String} Returns plan string after inserting dynamic names
 */
export const tagReplace = function template(literal, params) {
  return new Function(Object.keys(params) as any, 'return `' + literal + '`;')(
    ...Object.values(params),
  );
}
