import type { GetPracticeFiles200Item, GetSaveFiles200Item } from "../../api/generated/models";

export type PracticeFile = GetPracticeFiles200Item;
export type FileContents = Record<number, string>;

export function getFileLanguage(file: PracticeFile): string {
  const language = file.code_language;
  if (typeof language === "object" && language !== null && "title" in language) {
    const title = String(language.title).toLowerCase();
    if (title === "html" || title === "css") return title;
  }
  if (/\.html?$/i.test(file.filename)) return "html";
  if (/\.css$/i.test(file.filename)) return "css";
  return "plaintext";
}

export function getMainHtml(files: readonly PracticeFile[]) {
  const html = files
    .filter((file) => getFileLanguage(file) === "html")
    .sort((left, right) => left.id - right.id);
  return html.find((file) => file.filename === "index.html") ?? html[0];
}

export function getInitialContents(
  files: readonly PracticeFile[],
  savedFiles: readonly GetSaveFiles200Item[] = [],
): FileContents {
  const saved = new Map(savedFiles.map((file) => [file.id_practice_file, file.code]));
  return Object.fromEntries(files.map((file) => [file.id, saved.get(file.id) ?? file.code]));
}

export function hasChanges(
  files: readonly PracticeFile[],
  contents: FileContents,
  saved: FileContents,
) {
  return files.some((file) => contents[file.id] !== saved[file.id]);
}

export function buildPreview(files: readonly PracticeFile[], contents: FileContents): string {
  const main = getMainHtml(files);
  if (!main) throw new Error("В задании нет HTML-файла для предпросмотра.");

  const document = new DOMParser().parseFromString(contents[main.id], "text/html");
  const origin = "https://practice.invalid/";
  const styles = new Map(
    files
      .filter((file) => getFileLanguage(file) === "css")
      .map((file) => [file.filename, contents[file.id]]),
  );

  // Keep the same stylesheet links and order as the server's practice runner.
  for (const link of document.querySelectorAll<HTMLLinkElement>(
    'link[rel~="stylesheet" i][href]',
  )) {
    const url = new URL(link.getAttribute("href")!, origin);
    if (url.origin !== new URL(origin).origin) continue;
    const code = styles.get(decodeURIComponent(url.pathname.slice(1)));
    if (code !== undefined) {
      link.href = `data:text/css;charset=utf-8,${encodeURIComponent(code)}`;
    }
  }

  // Insert before user markup so it also covers scripts and resource requests.
  document
    .querySelectorAll("base, meta[http-equiv='Content-Security-Policy' i]")
    .forEach((element) => element.remove());
  const policy = document.createElement("meta");
  policy.httpEquiv = "Content-Security-Policy";
  policy.content =
    "default-src 'none'; style-src 'unsafe-inline' data:; img-src data: blob:; " +
    "font-src data:; form-action 'none'; base-uri 'none'";
  document.head.prepend(policy);
  return `<!doctype html>\n${document.documentElement.outerHTML}`;
}
