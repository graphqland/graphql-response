import { BuildOptions } from "https://deno.land/x/dnt@0.31.0/mod.ts";

export const makeOptions = (version: string): BuildOptions => ({
  test: false,
  shims: {
    undici: true,
  },
  typeCheck: true,
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  compilerOptions: {
    lib: ["esnext", "dom"],
  },
  package: {
    name: "@graphqland/graphql-response",
    version,
    description:
      "A reference implementation of GraphQL-over-HTTP request for JavaScript",
    keywords: [
      "graphql",
      "request",
      "response",
      "http",
      "https",
      "graphql-over-http",
    ],
    license: "MIT",
    homepage: "https://github.com/graphqland/graphql-response",
    repository: {
      type: "git",
      url: "git+https://github.com/graphqland/graphql-response.git",
    },
    bugs: {
      url: "https://github.com/graphqland/graphql-response/issues",
    },
    sideEffects: false,
    type: "module",
    publishConfig: {
      access: "public",
    },
    devDependencies: {
      "graphql": "^16",
    },
  },
  packageManager: "pnpm",
  mappings: {
    "https://esm.sh/v96/graphql@16.6.0": {
      name: "graphql",
      version: "^16",
      peerDependency: true,
    },
    "https://deno.land/x/isx@1.0.0-beta.22/mod.ts": {
      name: "isxx",
      version: "1.0.0-beta.22",
    },
    "https://deno.land/x/gql_request@1.0.0-beta.1/mod.ts": {
      name: "@graphqland/graphql-request",
      version: "1.0.0-beta.1",
    },
    "https://deno.land/x/result_js@1.0.0/mod.ts": {
      name: "@miyauci/result",
      version: "1.0.0",
    },
    "https://deno.land/x/pure_json@1.0.0-beta.1/mod.ts": {
      name: "pure-json",
      version: "1.0.0-beta.1",
    },
    "https://deno.land/x/pattern_match@1.0.0-beta.2/mod.ts": {
      name: "@miyauci/pattern-match",
      version: "1.0.0-beta.2",
    },
  },
});
