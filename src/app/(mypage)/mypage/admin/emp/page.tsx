'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import api from '@/api/axios';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import {
  AlertColor,
  Box,
  Button,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridFilterModel,
  type GridPaginationModel,
  type GridRowId,
  type GridSortModel,
  type GridRowSelectionModel,
  useGridApiRef,
} from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import NotificationSnackbar from '@/components/snackBar';
import { useConfirm } from '@/components/confirm';

interface Employers {
  employerId: string;
  companyName: string;
  bizRegNo: string;
  companyEmail: string;
  bizRegistrationUrl: string;
  createdAt: string;
  isApproved: string;
  approvedAt: string;
}

export default function CompanyRequestTable() {
  const confirm = useConfirm();
  const apiRef = useGridApiRef();

  // 알림
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });
  const handleClose = () => closeSnackbar(setSnackbar);

  //선택 개수
  const [selectedCount, setSelectedCount] = useState(0);

  // 검색 키워드
  const [keyword, setKeyword] = useState('');

  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set<GridRowId>(),
  });

  //목록 상태
  const [rows, setRows] = useState<Employers[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  //서버 페이징/정렬/필터
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

  //컬럼
  const columns: GridColDef<Employers>[] = useMemo(
    () => [
      {
        field: '__no__',
        headerName: 'No',
        width: 80,
        headerAlign: 'center',
        align: 'center',
        renderCell: params => {
          const idx = params.api.getSortedRowIds().indexOf(params.id);
          const base = pagination.page * pagination.pageSize;
          return base + idx + 1;
        },
        sortable: false,
        filterable: false,
      },
      {
        field: 'employerId',
        headerName: '기업아이디',
        flex: 1,
        minWidth: 160,
        headerAlign: 'center',
        align: 'left',
      },
      {
        field: 'companyName',
        headerName: '기업명',
        flex: 1,
        minWidth: 160,
        headerAlign: 'center',
        align: 'left',
      },
      {
        field: 'bizRegNo',
        headerName: '사업자등록번호',
        flex: 1,
        minWidth: 140,
        headerAlign: 'center',
        align: 'left',
      },
      {
        field: 'companyEmail',
        headerName: '이메일',
        flex: 1,
        minWidth: 200,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'createdAt',
        headerName: '신청일자',
        flex: 1,
        minWidth: 140,
        headerAlign: 'center',
        align: 'center',
        renderCell: p => {
          const v = p.value as string | null;
          if (!v) return '-';
          const d = dayjs(v);
          return d.isValid() ? d.format('YYYY-MM-DD HH:mm') : '-';
        },
      },
      {
        field: 'bizRegistrationUrl',
        headerName: '사업자등록증',
        width: 130,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: params => {
          const url = params.value;
          if (!url) {
            return <span style={{ color: '#888' }}>없음</span>;
          }
          return (
            <Button
              size="small"
              variant="text"
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              보기
            </Button>
          );
        },
      },
      {
        field: 'isApproved',
        headerName: '승인여부',
        flex: 1.2,
        minWidth: 100,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'approvedAt',
        headerName: '승인일자',
        flex: 1,
        minWidth: 140,
        headerAlign: 'center',
        align: 'center',
        renderCell: p => {
          const v = p.value as string | null;
          if (!v) return '-';
          const d = dayjs(v);
          return d.isValid() ? d.format('YYYY-MM-DD HH:mm') : '-';
        },
      },
      {
        field: 'actions',
        headerName: '관리',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: params => {
          return (
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                handleApprove(params?.row.employerId);
              }}
              disableElevation
              sx={{
                minWidth: 60,
                px: 1.25,
                py: 0.25,
                fontSize: 12,
              }}
            >
              승인
            </Button>
          );
        },
      },
    ],
    [pagination.page, pagination.pageSize]
  );

  // 조회
  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const { page, pageSize } = pagination;
      const sort = sortModel[0]?.field;
      const direction = sortModel[0]?.sort;
      const res = await api.get('/admin/emp/requests', {
        params: { page, size: pageSize, sort, direction, keyword },
      });

      const list: Employers[] = (res.data?.content ?? res.data ?? []).map((r: any) => ({
        employerId: r.id ?? r.employerId,
        companyName: r.companyName,
        bizRegNo: r.bizRegNo,
        companyEmail: r.companyEmail,
        bizRegistrationUrl: r.bizRegistrationUrl,
        createdAt: String(r.createdAt),
        isApproved: r.isApproved === 'Y' ? 'Y' : 'N',
        approvedAt: String(r.approvedAt),
      }));

      setRows(list);
      setRowCount(Number(res.pagination?.totalElements ?? list.length));
      if (res.message) notifySuccess(setSnackbar, res.message);
    } catch (e: any) {
      notifyError(setSnackbar, e.message ?? '목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEmployers();
  }, [pagination, sortModel]);

  // ===== 핸들러 =====
  const onPageChange = (m: GridPaginationModel) => setPagination(m);
  const onSortChange = (m: GridSortModel) => {
    setSortModel(m);
    setPagination(prev => ({ ...prev, page: 0 }));
  };
  const onFilterChange = (m: GridFilterModel) => {
    setFilterModel(m);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // ===== 헤더 액션 =====
  const headerActions = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        size="small"
        placeholder="기업명·이메일·사업자등록번호 검색"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && fetchEmployers()}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: { xs: '100%', sm: 320 } }}
      />
    </Box>
  );

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/admin/emp/${id}/approve`);
      fetchEmployers();
    } catch (err) {
      console.error('승인 실패', err);
    }
  };

  // ===== 승인 처리 (다건) =====
  const handleApproveBulk = async () => {
    if (selectionModel.ids.size === 0) {
      notifyError(setSnackbar, '선택된 기업이 없습니다.');
      return;
    }

    const ok = await confirm({
      title: '승인 처리',
      message: `기업 [${selectionModel.ids.size}] 개를 일괄 승인하시겠습니까?`,
      confirmText: '승인',
      cancelText: '취소',
    });
    if (!ok) return;

    const ids: string[] = Array.from(selectionModel.ids).map(String);

    try {
      const res = await api.post('/admin/emp/approve-bulk', ids);
      const approved = res.data;
      notifySuccess(setSnackbar, `${approved}건 승인되었습니다.`);
      await fetchEmployers();
    } catch (e: any) {
      notifyError(setSnackbar, e.message ?? '일괄 승인 중 오류 발생');
    }
  };

  return (
    <PageSectionLayout title="기업관리" actions={headerActions}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 600 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ gap: 1, flexWrap: 'wrap', mb: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              기업 목록
            </Typography>
            <Chip size="small" variant="outlined" label={`${rowCount}건`} />
          </Stack>
          <Button
            variant="contained"
            size="small"
            disabled={selectedCount === 0}
            onClick={handleApproveBulk}
          >
            일괄승인
          </Button>
        </Stack>

        <DataGrid
          apiRef={apiRef}
          getRowId={r => r.employerId}
          rows={rows}
          columns={columns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={model => {
            setSelectionModel(model);
            setSelectedCount(model.ids.size);
          }}
          isRowSelectable={params => params.row.isApproved !== 'Y'}
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
          rowCount={rowCount}
          paginationModel={pagination}
          onPaginationModelChange={onPageChange}
          onSortModelChange={onSortChange}
          onFilterModelChange={onFilterChange}
          pageSizeOptions={[10, 20, 50]}
          pagination
          disableColumnMenu
          rowHeight={40}
          editMode="cell"
          isCellEditable={() => false}
        />
        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleClose}
          bottom="10px"
        />
      </Box>
    </PageSectionLayout>
  );
}
