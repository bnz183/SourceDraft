type IconProps = {
  className?: string;
};

export function IconBold({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4.5 2h4.1a3.2 3.2 0 0 1 2.3 5.5A3.4 3.4 0 0 1 12 12.2 3.5 3.5 0 0 1 8.4 14H4.5V2zm2.3 5.3h1.6a1.5 1.5 0 0 0 0-3H6.8v3zm0 4.5h2a1.7 1.7 0 0 0 0-3.4H6.8v3.4z"
      />
    </svg>
  );
}

export function IconItalic({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M6.5 2h5.5v1.6H10l-2.2 9.8h2.1V15H4.2v-1.6h1.8L8.2 3.6H6.5V2z" />
    </svg>
  );
}

export function IconUnderline({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 2.5h2v5.2a2.3 2.3 0 0 0 4.6 0V2.5h2v5.4a4.3 4.3 0 0 1-8.6 0V2.5zM3 13.5h10v1.5H3v-1.5z"
      />
    </svg>
  );
}

export function IconStrike({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.2 5.5a2.2 2.2 0 0 0-1.1-1.9 3.1 3.1 0 0 0-2.4-.2 2.4 2.4 0 0 0-1.2 2.1H3.3a4.5 4.5 0 0 1 2.2-3.8 5.2 5.2 0 0 1 3.9-.4 4.7 4.7 0 0 1 2.8 2.1 4.8 4.8 0 0 1 .5 2.1H10.2zM3 8.5h10v1.5H3V8.5zm1.3 2.5h8.4a4.2 4.2 0 0 1-1.8 2.4 5 5 0 0 1-3.1.8 4.8 4.8 0 0 1-3.3-1.3V10.5a6 6 0 0 0 3.5 1.2 2.8 2.8 0 0 0 1.8-.7 2.6 2.6 0 0 0 .5-.7z"
      />
    </svg>
  );
}

export function IconCode({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5.7 4.3 2 8l3.7 3.7 1.2-1.2L4.4 8l2.5-2.5-1.2-1.2zm4.6 0-1.2 1.2L11.6 8l-2.5 2.5 1.2 1.2L14 8l-3.7-3.7z"
      />
    </svg>
  );
}

export function IconCodeBlock({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9zM4 5.5v5h8v-5H4zm1.5 1h1v3h-1v-3zm2.5 0h1v3H8v-3zm2.5 0h1v3h-1v-3z"
      />
    </svg>
  );
}

export function IconListBullet({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2 4.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 4.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 4.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM5 3.5h9v1.5H5V3.5zm0 4.5h9V9.5H5V8zm0 4.5h9V14H5v-1.5z"
      />
    </svg>
  );
}

export function IconListNumbered({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2.5 2.5h1.2v1.1H3.3v.6h.4V5H2V2.5zm0 5.5h1.5l-.5 2H2v-1.1h.6l.2-.9H2V8zm0 4.2h1.4c.6 0 1 .4 1 .9s-.4.9-1 .9H2v-1.8zm5-8.7h9v1.5H7.5V3.5zm0 4.5h9V9.5h-9V8zm0 4.5h9V14h-9v-1.5z"
      />
    </svg>
  );
}

export function IconQuote({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 4.5c0-1.4 1.1-2.5 2.5-2.5.5 0 1 .1 1.4.4L5.6 4.2A1.2 1.2 0 0 0 5.5 4C4.9 4 4.5 4.4 4.5 5v1.5H3V4.5zm6 0c0-1.4 1.1-2.5 2.5-2.5.5 0 1 .1 1.4.4L11.6 4.2a1.2 1.2 0 0 0-.1-.2c-.6 0-1 .4-1 1v1.5H9V4.5z"
      />
    </svg>
  );
}

export function IconHr({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M2 7.25h12v1.5H2v-1.5z" />
    </svg>
  );
}

export function IconLink({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.2 9.8a2.8 2.8 0 0 0 4 0l2-2a2.8 2.8 0 1 0-4-4l-.8.8 1.1 1.1.8-.8a1.3 1.3 0 1 1 1.8 1.8l-2 2a1.3 1.3 0 0 1-1.8-1.8l-.1-.1-1.1 1.1.1.1zm3.6-3.6-1.1-1.1-.8.8a1.3 1.3 0 0 1-1.8 1.8l-2 2a1.3 1.3 0 1 0 1.8 1.8l.8-.8-1.1-1.1-.8.8a1.3 1.3 0 0 1-1.8-1.8l2-2a2.8 2.8 0 0 1 4 0l.1.1 1.1-1.1-.1-.1a2.8 2.8 0 0 0-4 0z"
      />
    </svg>
  );
}

