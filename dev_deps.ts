export * from "https://deno.land/std@0.159.0/testing/asserts.ts";
export * from "https://deno.land/std@0.159.0/testing/bdd.ts";
export { buildSchema } from "https://esm.sh/v96/graphql@16.6.0";
export { Status } from "https://deno.land/std@0.159.0/http/mod.ts";
import { equalsResponse } from "https://deno.land/x/http_utils@1.0.0-beta.6/mod.ts";
import { AssertionError } from "https://deno.land/std@0.159.0/testing/asserts.ts";

// deno-lint-ignore no-explicit-any
export type Fn<F extends (...args: any) => any> = [
  ...Parameters<F>,
  ReturnType<F>,
];

export async function assertEqualsResponse(
  actual: Response,
  expected: Response,
  message?: string,
): Promise<void> {
  if (!await equalsResponse(actual, expected)) {
    throw new AssertionError(
      message ??
        `Not equal response.
  Actual:
    text: ${await actual.clone().text()}
    ${Deno.inspect(actual)}
  Expected:
    text: ${await expected.clone().text()}
    ${Deno.inspect(expected)}`,
    );
  }
}
