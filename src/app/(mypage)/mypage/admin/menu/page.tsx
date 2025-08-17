/* components/mypage/MenuPage.tsx */
'use client';

import React, { useState, useMemo, useCallback, ChangeEvent, useEffect } from 'react';
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
  type AlertColor,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
// ── 자주 쓰는 아이콘들 import ──
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import RemoveIcon from '@mui/icons-material/Remove';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import ListIcon from '@mui/icons-material/List';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import PageSectionLayout from '@/components/layouts/mypage/pageSectionLayout';
import api from '@/api/axios';
import NotificationSnackbar from '@/components/snackBar';
import { closeSnackbar, notifyError, notifySuccess } from '@/api/apiNotify';
// ── 타입 정의 ──
type AccessRole = 'all' | 'admin' | 'employer' | 'user';

interface MenuDto {
  menuId: number;
  parentId: number | null;
  menuName: string;
  menuPath?: string;
  level: number;
  displayOrder: number;
  isActive: 'Y' | 'N';
  accessRoles: AccessRole[];
  icon?: string;
}
type MenuNode = MenuDto & { children: MenuNode[] };

const ICON_MAP: Record<string, React.ElementType> = {
  Home: HomeIcon,
  Dashboard: DashboardIcon,
  Settings: SettingsIcon,
  People: PeopleIcon,
  Notifications: NotificationsIcon,
  AccountCircle: AccountCircleIcon,
  Mail: MailIcon,
  CalendarToday: CalendarTodayIcon,
  ShoppingCart: ShoppingCartIcon,
  ShoppingBag: ShoppingBagIcon,
  Search: SearchIcon,
  Edit: EditIcon,
  Delete: DeleteIcon,
  Save: SaveIcon,
  Add: AddIcon,
  Remove: RemoveIcon,
  Info: InfoIcon,
  Warning: WarningIcon,
  Error: ErrorIcon,
  Check: CheckIcon,
  Close: CloseIcon,
  Folder: FolderIcon,
  FileCopy: FileCopyIcon,
  Bookmark: BookmarkIcon,
  Description: DescriptionIcon,
  Business: BusinessIcon,
  List: ListIcon,
};

// ── ICON_NAMES는 검색 옵션으로 활용 ──
const ICON_NAMES = Object.keys(ICON_MAP);

// ── 검색 옵션 (substring 매칭) ──
const filter = createFilterOptions<string>({
  matchFrom: 'any',
  stringify: option => option,
});

// ── 커스텀 TreeItem ──
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

// ── 재귀로 트리 데이터 구축 ──
const buildTree = (list: MenuDto[], parentId: number | null = null): MenuNode[] =>
  list
    .filter(item => item.parentId === parentId)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(item => ({ ...item, children: buildTree(list, item.menuId) }));

