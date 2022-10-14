// Copyright 2022-latest the graphqland authors. All rights reserved. MIT license.
// This module is browser compatible.

export {
  type DocumentNode,
  executeSync,
  type ExecutionResult,
  type FormattedExecutionResult,
  getOperationAST,
  GraphQLError,
  type GraphQLFieldResolver,
  type GraphQLFormattedError,
  GraphQLSchema,
  type GraphQLTypeResolver,
  parse,
  specifiedRules,
  validate,
} from "https://esm.sh/v96/graphql@16.6.0";
export { type Maybe } from "https://esm.sh/v96/graphql@16.6.0/jsutils/Maybe.d.ts";
export {
  createHttpError,
  HttpError,
} from "https://deno.land/std@0.159.0/http/http_errors.ts";
export { Status } from "https://deno.land/std@0.159.0/http/http_status.ts";
export { accepts } from "https://deno.land/std@0.159.0/http/negotiation.ts";
export {
  hasOwn,
  isNull,
  isObject,
  isString,
} from "https://deno.land/x/isx@1.0.0-beta.22/mod.ts";
export {
  isErr,
  Result,
  unsafe,
} from "https://deno.land/x/result_js@1.0.0/mod.ts";
export {
  type GraphQLRequestOptions,
  type GraphQLRequestParams,
} from "https://deno.land/x/gql_request@1.0.0-beta.1/mod.ts";
export { type json } from "https://deno.land/x/pure_json@1.0.0-beta.1/mod.ts";
export { match } from "https://deno.land/x/pattern_match@1.0.0-beta.2/mod.ts";

export function isNativeObject(
  // deno-lint-ignore ban-types
  value: {},
): value is { [k: PropertyKey]: unknown } {
  return value.constructor === Object;
}
