'use client';
import React, { useEffect, useMemo, useState } from 'react';
import api from '@/api/axios';
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
  type GridColDef,
  type GridFilterModel,
  type GridPaginationModel,
  type GridRowId,
  type GridSortModel,
  type GridRowParams,
  useGridApiRef,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import LockIcon from '@mui/icons-material/Lock';
import { closeSnackbar, notifyError, notifyInfo, notifySuccess } from '@/api/apiNotify';
import NotificationSnackbar from '@/components/snackBar';
import { useConfirm } from '@/components/confirm';
import CommonSelectBox from '@/components/selectBox/commonSelectBox';
import useCommonCodeMap from '@/components/selectBox/commonCodeMap';

interface CodeDto {
  id: string;
  groupCode: string;
  code: string;
  codeName: string;
  parentCode: string | null;
  sortOrder: number;
  level: number;
  useYn: string;
  isNew?: boolean;
}

export default function Page() {
  // ===== 공통맵 =====
  const useYnMap = useCommonCodeMap('USE_YN', 'YN');

  // ===== 컬럼 정의 (부모/자식 별도) =====
  const parentCols: GridColDef<CodeDto>[] = useMemo(
    () => [
      {
        field: 'groupCode',
        headerName: '그룹코드',
        width: 150,
        headerAlign: 'center',
        align: 'center',
        editable: true,
        renderCell: params => {
          const isLocked = !String(params.id).startsWith('NEW_');

          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                pl: 1,
                bgcolor: isLocked ? 'grey.100' : 'inherit',
                color: isLocked ? 'text.disabled' : 'inherit',
                cursor: isLocked ? 'not-allowed' : 'text',
              }}
            >
              {isLocked && <LockIcon fontSize="small" sx={{ mr: 0.5 }} />}
              {params.value}
            </Box>
          );
        },
      },
      {
        field: 'code',
        headerName: '코드',
        width: 140,
        headerAlign: 'center',
        align: 'center',
        editable: true,
        renderCell: params => {
          const isLocked = !String(params.id).startsWith('NEW_') && !params.row.parentCode;
          // NEW_ 가 아니고, parentCode == null → 부모코드

          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                pl: 1,
                bgcolor: isLocked ? 'grey.100' : 'inherit',
                color: isLocked ? 'text.disabled' : 'inherit',
                cursor: isLocked ? 'not-allowed' : 'text',
              }}
            >
              {isLocked && <LockIcon fontSize="small" sx={{ mr: 0.5 }} />}
              {params.value}
            </Box>
          );
        },
      },

      {
        field: 'codeName',
        headerName: '그룹코드명',
        flex: 1,
        minWidth: 100,
        headerAlign: 'center',
        editable: true,
      },
      {
        field: 'useYn',
        headerName: '사용여부',
        width: 80,
        headerAlign: 'center',
        align: 'center',
        editable: true,
        renderCell: ({ value }) => useYnMap[value as keyof typeof useYnMap] ?? value,
        renderEditCell: params => (
          <CommonSelectBox
            groupCode="USE_YN"
            parentCode="YN"
            value={params.value}
            onChange={v =>
              params.api.setEditCellValue({ id: params.id, field: params.field, value: v })
            }
          />
        ),
      },
    ],
    [useYnMap]
  );

  const childCols: GridColDef<CodeDto>[] = useMemo(
    () => [
      {
        field: 'code',
        headerName: '코드',
        width: 140,
        headerAlign: 'center',
        align: 'center',
        editable: true,
        renderCell: params => {
          const isLocked = !String(params.id).startsWith('NEW_');

          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                pl: 1,
                bgcolor: isLocked ? 'grey.100' : 'inherit',
                color: isLocked ? 'text.disabled' : 'inherit',
                cursor: isLocked ? 'not-allowed' : 'text',
              }}
            >
              {isLocked && <LockIcon fontSize="small" sx={{ mr: 0.5 }} />}
              {params.value}
            </Box>
          );
        },
      },
      {
        field: 'codeName',
        headerName: '코드명',
        flex: 1,
        minWidth: 150,
        headerAlign: 'center',
        editable: true,
      },
      {
        field: 'sortOrder',
        headerName: '정렬',
        width: 90,
        type: 'number',
        headerAlign: 'center',
        align: 'center',
        editable: true,
      },
      {
        field: 'useYn',
        headerName: '사용여부',
        width: 80,
        headerAlign: 'center',
        align: 'center',
        editable: true,
        renderCell: ({ value }) => useYnMap[value as keyof typeof useYnMap] ?? value,
        renderEditCell: params => (
          <CommonSelectBox
            groupCode="USE_YN"
            parentCode="YN"
            value={params.value}
            onChange={v =>
              params.api.setEditCellValue({ id: params.id, field: params.field, value: v })
            }
          />
        ),
      },
    ],
    [useYnMap]
  );

  const confirm = useConfirm();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const [keyword, setKeyword] = useState('');
  const parentApiRef = useGridApiRef();
  const childApiRef = useGridApiRef();

  const [parentSelectedCount, setParentSelectedCount] = useState(0);
  const [childSelectedCount, setChildSelectedCount] = useState(0);

  // ===== 상위코드 상태 =====
  const [parents, setParents] = useState<Array<CodeDto & { isNew?: boolean }>>([]);
  const [parentRowCount, setParentRowCount] = useState(0);
  const [parentLoading, setParentLoading] = useState(false);
  const [parentPagination, setParentPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [parentSortModel, setParentSortModel] = useState<GridSortModel>([]);
  const [parentFilterModel, setParentFilterModel] = useState<GridFilterModel>({ items: [] });
  const [selectedParent, setSelectedParent] = useState<CodeDto | null>(null);
  const [parentDirtyIds, setParentDirtyIds] = useState<Set<string>>(new Set());
  const [parentNewIds, setParentNewIds] = useState<Set<string>>(new Set());
  const [parentDeleted, setParentDeleted] = useState<Array<{ groupCode: string; code: string }>>(
    []
  );

  // ===== 하위 상태 =====
  const [children, setChildren] = useState<Array<CodeDto & { isNew?: boolean }>>([]);
  const [childRowCount, setChildRowCount] = useState(0);
  const [childLoading, setChildLoading] = useState(false);
  const [childPagination, setChildPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [childSortModel, setChildSortModel] = useState<GridSortModel>([]);
  const [childFilterModel, setChildFilterModel] = useState<GridFilterModel>({ items: [] });
  const [childDirtyIds, setChildDirtyIds] = useState<Set<string>>(new Set());
  const [childNewIds, setChildNewIds] = useState<Set<string>>(new Set());
  const [childDeleted, setChildDeleted] = useState<
    Array<{ groupCode: string; parentCode: string | null; code: string }>
  >([]);

  // ===== 공통: 변경 여부 / 가드 =====
  const hasUnsavedParents =
    parentNewIds.size > 0 || parentDirtyIds.size > 0 || parentDeleted.length > 0;
  const hasUnsavedChildren =
    childNewIds.size > 0 || childDirtyIds.size > 0 || childDeleted.length > 0;
  const hasUnsavedAny = hasUnsavedParents || hasUnsavedChildren;

  // 새로고침 가드
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedAny) return;
      e.preventDefault();
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [hasUnsavedAny]);

  // ===== 편집 커밋 =====
  const commitAllEdits = async () => {
    (document.activeElement as HTMLElement)?.blur?.();
    const apiRefs = [parentApiRef.current, childApiRef.current];
    for (const api of apiRefs) {
      if (!api) continue;
      const editRows = (api.state as any)?.editRows ?? {};
      for (const [id, model] of Object.entries(editRows)) {
        for (const field of Object.keys(model as any)) {
          (api as any).commitCellChange({ id, field });
          api.stopCellEditMode({ id, field } as any);
        }
      }
    }
  };

  // ===== 변경 데이터 저장 확인 =====
  const confirmUnsaved = async (scope: 'parent' | 'child' | 'both', proceed: () => void) => {
    const need =
      scope === 'both'
        ? hasUnsavedAny
        : scope === 'parent'
          ? hasUnsavedParents
          : hasUnsavedChildren;
    if (!need) {
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
      return;
    }
  };

  // ===== 조회 =====
  const getParentCodes = async () => {
    setParentLoading(true);
    try {
      const { page, pageSize } = parentPagination;
      const sort = parentSortModel[0]?.field;
      const direction = parentSortModel[0]?.sort;
      const res = await api.get('/admin/commonCode/getParentCodes', {
        params: { page, size: pageSize, sort, direction, keyword },
      });
      setParents(res.data);
      setParentRowCount(Number(res.pagination?.totalElements ?? res.data.length));
      setSelectedParent(res.data[0] ?? null);
      notifySuccess(setSnackbar, res.message);
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    } finally {
      setParentLoading(false);
    }
  };

  const getChildCodes = async () => {
    if (!selectedParent) {
      setChildren([]);
      setChildRowCount(0);
      return;
    }
    setChildLoading(true);
    try {
      const { page, pageSize } = childPagination;
      const sort = childSortModel[0]?.field;
      const direction = childSortModel[0]?.sort;
      const res = await api.get('/admin/commonCode/getChildCodes', {
        params: {
          page,
          size: pageSize,
          sort,
          direction,
          groupCode: selectedParent.groupCode,
          parentCode: selectedParent.code,
        },
      });
      setChildren(res.data);
      setChildRowCount(Number(res.pagination?.totalElements ?? res.data.length));
      notifySuccess(setSnackbar, res.message);
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    } finally {
      setChildLoading(false);
    }
  };

  useEffect(() => {
    void getParentCodes();
  }, [parentPagination, parentSortModel, parentFilterModel]);
  useEffect(() => {
    void getChildCodes();
  }, [selectedParent, childPagination, childSortModel, childFilterModel]);

  // ===== 부모 행 클릭 (자식 변경사항 가드) =====
  const handleParentRowClick = (p: GridRowParams<CodeDto>) => {
    confirmUnsaved('child', () => {
      setSelectedParent(p.row);
      setChildPagination(prev => ({ ...prev, page: 0 }));
    }).catch((e: any) => notifyError(setSnackbar, e.message));
  };

  // ===== 추가/삭제 =====
  const addParent = () => {
    const row: CodeDto = {
      id: `NEW_${Date.now()}`,
      groupCode: '',
      code: '',
      codeName: '',
      parentCode: null,
      sortOrder: 0,
      level: 1,
      useYn: 'Y',
    };
    setParents(prev => [row, ...prev]);
    setParentNewIds(prev => new Set(prev).add(row.id));
    setParentDirtyIds(prev => new Set(prev).add(row.id));

    setSelectedParent(row);
  };

  const addChild = () => {
    if (!selectedParent || !selectedParent.groupCode?.trim()) {
      notifyInfo(setSnackbar, '먼저 입력된 부모코드 선택 후 추가해주세요.');
      return;
    }

    const nextSort = (children.reduce((m, r) => Math.max(m, r.sortOrder || 0), 0) || 0) + 1;
    const row: CodeDto = {
      id: `NEW_${Date.now()}`,
      groupCode: selectedParent.groupCode,
      code: '',
      codeName: '',
      parentCode: selectedParent.code,
      sortOrder: nextSort,
      level: 2,
      useYn: 'Y',
    };
    setChildren(prev => [row, ...prev]);
    setChildNewIds(prev => new Set(prev).add(row.id));
    setChildDirtyIds(prev => new Set(prev).add(row.id));
  };

  const deleteParents = () => {
    const map = parentApiRef.current?.getSelectedRows();
    const ids = map ? (Array.from(map.keys()) as string[]) : [];
    if (ids.length === 0) return;

    const victims = parents.filter(r => ids.includes(r.id));
    const victimsExisting = victims.filter(r => !parentNewIds.has(r.id));
    if (victimsExisting.length) {
      setParentDeleted(prev => [
        ...prev,
        ...victimsExisting.map(r => ({ groupCode: r.groupCode, code: r.code })),
      ]);
    }

    setParents(prev => prev.filter(r => !ids.includes(r.id)));
    setParentNewIds(prev => {
      const next = new Set(prev);
      victims.forEach(v => next.delete(v.id));
      return next;
    });
    setParentDirtyIds(prev => {
      const next = new Set(prev);
      victims.forEach(v => next.delete(v.id));
      return next;
    });
  };

  const deleteChildren = () => {
    const map = childApiRef.current?.getSelectedRows();
    const ids = map ? (Array.from(map.keys()) as string[]) : [];
    if (ids.length === 0) return;

    const victims = children.filter(r => ids.includes(r.id));
    const victimsExisting = victims.filter(r => !childNewIds.has(r.id));
    if (victimsExisting.length) {
      setChildDeleted(prev => [
        ...prev,
        ...victimsExisting.map(r => ({
          groupCode: r.groupCode,
          parentCode: r.parentCode,
          code: r.code,
        })),
      ]);
    }

    setChildren(prev => prev.filter(r => !ids.includes(r.id)));
    setChildNewIds(prev => {
      const next = new Set(prev);
      victims.forEach(v => next.delete(v.id));
      return next;
    });
    setChildDirtyIds(prev => {
      const next = new Set(prev);
      victims.forEach(v => next.delete(v.id));
      return next;
    });
  };

  // ===== Row 업데이트 콜백 =====
  const onParentRowUpdate = (newRow: CodeDto, oldRow: CodeDto) => {
    const id = oldRow.id;
    setParents(prev => prev.map(r => (r.id === id ? newRow : r)));
    if (!parentNewIds.has(id)) setParentDirtyIds(prev => new Set(prev).add(id));
    return newRow;
  };

  const onChildRowUpdate = (newRow: CodeDto, oldRow: CodeDto) => {
    const id = oldRow.id;
    // 부모키는 고정
    newRow.groupCode = oldRow.groupCode;
    newRow.parentCode = oldRow.parentCode;
    setChildren(prev => prev.map(r => (r.id === id ? newRow : r)));
    if (!childNewIds.has(id)) setChildDirtyIds(prev => new Set(prev).add(id));
    return newRow;
  };

  // ===== sanitize & BULK DTO =====
  const sanitize = (r: CodeDto) => ({
    groupCode: r.groupCode?.trim(),
    code: r.code?.trim(),
    codeName: r.codeName?.trim(),
    parentCode: r.parentCode ?? null,
    sortOrder: Number(r.sortOrder ?? 0),
    level: Number(r.level ?? 0),
    useYn: (r.useYn ?? 'Y').toUpperCase() === 'Y' ? 'Y' : 'N',
  });

  const buildSaveDto = () => {
    const pMap = new Map(parents.map(r => [r.id, r]));
    const cMap = new Map(children.map(r => [r.id, r]));

    const parentInserts = [...parentNewIds]
      .map(id => pMap.get(id)!)
      .filter(Boolean)
      .map(sanitize)
      .filter(r => r.groupCode && r.code);

    const parentUpdates = [...parentDirtyIds]
      .filter(id => !parentNewIds.has(id))
      .map(id => pMap.get(id)!)
      .filter(Boolean)
      .map(sanitize)
      .filter(r => r.groupCode && r.code);

    const parentDeletes = parentDeleted.map(d => ({
      groupCode: d.groupCode,
      code: d.code,
      codeName: null,
      parentCode: null,
      sortOrder: 0,
      level: 0,
      useYn: 'Y',
    }));

    const childInserts = [...childNewIds]
      .map(id => cMap.get(id)!)
      .filter(Boolean)
      .map(sanitize)
      .filter(r => r.groupCode && r.parentCode !== undefined && r.code);

    const childUpdates = [...childDirtyIds]
      .filter(id => !childNewIds.has(id))
      .map(id => cMap.get(id)!)
      .filter(Boolean)
      .map(sanitize)
      .filter(r => r.groupCode && r.parentCode !== undefined && r.code);

    const childDeletes = childDeleted.map(d => ({
      groupCode: d.groupCode,
      code: d.code,
      codeName: null,
      parentCode: d.parentCode,
      sortOrder: 0,
      level: 0,
      useYn: 'Y',
    }));

    return {
      parentInserts,
      parentUpdates,
      parentDeletes,
      childInserts,
      childUpdates,
      childDeletes,
    };
  };

  // ===== 저장 =====
  const handleSaveAll = async (): Promise<boolean> => {
    await commitAllEdits();
    // === Validation ===
    // 부모 필수값 체크
    const invalidParents = parents.filter(p => !p.groupCode?.trim() || !p.code?.trim());
    if (invalidParents.length > 0) {
      notifyInfo(setSnackbar, '부모코드 저장 시 [그룹코드]와 [코드]는 필수입니다.');
      return false;
    }

    // 자식 필수값 체크
    const invalidChildren = children.filter(
      c => !c.groupCode?.trim() || !c.parentCode?.trim() || !c.code?.trim()
    );
    if (invalidChildren.length > 0) {
      notifyInfo(setSnackbar, '하위코드 저장 시 [그룹코드], [부모코드], [코드]는 필수입니다.');
      return false;
    }
    try {
      const dto = buildSaveDto();
      const res = await api.post('/admin/commonCode/saveCommonCodes', dto);

      // 큐 초기화 + 재조회
      setParentNewIds(new Set());
      setParentDirtyIds(new Set());
      setParentDeleted([]);
      setChildNewIds(new Set());
      setChildDirtyIds(new Set());
      setChildDeleted([]);

      await Promise.all([getParentCodes(), getChildCodes()]);
      notifySuccess(setSnackbar, res.message);
      return true;
    } catch (e: any) {
      notifyError(setSnackbar, e.message ?? '저장 중 오류가 발생했습니다.');
      return false;
    }
  };

  // ===== 페이징/정렬/필터 가드 =====
  const onParentPageChange = (m: GridPaginationModel) =>
    confirmUnsaved('parent', () => {
      setParentPagination(m);
      setParentNewIds(new Set());
      setParentDirtyIds(new Set());
      setParentDeleted([]);
      setChildPagination(prev => ({ ...prev, page: 0 }));
      setChildNewIds(new Set());
      setChildDirtyIds(new Set());
      setChildDeleted([]);
    });

  const onParentSortChange = (m: GridSortModel) =>
    confirmUnsaved('parent', () => {
      setParentSortModel(m);
      setParentPagination(prev => ({ ...prev, page: 0 }));
      setParentNewIds(new Set());
      setParentDirtyIds(new Set());
      setParentDeleted([]);
    });

  const onParentFilterChange = (m: GridFilterModel) =>
    confirmUnsaved('parent', () => {
      setParentFilterModel(m);
      setParentPagination(prev => ({ ...prev, page: 0 }));
      setParentNewIds(new Set());
      setParentDirtyIds(new Set());
      setParentDeleted([]);
    });

  const onChildPageChange = (m: GridPaginationModel) =>
    confirmUnsaved('child', () => {
      setChildPagination(m);
      setChildNewIds(new Set());
      setChildDirtyIds(new Set());
      setChildDeleted([]);
    });

  const onChildSortChange = (m: GridSortModel) =>
    confirmUnsaved('child', () => {
      setChildSortModel(m);
      setChildPagination(prev => ({ ...prev, page: 0 }));
      setChildNewIds(new Set());
      setChildDirtyIds(new Set());
      setChildDeleted([]);
    });

  const onChildFilterChange = (m: GridFilterModel) =>
    confirmUnsaved('child', () => {
      setChildFilterModel(m);
      setChildPagination(prev => ({ ...prev, page: 0 }));
      setChildNewIds(new Set());
      setChildDirtyIds(new Set());
      setChildDeleted([]);
    });

  // ===== 헤더 액션 =====
  const headerActions = (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="상위그룹코드·코드·코드명 검색"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && getParentCodes()}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment
                  position="start"
                  onClick={getParentCodes}
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
          onClick={handleSaveAll}
          disabled={!hasUnsavedAny}
          sx={{ ml: 1 }}
        >
          저장
        </Button>
      </Box>
    </>
  );

  const handleClose = () => closeSnackbar(setSnackbar);

  return (
    <PageSectionLayout title="공통코드 관리" actions={headerActions}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'stretch',
        }}
      >
        {/* ===== 상위 그리드 ===== */}
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 600 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ gap: 1, flexWrap: 'wrap', mb: 1 }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                상위코드
              </Typography>
              <Chip size="small" variant="outlined" label={`${parentRowCount}건`} />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addParent}>
                추가
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={deleteParents}
                disabled={parentSelectedCount === 0}
              >
                삭제
              </Button>
            </Stack>
          </Stack>

          <DataGrid
            apiRef={parentApiRef}
            getRowId={r => r.id}
            columns={parentCols}
            rows={parents}
            loading={parentLoading}
            onRowClick={handleParentRowClick}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={ids =>
              setParentSelectedCount((ids as unknown as GridRowId[]).length)
            }
            paginationMode="server"
            sortingMode="server"
            filterMode="server"
            rowCount={parentRowCount}
            paginationModel={parentPagination}
            onPaginationModelChange={onParentPageChange}
            onSortModelChange={onParentSortChange}
            onFilterModelChange={onParentFilterChange}
            pageSizeOptions={[10, 20, 50]}
            pagination
            disableColumnMenu
            rowHeight={40}
            editMode="cell"
            processRowUpdate={onParentRowUpdate}
            isCellEditable={params =>
              !(params.field === 'groupCode' && !String(params.id).startsWith('NEW_'))
            }
          ></DataGrid>
        </Box>

        {/* ===== 하위 그리드 ===== */}
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 600 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ gap: 1, flexWrap: 'wrap', mb: 1 }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                하위코드
              </Typography>
              <Chip size="small" variant="outlined" label={`${childRowCount}건`} />
              {selectedParent && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  [{selectedParent.groupCode} / {selectedParent.codeName}]
                </Typography>
              )}
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={addChild}
                disabled={!selectedParent}
              >
                추가
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={deleteChildren}
                disabled={childSelectedCount === 0}
              >
                삭제
              </Button>
            </Stack>
          </Stack>

          <DataGrid
            apiRef={childApiRef}
            getRowId={r => r.id}
            columns={childCols}
            rows={children}
            loading={childLoading}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={ids =>
              setChildSelectedCount((ids as unknown as GridRowId[]).length)
            }
            paginationMode="server"
            sortingMode="server"
            filterMode="server"
            rowCount={childRowCount}
            paginationModel={childPagination}
            onPaginationModelChange={onChildPageChange}
            onSortModelChange={onChildSortChange}
            onFilterModelChange={onChildFilterChange}
            pageSizeOptions={[10, 20, 50]}
            pagination
            disableColumnMenu
            rowHeight={40}
            editMode="cell"
            processRowUpdate={onChildRowUpdate}
            isCellEditable={params =>
              !(params.field === 'code' && !String(params.id).startsWith('NEW_'))
            }
          />
        </Box>
      </Box>

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleClose}
        bottom="10px"
      />
    </PageSectionLayout>
  );
}
