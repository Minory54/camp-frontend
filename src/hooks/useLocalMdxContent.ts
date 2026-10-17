import { skipToken, useQuery } from "@tanstack/react-query";
import type { MDXModule } from "mdx/types";

const mdxFiles = import.meta.glob<MDXModule>("../assets/mdx/*.mdx");

export function useLocalMdxContent(file?: string) {
  const query = useQuery({
    queryKey: ["mdx", "local", file],
    queryFn:
      file === undefined
        ? skipToken
        : async () => {
            const loadModule = mdxFiles["../assets/mdx/" + file];

            if (!loadModule) {
              throw new Error("MDX-файл «" + file + "» не найден.");
            }

            const { default: Content } = await loadModule();

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
