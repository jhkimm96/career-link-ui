'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { SidebarMenuItem } from '@/components/layouts/mypage/sidebarMenus';

interface SidebarItemProps {
  item: SidebarMenuItem;
  pathname: string;
  isCollapsed: boolean;
  onExpandSidebar: () => void;
}

export default function SidebarItem({
  item,
  pathname,
  isCollapsed,
  onExpandSidebar,
}: SidebarItemProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = item.path && pathname.startsWith(item.path);

  useEffect(() => {
    if (isCollapsed) setOpen(false);
  }, [isCollapsed]);

  const handleClick = () => {
    if (item.children) {
      if (isCollapsed) {
        onExpandSidebar();
      } else {
        setOpen(prev => !prev);
      }
    } else if (item.path) {
      router.push(item.path);
    }
  };

  const Content = (
    <ListItemButton
      component={item.path ? Link : 'button'}
      href={item.path || undefined}
      onClick={handleClick}
      selected={!!isActive}
      sx={{
        px: isCollapsed ? 1.5 : 2,
        py: 1.3,
        transition: 'padding 0.3s ease-in-out, background-color 0.3s ease-in-out',
        minHeight: 48,
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: isCollapsed ? 40 : 48,
          display: 'flex',
          justifyContent: 'center',
          transition: 'min-width 0.3s ease-in-out',
        }}
      >
        <item.icon fontSize="small" />
      </ListItemIcon>

      {!isCollapsed && (
        <ListItemText
          primary={item.label}
          sx={{
            transition: 'opacity 0.3s ease-in-out',
            whiteSpace: 'nowrap',
          }}
        />
      )}

      {!isCollapsed && item.children && (open ? <ExpandLess /> : <ExpandMore />)}
    </ListItemButton>
  );

  return (
    <>
      {isCollapsed ? (
        <Tooltip title={item.label} placement="right">
          {Content}
        </Tooltip>
      ) : (
        Content
      )}

      {item.children && (
        <Collapse in={!isCollapsed && open} timeout={{ enter: 500, exit: 300 }} unmountOnExit>
          {item.children.map((child, index) => (
            <ListItem key={index} disablePadding sx={{ pl: 4 }}>
              <ListItemButton
                component={Link}
                href={child.path || ''}
                selected={pathname.startsWith(child.path || '')}
                sx={{
                  py: 1.1,
                  transition: 'background-color 0.3s ease-in-out',
                }}
              >
                <ListItemText
                  primary={child.label}
                  sx={{
                    fontSize: 14,
                    whiteSpace: 'nowrap',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </Collapse>
      )}
    </>
  );
}
