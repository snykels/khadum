declare module "@editorjs/checklist" {
  import type { BlockToolConstructable } from "@editorjs/editorjs";
  const Checklist: BlockToolConstructable;
  export default Checklist;
}

declare module "editorjs-drag-drop" {
  export default class DragDrop {
    constructor(editor: unknown);
  }
}

declare module "editorjs-undo" {
  export default class Undo {
    constructor(opts: { editor: unknown });
    undo(): void;
    redo(): void;
  }
}

declare module "@calumk/editorjs-columns" {
  import type { BlockToolConstructable } from "@editorjs/editorjs";
  const Columns: BlockToolConstructable;
  export default Columns;
}
