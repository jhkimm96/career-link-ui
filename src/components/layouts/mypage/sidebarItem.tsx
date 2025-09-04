'use client';

import { useEffect, useMemo, useState } from 'react';
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

const normalize = (p?: string) => (p ? p.replace(/\/+$/, '') : '');

export default function SidebarItem({
  item,
  pathname,
  isCollapsed,
  onExpandSidebar,
}: SidebarItemProps) {
  const Icon = item.icon;
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const current = normalize(pathname);
  const itemPath = normalize(item.path);
  const isActiveExact = !!itemPath && current === itemPath;

  const hasExactActiveChild = useMemo(
    () => (item.children ?? []).some(c => normalize(c.path) === current),
    [item.children, current]
  );

  useEffect(() => {
    if (!isCollapsed) setOpen(hasExactActiveChild);
    else setOpen(false);
  }, [isCollapsed, hasExactActiveChild]);

  const handleClick = () => {
    if (item.children) {
      if (isCollapsed) onExpandSidebar();
      else setOpen(prev => !prev);
    } else if (item.path) {
      router.push(item.path);
    }
  };

  const Content = (
    <ListItemButton
      component={item.path ? Link : 'button'}
      href={item.path || undefined}
      onClick={handleClick}
      selected={isActiveExact}
      sx={{
        px: isCollapsed ? 1.5 : 2,
        py: 1.3,
        minHeight: 48,
        transition: 'padding 0.3s ease-in-out',
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: isCollapsed ? 40 : 48,
          justifyContent: 'center',
        }}
      >
        {Icon && <Icon fontSize="small" />}
      </ListItemIcon>

      {!isCollapsed && <ListItemText primary={item.label} />}
      {!isCollapsed &&
        Array.isArray(item.children) &&
        item.children.length > 0 &&
        (open ? <ExpandLess /> : <ExpandMore />)}
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
          {item.children.map((child, index) => {
            const childPath = normalize(child.path);
            const childActive = !!childPath && current === childPath;

            return (
              <ListItem key={index} disablePadding sx={{ pl: 4 }}>
                <ListItemButton
                  component={Link}
                  href={child.path || ''}
                  selected={childActive}
                  sx={{ py: 1.1 }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isCollapsed ? 40 : 48,
                      justifyContent: 'center',
                    }}
                  >
                    {Icon && <Icon fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText primary={child.label} sx={{ fontSize: 14 }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </Collapse>
      )}
    </>
  );
}
