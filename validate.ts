// Copyright 2022-latest the graphqland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  GraphQLRequestOptions,
  GraphQLRequestParams,
  hasOwn,
  isNativeObject,
  isNull,
  isObject,
  isString,
  json,
  Result,
} from "./deps.ts";

export function validateRequestParams(
  value: json,
): Result<GraphQLRequestOptions & GraphQLRequestParams, TypeError> {
  if (!isObject(value) || !isNativeObject(value)) {
    return Result.err(TypeError(`Value must be JSON object.`));
  }

  if (!hasOwn("query", value)) {
    return Result.err(TypeError(`Missing field. "query"`));
  }

  if (!isString(value.query)) {
    return Result.err(TypeError(`"query" must be string.`));
  }

  if (hasOwn("variables", value)) {
    if (
      (!isNull(value.variables) &&
        !(isObject(value.variables) && isNativeObject(value.variables)))
    ) {
      return Result.err(TypeError(`"variables" must be object or null.`));
    }
  }

  if (
    hasOwn("operationName", value) &&
    !(isNull(value.operationName) || isString(value.operationName))
  ) {
    return Result.err(TypeError(`"operationName" must be string or null.`));
  }

  if (hasOwn("extensions", value)) {
    if (
      !(isNull(value.extensions) ||
        (isObject(value.extensions) && isNativeObject(value.extensions)))
    ) {
      return Result.err(
        TypeError(`"extensions" must be object or null.`),
      );
    }
  }

  const { query, variables, operationName, extensions } = value as
    & GraphQLRequestParams
    & GraphQLRequestOptions;

  return Result.ok({
    operationName,
    variables,
    extensions,
    query,
  });
}
