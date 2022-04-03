import { escapeSpecialCharacters } from './utils';

function parseFieldTerm(str: string) {
  let fieldTermStartIndex = str.lastIndexOf('(') + 1;
  let fieldTerm = str.substring(fieldTermStartIndex, str.length);
  let prefix = str.substring(0, fieldTermStartIndex);

  return `${prefix}${escapeSpecialCharacters(fieldTerm)}`;
}

function parseTerm(str: string) {
  return escapeSpecialCharacters(str);
}

function parseToken(token: string) {
  const separator = ':';

  let terms = token.split(separator);
  let field = '',
    term = '';

  if (terms.length > 1) {
    field = parseFieldTerm(terms[0]);
    term = parseTerm(terms[1]);

    return [field, term].join(separator);
  }

  term = parseTerm(terms[0]);

  return term;
}

function tokenize(str: string) {
  let tokens = str.split(' ');

  return tokens;
}

function joinTokens(tokens: string[]) {
  return tokens.join(' ');
}

export function parse(str: string) {
  let tokens = tokenize(str).map(parseToken);

  return joinTokens(tokens);
}