export function IconImage({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2.5 3A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3h-11zm0 1.5h11v5.3l-2.2-2.2a1 1 0 0 0-1.4 0L5.6 11 4 9.4 2.5 10.9V4.5zm2 1a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"
      />
    </svg>
  );
}

export function IconVideo({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2.5 3.5A1.5 1.5 0 0 1 4 2h5.5a1.5 1.5 0 0 1 1.5 1.5v1.2l2.3-1.5A1 1 0 0 1 15 4.1v7.8a1 1 0 0 1-1.7.9L11 11.3v1.2A1.5 1.5 0 0 1 9.5 14H4A1.5 1.5 0 0 1 2.5 12.5v-9zM4 4v8h5.5V4H4zm7 1.4 2.5 1.7V7.9L11 9.6V5.4z"
      />
    </svg>
  );
}

export function IconAttachment({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.2 2.5a3.5 3.5 0 0 0-4.9 0L3.1 4.7a4.5 4.5 0 0 0 0 6.4 4.5 4.5 0 0 0 6.4 0l4.1-4.1a2.8 2.8 0 0 0-4-4L5.5 10.1a1.5 1.5 0 1 1-2.1-2.1l4.9-4.9 1.1 1.1-4.9 4.9a.3.3 0 0 0 0 .5.3.3 0 0 0 .5 0l4.1-4.1a1.5 1.5 0 1 1 2.1 2.1L6.5 11.6a2.8 2.8 0 0 1-4-4l3.2-3.2 1.1 1.1-3.2 3.2a1.5 1.5 0 0 0 2.1 2.1l3.2-3.2a3.5 3.5 0 0 0-5-5L3.1 8.1a4.5 4.5 0 0 0 6.4 6.4l4.9-4.9-1.1-1.1-4.9 4.9a2.8 2.8 0 1 1-4-4l4.1-4.1a2.5 2.5 0 0 1 3.5 0 2.5 2.5 0 0 1 0 3.5L6.5 10.1"
      />
    </svg>
  );
}

export function IconTable({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2.5 2.5h11a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm1 2v2.5h3.5V4.5H3.5zm4.5 0V7H12V4.5H8zm-4.5 4H7V12H3.5V8.5zm4.5 0H12V12H8V8.5z"
      />
    </svg>
  );
}

export function IconUndo({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4.5 3.5 2 6v5.5A1.5 1.5 0 0 0 3.5 13H12v-1.5H4.1L6.6 9a4.5 4.5 0 1 1-1.3-4.2L4.5 3.5z"
      />
    </svg>
  );
}

export function IconRedo({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.5 3.5 14 6v5.5A1.5 1.5 0 0 1 12.5 13H4V11.5h7.9L9.4 9a4.5 4.5 0 1 0 1.3-4.2l.8 1.3z"
      />
    </svg>
  );
}

export function IconAlignLeft({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M2 3.5h12v1.5H2V3.5zm0 3.5h8v1.5H2V7zm0 3.5h12v1.5H2V10.5zm0 3.5h8V15.5H2V14z" />
    </svg>
  );
}

export function IconAlignCenter({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M2 3.5h12v1.5H2V3.5zm2 3.5h8v1.5H4V7zm-2 3.5h12v1.5H2V10.5zm2 3.5h8V15.5H4V14z" />
    </svg>
  );
}

export function IconAlignRight({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M2 3.5h12v1.5H2V3.5zm4 3.5h8v1.5H6V7zm-4 3.5h12v1.5H2V10.5zm4 3.5h8V15.5H6V14z" />
    </svg>
  );
}

export function IconSubscript({ className }: IconProps) {
  return (
    <span className={className} style={{ fontSize: "0.85em", lineHeight: 1 }}>
      x<sub style={{ fontSize: "0.75em" }}>2</sub>
    </span>
  );
}

export function IconSuperscript({ className }: IconProps) {
  return (
    <span className={className} style={{ fontSize: "0.85em", lineHeight: 1 }}>
      x<sup style={{ fontSize: "0.75em" }}>2</sup>
    </span>
  );
}
