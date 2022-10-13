# graphql-response

A reference implementation of GraphQL-over-HTTP request for JavaScript.

## GraphQL response from request

Create a GraphQL-over-HTTP compliant HTTP `Response` from an HTTP `Request`.

Example of creating a GraphQL response from a GraphQL request:

```ts
import { createResponse } from "https://deno.land/x/gaphql_response@$VERSION/mod.ts";
import { buildSchema } from "https://esm.sh/graphql@$VERSION";

const url = new URL("http://localhost/graphql");
const query = `query Test { greet }`;
url.searchParams.set("query", query);
const qqlRequest = new Request(url);

const schema = buildSchema(`type Query {
  greet: String
}`);
const response = await createResponse(qqlRequest, {
  schema,
  rootValue: {
    greet: () => "hello world!",
  },
});
```

Note that this is asynchronous, since the request body may be read.

### GraphQL Execution parameters

`createRequest` accepts portions of GraphQL `ExecutionArgs` as is.

- schema
- rootValue
- contextValue
- fieldResolver
- typeResolver
- subscribeFieldResolver

The following parameters are obtained from the `Request` object and need not be
passed.

- document
- variableValues
- operationName

## License

Copyright © 2022-present [graphqland](https://github.com/graphqland).

Released under the [MIT](./LICENSE) license
