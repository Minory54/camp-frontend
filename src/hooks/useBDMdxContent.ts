import { skipToken, useQuery } from "@tanstack/react-query";
import * as runtime from "react/jsx-runtime";

export function useBDMdxContent(mdxSource?: string) {
  const query = useQuery({
    queryKey: ["mdx", "db", mdxSource],
    queryFn:
      mdxSource === undefined
        ? skipToken
        : async () => {
            const { evaluate } = await import("@mdx-js/mdx");
            const { default: Content } = await evaluate(mdxSource, runtime);

            return Content;
          },
    staleTime: Infinity,
    retry: false,
  });

  return {
    Content: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
