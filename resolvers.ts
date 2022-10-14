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

export type RawParams = {
  readonly query?: json;
  readonly operationName?: json;
  readonly variables?: json;
  readonly extensions?: json;
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

export async function resolvePostParams(
  request: Request,
): Promise<Result<RawParams, HttpError>> {
  const textResult = await request.text().then(Result.ok).catch(Result.err);

  if (isErr(textResult)) {
    return Result.err(createHttpError(Status.BadRequest));
  }

  const result = unsafe<json, TypeError>(() => JSON.parse(textResult.value));

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
  request: Request,
): Result<RawParams, HttpError> {
  const url = new URL(request.url);
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
