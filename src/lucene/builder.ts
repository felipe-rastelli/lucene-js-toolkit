import { isEmpty, isNil, isObject } from 'lodash';

import { escapeSpecialCharacters, removeUnescappableSpecialCharacters } from './utils';
import type {
  Disjunction,
  RangeQuery,
  DisjunctionQuery,
  TermQuery,
  TermField,
  TermsQuery,
  Query,
  ClauseQuery
} from './types';

export enum BooleanOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT'
};

function createRange(range: RangeQuery = {} as RangeQuery) {
  const { from, to, inclusive = true } = range;

  if (isNil(from) || isNil(to)) return '';

  return inclusive ? `[${from} TO ${to}]` : `{${from} TO ${to}}`;
}

function createDisjunction(include: Disjunction = [], exclude: Disjunction = []) {
  let disjunctionQuery = '';

  let includeTerms = include.map(normalizeTerm).filter(Boolean);

  if (includeTerms.length > 0) {
    disjunctionQuery = `(${includeTerms.join(` ${BooleanOperator.OR} `)})`;

    if (exclude.length > 0) {
      let excludeDisjunctionQuery = createDisjunction(exclude);
      disjunctionQuery = `(${disjunctionQuery} ${BooleanOperator.AND} ${BooleanOperator.NOT} ${excludeDisjunctionQuery})`;
    }
  }

  return disjunctionQuery;
}

function createDisjunctionQuery(disjunctionQuery: DisjunctionQuery) {
  const { $in, $nin, $range } = disjunctionQuery;

  if (!isEmpty($in) && Array.isArray($in)) {
    return createDisjunction($in, $nin);
  }

  if (!isEmpty($range)) {
    return createRange($range);
  }

  return '';
}

function parseStringTerm(value: string) {
  let str = value.trim();

  if (str.indexOf(' ') > -1) {
    return `"${str}"`;
  }

  str = removeUnescappableSpecialCharacters(str);
  str = escapeSpecialCharacters(str);

  return str;
}

function normalizeTerm(term: string | number | boolean) {
  // Make sure that only primitive values are returned
  if (isObject(term)) return '';

  if (typeof term === 'string') {
    return parseStringTerm(term);
  }

  return term;
}

function createTermQuery(term: TermQuery) {
  if (Array.isArray(term)) {
    return createDisjunction(term);
  }

  if (isObject(term)) {
    return createDisjunctionQuery(term);
  }

  return normalizeTerm(term);
}

function createTermField(fieldName: TermField = '') {
  if (typeof fieldName !== 'string') return '';

  let field = '';

  field = removeUnescappableSpecialCharacters(fieldName.trim());
  field = escapeSpecialCharacters(field, true);

  return `${field}:`;
}

function createClause(term: TermQuery, field: TermField = '', optionalOperator?: BooleanOperator) {
  if (isObject(term) && isEmpty(term)) return '';

  let termField = createTermField(field);
  let termQuery = createTermQuery(term);

  let clause = termQuery !== '' ? `${optionalOperator ?? ''} ${termField}${termQuery}`.trim() : '';

  return clause;
}

function createClauses(
  terms: TermsQuery = {},
  operator: Omit<BooleanOperator, 'NOT'> = BooleanOperator.AND
): Query {
  let query = '';

  if (isObject(terms) && !Array.isArray(terms)) {
    let op = operator != BooleanOperator.OR ? BooleanOperator.AND : operator;

    query = Object.keys(terms)
      .map((field) => createClause(terms[field], field))
      .join(` ${op} `);

    query = query ? `(${query})` : '';
  }

  return query;
}

export function createQuery(queryArgs: ClauseQuery): Query {
  let query = '';

  if (isObject(queryArgs) && !Array.isArray(queryArgs)) {
    const { $operator, terms } = queryArgs;
    query = createClauses(terms, $operator);
  }

  return query;
}

export function createQueries(queriesArgs: Array<ClauseQuery | BooleanOperator>): Query {
  let query = '';

  if (Array.isArray(queriesArgs)) {
    query = queriesArgs
      .reduce((queryChunk, queryArgs, index) => {
        if (
          queryChunk === '' &&
          (queryArgs === BooleanOperator.AND ||
            queryArgs === BooleanOperator.OR ||
            queryArgs === BooleanOperator.NOT)
        ) {
          return queryChunk;
        }

        if (queryArgs === BooleanOperator.AND || queryArgs === BooleanOperator.OR) {
          return `${queryChunk} ${queryArgs}`;
        }

        if (queryArgs === BooleanOperator.NOT) {
          return queryChunk;
        }

        return `${queryChunk} ${createQuery(queryArgs)}`;
      }, '')
      .trim();
  }

  return query;
}
