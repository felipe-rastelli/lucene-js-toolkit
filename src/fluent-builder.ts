import { isObject } from 'lodash';

// Ref

[ // query group ()
  [ // clauses ()
    [field, term]
  ],
  op,
  [
    term
  ]
]

query = []
clauses = {
  field: {
    must: [],
    should: [],
    must_not: []
  }
}

// ((field1:value1) )
// ordenação de queries: 
// 1 - primeiro filtra por tudo o que deve ter
// 2 - em seguida remove tudo o que não deve ter do dataset de resultado

interface Term {
  $eq: string | number | boolean,  // must
  $ne: string | number | boolean,  // must_not
  $in: string[] | number[], // disjunction
  $nin: string[] | number[], // disjunction
  $gt: string | number,  // range
  $gte: string | number, // range
  $lt: string | number,  // range
  $lte: string | number, // range
  $startWith: string,  // wildcard
  $endsWith: string, // wildcard
  $contains: string, // wildcard
  $exists: boolean, // must exists
  // not:
}

// function parseTermValue(term) {
//   if(isObject(term)) {

//   }
// }


export class Builder {
  private queries = [];
  private clauses = {};

  constructor() {

  }

  fromObject() {

  }

  and() {}

  or() {}

  not() {}

  addTerm(term: string | number | boolean | Term, field: string) {
    if(!this.clauses[field]) {
      this.clauses[field] = {
        must: [],
        must_not: []
      };
    }

    if(isObject(term)) {
      let { $eq, $ne, $in, $nin, $exists, $startWith, $endsWith, $contains, $gt, $gte, $lt, $lte } = term;

      // $eq = $in > $startWith > $endsWith > $contains -> precedência, exclusivos entre si
      // $ne = $nin -> precedência, devem construir uma query exclusiva após a query de filtro
      // $gte > $gt -> precedência, $gte inclui o valor ([]), $gt exclui o valor ({})
      // $lte > $lt -> precedência, $lte inclui o valor ([]), $lt exclui o valor ({})

      if($eq || $in) {
        this.clauses[field].must = [...this.clauses[field].must_not, $ep, ...$in];
      }

      if($startWith) {
        // add wildcard
      }

      if($endsWith) {
        // add wildcard
      }

      if($contains) {
        // add wildcard
      }

      if($gte || $gt) {
        // add range begin
      }

      if($lte || $lt) {
        // add range end
      }

      if($ne || $nin) {
        this.clauses[field].must_not = [...this.clauses[field].must_not, $ne, ...$nin];
      }
    }

    return this;
  }

  addClause(term, field) {}

  addDisjunction() {}

  startQuery() {
    this.clauses = {};

    return this;
  }

  endQuery() {
    this.queries.push(this.clauses);
    this.clauses = {};

    return this;
  } // end group
}