import { Node, mergeAttributes } from "@tiptap/core";

export const MdxRawBlock = Node.create({
  name: "mdxRawBlock",
  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      raw: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-mdx-raw="true"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-mdx-raw": "true",
        class: "mdx-raw-block",
        contenteditable: "false",
      }),
      ["pre", { class: "mdx-raw-block__code" }, HTMLAttributes.raw ?? ""],
    ];
  },
});
