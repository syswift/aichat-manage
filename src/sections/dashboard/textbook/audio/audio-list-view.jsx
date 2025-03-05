'use client';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export function AudioListView() {
    return (
        <DashboardContent>
            <CustomBreadcrumbs
            heading="音频"
            links={[
                { name: '首页', href: paths.dashboard.root },
                { name: '教材管理', href: paths.dashboard.textbook.audio },
                { name: '音频' },
            ]}
            action={
                <Button
                href={paths.dashboard.root}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                >
                New user
                </Button>
            }
            sx={{ mb: { xs: 3, md: 5 } }}
            />
        </DashboardContent>
    );
}