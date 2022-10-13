export {
  type DocumentNode,
  executeSync,
  type ExecutionArgs,
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
  Status,
} from "https://deno.land/std@0.159.0/http/mod.ts";
export { accepts } from "https://deno.land/std@0.159.0/http/mod.ts";
export {
  hasOwn,
  isNull,
  isObject,
  isString,
  isUndefined,
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
export {
  JSON,
  type json,
} from "https://deno.land/x/pure_json@1.0.0-beta.1/mod.ts";

export function isNativeObject(
  // deno-lint-ignore ban-types
  value: {},
): value is { [k: PropertyKey]: unknown } {
  return value.constructor === Object;
}
