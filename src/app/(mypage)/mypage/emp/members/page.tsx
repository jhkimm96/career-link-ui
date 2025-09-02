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
  useGridApiRef,
} from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import NotificationSnackbar from '@/components/snackBar';
import { useConfirm } from '@/components/confirm';

interface EmployerMember {
  employerUserId: string;
  userName: string;
  employerLoginId: string;
  email: string;
  phoneNumber: string;
  isApproved: string;
  approvedAt: string | null;
}

export default function EmployerMembersPage() {
  const confirm = useConfirm();
  const apiRef = useGridApiRef();

  // 알림
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });
  const handleClose = () => closeSnackbar(setSnackbar);

  // 검색 키워드
  const [keyword, setKeyword] = useState('');

  //선택 개수
  const [selectedCount, setSelectedCount] = useState(0);

  //목록 상태
  const [rows, setRows] = useState<EmployerMember[]>([]);
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
  const columns: GridColDef<EmployerMember>[] = useMemo(
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
        field: 'userName',
        headerName: '회원명',
        flex: 1,
        minWidth: 140,
        headerAlign: 'center',
        align: 'left',
      },
      {
        field: 'employerLoginId',
        headerName: '회원ID',
        flex: 1,
        minWidth: 140,
        headerAlign: 'center',
        align: 'left',
      },
      {
        field: 'email',
        headerName: '이메일',
        flex: 1.2,
        minWidth: 200,
        headerAlign: 'center',
        align: 'left',
      },
      {
        field: 'phoneNumber',
        headerName: '휴대전화',
        flex: 1,
        minWidth: 160,
        headerAlign: 'center',
        align: 'center',
        renderCell: p => {
          const v = p.row.phoneNumber ?? '';
          return v ? v.replace(/\D/g, '').replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3') : '-';
        },
      },
      {
        field: 'approvedAt',
        headerName: '승인일자',
        flex: 1,
        minWidth: 160,
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
        field: 'isApproved',
        headerName: '승인처리',
        width: 130,
        headerAlign: 'center',
        align: 'center',
        sortable: false,
        filterable: false,
        renderCell: params => {
          return (
            <Button
              size="small"
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={() => handleApprove(params.row)}
              disabled={params.row.isApproved === 'Y'}
              disableElevation
              sx={{
                minWidth: 88,
                px: 1.25,
                py: 0.25,
                fontSize: 12,
              }}
            >
              {params.row.isApproved === 'Y' ? '승인됨' : '승인'}
            </Button>
          );
        },
      },
    ],
    [pagination.page, pagination.pageSize]
  );

  // 조회
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { page, pageSize } = pagination;
      const sort = sortModel[0]?.field;
      const direction = sortModel[0]?.sort;
      const res = await api.get('/emp/members', {
        params: { page, size: pageSize, sort, direction, keyword },
      });

      const list: EmployerMember[] = (res.data?.content ?? res.data ?? []).map((r: any) => ({
        employerUserId: String(r.id ?? r.employerUserId),
        userName: r.userName,
        employerLoginId: r.employerLoginId,
        email: r.email,
        phoneNumber: r.phoneNumber,
        isApproved: String(r.isApproved).toUpperCase() === 'Y' ? 'Y' : 'N',
        approvedAt: String(r.approvedAt),
      }));

      setRows(list);
      setRowCount(
        Number(res.data?.pagination?.totalElements ?? res.data?.totalElements ?? list.length)
      );
      if (res.message) notifySuccess(setSnackbar, res.message);
    } catch (e: any) {
      notifyError(setSnackbar, e.message ?? '목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMembers();
  }, [pagination, sortModel]);

  // ===== 승인 처리 =====
  const handleApprove = async (row: EmployerMember) => {
    if (row.isApproved === 'Y') return;

    const ok = await confirm({
      title: '승인 처리',
      message: `승인 후 취소할 수 없습니다. [${row.userName}] 회원을 승인하시겠습니까?`,
      confirmText: '승인',
      cancelText: '취소',
    });
    if (!ok) return;

    try {
      const res = await api.post(`/emp/members/${row.employerUserId}/approve`);
      notifySuccess(setSnackbar, res.message ?? '승인되었습니다.');

      setRows(prev =>
        prev.map(r => (r.employerUserId === row.employerUserId ? { ...r, isApproved: 'Y' } : r))
      );
    } catch (e: any) {
      notifyError(setSnackbar, e.message ?? '승인 처리 중 오류가 발생했습니다.');
    }
  };

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
        placeholder="이름·ID·이메일·전화 검색"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && fetchMembers()}
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
      <Button size="small" variant="outlined" startIcon={<SearchIcon />} onClick={fetchMembers}>
        검색
      </Button>
    </Box>
  );

  return (
    <PageSectionLayout title="기업회원관리 - 소속회원" actions={headerActions}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 600 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ gap: 1, flexWrap: 'wrap', mb: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              소속회원 목록
            </Typography>
            <Chip size="small" variant="outlined" label={`${rowCount}건`} />
          </Stack>
        </Stack>

        <DataGrid
          apiRef={apiRef}
          getRowId={r => r.employerUserId}
          rows={rows}
          columns={columns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={ids =>
            setSelectedCount((ids as unknown as GridRowId[]).length)
          }
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