export default function MenuPage() {
  // ── State ──
  const [menus, setMenus] = useState<MenuDto[]>([]);
  const [filterRole, setFilterRole] = useState<AccessRole>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string[]>(menus.map(m => String(m.menuId)));
  const [form, setForm] = useState<Omit<MenuDto, 'menuId'>>({
    parentId: null,
    menuName: '',
    menuPath: '',
    level: 1,
    displayOrder: 0,
    isActive: 'Y',
    accessRoles: [],
    icon: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'info' });

  const handleClose = () => {
    closeSnackbar(setSnackbar);
  };

  useEffect(() => {
    handlerSearch();
  }, []);

  const handlerSearch = async () => {
    try {
      const res = await api.get<MenuDto[]>('/admin/menu');
      setMenus(res.data);
      notifySuccess(setSnackbar, res.message);
    } catch (e: any) {
      notifyError(setSnackbar, e.message);
    }
  };
  // ── 핸들러 ──
  const handleFilterRoleChange = (e: SelectChangeEvent) =>
    setFilterRole(e.target.value as AccessRole);

  const handleText = useCallback(
    (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setForm(prev => ({
        ...prev,
        [field]: field === 'displayOrder' ? Number(v) : v,
      }));
    },
    []
  );

  const handleSelect = useCallback(
    (field: 'level' | 'isActive') => (e: SelectChangeEvent<string>) => {
      const v = e.target.value;
      setForm(prev => ({
        ...prev,
        [field]: field === 'level' ? Number(v) : (v as 'Y' | 'N'),
      }));
    },
    []
  );

  const handleMultiSelect = useCallback(
    (field: 'accessRoles') => (e: SelectChangeEvent<AccessRole[]>) => {
      const v = e.target.value as AccessRole[];
      setForm(prev => ({ ...prev, [field]: v }));
    },
    []
  );

  const handleIconSelect = useCallback((_: any, val: string | null) => {
    setForm(prev => ({ ...prev, icon: val ?? '' }));
  }, []);

  const handleAdd = useCallback(() => {
    const nextId = menus.length ? Math.max(...menus.map(m => m.menuId)) + 1 : 1;
    setMenus(prev => [...prev, { menuId: nextId, ...form }]);
    setForm(f => ({
      ...f,
      menuName: '',
      menuPath: '',
      displayOrder: 0,
      accessRoles: [],
      icon: '',
    }));
  }, [menus, form]);

  const handleDelete = useCallback(() => {
    if (!selectedId || selectedId === 1) return;
    const toRemove = new Set<number>();
    (function collect(id: number) {
      toRemove.add(id);
      menus.filter(m => m.parentId === id).forEach(c => collect(c.menuId));
    })(selectedId);
    setMenus(prev => prev.filter(m => !toRemove.has(m.menuId)));
    setSelectedId(null);
  }, [menus, selectedId]);

  const handleSave = useCallback(() => {
    if (!selectedId) return;
    setMenus(prev =>
      prev.map(m => (m.menuId === selectedId ? { ...m, ...form, menuId: selectedId } : m))
    );
  }, [form, selectedId]);

  // ── ROLE 필터링된 메뉴만 보여주기 ──
  const visibleMenus = useMemo(
    () =>
      menus.filter(
        m => m.isActive === 'Y' && (filterRole === 'all' || m.accessRoles.includes(filterRole))
      ),
    [menus, filterRole]
  );

  // ── 트리 렌더링 ──
  const treeData = useMemo(() => buildTree(visibleMenus), [visibleMenus]);
  const renderTree = useCallback(
    (nodes: MenuNode[]): React.ReactNode =>
      nodes.map(n => {
        const IconComp = n.icon ? ICON_MAP[n.icon] : undefined;
        return (
          <CustomTreeItem
            key={n.menuId}
            itemId={String(n.menuId)}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {IconComp && <IconComp fontSize="small" />}
                <Typography sx={{ ml: IconComp ? 1 : 0 }}>{n.menuName}</Typography>
              </Box>
            }
            onClick={() => {
              setSelectedId(n.menuId);
              setForm(f => ({ ...f, parentId: n.menuId }));
            }}
          >
            {n.children.length > 0 && renderTree(n.children)}
          </CustomTreeItem>
        );
      }),
    []
  );

  // ── 헤더 액션 ──
  const headerActions = (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>미리보기 ROLE</InputLabel>
          <Select label="미리보기 ROLE" value={filterRole} onChange={handleFilterRoleChange}>
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="admin">관리자</MenuItem>
            <MenuItem value="employer">기업</MenuItem>
            <MenuItem value="user">지원자</MenuItem>
          </Select>
        </FormControl>

        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ ml: 1 }}
        >
          추가
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
          disabled={!selectedId || selectedId === 1}
          sx={{ ml: 1 }}
        >
          삭제
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ ml: 1 }}
        >
          저장
        </Button>
      </Box>
    </>
  );

  return (
    <PageSectionLayout title="메뉴 관리" actions={headerActions}>
      {/* 좌측: 메뉴 트리 */}
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
          expandedItems={expanded}
          onExpandedItemsChange={(_e, items) => setExpanded(items)}
        >
          {renderTree(treeData)}
        </SimpleTreeView>
      </Box>

      {/* 우측: 입력 폼 */}
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
          size="small"
          label="메뉴 이름"
          value={form.menuName}
          onChange={handleText('menuName')}
        />
        <TextField
          size="small"
          label="경로(URL)"
          value={form.menuPath}
          onChange={handleText('menuPath')}
        />
        <TextField
          size="small"
          type="number"
          label="정렬순서"
          value={String(form.displayOrder)}
          onChange={handleText('displayOrder')}
        />

        <FormControl size="small">
          <InputLabel>활성여부</InputLabel>
          <Select label="활성여부" value={form.isActive} onChange={handleSelect('isActive')}>
            <MenuItem value="Y">Y</MenuItem>
            <MenuItem value="N">N</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>레벨</InputLabel>
          <Select label="레벨" value={String(form.level)} onChange={handleSelect('level')}>
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>접근권한</InputLabel>
          <Select
            label="접근권한"
            multiple
            value={form.accessRoles}
            onChange={handleMultiSelect('accessRoles')}
            renderValue={selected => (selected as string[]).join(', ')}
          >
            <MenuItem value="admin">관리자</MenuItem>
            <MenuItem value="employer">기업</MenuItem>
            <MenuItem value="user">지원자</MenuItem>
          </Select>
        </FormControl>

        <Autocomplete<string, false, false, true>
          freeSolo
          size="small"
          options={ICON_NAMES}
          filterOptions={filter}
          value={form.icon}
          onChange={handleIconSelect}
          renderOption={(props, option) => {
            // props 에 포함된 key 를 분리하고 나머지를 rest 로 모은 뒤,
            // JSX 에는 key 를 직접 전달해야 합니다.
            const { key, ...rest } = props;
            const IconComp = ICON_MAP[option];

            return (
              <li key={option} {...rest}>
                <ListItemIcon>{IconComp && <IconComp fontSize="small" />}</ListItemIcon>
                <Typography>{option}</Typography>
              </li>
            );
          }}
          renderInput={params => <TextField {...params} label="아이콘 검색" />}
        />
      </Box>
      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleClose}
      />
    </PageSectionLayout>
  );
}
