'use client';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';

import { supabase } from 'src/lib/supabase';
import { _roles, USER_STATUS_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { PicbookTableRow } from './picbook-table-row';
import { PicbookTableToolbar } from './picbook-table-toolbar';
import { PicbookTableFiltersResult } from './picbook-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: '全部' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'name', label: '名称' },
  { id: 'type', label: '类型', width: 220 },
  { id: 'note', label: '简介', width: 220 },
  { id: 'status', label: '状态', width: 150 },
  { id: 'actions', label: '操作', width: 120 },
];

// ----------------------------------------------------------------------

export function PicbookListView() {
  const table = useTable();
  const confirmDialog = useBoolean();

  const [tableData, setTableData] = useState([]);
  const filters = useSetState({
    name: '',
    status: 'all',
  });

  const fetchPicbooks = useCallback(async () => {
    const { data, error } = await supabase
      .from('picbook')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setTableData(data);
    }
  }, []);

  useEffect(() => {
    fetchPicbooks();
  }, [fetchPicbooks]);

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [table, filters]
  );

  const handleFilterName = useCallback(
    (value) => {
      table.onResetPage();
      filters.setState({ name: value });
    },
    [table, filters]
  );

  const handleResetFilters = useCallback(() => {
    table.onResetPage();
    filters.resetState();
  }, [table, filters]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const notFound = !dataFiltered.length && !!filters.state.name;

  const handleDeleteRow = useCallback(
    async (id) => {
      // Get the picbook data first to access cover_url and folder_name
      const { data: picbookData, error: fetchError } = await supabase
        .from('picbook')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError || !picbookData) {
        console.error('Error fetching picbook data:', fetchError);
        return;
      }

      // 1. Delete cover image from picbookcover bucket
      if (picbookData.cover_url) {
        const coverFileName = picbookData.cover_url.replace('https://reecurbemkhjmectdkyp.supabase.co/storage/v1/object/public/picbookcover/', '');
        const { error: coverDeleteError } = await supabase.storage
          .from('picbookcover')
          .remove([coverFileName]);
          
        if (coverDeleteError) {
          console.error('Error deleting cover image:', coverDeleteError);
        }
      }

      // 2. Delete all files in the folder from picbook bucket
      if (picbookData.folder_name) {
        // List all files in the folder
        const { data: folderFiles, error: listError } = await supabase.storage
          .from('picbook')
          .list(picbookData.folder_name);
          
        if (!listError && folderFiles && folderFiles.length > 0) {
          // Create an array of file paths to delete
          const filePaths = folderFiles.map(file => `${picbookData.folder_name}/${file.name}`);
          
          // Delete all files in the folder
          const { error: filesDeleteError } = await supabase.storage
            .from('picbook')
            .remove(filePaths);
            
          if (filesDeleteError) {
            console.error('Error deleting folder files:', filesDeleteError);
          }
        }
      }

      // 3. Delete the picbook record from the database
      const { error } = await supabase.from('picbook').delete().eq('id', id);
      if (error) {
        console.error('Error deleting picbook record:', error);
      } else {
        console.log('Picbook deleted successfully!');
        await fetchPicbooks();
      }
    },
    [fetchPicbooks]
  );

  const handleDeleteRows = useCallback(
    async (selectedIds) => {
      // For each selected ID, we need to perform the same operations as handleDeleteRow
      for (const id of selectedIds) {
        // Get the picbook data first
        const { data: picbookData, error: fetchError } = await supabase
          .from('picbook')
          .select('*')
          .eq('id', id)
          .single();
          
        if (!fetchError && picbookData) {
          // 1. Delete cover image
          if (picbookData.cover_url) {
            const coverFileName = picbookData.cover_url.replace('https://reecurbemkhjmectdkyp.supabase.co/storage/v1/object/public/picbookcover/', '');
            await supabase.storage.from('picbookcover').remove([coverFileName]);
          }
  
          // 2. Delete all files in the folder
          if (picbookData.folder_name) {
            const { data: folderFiles } = await supabase.storage
              .from('picbook')
              .list(picbookData.folder_name);
              
            if (folderFiles && folderFiles.length > 0) {
              const filePaths = folderFiles.map(file => `${picbookData.folder_name}/${file.name}`);
              await supabase.storage.from('picbook').remove(filePaths);
            }
          }
        }
      }
      
      // 3. Delete all selected picbook records
      const { error } = await supabase.from('picbook').delete().in('id', selectedIds);
      if (!error) {
        await fetchPicbooks();
        table.onSelectAllRows(false);
      } else {
        console.error('Error deleting picbook records:', error);
      }
    },
    [fetchPicbooks, table]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="绘本"
        links={[
          { name: '首页', href: paths.dashboard.root },
          { name: '教材管理', href: paths.dashboard.textbook.picbook.root },
          { name: '绘本' },
        ]}
        action={
          <Button
            href={paths.dashboard.textbook.picbook.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            新增绘本
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={filters.state.status}
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
                    ((tab.value === 'all' || tab.value === filters.state.status) && 'filled') ||
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
                    ? tableData.filter((item) => item.status === tab.value).length
                    : tableData.length}
                </Label>
              }
            />
          ))}
        </Tabs>

        <PicbookTableToolbar
          filters={filters}
          onFilterName={handleFilterName}
          onResetFilters={handleResetFilters}
          options={{ roles: _roles }}
        />

        {notFound && <TableNoData query={filters.state.name} />}

        <PicbookTableFiltersResult
          filters={filters}
          onResetPage={table.onResetPage}
          totalResults={dataFiltered.length}
          sx={{ p: 2.5, pt: 0 }}
        />

        <TableSelectedAction
          dense={table.dense}
          numSelected={table.selected.length}
          rowCount={tableData.length}
          onSelectAllRows={(checked) =>
            table.onSelectAllRows(
              checked,
              tableData.map((row) => row.id)
            )
          }
          action={
            <Button
              variant="contained"
              color="error"
              onClick={confirmDialog.onTrue}
            >
              删除
            </Button>
          }
        />

        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headCells={TABLE_HEAD}
              rowCount={tableData.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
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
                  <PicbookTableRow
                    key={row.id}
                    row={row}
                    selected={table.selected.includes(row.id)}
                    onSelectRow={() => table.onSelectRow(row.id)}
                    onDeleteRow={() => handleDeleteRow(row.id)}
                    editHref={paths.dashboard.textbook.picbook.edit(row.id)}
                  />
                ))}

              <TableEmptyRows
                height={table.dense ? 52 : 72}
                emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
              />

              {notFound && <TableNoData query={filters.state.name} />}
            </TableBody>
          </Table>
        </Scrollbar>

        <TablePaginationCustom
          count={dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />

        <ConfirmDialog
          open={confirmDialog.value}
          onClose={confirmDialog.onFalse}
          title="删除"
          content={
            <>{`你确定要删除 ${table.selected.length} 个选中项吗?`}</>
          }
          action={
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                await handleDeleteRows(table.selected);
                confirmDialog.onFalse();
              }}
            >
              删除
            </Button>
          }
        />
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (picbook) => picbook.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((picbook) => picbook.status === status);
  }

  return inputData;
}