import { useState } from "react";

interface Props {
  initial: string;
  onSave: (text: string) => void;
  onClose: () => void;
}

export function NotesDialog({ initial, onSave, onClose }: Props) {
  const [text, setText] = useState(initial);

  function save() {
    onSave(text.trim());
    onClose();
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="dialog-title">Game notes</h2>
        <textarea
          className="notes-input"
          value={text}
          autoFocus
          rows={5}
          placeholder="House rules, context, anything worth remembering…"
          onChange={(e) => setText(e.target.value)}
        />
        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
