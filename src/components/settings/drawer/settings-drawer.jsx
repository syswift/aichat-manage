'use client';

import { useEffect, useCallback } from 'react';
import { hasKeys, varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';

import { themeConfig } from 'src/theme/theme-config';
import { primaryColorPresets } from 'src/theme/with-settings';

import { Iconify } from '../../iconify';
import { BaseOption } from './base-option';
import { Scrollbar } from '../../scrollbar';
import { SmallBlock, LargeBlock } from './styles';
import { PresetsOptions } from './presets-options';
import { FullScreenButton } from './fullscreen-button';
import { FontSizeOptions, FontFamilyOptions } from './font-options';
import { useSettingsContext } from '../context/use-settings-context';
import { NavColorOptions, NavLayoutOptions } from './nav-layout-option';

// ----------------------------------------------------------------------

export function SettingsDrawer({ sx, defaultSettings }) {
  const settings = useSettingsContext();

  const { mode, setMode, systemMode } = useColorScheme();

  useEffect(() => {
    if (mode === 'system' && systemMode) {
      settings.setState({ colorScheme: systemMode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, systemMode]);

  // Visible options by default settings
  const isFontFamilyVisible = hasKeys(defaultSettings, ['fontFamily']);
  const isCompactLayoutVisible = hasKeys(defaultSettings, ['compactLayout']);
  const isDirectionVisible = hasKeys(defaultSettings, ['direction']);
  const isColorSchemeVisible = hasKeys(defaultSettings, ['colorScheme']);
  const isContrastVisible = hasKeys(defaultSettings, ['contrast']);
  const isNavColorVisible = hasKeys(defaultSettings, ['navColor']);
  const isNavLayoutVisible = hasKeys(defaultSettings, ['navLayout']);
  const isPrimaryColorVisible = hasKeys(defaultSettings, ['primaryColor']);
  const isFontSizeVisible = hasKeys(defaultSettings, ['fontSize']);

  const handleReset = useCallback(() => {
    settings.onReset();
    setMode(defaultSettings.colorScheme);
  }, [defaultSettings.colorScheme, setMode, settings]);

  const renderHead = () => (
    <Box
      sx={{
        py: 2,
        pr: 1,
        pl: 2.5,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        外观设置
      </Typography>

      <FullScreenButton />

      <Tooltip title="重置全部">
        <IconButton onClick={handleReset}>
          <Badge color="error" variant="dot" invisible={!settings.canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title="关闭">
        <IconButton onClick={settings.onCloseDrawer}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderMode = () => (
    <BaseOption
      label="深色模式"
      icon="moon"
      selected={settings.state.colorScheme === 'dark'}
      onChangeOption={() => {
        setMode(mode === 'light' ? 'dark' : 'light');
        settings.setState({ colorScheme: mode === 'light' ? 'dark' : 'light' });
      }}
    />
  );

  const renderContrast = () => (
    <BaseOption
      label="对比度"
      icon="contrast"
      selected={settings.state.contrast === 'hight'}
      onChangeOption={() =>
        settings.setState({
          contrast: settings.state.contrast === 'default' ? 'hight' : 'default',
        })
      }
    />
  );

  const renderRtl = () => (
    <BaseOption
      label="从右到左"
      icon="align-right"
      selected={settings.state.direction === 'rtl'}
      onChangeOption={() =>
        settings.setState({
          direction: settings.state.direction === 'ltr' ? 'rtl' : 'ltr',
        })
      }
    />
  );

  const renderCompact = () => (
    <BaseOption
      tooltip="仅适用于仪表盘，在大于1600px(xl)的大分辨率下可用"
      label="紧凑模式"
      icon="autofit-width"
      selected={!!settings.state.compactLayout}
      onChangeOption={() => settings.setState({ compactLayout: !settings.state.compactLayout })}
    />
  );

  const renderPresets = () => (
    <LargeBlock
      title="预设"
      canReset={settings.state.primaryColor !== defaultSettings.primaryColor}
      onReset={() => settings.setState({ primaryColor: defaultSettings.primaryColor })}
    >
      <PresetsOptions
        options={Object.keys(primaryColorPresets).map((key) => ({
          name: key,
          value: primaryColorPresets[key].main,
        }))}
        value={settings.state.primaryColor}
        onChangeOption={(newOption) => settings.setState({ primaryColor: newOption })}
      />
    </LargeBlock>
  );

  const renderNav = () => (
    <LargeBlock title="导航" tooltip="仅适用于仪表盘" sx={{ gap: 2.5 }}>
      {isNavLayoutVisible && (
        <SmallBlock
          label="布局"
          canReset={settings.state.navLayout !== defaultSettings.navLayout}
          onReset={() => settings.setState({ navLayout: defaultSettings.navLayout })}
        >
          <NavLayoutOptions
            options={['vertical', 'horizontal', 'mini']}
            value={settings.state.navLayout}
            onChangeOption={(newOption) => settings.setState({ navLayout: newOption })}
          />
        </SmallBlock>
      )}
      {isNavColorVisible && (
        <SmallBlock
          label="颜色"
          canReset={settings.state.navColor !== defaultSettings.navColor}
          onReset={() => settings.setState({ navColor: defaultSettings.navColor })}
        >
          <NavColorOptions
            options={['integrate', 'apparent']}
            value={settings.state.navColor}
            onChangeOption={(newOption) => settings.setState({ navColor: newOption })}
          />
        </SmallBlock>
      )}
    </LargeBlock>
  );

  const renderFont = () => (
    <LargeBlock title="字体" sx={{ gap: 2.5 }}>
      {isFontFamilyVisible && (
        <SmallBlock
          label="字体族"
          canReset={settings.state.fontFamily !== defaultSettings.fontFamily}
          onReset={() => settings.setState({ fontFamily: defaultSettings.fontFamily })}
        >
          <FontFamilyOptions
            options={[
              themeConfig.fontFamily.primary,
              'Inter Variable',
              'DM Sans Variable',
              'Nunito Sans Variable',
            ]}
            value={settings.state.fontFamily}
            onChangeOption={(newOption) => settings.setState({ fontFamily: newOption })}
          />
        </SmallBlock>
      )}
      {isFontSizeVisible && (
        <SmallBlock
          label="大小"
          canReset={settings.state.fontSize !== defaultSettings.fontSize}
          onReset={() => settings.setState({ fontSize: defaultSettings.fontSize })}
          sx={{ gap: 5 }}
        >
          <FontSizeOptions
            options={[12, 20]}
            value={settings.state.fontSize}
            onChangeOption={(newOption) => settings.setState({ fontSize: newOption })}
          />
        </SmallBlock>
      )}
    </LargeBlock>
  );

  return (
    <Drawer
      anchor="right"
      open={settings.openDrawer}
      onClose={settings.onCloseDrawer}
      slotProps={{ backdrop: { invisible: true } }}
      PaperProps={{
        sx: [
          (theme) => ({
            ...theme.mixins.paperStyles(theme, {
              color: varAlpha(theme.vars.palette.background.defaultChannel, 0.9),
            }),
            width: 360,
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ],
      }}
    >
      {renderHead()}

      <Scrollbar>
        <Box
          sx={{
            pb: 5,
            gap: 6,
            px: 2.5,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              gap: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
            }}
          >
            {isColorSchemeVisible && renderMode()}
            {isContrastVisible && renderContrast()}
            {isDirectionVisible && renderRtl()}
            {isCompactLayoutVisible && renderCompact()}
          </Box>

          {(isNavColorVisible || isNavLayoutVisible) && renderNav()}
          {isPrimaryColorVisible && renderPresets()}
          {(isFontFamilyVisible || isFontSizeVisible) && renderFont()}
        </Box>
      </Scrollbar>
    </Drawer>
  );
}
