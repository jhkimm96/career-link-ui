'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Typography,
  ListItemIcon,
  createFilterOptions,
  Stack,
  type AlertColor,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';

import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import api from '@/api/axios';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess, notifyInfo } from '@/api/apiNotify';
import CommonSelectBox from '@/components/selectBox/commonSelectBox';
import { useConfirm } from '@/components/confirm';
import { ICON_MAP, ICON_NAMES, getMenuIcon } from '@/components/icons';

const iconFilter = createFilterOptions<string>({ matchFrom: 'any', stringify: o => o });

export type AccessRole = 'PUBLIC' | 'ADMIN' | 'EMP' | 'USER';
export interface MenuDto {
  menuId: number | string; // 신규는 'NEW_...' 문자열
  parentId: number | null; // 항상 실제 숫자 ID만 허용 (신규 상위 밑 하위 추가 금지)
  menuName: string;
  menuPath: string;
  level: number;
  displayOrder: number;
  isActive: string;
  accessRole: AccessRole;
  icon?: string;
  isTemp?: boolean;
}

const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0),
    display: 'flex',
    alignItems: 'center',
    [`& .${treeItemClasses.label}`]: {
      fontSize: '0.875rem',
      fontWeight: 500,
      marginLeft: theme.spacing(1),
    },
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

const shallowEqualMenu = (a: MenuDto, b: MenuDto) =>
  a.parentId === b.parentId &&
  a.menuName === b.menuName &&
  a.menuPath === b.menuPath &&
  a.level === b.level &&
  a.displayOrder === b.displayOrder &&
  a.isActive === b.isActive &&
  a.accessRole === b.accessRole &&
  a.icon === b.icon;

