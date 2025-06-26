'use client';

import {
  DataGrid,
  GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from '@mui/x-data-grid';
import React, { useEffect, useState, useCallback } from 'react';
import {
  AlertColor,
  Box,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Button,
  Autocomplete,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import NotificationSnackbar from '@/components/snackBar';
import api from '@/api/axios';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import dayjs from 'dayjs';
import CommonSelectBox from '@/components/selectBox/commonSelectBox';
import useCommonCodeMap from '@/components/selectBox/commonCodeMap';
import { useConfirm } from '@/components/confirm';
import ApplicationPreviewDialog from '@/components/dialog/jobPosting/ApplicationPreviewDialog';

interface ApplicationDto {
  applicationId: number;
  jobPostingId: number;
  jobTitle: string;
  applicantName: string;
  email: string;
  resumeId: number;
  coverLetterId?: number | null;
  resumeTitle: string;
  status: string;
  appliedAt: string;
}

interface JobPostingDto {
  jobPostingId: number;
  title: string;
}

export default function EmployerApplicationsPage() {
  const confirm = useConfirm();

  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'appliedAt', sort: 'desc' }]);

  const [jobPostingId, setJobPostingId] = useState<string | ''>(''); // ✅ 선택된 공고 ID
  const [jobPostings, setJobPostings] = useState<JobPostingDto[]>([]);
  const [keyword, setKeyword] = useState('');

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const statusMap = useCommonCodeMap('APPLICATION', 'STATUS');

  const [editedRows, setEditedRows] = useState<Record<number, string>>({});
  const hasUnsaved = Object.keys(editedRows).length > 0;

  const [preview, setPreview] = useState<{ applicationId: number } | null>(null);

  const applicationColumns: GridColDef<ApplicationDto>[] = [
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
    { field: 'jobTitle', headerName: '공고명', flex: 1, minWidth: 180, headerAlign: 'center' },
    {
      field: 'applicantName',
      headerName: '지원자명',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    { field: 'email', headerName: '이메일', flex: 1, minWidth: 200, headerAlign: 'center' },
    { field: 'resumeTitle', headerName: '이력서', flex: 1, minWidth: 200, headerAlign: 'center' },
    {
      field: 'status',
      headerName: '상태',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      editable: true,
      renderCell: ({ value }) => statusMap[value as keyof typeof statusMap] ?? value,
      renderEditCell: params => (
        <CommonSelectBox
          groupCode="APPLICATION"
          parentCode="STATUS"
          value={params.value}
          onChange={v => {
            params.api.setEditCellValue({ id: params.id, field: params.field, value: v });
            setEditedRows(prev => ({ ...prev, [params.id as number]: v }));
          }}
        />
      ),
    },
    {
      field: 'appliedAt',
      headerName: '지원일',
      width: 160,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => dayjs(params.value).format('YYYY-MM-DD HH:mm'),
    },
  ];

  const getApplications = useCallback(async () => {
    try {
      const { page, pageSize } = pagination;
      const sort = sortModel[0]?.field ?? 'appliedAt';
      const direction = sortModel[0]?.sort ?? 'desc';

      const res = await api.get('/emp/applications', {
        params: {
          jobPostingId: jobPostingId || undefined,
          keyword,
          page,
          size: pageSize,
          sort,
          direction,
        },
      });

      setApplications(res.data);
      setRowCount(Number(res.pagination?.totalElements ?? res.data.length));
      setEditedRows({});
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  }, [pagination, sortModel, jobPostingId, keyword]);

  const getJobPostings = async () => {
    try {
      const res = await api.get('/emp/job-postings');
      setJobPostings(res.data ?? []);
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  };

  useEffect(() => {
    getJobPostings();
  }, []);

  useEffect(() => {
    getApplications();
  }, [pagination, sortModel, jobPostingId]);

  const handleClose = () => closeSnackbar(setSnackbar);

  const handleSaveAll = async () => {
    if (!hasUnsaved) return false;
    const isConfirmed = await confirm({
      title: '저장하시겠습니까?',
      message: '지원자의 지원서 상태정보를 수정합니다.',
      confirmText: '저장',
      cancelText: '취소',
    });
    if (isConfirmed) {
      try {
        const payload = Object.entries(editedRows).map(([id, status]) => ({
          applicationId: Number(id),
          status,
        }));
        await api.put('/emp/applications/status', payload);
        notifySuccess(setSnackbar, '저장되었습니다.');
        await getApplications();
        return true;
      } catch (e: any) {
        notifyError(setSnackbar, e.message);
        return false;
      }
    }
  };

  const confirmUnsaved = async (proceed: () => void) => {
    if (!hasUnsaved) {
      proceed();
      return;
    }
    const ok = await confirm({
      title: '작업 중인 데이터가 있습니다.',
      message: '변경 사항을 저장하시겠습니까?\n저장하지 않으면 수정 내용이 사라집니다.',
      confirmText: '저장',
      cancelText: '계속 편집',
    });
    if (ok) {
      const saved = await handleSaveAll();
      if (saved) proceed();
    }
  };

  const headerActions = (
    <Stack direction="row" spacing={1} alignItems="center">
      {/* 공고 검색 + 선택 */}
      <Autocomplete
        options={jobPostings}
        getOptionLabel={(option: JobPostingDto) => option.title}
        value={jobPostings.find(jp => String(jp.jobPostingId) === jobPostingId) ?? null}
        onChange={(_, newValue) =>
          confirmUnsaved(() => setJobPostingId(newValue ? String(newValue.jobPostingId) : ''))
        }
        renderInput={params => <TextField {...params} label="공고 선택/검색" size="small" />}
        sx={{ minWidth: 240 }}
      />

      <TextField
        size="small"
        placeholder="지원자명·이메일·이력서 검색"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && confirmUnsaved(getApplications)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment
                position="start"
                onClick={() => confirmUnsaved(getApplications)}
                sx={{ cursor: 'pointer' }}
              >
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: { xs: '100%', sm: 300 } }}
      />

      <Button
        size="small"
        variant="contained"
        startIcon={<SaveIcon />}
        disabled={!hasUnsaved}
        onClick={handleSaveAll}
      >
        저장
      </Button>
    </Stack>
  );

  return (
    <PageSectionLayout title="지원자 관리" actions={headerActions}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 620 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            지원자 목록
          </Typography>
          <Chip size="small" variant="outlined" label={`${rowCount}건`} />
        </Stack>

        <DataGrid
          getRowId={r => r.applicationId}
          columns={applicationColumns}
          rows={applications}
          disableRowSelectionOnClick
          paginationMode="server"
          sortingMode="server"
          rowCount={rowCount}
          paginationModel={pagination}
          onPaginationModelChange={m => confirmUnsaved(() => setPagination(m))}
          onSortModelChange={m => confirmUnsaved(() => setSortModel(m))}
          pageSizeOptions={[10, 20, 50]}
          pagination
          disableColumnMenu
          rowHeight={44}
          onCellClick={(params, event) => {
            if (params.field === 'status') {
              event.stopPropagation(); // RowClick 막기
            }
          }}
          onRowClick={params => {
            setPreview({ applicationId: params.row.applicationId });
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-virtualScroller': {
              overflowX: 'hidden',
            },
          }}
        />

        <NotificationSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleClose}
          bottom="10px"
        />

        {preview && (
          <ApplicationPreviewDialog
            open={!!preview}
            applicationId={preview.applicationId}
            onClose={() => setPreview(null)}
          />
        )}
      </Box>
    </PageSectionLayout>
  );
}
