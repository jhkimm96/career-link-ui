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
import { useRouter } from 'next/navigation';

interface JopPostings {
  jobPostingId: string;
  employerId: string;
  companyName: string;
  title: string;
  applicationDeadline: string;
  isActive: string;
  isDeleted: string;
  createdAt: string | null;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string;
}

export default function JobPostingManagementPage() {
  const router = useRouter();
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
  // 멀티select
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set<GridRowId>(),
  });

  //목록 상태
  const [rows, setRows] = useState<JopPostings[]>([]);
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
  const columns: GridColDef<JopPostings>[] = useMemo(
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
        field: 'companyName',
        headerName: '기업명',
        flex: 1,
        minWidth: 160,
        headerAlign: 'center',
        align: 'left',
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
        field: 'title',
        headerName: '공고제목',
        flex: 1,
        minWidth: 260,
        headerAlign: 'center',
        align: 'left',
      },
      {
        field: 'applicationDeadline',
        headerName: '지원마감일',
        flex: 1,
        minWidth: 140,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'isActive',
        headerName: '게시활성화여부',
        flex: 1,
        minWidth: 140,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'isDeleted',
        headerName: '삭제여부',
        flex: 1,
        minWidth: 140,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'createdBy',
        headerName: '작성자',
        flex: 1.2,
        minWidth: 140,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'updatedBy',
        headerName: '수정자',
        flex: 1.2,
        minWidth: 140,
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'createdAt',
        headerName: '작성일자',
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
        field: 'updatedAt',
        headerName: '수정일자',
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
        field: 'jobPostingId',
        headerName: '바로가기',
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
              onClick={() => {
                router.push(`/job-postings/detail?id=${params?.row.jobPostingId}`);
              }}
              disableElevation
              sx={{
                minWidth: 80,
                px: 1.25,
                py: 0.25,
                fontSize: 12,
              }}
            >
              바로가기
            </Button>
          );
        },
      },
    ],
    [pagination.page, pagination.pageSize]
  );

  // 조회
  const fetchJobPostings = async () => {
    setLoading(true);
    try {
      const { page, pageSize } = pagination;
      const sort = sortModel[0]?.field;
      const direction = sortModel[0]?.sort;
      const res = await api.get('/admin/job-postings/manage', {
        params: { page, size: pageSize, sort, direction, keyword },
      });

      const list: JopPostings[] = (res.data?.content ?? res.data ?? []).map((r: any) => ({
        jobPostingId: r.id ?? r.jobPostingId,
        employerId: r.employerId,
        companyName: r.companyName,
        title: r.title,
        applicationDeadline: r.applicationDeadline,
        isActive: r.isActive === 'Y' ? 'Y' : 'N',
        isDeleted: r.isDeleted === 'Y' ? 'Y' : 'N',
        createdAt: String(r.createdAt),
        createdBy: r.createdBy,
        updatedAt: String(r.updatedAt),
        updatedBy: r.updatedBy,
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
    void fetchJobPostings();
  }, [pagination, sortModel]);

  // ===== 삭제 처리 (다건) =====
  const handleDeleteBulk = async () => {
    if (selectionModel.ids.size === 0) {
      notifyError(setSnackbar, '선택된 공고가 없습니다.');
      return;
    }

    const ok = await confirm({
      title: '삭제 처리',
      message: `공고 [${selectionModel.ids.size}] 개를 일괄 삭제하시겠습니까?`,
      confirmText: '삭제',
      cancelText: '취소',
    });
    if (!ok) return;

    const ids: string[] = Array.from(selectionModel.ids).map(String);

    try {
      const res = await api.post('/admin/job-postings/delete-bulk', ids);
      const deleted = res.data;
      notifySuccess(setSnackbar, `${deleted}건 삭제되었습니다.`);
      await fetchJobPostings();
    } catch (e: any) {
      notifyError(setSnackbar, e.message ?? '일괄 삭제 중 오류 발생');
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
        placeholder="기업명·공고명·작성자·마감일자(YYYYMMDD) 검색"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && fetchJobPostings()}
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
      <Button size="small" variant="outlined" startIcon={<SearchIcon />} onClick={fetchJobPostings}>
        검색
      </Button>
    </Box>
  );

  return (
    <PageSectionLayout title="기업공고관리" actions={headerActions}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 600 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ gap: 1, flexWrap: 'wrap', mb: 1 }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              기업공고 목록
            </Typography>
            <Chip size="small" variant="outlined" label={`${rowCount}건`} />
          </Stack>
          <Button
            variant="contained"
            size="small"
            disabled={selectedCount === 0}
            onClick={handleDeleteBulk}
          >
            일괄삭제
          </Button>
        </Stack>

        <DataGrid
          apiRef={apiRef}
          getRowId={r => r.jobPostingId}
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
