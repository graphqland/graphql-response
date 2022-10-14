import { createResponse } from "./response.ts";
import {
  assertEqualsResponse,
  buildSchema,
  describe,
  it,
  Status,
} from "./dev_deps.ts";

const url = "http://test.test";
const schema = buildSchema(`type Query {
  hello: String!
}`);

describe("createResponse", () => {
  it("should return 405 when the HTTP method is not GET or POST", async () => {
    const invalidResponse = new Response(null, {
      status: Status.MethodNotAllowed,
      headers: {
        allow: "GET,POST",
      },
    });
    const table: [...Parameters<typeof createResponse>, Response][] = [
      [new Request(url, { method: "PUT" }), { schema }, invalidResponse],
      [new Request(url, { method: "PATCH" }), { schema }, invalidResponse],
      [new Request(url, { method: "HEAD" }), { schema }, invalidResponse],
      [new Request(url, { method: "OPTIONS" }), { schema }, invalidResponse],
      [new Request(url, { method: "SEARCH" }), { schema }, invalidResponse],
    ];

    await Promise.all(table.map(async ([req, args, expected]) => {
      await assertEqualsResponse(
        await createResponse(req, args),
        expected,
      );
    }));
  });

  it("should return 406 when accept header is not supported value", async () => {
    const invalidResponse = new Response(
      "application/graphql-response+json,application/json",
      {
        status: Status.NotAcceptable,
        headers: {
          vary: "accept",
        },
      },
    );
    const table: [...Parameters<typeof createResponse>, Response][] = [
      [
        new Request(url, { headers: { accept: "text/*" } }),
        { schema },
        invalidResponse,
      ],
      [
        new Request(url, { headers: { accept: " image/* " } }),
        { schema },
        invalidResponse,
      ],
    ];

    await Promise.all(table.map(async ([req, args, expected]) => {
      await assertEqualsResponse(
        await createResponse(req, args),
        expected,
      );
    }));
  });

  it("should return 415 when the content type is not application/json", async () => {
    const invalidResponse = new Response(
      undefined,
      {
        status: Status.UnsupportedMediaType,
        headers: {
          vary: "content-type",
        },
      },
    );
    const table: [...Parameters<typeof createResponse>, Response][] = [
      [
        new Request(url, {
          method: "POST",
          body: "",
          headers: { "content-type": "text/plain" },
        }),
        { schema },
        invalidResponse,
      ],
      [
        new Request(url, {
          method: "POST",
          body: "",
          headers: { "content-type": "image/jpg" },
        }),
        { schema },
        invalidResponse,
      ],
    ];

    await Promise.all(table.map(async ([req, args, expected]) => {
      await assertEqualsResponse(
        await createResponse(req, args),
        expected,
      );
    }));
  });

  it("should return 400 when GET query string is invalid", async () => {
    const responseInit: ResponseInit = {
      status: Status.BadRequest,
      headers: {
        "content-type": "text/plain;charset=UTF-8",
      },
    };

    const table: [...Parameters<typeof createResponse>, Response][] = [
      [
        new Request(url),
        { schema },
        new Response(`"query" must be string.`, responseInit),
      ],
      [
        new Request("http://test.test?query=1"),
        { schema },
        new Response(`Syntax Error: Unexpected Int "1".`, responseInit),
      ],
      [
        new Request("http://test.test?query=1&variables=[["),
        { schema },
        new Response(`"variables" is invalid JSON format.`, responseInit),
      ],
      [
        new Request("http://test.test?query=1&variables=1"),
        { schema },
        new Response(`"variables" must be object or null.`, responseInit),
      ],
      [
        new Request("http://test.test?query=1&variables={}"),
        { schema },
        new Response(`Syntax Error: Unexpected Int "1".`, responseInit),
      ],
      [
        new Request("http://test.test?query=1&extensions=1"),
        { schema },
        new Response(`"extensions" must be object or null.`, responseInit),
      ],
      [
        new Request("http://test.test?query=1&extensions=["),
        { schema },
        new Response(`"extensions" is invalid JSON format.`, responseInit),
      ],
      [
        new Request("http://test.test?query=1&extensions={}"),
        { schema },
        new Response(`Syntax Error: Unexpected Int "1".`, responseInit),
      ],
      [
        new Request("http://test.test?query=1&operatonName=null"),
        { schema },
        new Response(`Syntax Error: Unexpected Int "1".`, responseInit),
      ],
    ];

    await Promise.all(table.map(async ([req, args, expected]) => {
      await assertEqualsResponse(
        await createResponse(req, args),
        expected,
      );
    }));
  });

  it("should return 400 when POST body is invalid", async () => {
    const responseInit: ResponseInit = {
      status: Status.BadRequest,
      headers: {
        "content-type": "text/plain;charset=UTF-8",
      },
    };

    const requestInit: RequestInit = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    };

    const table: [...Parameters<typeof createResponse>, Response][] = [
      [
        new Request(url, {
          ...requestInit,
          body: "[[",
        }),
        { schema },
        new Response(`Invalid JSON format.`, responseInit),
      ],
      [
        new Request(url, {
          ...requestInit,
          body: "[]",
        }),
        { schema },
        new Response(`JSON must be object.`, responseInit),
      ],
      [
        new Request(url, {
          ...requestInit,
          body: "{}",
        }),
        { schema },
        new Response(`"query" must be string.`, responseInit),
      ],
      [
        new Request(url, {
          ...requestInit,
          body: JSON.stringify({ query: "" }),
        }),
        { schema },
        new Response(`Syntax Error: Unexpected <EOF>.`, responseInit),
      ],
      [
        new Request(url, {
          ...requestInit,
          body: `{"query":"","variables":1}`,
        }),
        { schema },
        new Response(`"variables" must be object or null.`, responseInit),
      ],
      [
        new Request(url, {
          ...requestInit,
          body: `{"query":"","operationName":1}`,
        }),
        { schema },
        new Response(`"operationName" must be string or null.`, responseInit),
      ],
      [
        new Request(url, {
          ...requestInit,
          body: `{"query":"","extensions":1}`,
        }),
        { schema },
        new Response(`"extensions" must be object or null.`, responseInit),
      ],
      [
        new Request(url, {
          ...requestInit,
          body:
            `{"query":"","extensions":{},"variables":{},"operationName":""}`,
        }),
        { schema },
        new Response(`Syntax Error: Unexpected <EOF>.`, responseInit),
      ],
    ];

    await Promise.all(table.map(async ([req, args, expected]) => {
      await assertEqualsResponse(
        await createResponse(req, args),
        expected,
      );
    }));
  });

  it("should return 400 when the query is invalid graphql format", async () => {
    const table: [...Parameters<typeof createResponse>, Response][] = [
      [
        new Request(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: `{"query":"query {hello;"}`,
        }),
        { schema },
        new Response(`Syntax Error: Unexpected character: ";".`, {
          status: Status.BadRequest,
          headers: {
            "content-type": "text/plain;charset=UTF-8",
          },
        }),
      ],
    ];

    await Promise.all(table.map(async ([req, args, expected]) => {
      await assertEqualsResponse(
        await createResponse(req, args),
        expected,
      );
    }));
  });

  it("should return 405 when the document is not query with HTTP GET", async () => {
    const table: [...Parameters<typeof createResponse>, Response][] = [
      [
        new Request(url + "?query=mutation { hello }"),
        { schema },
        new Response(
          `Invalid GraphQL operation. Can only perform a mutation operation from a POST request.`,
          {
            status: Status.MethodNotAllowed,
            headers: {
              "allow": "POST",
              "content-type": "text/plain;charset=UTF-8",
            },
          },
        ),
      ],
    ];

    await Promise.all(table.map(async ([req, args, expected]) => {
      await assertEqualsResponse(
        await createResponse(req, args),
        expected,
      );
    }));
  });

  it("should return 400 when validation error has occur", async () => {
    const schema = buildSchema(`type Query {hello: String!}`);
    const table: [...Parameters<typeof createResponse>, Response][] = [
      [
        new Request(url + "?query=query { hello2 }"),
        { schema },
        new Response(
          String
            .raw`{"errors":[{"message":"Cannot query field \"hello2\" on type \"Query\". Did you mean \"hello\"?","locations":[{"line":1,"column":9}]}]}`,
          {
            status: Status.BadRequest,
            headers: {
              "content-type": "application/graphql-response+json;charset=UTF-8",
            },
          },
        ),
      ],
    ];

    await Promise.all(table.map(async ([req, args, expected]) => {
      await assertEqualsResponse(
        await createResponse(req, args),
        expected,
      );
    }));
  });

  it("should return 200 when graphql request is succeed", async () => {
    const schema = buildSchema(`type Query {hello: String}`);
    const table: [...Parameters<typeof createResponse>, Response][] = [
      [
        new Request(url + "?query=query { hello }"),
        { schema },
        new Response(
          `{"data":{"hello":null}}`,
          {
            status: Status.OK,
            headers: {
              "content-type": "application/graphql-response+json;charset=UTF-8",
            },
          },
        ),
      ],
    ];

    await Promise.all(table.map(async ([req, args, expected]) => {
      await assertEqualsResponse(
        await createResponse(req, args),
        expected,
      );
    }));
  });

  it("should return 200 when graphql request has partial error with application/graphql-response+json", async () => {
    const schema = buildSchema(`type Query {hello: String! hello2: String}`);

    const url = new URL("http://l");
    url.searchParams.set("query", `query{hello}`);

    const url2 = new URL("http://l");
    url2.searchParams.set("query", "query{ hello hello2}");
    const table: [...Parameters<typeof createResponse>, Response][] = [
      [
        new Request(url),
        { schema },
        new Response(
          `{"errors":[{"message":"Cannot return null for non-nullable field Query.hello.","locations":[{"line":1,"column":7}],"path":["hello"]}],"data":null}`,
          {
            status: Status.OK,
            headers: {
              "content-type": "application/graphql-response+json;charset=UTF-8",
            },
          },
        ),
      ],
      [
        new Request(url2),
        { schema },
        new Response(
          `{"errors":[{"message":"Cannot return null for non-nullable field Query.hello.","locations":[{"line":1,"column":8}],"path":["hello"]}],"data":null}`,
          {
            status: Status.OK,
            headers: {
              "content-type": "application/graphql-response+json;charset=UTF-8",
            },
          },
        ),
      ],
    ];

    await Promise.all(table.map(async ([req, args, expected]) => {
      await assertEqualsResponse(
        await createResponse(req, args),
        expected,
      );
    }));
  });

  it("should return 200 when graphql request is succeed with application/json", async () => {
    const schema = buildSchema(`type Query {hello: String}`);

    const url = new URL("http://l");
    url.searchParams.set("query", `query{hello}`);

    const table: [...Parameters<typeof createResponse>, Response][] = [
      [
        new Request(url, { headers: { accept: "application/json" } }),
        { schema },
        new Response(
          `{"data":{"hello":null}}`,
          {
            status: Status.OK,
            headers: {
              "content-type": "application/json;charset=UTF-8",
            },
          },
        ),
      ],
    ];

    await Promise.all(table.map(async ([req, args, expected]) => {
      await assertEqualsResponse(
        await createResponse(req, args),
        expected,
      );
    }));
  });

  it("should return 200 when graphql request is succeed with POST", async () => {
    const schema = buildSchema(`type Query {hello: String}`);

    const table: [...Parameters<typeof createResponse>, Response][] = [
      [
        new Request(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query: "query { hello }" }),
        }),
        { schema },
        new Response(
          `{"data":{"hello":null}}`,
          {
            status: Status.OK,
            headers: {
              "content-type": "application/graphql-response+json;charset=UTF-8",
            },
          },
        ),
      ],
    ];

    await Promise.all(table.map(async ([req, args, expected]) => {
      await assertEqualsResponse(
        await createResponse(req, args),
        expected,
      );
    }));
  });
});