export default function MenuPage() {
  const confirm = useConfirm();
  const [menus, setMenus] = useState<MenuDto[]>([]);
  const [serverSnapshot, setServerSnapshot] = useState<MenuDto[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [filterRole, setFilterRole] = useState<AccessRole>('PUBLIC');
  const [selectedId, setSelectedId] = useState<string | null>(null); // 항상 string 비교
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });
  const nameRef = useRef<HTMLInputElement>(null);
  const notifyClose = () => closeSnackbar(setSnackbar);

  // 초기 조회
  const fetchMenus = async (role: AccessRole) => {
    try {
      const res = await api.get<MenuDto[]>('/admin/menu', { params: { accessRole: role } });
      setMenus(res.data);
      setServerSnapshot(res.data);
      notifySuccess(setSnackbar, res.message);
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchMenus(filterRole);
    })();
  }, [filterRole]);

  // 파생
  const visibleMenus = useMemo(
    () => menus.filter(m => !deletedIds.has(Number(m.menuId)) && m.isActive === 'Y'),
    [menus, deletedIds]
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<number | null, MenuDto[]>();
    for (const m of visibleMenus) {
      const key = m.parentId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.displayOrder - b.displayOrder || Number(a.menuId) - Number(b.menuId));
    }
    return map;
  }, [visibleMenus]);

  const selected = useMemo(
    () => (selectedId == null ? null : (menus.find(m => String(m.menuId) === selectedId) ?? null)),
    [menus, selectedId]
  );
  const isFormDisabled = !selected;

  // 더티 체크
  const isDirty = useMemo(() => {
    const created = menus.some(
      m => typeof m.menuId === 'string' && !deletedIds.has(Number(m.menuId))
    );
    const updated = menus.some(m => {
      if (typeof m.menuId !== 'number' || deletedIds.has(m.menuId)) return false;
      const base = serverSnapshot.find(s => s.menuId === m.menuId);
      return base && !shallowEqualMenu(m, base);
    });
    return created || updated || deletedIds.size > 0;
  }, [menus, serverSnapshot, deletedIds]);

  // 유틸
  const patchSelected = (patch: Partial<MenuDto>) => {
    if (!selectedId) return;
    setMenus(prev => prev.map(m => (String(m.menuId) === selectedId ? { ...m, ...patch } : m)));
  };

  // 추가
  const handleAdd = () => {
    const parent = selectedId ? menus.find(m => String(m.menuId) === selectedId) : null;

    // ⛔ 부모가 NEW_* 면 금지
    if (parent && typeof parent.menuId !== 'number') {
      notifyInfo(setSnackbar, '상위 메뉴를 먼저 저장해 주세요.');
      return;
    }

    const parentId = parent ? (parent.menuId as number) : null; // ★ 숫자만 허용
    const level: 1 | 2 = parent ? 2 : 1;

    const siblings = menus.filter(m => m.parentId === parentId);
    const nextOrder = siblings.length ? Math.max(...siblings.map(s => s.displayOrder)) + 1 : 1;

    const newItem: MenuDto = {
      menuId: `NEW_${Date.now()}`,
      parentId, // ★ 여기엔 반드시 number | null
      menuName: '',
      menuPath: '',
      level,
      displayOrder: nextOrder,
      isActive: 'Y',
      accessRole: filterRole,
      icon: '',
      isTemp: true,
    };

    setMenus(prev => [...prev, newItem]);
    setSelectedId(String(newItem.menuId));
  };

  // 삭제(상위면 하위 포함)
  const handleDelete = async () => {
    if (!selectedId) return;
    const target = menus.find(m => String(m.menuId) === selectedId);
    if (!target) return;

    const ok = await confirm({
      message:
        target.level === 1
          ? '선택한 메뉴는 하위 메뉴와 함께 화면에서 제거됩니다.\n저장 시 삭제가 확정됩니다.'
          : '선택한 메뉴는 화면에서 제거됩니다.\n저장 시 삭제가 확정됩니다.',
      confirmText: '삭제',
      cancelText: '취소',
    });
    if (!ok) return;

    const idsToDelete = new Set<string>(); // string으로 모아두고
    idsToDelete.add(String(target.menuId));
    if (target.level === 1) {
      menus.forEach(m => {
        if (m.parentId != null && Number(m.parentId) === Number(target.menuId)) {
          idsToDelete.add(String(m.menuId));
        }
      });
    }

    // 상태에서 제거
    setMenus(prev => prev.filter(m => !idsToDelete.has(String(m.menuId))));
    // 기존(숫자)만 삭제집합에 누적
    setDeletedIds(prev => {
      const next = new Set(prev);
      idsToDelete.forEach(idStr => {
        const num = Number(idStr);
        if (!Number.isNaN(num)) next.add(num);
      });
      return next;
    });
    setSelectedId(null);
  };

  // 저장
  const handleSave = async () => {
    const inserts = menus
      .filter(m => typeof m.menuId === 'string')
      .map(({ isTemp, menuId, ...rest }) => rest); // ★ parentId 포함해서 그대로 보냄

    const updates = menus
      .filter(m => {
        if (typeof m.menuId !== 'number' || deletedIds.has(m.menuId)) return false;
        const base = serverSnapshot.find(s => s.menuId === m.menuId);
        return !!base && !shallowEqualMenu(m, base);
      })
      .map(m => ({
        menuId: Number(m.menuId),
        parentId: m.parentId,
        menuName: m.menuName,
        menuPath: m.menuPath,
        level: m.level,
        displayOrder: m.displayOrder,
        isActive: m.isActive,
        accessRole: m.accessRole,
        icon: m.icon ?? '',
      }));

    const deletes = Array.from(deletedIds);

    try {
      const res = await api.post('/admin/saveMenus', { inserts, updates, deletes });
      setDeletedIds(new Set());
      setSelectedId(null);
      notifySuccess(setSnackbar, res.message);
      await fetchMenus(filterRole);
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  };

  const handleRoleChange = async (e: SelectChangeEvent) => {
    const next = e.target.value as AccessRole;
    if (next === filterRole) return;
    if (isDirty) {
      const ok = await confirm({
        message: '저장하지 않은 변경 사항이 있습니다. 계속하시겠습니까?',
        confirmText: '예',
        cancelText: '아니오',
      });
      if (!ok) return;
    }
    setFilterRole(next);
    setSelectedId(null);
    setDeletedIds(new Set());
  };

  // 트리 선택
  const handleTreeSelect = (_: any, itemId: string | string[] | null) => {
    const idStr = Array.isArray(itemId) ? itemId[0] : itemId;
    if (!idStr) return;
    if (!menus.find(m => String(m.menuId) === idStr)) return;
    setSelectedId(idStr);
  };

  const allExpandableIds = useMemo(() => {
    const ids: string[] = [];
    childrenByParent.forEach((children, pid) => {
      if (pid !== null && children.length > 0) ids.push(String(pid));
    });
    return ids;
  }, [childrenByParent]);

  const renderTree = useMemo(() => {
    const fn = (parentId: number | null): React.ReactNode => {
      const children = childrenByParent.get(parentId) ?? [];
      return children.map(n => {
        const isSel = String(n.menuId) === selectedId;
        const previewName = isSel ? selected?.menuName || n.menuName : n.menuName;
        const iconName = isSel ? selected?.icon : n.icon;
        const IconComp = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : null;

        return (
          <CustomTreeItem
            key={String(n.menuId)}
            itemId={String(n.menuId)}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {IconComp ? <IconComp fontSize="small" /> : null}
                <Typography fontWeight={isSel ? 700 : 500}>
                  {previewName || '(이름없음)'}
                </Typography>
              </Box>
            }
          >
            {fn(Number(n.menuId))}
          </CustomTreeItem>
        );
      });
    };
    return fn;
  }, [childrenByParent, selectedId, selected?.menuName, selected?.icon]);

  // 헤더
  const headerActions = (
    <Stack direction="row" alignItems="center" spacing={1}>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="preview-role-label">미리보기 권한</InputLabel>
        <Select
          labelId="preview-role-label"
          value={filterRole}
          onChange={handleRoleChange}
          label="미리보기 권한"
        >
          <MenuItem value="PUBLIC">공개</MenuItem>
          <MenuItem value="ADMIN">관리자</MenuItem>
          <MenuItem value="EMP">기업</MenuItem>
          <MenuItem value="USER">지원자</MenuItem>
        </Select>
      </FormControl>

      <Button
        size="small"
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        disabled={selected?.level === 2}
      >
        추가
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={handleDelete}
        disabled={!selectedId}
      >
        삭제
      </Button>
      <Button
        size="small"
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={handleSave}
        disabled={!isDirty}
      >
        저장
      </Button>
    </Stack>
  );

  return (
    <PageSectionLayout title="메뉴 관리" actions={headerActions}>
      {/* 좌측: 트리 */}
      <Box
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflowY: 'auto',
        }}
      >
        <SimpleTreeView
          expandedItems={allExpandableIds}
          selectedItems={selectedId}
          onSelectedItemsChange={handleTreeSelect}
        >
          {renderTree(null)}
        </SimpleTreeView>
      </Box>

      {/* 우측: 폼 */}
      <Box
        component="form"
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          display: 'grid',
          rowGap: 2,
        }}
      >
        <TextField
          inputRef={nameRef}
          size="small"
          label="메뉴 이름"
          value={selected?.menuName ?? ''}
          onChange={e => patchSelected({ menuName: e.target.value })}
          disabled={isFormDisabled}
        />
        <TextField
          size="small"
          label="경로(URL)"
          value={selected?.menuPath ?? ''}
          onChange={e => patchSelected({ menuPath: e.target.value })}
          disabled={isFormDisabled}
        />
        <TextField
          size="small"
          type="number"
          label="정렬순서"
          value={selected?.displayOrder ?? 1}
          onChange={e => patchSelected({ displayOrder: Number(e.target.value) || 1 })}
          disabled={isFormDisabled}
        />
        <CommonSelectBox
          label="활성여부"
          groupCode="USE_YN"
          parentCode="YN"
          value={selected?.isActive ?? ''}
          onChange={v => patchSelected({ isActive: v })}
          disabled={isFormDisabled}
        />
        <TextField size="small" label="레벨" value={selected?.level ?? 1} disabled />
        <CommonSelectBox
          label="접근권한"
          groupCode="MENU_ROLE"
          parentCode="ROLE"
          value={selected?.accessRole ?? filterRole}
          onChange={v => patchSelected({ accessRole: v as AccessRole })}
          disabled
        />
        <Autocomplete
          freeSolo
          size="small"
          options={ICON_NAMES}
          filterOptions={iconFilter}
          value={selected?.icon ?? ''}
          onChange={(_, val) => patchSelected({ icon: val ?? '' })}
          renderOption={(props, option) => {
            const { key, ...rest } = props; // key 분리
            const IconComp = getMenuIcon(option);
            return (
              <li key={key} {...rest}>
                <ListItemIcon>{IconComp && <IconComp fontSize="small" />}</ListItemIcon>
                <Typography>{option}</Typography>
              </li>
            );
          }}
          renderInput={params => <TextField {...params} label="아이콘 검색" />}
          disabled={isFormDisabled}
        />
      </Box>

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={notifyClose}
        bottom="10px"
      />
    </PageSectionLayout>
  );
}
