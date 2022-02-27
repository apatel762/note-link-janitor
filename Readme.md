# note-link-janitor

This script reads in a folder of Markdown files, notes all the markdown links between them, then adds a special "backlinks" section which lists passages which reference a given file.

For example, this text might get added to `Sample note.md`:

```
## Backlinks
* [Something that links here](./path.md)
    * The block of text in the referencing note which contains the link to [Sample note](./Sample note.md).
    * Another block in that same note which links to [[Sample note]].
* [A different note that links here](./different-path.md)
    * This is a paragraph from another note which links to [Sample note](./Sample note.md).
```

The script is idempotent; on subsequent runs, _it will update that backlinks section in-place_.

The backlinks section will be initially inserted at the end of the file. If there happens to be a HTML-style `<!-- -->` block at the end of your note, the backlinks will be inserted before that block.

## Assumptions/warnings

1. Links are formatted `[like this](./local-link.md)`.
2. Note titles are inferred from the first line of each note, which is assumed to be formatted as a heading, i.e. `# Note title`.
3. All `.md` files are siblings; the script does not currently recursively traverse subtrees
4. The backlinks "section" is defined as the AST span between `## Backlinks` and the next heading tag (or `<!-- -->` tag). Any text you might add to this section will be clobbered. Don't append text after the backlinks list without a heading in between! (I like to leave my backlinks list at the end of the file)

### This is FYI-style open source

This is FYI-style open source. I'm sharing it for interested parties, but without any stewardship commitment. Assume that my default response to issues and pull requests will by to ignore or close them without comment. It's modified from [Andy Matuschak's code](https://github.com/andymatuschak/note-link-janitor), which does the same but with [[Wiki Style Links]].

If you store your notes in a Git repository and would like to run note-link-janitor on every push, see this [Github Actions Workflow](https://gist.github.com/rajesh-s/749c99ef9e7c884828a1acda698e477b) from [Rajesh Shashi Kumar](https://github.com/rajesh-s).

## Building a local copy

```
yarn install
yarn run build
```
