'use client';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import {
  type AlertColor,
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
  GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from '@mui/x-data-grid';
import useCommonCodeMap from '@/components/selectBox/commonCodeMap';
import CommonSelectBox from '@/components/selectBox/commonSelectBox';
import React, { useEffect, useState } from 'react';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
import NotificationSnackbar from '@/components/snackBar';
import api from '@/api/axios';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';

interface UserDto {
  userName: string;
  loginId: string;
  email: string;
  role: string;
  userPk: string;
  userStatus: string;
}

export default function UserPage() {
  const userTypeMap = useCommonCodeMap('USER_TYPE', 'TYPE');
  const userStatusMap = useCommonCodeMap('USER_STATUS', 'STATUS');
  const userColumns: GridColDef<UserDto>[] = [
    {
      field: 'userName',
      headerName: '성명',
      width: 220,
      headerAlign: 'center',
      align: 'center',
      editable: false,
    },
    {
      field: 'loginId',
      headerName: '로그인ID',
      width: 180,
      editable: false,
    },
    {
      field: 'email',
      headerName: '이메일',
      width: 250,
      editable: false,
    },
    {
      field: 'role',
      headerName: '권한',
      width: 140,
      editable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ value }) => userTypeMap[value as keyof typeof userTypeMap] ?? value,
      renderEditCell: params => (
        <CommonSelectBox
          groupCode="USER_TYPE"
          parentCode="TYPE"
          value={params.value}
          onChange={v =>
            params.api.setEditCellValue({ id: params.id, field: params.field, value: v })
          }
        />
      ),
    },
    {
      field: 'userPk',
      headerName: '사용자키',
      width: 200,
      editable: false,
    },
    {
      field: 'userStatus',
      headerName: '상태',
      width: 140,
      editable: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ value }) => userStatusMap[value as keyof typeof userStatusMap] ?? value,
      renderEditCell: params => (
        <CommonSelectBox
          groupCode="USER_STATUS"
          parentCode="STATUS"
          value={params.value}
          onChange={v =>
            params.api.setEditCellValue({ id: params.id, field: params.field, value: v })
          }
        />
      ),
    },
  ];
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });
  const [role, setRole] = useState('');
  const [keyword, setKeyword] = useState('');
  const [users, setUsers] = useState<UserDto[]>([]);
  const [usersRowCount, setUsersRowCount] = useState(0);
  const [usersPagination, setUsersPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [usersSortModel, setUsersSortModel] = useState<GridSortModel>([]);
  const [editedRows, setEditedRows] = useState<Map<string, UserDto>>(new Map());

  useEffect(() => {
    getUsers();
  }, [usersPagination, usersSortModel, role]);

  const getUsers = async () => {
    try {
      const { page, pageSize } = usersPagination;
      const sort = usersSortModel[0]?.field;
      const direction = usersSortModel[0]?.sort;
      const res = await api.get('/admin/applicant/getUsers', {
        params: { page, size: pageSize, sort, direction, keyword, role },
      });
      setUsers(res.data);
      setUsersRowCount(Number(res.pagination?.totalElements ?? res.data.length));
      notifySuccess(setSnackbar, res.message);
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  };
  const onUsersPageChange = (m: GridPaginationModel) => {
    setUsersPagination(m);
  };
  const onUsersSortChange = (m: GridSortModel) => {
    setUsersSortModel(m);
    setUsersPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleRowUpdate = (newRow: UserDto, oldRow: UserDto) => {
    if (newRow.userStatus !== oldRow.userStatus) {
      setEditedRows(prev => new Map(prev.set(newRow.userPk, newRow)));
    }
    return newRow;
  };
  const handleSaveAll = async () => {
    if (editedRows.size === 0) return;
    try {
      const editRows = Array.from(editedRows.values()).map(r => ({
        userPk: r.userPk,
        userStatus: r.userStatus,
        role: r.role,
      }));
      const res = await api.post('/admin/applicant/saveUsers', editRows); // 백엔드에 맞춰 수정

      setEditedRows(new Map());
      await getUsers();
      notifySuccess(setSnackbar, res.message);
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  };

  // ===== 헤더 액션 =====
  const headerActions = (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CommonSelectBox
          label="권한"
          defaultOptionLabel="전체"
          groupCode="USER_TYPE"
          parentCode="TYPE"
          value={role}
          onChange={code => setRole(code)}
          fullWidth={false}
        />
        <TextField
          size="small"
          placeholder="사용자이름 검색"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && getUsers()}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" onClick={getUsers} sx={{ cursor: 'pointer' }}>
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: { xs: '100%', sm: 200 } }}
        />
        <Button
          size="small"
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveAll}
          disabled={editedRows.size === 0}
        >
          저장
        </Button>
      </Box>
    </>
  );

  const handleClose = () => closeSnackbar(setSnackbar);
  return (
    <PageSectionLayout title="사용자관리" actions={headerActions}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 500,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, flexShrink: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            사용자
          </Typography>
          <Chip size="small" variant="outlined" label={`${usersRowCount}건`} />
        </Stack>
        <DataGrid
          getRowId={r => r.userPk}
          columns={userColumns}
          rows={users}
          disableRowSelectionOnClick
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
          rowCount={usersRowCount}
          paginationModel={usersPagination}
          onPaginationModelChange={onUsersPageChange}
          onSortModelChange={onUsersSortChange}
          pageSizeOptions={[10, 20, 50]}
          pagination
          disableColumnMenu
          rowHeight={40}
          processRowUpdate={handleRowUpdate}
          editMode="cell"
        ></DataGrid>
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
