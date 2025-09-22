'use client';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Paper, Button, TextField, MenuItem, Link, Stack } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import api from '@/api/axios';
import dayjs from 'dayjs';

interface CompanyRequest {
  employerId: number;
  companyName: string;
  bizRegNo: string;
  companyEmail: string;
  createdAt: string;
  isApproved: string;
  businessCertUrl?: string;
}

const columns: GridColDef[] = [
  { field: 'employerId', headerName: 'ID', width: 90, headerAlign: 'center' },
  { field: 'companyName', headerName: '회사명', width: 150, headerAlign: 'center' },
  { field: 'bizRegNo', headerName: '사업자등록번호', width: 130, headerAlign: 'center' },
  { field: 'companyEmail', headerName: '이메일', width: 200, headerAlign: 'center' },
  {
    field: 'createdAt',
    headerName: '신청일자',
    headerAlign: 'center',
    width: 160,
    renderCell: params => {
      const raw = params.value;
      return dayjs(raw).format('YYYY-MM-DD HH:mm:ss');
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
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          color="primary"
        >
          보기
        </Link>
      );
    },
  },
  {
    field: 'isApproved',
    headerName: '승인여부',
    width: 100,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'actions',
    headerName: '관리',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    renderCell: params => {
      const row = params?.row;
      if (!row) return null;

      return (
        <Button
          variant="contained"
          size="small"
          color="primary"
          disabled={row.isApproved === 'Y'}
          onClick={() => handleApprove(row.employerId)}
        >
          승인
        </Button>
      );
    },
  },
];

let handleApprove = (id: number) => {};

export default function CompanyRequestTable() {
  const [rows, setRows] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Y' | 'N'>('all');

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/emp/requests');
      setRows(res.data);
      console.log('받은 데이터:', res.data);
    } catch (err) {
      console.error('기업 목록 조회 실패', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  handleApprove = async (id: number) => {
    try {
      await api.post(`/admin/emp/${id}/approve`);
      fetchData();
    } catch (err) {
      console.error('승인 실패', err);
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const matchesSearch =
        row.companyName.toLowerCase().includes(search.toLowerCase()) ||
        row.companyEmail.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === 'all' ? true : row.isApproved === filter;

      return matchesSearch && matchesFilter;
    });
  }, [rows, search, filter]);

  return (
    <Paper sx={{ height: 700, width: '100%', p: 2 }}>
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <TextField
          label="회사명"
          variant="outlined"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <TextField
          select
          label="승인 여부"
          variant="outlined"
          size="small"
          value={filter}
          onChange={e => setFilter(e.target.value as 'all' | 'Y' | 'N')}
        >
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="Y">승인됨</MenuItem>
          <MenuItem value="N">미승인</MenuItem>
        </TextField>
      </Stack>

      <DataGrid
        rows={filteredRows}
        columns={columns}
        getRowId={row => row.employerId}
        pageSizeOptions={[5, 10, 20]}
        loading={loading}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Paper>
  );
}
