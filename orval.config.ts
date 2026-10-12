import { defineConfig } from "orval";

export default defineConfig({
  camp: {
    input: {
      target: "./openapi.json",
    },
    output: {
      target: "./src/api/generated/camp.ts",
      schemas: "./src/api/generated/models",
      mode: "tags-split",
      client: "react-query",
      httpClient: "axios",
      indexFiles: true,
      override: {
        mutator: {
          path: "./src/api/mutator.ts",
          name: "apiRequest",
        },
        query: {
          signal: true,
        },
      },
    },
  },
});
