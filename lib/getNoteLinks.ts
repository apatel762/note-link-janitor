import * as MDAST from "mdast";
import * as path from "path";
import * as UNIST from "unist";
import * as visitParents from "unist-util-visit-parents";
import getBacklinksBlock from "./getBacklinksBlock";
import { readNote, getNoteTitle } from "./readAllNotes";

const blockTypes = [
  "paragraph",
  "heading",
  "thematicBreak",
  "blockquote",
  "list",
  "table",
  "html",
  "code"
];

function isBlockContent(node: MDAST.Content): node is MDAST.BlockContent {
  return blockTypes.includes(node.type);
}

export interface NoteLinkEntry {
  targetTitle: string;
  context: MDAST.BlockContent | null;
}

export default async function getNoteLinks(
  tree: MDAST.Root,
  folder: string
): Promise<NoteLinkEntry[]> {
  // Strip out the back links section
  const backlinksInfo = getBacklinksBlock(tree);
  let searchedChildren: UNIST.Node[];
  if (backlinksInfo.isPresent) {
    searchedChildren = tree.children
      .slice(
        0,
        tree.children.findIndex(n => n === backlinksInfo.start)
      )
      .concat(
        tree.children.slice(
          backlinksInfo.until
            ? tree.children.findIndex(n => n === backlinksInfo.until)
            : tree.children.length
        )
      );
  } else {
    searchedChildren = tree.children;
  }
  const links: Promise<NoteLinkEntry>[] = [];
  visitParents<MDAST.Link>(
    { ...tree, children: searchedChildren } as MDAST.Parent,
    "link",
    (node: MDAST.Link, ancestors: MDAST.Content[]) => {
      const closestBlockLevelAncestor = ancestors.reduceRight<MDAST.BlockContent | null>(
        (result, needle) => result ?? (isBlockContent(needle) ? needle : null),
        null
      );
      if (node.url.endsWith(".md")) {
        // gross
        links.push(
          getNoteTitle(path.join(folder, node.url)).then(
            ({ title: targetTitle }) => {
              return { targetTitle, context: closestBlockLevelAncestor };
            }
          )
        );
      }
      return true;
    }
  );
  return Promise.all(links);
}
