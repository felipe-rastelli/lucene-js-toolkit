const ESCAPE_OPERATOR = '\\\\';

const matchLuceneSpecialCharactersRegex = /\+|-|&|\||!|\(|\)|{|}|\[|\]|\^|"|~|\*|\?|:|\\|\//g;
const matchLuceneCharactersToRemoveRegex = /<|>/g;
const matchWhitespacesRegex = /\s/g;

export function escapeSpecialCharacters(value = '', escapeWhitespaces = false) {
  let str = value;
  
  if(typeof value === 'string' && value !== '') {
    // Replace special characters with '\\' + character
    str = value.replace(
      matchLuceneSpecialCharactersRegex, 
      `${ESCAPE_OPERATOR}$&`
    );
  
    if(escapeWhitespaces) {
      str = str.replace(matchWhitespacesRegex, `${ESCAPE_OPERATOR}$&`);
    }
  }

  return str;
};

export function removeUnescappableSpecialCharacters(value = '') {
  let str = value;

  if(typeof value === 'string' && value !== '') {
    // The characters < and > are unscappable, the only way to prevent is to remove from the query
    str = value.replace(matchLuceneCharactersToRemoveRegex, '').trim();
  }

  return str;
};
