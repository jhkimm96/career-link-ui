'use client';

import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Button,
  Stack,
  Typography,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/libs/authContext';
import Image from 'next/image';

import AppHeaderIconIsLogined from '@/components/layouts/header/appHeaderIconIsLogined';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { getMenuIcon } from '@/components/icons';
import api from '@/api/axios';

interface MenuDto {
  menuId: number;
  parentId: number | null;
  menuName: string;
  menuPath: string;
  displayOrder: number;
  icon?: string;
  children?: MenuDto[];
}

export default function AppHeader() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [navItems, setNavItems] = useState<MenuDto[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  // PUBLIC 메뉴 조회
  useEffect(() => {
    async function fetchMenus() {
      try {
        const res = await api.get<MenuDto[]>('/common/getAllMenusByPublic', {
          params: { accessRole: 'PUBLIC' },
        });
        setNavItems(buildTree(res.data));
      } catch (e: any) {
        console.error('메뉴 조회 실패:', e.message);
      }
    }
    fetchMenus();
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(openMenu === id ? null : id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenMenu(null);
  };

  return (
    <AppBar position="static" color="inherit" elevation={0}>
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          px: { xs: 2, md: 6 },
          py: 1.5,
          borderBottom: '1px solid #eee',
        }}
      >
        {/* Logo + Nav */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Link href="/">
            <Image src="/c-logo.png" alt="logo" width={60} height={60} />
          </Link>

          {/* 메뉴 박스 */}
          <Box sx={{ display: 'flex', gap: 4, ml: 4 }}>
            {navItems.map(menu => {
              const IconComp = menu.icon ? getMenuIcon(menu.icon) : null;
              const hasChildren = menu.children && menu.children.length > 0;

              return (
                <Box
                  key={menu.menuId}
                  onClick={e => hasChildren && handleMenuClick(e, menu.menuId)}
                  sx={{
                    position: 'relative',
                    fontWeight: openMenu === menu.menuId ? 600 : 400,
                    borderBottom:
                      openMenu === menu.menuId ? '2px solid #1976d2' : '2px solid transparent',
                    cursor: hasChildren ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {IconComp && <IconComp fontSize="small" />}
                  {menu.menuPath && !hasChildren ? (
                    <Link href={menu.menuPath}>
                      <Typography variant="body1" sx={{ color: 'inherit', textDecoration: 'none' }}>
                        {menu.menuName}
                      </Typography>
                    </Link>
                  ) : (
                    <Typography variant="body1">{menu.menuName}</Typography>
                  )}

                  {openMenu === menu.menuId && hasChildren && (
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                      slotProps={{
                        paper: {
                          sx: {
                            mt: 1.5,
                            borderRadius: 2,
                            boxShadow: 2,
                            minWidth: 200, // ✅ 최소 보장
                            width: 'fit-content', // ✅ 글자 길이에 맞게 자동 확장
                            border: '1px solid #eee',
                          },
                        },
                      }}
                    >
                      {menu.children?.map(child => (
                        <Link key={child.menuId} href={child.menuPath} passHref>
                          <MenuItem onClick={handleClose} sx={{ fontSize: 14 }}>
                            {child.menuName}
                          </MenuItem>
                        </Link>
                      ))}
                    </Menu>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Right side icons */}
        <Box display="flex" alignItems="center" gap={2}>
          {isLoggedIn ? (
            <AppHeaderIconIsLogined />
          ) : (
            <Stack direction="row">
              <Button size="small" onClick={() => router.push('/login')}>
                로그인
              </Button>
              <Button size="small" onClick={() => router.push('/signup')}>
                회원가입
              </Button>
              <Tooltip title="기업등록 요청하기">
                <IconButton onClick={() => router.push('/emp/registration')}>
                  <BusinessRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

// flat → tree 변환
function buildTree(menus: MenuDto[]): MenuDto[] {
  const map = new Map<number, MenuDto & { children: MenuDto[] }>();
  const roots: (MenuDto & { children: MenuDto[] })[] = [];

  menus.forEach(m => map.set(m.menuId, { ...m, children: [] }));

  menus.forEach(m => {
    if (m.parentId != null) {
      map.get(m.parentId)?.children.push(map.get(m.menuId)!);
    } else {
      roots.push(map.get(m.menuId)!);
    }
  });

  // 정렬
  const sortFn = (a: MenuDto, b: MenuDto) => a.displayOrder - b.displayOrder || a.menuId - b.menuId;
  const sortTree = (nodes: any[]) => {
    nodes.sort(sortFn);
    nodes.forEach(n => sortTree(n.children));
  };
  sortTree(roots);

  return roots;
}
