'use client';

import {
  DataGrid,
  GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { AlertColor, Box, Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NotificationSnackbar from '@/components/snackBar';
import api from '@/api/axios';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

interface NoticeDto {
  noticeId: number;
  noticeType: string;
  title: string;
  writerId: string;
  viewCount: number;
  isTopFixed: string;
  isExposed: string;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminNoticePage() {
  const router = useRouter();

  const noticeColumns: GridColDef<NoticeDto>[] = [
    { field: 'noticeId', headerName: 'ID', width: 90, align: 'center', headerAlign: 'center' },
    { field: 'noticeType', headerName: '유형', width: 120, align: 'center', headerAlign: 'center' },
    { field: 'title', headerName: '제목', flex: 1, minWidth: 200, headerAlign: 'center' },
    { field: 'writerId', headerName: '작성자', width: 120, align: 'center', headerAlign: 'center' },
    {
      field: 'viewCount',
      headerName: '조회수',
      type: 'number',
      width: 100,
      align: 'right',
      headerAlign: 'center',
    },
    {
      field: 'isTopFixed',
      headerName: '상단고정',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => (params.value === 'Y' ? '예' : '아니오'),
    },
    {
      field: 'isExposed',
      headerName: '노출여부',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => (params.value === 'Y' ? '노출' : '숨김'),
    },
    {
      field: 'startDate',
      headerName: '시작일',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    { field: 'endDate', headerName: '종료일', width: 120, align: 'center', headerAlign: 'center' },
    {
      field: 'createdAt',
      headerName: '등록일',
      width: 160,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => dayjs(params.value).format('YYYY-MM-DD'),
    },
    {
      field: 'updatedAt',
      headerName: '수정일',
      width: 160,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => dayjs(params.value).format('YYYY-MM-DD'),
    },
  ];

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [notices, setNotices] = useState<NoticeDto[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  useEffect(() => {
    getNotices();
  }, [pagination, sortModel]);

  const getNotices = async () => {
    try {
      const { page, pageSize } = pagination;
      const sort = sortModel[0]?.field;
      const direction = sortModel[0]?.sort;
      const res = await api.get('/admin/getNotices', {
        params: { page, size: pageSize, sort, direction },
      });
      setNotices(res.data);
      setRowCount(Number(res.pagination?.totalElements ?? res.data.length));
      notifySuccess(setSnackbar, res.message);
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  };

  const handleClose = () => closeSnackbar(setSnackbar);

  return (
    <PageSectionLayout title="공지사항 관리">
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 600 }}>
        {/* 상단 툴바 */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            공지사항 목록 ({rowCount}건)
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => router.push('/notice/new')}
          >
            등록
          </Button>
        </Stack>

        {/* 데이터 그리드 */}
        <DataGrid
          getRowId={r => r.noticeId}
          columns={noticeColumns}
          rows={notices}
          disableRowSelectionOnClick
          paginationMode="server"
          sortingMode="server"
          rowCount={rowCount}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          onSortModelChange={setSortModel}
          pageSizeOptions={[10, 20, 50]}
          pagination
          disableColumnMenu
          rowHeight={40}
          onRowClick={params => {
            router.push(`/notice/detail/${params.row.noticeId}`);
          }}
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
