'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SidebarItem from '@/components/layouts/mypage/sidebarItem';
import { getSidebarMenus, SidebarMenuItem } from '@/components/layouts/mypage/sidebarMenus';
import { Box, IconButton, List } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menus, setMenus] = useState<SidebarMenuItem[]>([]);
  const [open, setOpen] = useState(true);

  const toggleSidebar = () => {
    setOpen(prev => !prev);
  };

  useEffect(() => {
    (async () => {
      const treeMenus = await getSidebarMenus();
      setMenus(treeMenus);
    })();
  });

  return (
    <Box
      sx={{
        width: open ? 240 : 64,
        height: '100vh',
        borderRight: '1px solid #eee',
        transition: 'width 0.35s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1100,
        overflowX: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: 1.5,
          borderBottom: '1px solid #eee',
        }}
      >
        <IconButton
          onClick={() => router.push('/')}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <img src="/c-logo.png" alt="logo" style={{ height: 28, width: 28 }} />
        </IconButton>

        {open && (
          <IconButton onClick={toggleSidebar}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {!open && (
        <IconButton onClick={toggleSidebar} sx={{ mt: 1, alignSelf: 'center' }}>
          <MenuIcon />
        </IconButton>
      )}

      <List sx={{ overflowX: 'hidden' }}>
        {menus.map((item, index) => (
          <SidebarItem
            key={index}
            item={item}
            pathname={pathname}
            isCollapsed={!open}
            onExpandSidebar={() => setOpen(true)}
          />
        ))}
      </List>
    </Box>
  );
}
