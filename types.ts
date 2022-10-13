// Copyright 2022-latest the graphqland authors. All rights reserved. MIT license.
// This module is browser compatible.

// deno-lint-ignore-file no-explicit-any

import {
  GraphQLFieldResolver,
  GraphQLSchema,
  GraphQLTypeResolver,
  Maybe,
} from "./deps.ts";

/** GraphQL execution parameters.
 * The difference from `ExecutionArgs` in `graphql` is that the following fields are not present.
 * - document
 * - variableValues
 * - operationName
 */
export interface ExecutionParams {
  /** The GraphQL type system to use when validating and executing a query. */
  readonly schema: GraphQLSchema;

  /** The value provided as the first argument to resolver functions on the top level type (e.g. the query object type). */
  readonly rootValue?: unknown;

  /** The context value is provided as an argument to resolver functions after field arguments. It is used to pass shared information useful at any point during executing this query, for example the currently logged in user and connections to databases or other services. */
  readonly contextValue?: unknown;

  /** A resolver function to use when one is not provided by the schema. If not provided, the default field resolver is used (which looks for a value or method on the source value with the field's name). */
  readonly fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>;

  /** A type resolver function to use when none is provided by the schema. If not provided, the default type resolver is used (which looks for a `__typename` field or alternatively calls the `isTypeOf` method). */
  readonly typeResolver?: Maybe<GraphQLTypeResolver<any, any>>;

  readonly subscribeFieldResolver?: Maybe<GraphQLFieldResolver<any, any>>;
}
