import { BooleanOperator } from './builder';

export type TermField = string;

export type TermQuery = string | number | boolean | Disjunction | DisjunctionQuery;

export type Query = string;

export type Disjunction = string[] | number[];

export interface RangeQuery {
  from: string | number,
  to: string | number,
  inclusive?: boolean
};

export interface DisjunctionQuery {
  $in?: string[] | number[],
  $nin?: string[] | number[],
  $range?: RangeQuery
};

export interface TermsQuery { 
  [field: TermField]: TermQuery 
};

export interface ClauseQuery {
  $operator?: Omit<BooleanOperator, 'NOT'>,
  terms: TermsQuery
};