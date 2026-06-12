import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import type { Extensions } from "@tiptap/core";
import { MdxRawBlock } from "./mdxRawBlockExtension.js";

type CreateExtensionKitOptions = {
  placeholder?: string;
  slashExtension: Extensions[number];
};

export function createExtensionKit({
  placeholder = "Start writing your article… Type / for commands.",
  slashExtension,
}: CreateExtensionKitOptions): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      horizontalRule: false,
    }),
    HorizontalRule,
    Underline,
    Subscript,
    Superscript,
    TextStyle,
    Color,
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right"],
      defaultAlignment: "left",
    }),
    Table.configure({
      resizable: false,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Link.configure({
      openOnClick: false,
      autolink: false,
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
    }),
    Placeholder.configure({ placeholder }),
    MdxRawBlock,
    slashExtension,
  ];
}
