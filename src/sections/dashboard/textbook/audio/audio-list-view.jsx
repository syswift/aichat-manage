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
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
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

  import { AudioTableRow } from './audio-table-row';
  import { AudioTableToolbar } from './audio-table-toolbar';
  import { AudioTableFiltersResult } from './audio-table-filters-result';

  // ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: '全部' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
    { id: 'name', label: '名称' },
    { id: 'phoneNumber', label: '类型', width: 220 },
    { id: 'company', label: '简介', width: 220 },
    { id: 'status', label: '状态', width: 150 },
    { id: 'role', label: '操作', width: 120 },
  ];

  // 使用 supabase 进行操作
async function fetchData() {
    const { data, error } = await supabase
      .from('audio')
      .select('*');
  
    if (error) {
      console.error('Error fetching data:', error);
    } else {
      console.log('Data:', data);
    }
    return data;
}
  
export function AudioListView() {
    const table = useTable();
    const confirmDialog = useBoolean();
    const [tableData, setTableData] = useState([]);

    const filters = useSetState({ name: '', role: [], status: 'all' });
    const { state: currentFilters, setState: updateFilters } = filters;

    // Fetch data on component mount
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

    const handleDeleteRow = useCallback(
        (id) => {
        const deleteRow = tableData.filter((row) => row.id !== id);

        toast.success('Delete success!');

        setTableData(deleteRow);

        table.onUpdatePageDeleteRow(dataInPage.length);
        },
        [dataInPage.length, table, tableData]
    );

    const handleDeleteRows = useCallback(() => {
        const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

        toast.success('Delete success!');

        setTableData(deleteRows);

        table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
    }, [dataFiltered.length, dataInPage.length, table, tableData]);

    const handleFilterStatus = useCallback(
        (event, newValue) => {
        table.onResetPage();
        updateFilters({ status: newValue });
        },
        [updateFilters, table]
    );

    const renderConfirmDialog = () => (
        <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Delete"
        content={
            <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
            </>
        }
        action={
            <Button
            variant="contained"
            color="error"
            onClick={() => {
                handleDeleteRows();
                confirmDialog.onFalse();
            }}
            >
            Delete
            </Button>
        }
        />
    );


    return (
        <>
        <DashboardContent>
            <CustomBreadcrumbs
            heading="音频"
            links={[
                { name: '首页', href: paths.dashboard.root },
                { name: '教材管理', href: paths.dashboard.textbook.audio.root },
                { name: '音频' },
            ]}
            action={
                <Button
                href={paths.dashboard.textbook.audio.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                >
                新增音频
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
                <AudioTableToolbar
                    filters={filters}
                    onResetPage={table.onResetPage}
                    options={{ roles: _roles }}
                />

                {canReset && (
                    <AudioTableFiltersResult
                    filters={filters}
                    totalResults={dataFiltered.length}
                    onResetPage={table.onResetPage}
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
                            <AudioTableRow
                                key={row.id}
                                row={row}
                                selected={table.selected.includes(row.id)}
                                onSelectRow={() => table.onSelectRow(row.id)}
                                onDeleteRow={() => handleDeleteRow(row.id)}
                                editHref={paths.dashboard.textbook.audio.edit(row.id)}
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

        {renderConfirmDialog()}
        </>
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
