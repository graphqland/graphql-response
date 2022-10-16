// Copyright 2022-latest the graphqland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  accepts,
  DocumentNode,
  executeSync,
  ExecutionResult,
  getOperationAST,
  GraphQLError,
  HttpError,
  isErr,
  match,
  object,
  optional,
  parse,
  Result,
  specifiedRules,
  Status,
  string,
  unsafe,
  validate,
  validateSchema,
} from "./deps.ts";
import { RawParams, resolveGetParams, resolvePostParams } from "./resolvers.ts";
import { ExecutionParams } from "./types.ts";

const GraphQLParams = object({
  query: string(),
  operationName: optional(string()),
  variables: optional(object()),
  extensions: optional(object()),
});

const APP_GQL_RESPONSE = "application/graphql-response+json";
const APP_JSON = "application/json";

/** Create a GraphQL-over-HTTP compliant HTTP `Response` from an HTTP `Request`.
 *
 * @example
 * ```ts
 * import { createResponse } from "https://deno.land/x/gaphql_response@$VERSION/mod.ts";
 * import { buildSchema } from "https://esm.sh/graphql@$VERSION";
 *
 * const url = new URL("http://localhost/graphql");
 * const query = `query Test { greet }`;
 * url.searchParams.set("query", query);
 * const qqlRequest = new Request(url);
 *
 * const schema = buildSchema(`type Query {
 *   greet: String
 * }`);
 * const response = await createResponse(qqlRequest, {
 *   schema,
 *   rootValue: {
 *     greet: () => "hello world!",
 *   },
 * });
 * ```
 */
export async function createResponse(
  request: Request,
  params: ExecutionParams,
): Promise<Response> {
  if (!(request.method === "GET" || request.method === "POST")) {
    return new Response(null, {
      status: Status.MethodNotAllowed,
      headers: {
        allow: "GET,POST",
      },
    });
  }

  const accept = accepts(request, APP_GQL_RESPONSE, APP_JSON) as
    | undefined
    | typeof APP_GQL_RESPONSE
    | typeof APP_JSON;

  if (!accept) {
    return new Response([APP_GQL_RESPONSE, APP_JSON].join(","), {
      status: Status.NotAcceptable,
      headers: {
        vary: "accept",
      },
    });
  }

  const contentType = request.headers.get("content-type");

  if (
    request.method === "POST" &&
    !contentType?.trim()?.toLowerCase()?.startsWith(APP_JSON)
  ) {
    return new Response(undefined, {
      status: Status.UnsupportedMediaType,
      headers: {
        vary: "content-type",
      },
    });
  }

  const value = await match<
    "GET" | "POST",
    Promise<Result<RawParams, HttpError>> | Result<RawParams, HttpError>,
    Request
  >(
    request.method,
    { GET: resolveGetParams, POST: resolvePostParams },
    request,
  );

  if (isErr(value)) return responseFrom(value.value);

  const validationResult = validateSchema(value.value, GraphQLParams);

  if (validationResult[0]) {
    return new Response(
      validationResult[0].message ??
        "GraphQL request parameter is invalid.",
      {
        status: Status.BadRequest,
      },
    );
  }

  const { query, variables: variableValues, operationName } =
    validationResult[1];
  const {
    schema,
    contextValue,
    fieldResolver,
    rootValue,
    subscribeFieldResolver,
    typeResolver,
  } = params;

  const documentResult = unsafe<DocumentNode, GraphQLError>(() => parse(query));

  if (isErr(documentResult)) {
    return new Response(documentResult.value.message, {
      status: Status.BadRequest,
    });
  }

  const document = documentResult.value;
  const operationAST = getOperationAST(document, operationName);

  if (
    request.method === "GET" && operationAST &&
    operationAST.operation !== "query"
  ) {
    const message =
      `Invalid GraphQL operation. Can only perform a ${operationAST.operation} operation from a POST request.`;

    return new Response(message, {
      status: Status.MethodNotAllowed,
      headers: {
        allow: "POST",
      },
    });
  }

  const validationErrors = validate(schema, document, specifiedRules);
  if (validationErrors.length > 0) {
    const result: ExecutionResult = { errors: validationErrors };

    return new Response(JSON.stringify(result), {
      status: Status.BadRequest,
      headers: {
        "content-type": withCharset(accept),
      },
    });
  }

  const executionResult = executeSync({
    schema,
    document,
    rootValue,
    contextValue,
    variableValues,
    operationName,
    fieldResolver,
    typeResolver,
    subscribeFieldResolver,
  });

  const response = match(accept, {
    [APP_JSON]: (contentType) => {
      return new Response(JSON.stringify(executionResult), {
        status: Status.OK,
        headers: {
          "content-type": withCharset(contentType),
        },
      });
    },
    [APP_GQL_RESPONSE]: (contentType) => {
      const mediaType = withCharset(contentType);
      const data = JSON.stringify(executionResult);

      if ("data" in executionResult) {
        return new Response(data, {
          status: Status.OK,
          headers: {
            "content-type": mediaType,
          },
        });
      }

      return new Response(data, {
        status: Status.BadRequest,
        headers: {
          "content-type": mediaType,
        },
      });
    },
  });

  return response;
}

function responseFrom(error: HttpError): Response {
  return new Response(error.expose ? error.message : null, {
    headers: error.headers,
    status: error.status,
  });
}

function withCharset<T extends string>(value: T): `${T};charset=UTF-8` {
  return `${value};charset=UTF-8`;
}
