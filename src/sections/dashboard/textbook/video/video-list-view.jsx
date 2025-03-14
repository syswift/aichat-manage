'use client';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';

import { supabase } from 'src/lib/supabase';
import {_roles, USER_STATUS_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { VideoTableRow } from './video-table-row';
import { VideoTableToolbar } from './video-table-toolbar';
import { VideoTableFiltersResult } from './video-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: '全部' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'name', label: '名称' },
  { id: 'phoneNumber', label: '类型', width: 220 },
  { id: 'company', label: '简介', width: 220 },
  { id: 'status', label: '状态', width: 150 },
  { id: 'role', label: '操作', width: 120 },
];

async function fetchData() {
  const { data, error } = await supabase
    .from('video')
    .select('*');

  if (error) {
    console.error('Error fetching data:', error);
  } else {
    console.log('Data:', data);
  }
  return data;
}

export function VideoListView() {
  const table = useTable();
  const confirmDialog = useBoolean();
  const [tableData, setTableData] = useState([]);

  const filters = useSetState({ name: '', role: [], status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  useEffect(() => {
    async function loadData() {
      const data = await fetchData();
      setTableData(data);
    }
    loadData();
  }, []);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.name || currentFilters.role.length > 0 || currentFilters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(async (id) => {
    const deleteRow = tableData.filter((row) => row.id !== id);

    const targetRow = tableData.find((row) => row.id === id);
    if (targetRow) {
      const videoFileName = targetRow.file_url.replace('https://reecurbemkhjmectdkyp.supabase.co/storage/v1/object/public/video/', '');
      const coverFileName = targetRow.cover_url.replace('https://reecurbemkhjmectdkyp.supabase.co/storage/v1/object/public/video_cover/', '');

      console.log('Deleting video file:', videoFileName);
      console.log('Deleting cover file:', coverFileName);
      
      const { data: videoData, error: videoError } = await supabase.storage.from('video').remove([videoFileName]);
      if (videoError) {
        console.error('Error deleting video file:', videoError);
      } else {
        console.log('Video file delete response:', videoData);
      }

      const { data: coverData, error: coverError } = await supabase.storage.from('video_cover').remove([coverFileName]);
      if (coverError) {
        console.error('Error deleting cover file:', coverError);
      } else {
        console.log('Cover file delete response:', coverData);
      }

      const { data: dbData, error: dbError } = await supabase.from('video').delete().eq('id', targetRow.id);
      if (dbError) {
        console.error('Error deleting database entry:', dbError);
      } else {
        console.log('Database delete response:', dbData);
      }
    }

    console.log('Delete success!');

    setTableData(deleteRow);

    table.onUpdatePageDeleteRow(dataInPage.length);
  }, [dataInPage.length, table, tableData]);

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="视频"
        links={[
          { name: '首页', href: paths.dashboard.root },
          { name: '教材管理', href: paths.dashboard.textbook.video.root },
          { name: '视频' },
        ]}
        action={
          <Button
            href={paths.dashboard.textbook.video.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            新增视频
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={currentFilters.status}
          onChange={handleFilterStatus}
          sx={[
            (theme) => ({
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }),
          ]}
        >
          {STATUS_OPTIONS.map((tab) => (
            <Tab
              key={tab.value}
              iconPosition="end"
              value={tab.value}
              label={tab.label}
              icon={
                <Label
                  variant={
                    ((tab.value === 'all' || tab.value === currentFilters.status) && 'filled') ||
                    'soft'
                  }
                  color={
                    (tab.value === 'active' && 'success') ||
                    (tab.value === 'pending' && 'warning') ||
                    (tab.value === 'banned' && 'error') ||
                    (tab.value === 'rejected' && 'info') ||
                    'default'
                  }
                >
                  {['active', 'pending', 'banned', 'rejected'].includes(tab.value)
                    ? tableData.filter((user) => user.status === tab.value).length
                    : tableData.length}
                </Label>
              }
            />
          ))}
        </Tabs>

        <VideoTableToolbar
          filters={filters}
          onResetPage={table.onResetPage}
          options={{ roles: _roles }}
        />

        {canReset && (
          <VideoTableFiltersResult
            filters={filters}
            onResetPage={table.onResetPage}
            totalResults={dataFiltered.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <Box sx={{ position: 'relative' }}>
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={dataFiltered.length}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                dataFiltered.map((row) => row.id)
              )
            }
            action={
              <Tooltip title="Delete">
                <IconButton color="primary" onClick={confirmDialog.onTrue}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            }
          />

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headCells={TABLE_HEAD}
                rowCount={dataFiltered.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row.id)
                  )
                }
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <VideoTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      editHref={paths.dashboard.textbook.video.edit(row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={table.dense ? 56 : 56 + 20}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((user) => user.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }

  return inputData;
} 