import { mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';

import { navBasicClasses } from '../styles';

// ----------------------------------------------------------------------

export const Nav = styled('nav')``;

// ----------------------------------------------------------------------

export const NavLi = styled(
  (props) => <li {...props} className={mergeClasses([navBasicClasses.li, props.className])} />,
  { shouldForwardProp: (prop) => !['disabled', 'sx'].includes(prop) }
)(() => ({
  display: 'inline-block',
  variants: [
    {
      props: { disabled: true },
      style: { cursor: 'not-allowed' },
    },
  ],
}));

// ----------------------------------------------------------------------

export const NavUl = styled((props) => (
  <ul {...props} className={mergeClasses([navBasicClasses.ul, props.className])} />
))(() => ({ display: 'flex', flexDirection: 'column' }));
