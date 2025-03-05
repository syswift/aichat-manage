import { cloneElement } from 'react';

import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export function createNavItem({
  path,
  icon,
  info,
  render,
  hasChild,
  externalLink,
  enabledRootRedirect,
}) {
  const linkProps = externalLink
    ? { href: path, target: '_blank', rel: 'noopener' }
    : { component: RouterLink, href: path };

  const baseProps = hasChild && !enabledRootRedirect ? { component: 'div' } : linkProps;

  /**
   * Render @icon
   */
  let renderIcon = null;

  if (icon && render?.navIcon && typeof icon === 'string') {
    renderIcon = render?.navIcon[icon];
  } else {
    renderIcon = icon;
  }

  /**
   * Render @info
   */
  let renderInfo = null;

  if (info && render?.navInfo && Array.isArray(info)) {
    const [key, value] = info;
    const element = render.navInfo(value)[key];

    renderInfo = element ? cloneElement(element) : null;
  } else {
    renderInfo = info;
  }

  return {
    baseProps,
    renderIcon,
    renderInfo,
  };
}
