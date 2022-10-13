// Copyright 2022-latest the graphqland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  createHttpError,
  GraphQLRequestOptions,
  GraphQLRequestParams,
  HttpError,
  isErr,
  isNativeObject,
  isObject,
  json,
  Result,
  Status,
  unsafe,
} from "./deps.ts";
import { validateRequestParams } from "./validate.ts";

type Raw = {
  query?: json;
  operationName?: json;
  variables?: json;
  extensions?: json;
};

export function validate(data: json): Result<
  GraphQLRequestParams & GraphQLRequestOptions,
  HttpError
> {
  const result = validateRequestParams(data);

  if (isErr(result)) {
    return Result.err(
      createHttpError(Status.BadRequest, result.value.message, {
        expose: true,
      }),
    );
  }

  return result;
}

export function resolvePostParams(text: string): Result<Raw, HttpError> {
  const result = unsafe<json, TypeError>(() => JSON.parse(text));

  if (isErr(result)) {
    return Result.err(
      createHttpError(Status.BadRequest, "Invalid JSON format."),
    );
  }

  const data = result.value;

  if (!isObject(data) || !isNativeObject(data)) {
    return Result.err(
      createHttpError(Status.BadRequest, "JSON must be object."),
    );
  }

  const { query, variables = null, operationName = null, extensions = null } =
    data;

  return Result.ok({
    query,
    variables,
    operationName,
    extensions,
  });
}

export function resolveGetParams(
  url: URL,
): Result<Raw, HttpError> {
  const query = url.searchParams.get("query");
  const operationName = url.searchParams.get("operationName");

  const variables = url.searchParams.has("variables")
    ? unsafe<json, TypeError>(() =>
      JSON.parse(url.searchParams.get("variables")!)
    )
    : Result.ok(null);

  if (isErr(variables)) {
    return Result.err(createHttpError(
      Status.BadRequest,
      `"variables" is invalid JSON format.`,
      { expose: true },
    ));
  }

  const extensions = url.searchParams.has("extensions")
    ? unsafe<json, TypeError>(() =>
      JSON.parse(url.searchParams.get("extensions")!)
    )
    : Result.ok(null);

  if (isErr(extensions)) {
    return Result.err(createHttpError(
      Status.BadRequest,
      `"extensions" is invalid JSON format.`,
      { expose: true },
    ));
  }

  return Result.ok({
    query,
    operationName,
    variables: variables.value,
    extensions: extensions.value,
  });
}
