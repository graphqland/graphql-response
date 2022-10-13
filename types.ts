// deno-lint-ignore-file no-explicit-any

import {
  GraphQLFieldResolver,
  GraphQLSchema,
  GraphQLTypeResolver,
  Maybe,
} from "./deps.ts";

export interface ExecutionParams {
  schema: GraphQLSchema;
  rootValue?: unknown;
  contextValue?: unknown;
  fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>;
  typeResolver?: Maybe<GraphQLTypeResolver<any, any>>;
  subscribeFieldResolver?: Maybe<GraphQLFieldResolver<any, any>>;
}
