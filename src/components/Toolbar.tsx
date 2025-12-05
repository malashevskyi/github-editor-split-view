import React from "react";
import { useMarkdownFormatter } from "../hooks/useMarkdownFormatter";
import { TOOLBAR_BUTTONS } from "../data/toolbarButtons";

interface ToolbarProps {
  wrapper: HTMLElement;
}

export const Toolbar: React.FC<ToolbarProps> = ({ wrapper }) => {
  const format = useMarkdownFormatter(wrapper);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {TOOLBAR_BUTTONS.map(({ iconClass, type, label, viewBox, pathD }) => (
        <button
          key={type}
          type="button"
          onClick={() => format(type)}
          title={label}
          aria-label={label}
          className="esv-toolbar-button"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            className={`octicon ${iconClass}`}
            viewBox={viewBox}
            width="16"
            height="16"
            fill="currentColor"
            style={{ verticalAlign: "text-bottom" }}
          >
            <path d={pathD} />
          </svg>
        </button>
      ))}
    </div>
  );
};
