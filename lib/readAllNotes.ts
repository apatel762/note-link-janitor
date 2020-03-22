import * as fs from "fs";
import * as MDAST from "mdast";
import * as path from "path";
import * as remark from "remark";
import * as find from "unist-util-find";
import * as memoizee from "memoizee";

import getNoteLinks, { NoteLinkEntry } from "./getNoteLinks";
import processor from "./processor";

const missingTitleSentinel = { type: "missingTitle" } as const;

const headingFinder = processor().use(() => tree =>
  find(tree, { type: "heading", depth: 1 }) || missingTitleSentinel
);
interface Note {
  title: string;
  url: string;
  links: NoteLinkEntry[];
  noteContents: string;
  parseTree: MDAST.Root;
}

export const getNoteTitle = memoizee(async function(
  notePath: string
): Promise<{ title: string; noteContents: string; parseTree: MDAST.Root }> {
  const noteContents = await fs.promises.readFile(notePath, {
    encoding: "utf-8"
  });

  const parseTree = processor.parse(noteContents) as MDAST.Root;
  const headingNode = await headingFinder.run(parseTree);
  if (headingNode.type === "missingTitle") {
    throw new Error(`${notePath} has no title`);
  }
  const title = remark()
    .stringify({
      type: "root",
      children: (headingNode as MDAST.Heading).children
    })
    .trimEnd();

  return { parseTree, title, noteContents };
});

export async function readNote(
  notePath: string,
  folder: string
): Promise<Note> {
  const { title, parseTree, noteContents } = await getNoteTitle(notePath);
  const links = await getNoteLinks(parseTree, folder);
  return {
    title,
    url: `./${path.parse(notePath).base}`,
    links,
    parseTree,
    noteContents
  };
}

export default async function readAllNotes(
  noteFolderPath: string
): Promise<{ [key: string]: Note }> {
  const noteDirectoryEntries = await fs.promises.readdir(noteFolderPath, {
    withFileTypes: true
  });
  const notePaths = noteDirectoryEntries
    .filter(
      entry =>
        entry.isFile() &&
        !entry.name.startsWith(".") &&
        !entry.name.includes("http") &&
        entry.name.endsWith(".md")
    )
    .map(entry => path.join(noteFolderPath, entry.name));

  const noteEntries = await Promise.all(
    notePaths.map(async notePath => [
      notePath,
      await readNote(notePath, noteFolderPath)
    ])
  );

  return Object.fromEntries(noteEntries);
}
