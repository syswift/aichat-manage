'use client';

import { forwardRef } from 'react';
import { Icon, disableCache } from '@iconify/react';
import { mergeClasses } from 'minimal-shared/utils';

import NoSsr from '@mui/material/NoSsr';
import { styled } from '@mui/material/styles';

import { iconifyClasses } from './classes';

// ----------------------------------------------------------------------

export const Iconify = forwardRef((props, ref) => {
  const { className, width = 20, sx, ...other } = props;

  const baseStyles = {
    width,
    height: width,
    flexShrink: 0,
    display: 'inline-flex',
  };

  const renderFallback = () => (
    <IconFallback
      className={mergeClasses([iconifyClasses.root, className])}
      sx={[baseStyles, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );

  return (
    <NoSsr fallback={renderFallback()}>
      <IconRoot
        ssr
        ref={ref}
        className={mergeClasses([iconifyClasses.root, className])}
        sx={[baseStyles, ...(Array.isArray(sx) ? sx : [sx])]}
        {...other}
      />
    </NoSsr>
  );
});

// https://iconify.design/docs/iconify-icon/disable-cache.html
disableCache('local');

// ----------------------------------------------------------------------

const IconRoot = styled(Icon)``;

const IconFallback = styled('span')``;
