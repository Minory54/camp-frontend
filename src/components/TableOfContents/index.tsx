import { useEffect, useState, type RefObject } from "react";
import clsx from "clsx";
import "./style.scss";

type Heading = {
  id: string;
  title: string;
  level: number;
};

type TableOfContentsProps = {
  contentRef: RefObject<HTMLElement | null>;
  documentId: number | string;
};

export const TableOfContents = ({ contentRef, documentId }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const article = contentRef.current;
    if (!article) return;

    let elements: HTMLHeadingElement[] = [];
    let frame = 0;

    const updateActiveHeading = () => {
      const atBottom =
        window.scrollY > 0 &&
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
      const current = atBottom
        ? elements.at(-1)
        : (elements.findLast((element) => element.getBoundingClientRect().top <= 32) ??
          elements[0]);

      setActiveId(current?.id ?? "");
    };

    const collectHeadings = () => {
      elements = Array.from(article.querySelectorAll<HTMLHeadingElement>("h1, h2, h3"));
      const items = elements.map((element, index) => {
        element.id ||= `heading-${index + 1}`;

        return {
          id: element.id,
          title: element.textContent ?? "",
          level: Number(element.tagName[1]),
        };
      });

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setHeadings(items);
        updateActiveHeading();
      });
    };

    collectHeadings();

    const observer = new MutationObserver(collectHeadings);
    observer.observe(article, { childList: true, subtree: true, characterData: true });

    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [contentRef, documentId]);

  return (
    <nav className="table-of-contents" aria-label="Заголовки материала">
      <ul className="table-of-contents__list">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={activeId === heading.id ? "location" : undefined}
              className={clsx(
                "table-of-contents__link",
                `table-of-contents__link--level-${heading.level}`,
                activeId === heading.id && "table-of-contents__link--active",
              )}
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
