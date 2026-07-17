export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: {
    className?: string;
    text?: string;
    html?: string;
    type?: string;
    ariaHidden?: string;
    id?: string;
  } = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.id) node.id = opts.id;
  if (opts.html) node.innerHTML = opts.html;
  else if (opts.text) node.textContent = opts.text;
  if (opts.type && node instanceof HTMLButtonElement) node.type = opts.type as 'button';
  if (opts.ariaHidden) node.setAttribute('aria-hidden', opts.ariaHidden);
  return node;
}

export function link(href: string, label: string, className = 'shell__link'): HTMLAnchorElement {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  a.className = className;
  a.target = href.startsWith('http') ? '_blank' : '_self';
  a.rel = href.startsWith('http') ? 'noopener noreferrer' : '';
  return a;
}
