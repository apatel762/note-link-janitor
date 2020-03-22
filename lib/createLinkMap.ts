import * as MDAST from "mdast";

import { Note } from "./Note";

export default function createLinkMap(notes: Note[]) {
  const linkMap: Map<
    string,
    Map<string, { context: MDAST.BlockContent[]; url: string }>
  > = new Map();
  for (const note of notes) {
    for (const link of note.links) {
      const targetTitle = link.targetTitle;
      let backlinkEntryMap = linkMap.get(targetTitle);
      if (!backlinkEntryMap) {
        backlinkEntryMap = new Map();
        linkMap.set(targetTitle, backlinkEntryMap);
      }
      let contextList = backlinkEntryMap.get(note.title) || {
        context: [],
        url: ""
      };
      if (contextList !== undefined) {
        contextList.context = [];
        backlinkEntryMap.set(note.title, {
          context: contextList.context,
          url: note.url
        });
      }
      if (link.context) {
        contextList.context.push(link.context);
      }
    }
  }

  return linkMap;
}
