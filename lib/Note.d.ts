import * as MDAST from "mdast";

import { NoteLinkEntry } from "./getNoteLinks";

export interface Note {
  title: string;
  url: string;
  links: NoteLinkEntry[];
  parseTree: MDAST.Root;
}
