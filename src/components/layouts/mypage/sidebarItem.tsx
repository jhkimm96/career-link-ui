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
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const current = normalize(pathname);
  const itemPath = normalize(item.path);

  // ✅ 정확히 같은 URL만 active
  const isActiveExact = !!itemPath && current === itemPath;

  // 자식 중 현재 경로와 정확히 일치하는 것이 있는지
  const hasExactActiveChild = useMemo(
    () => (item.children ?? []).some(c => normalize(c.path) === current),
    [item.children, current]
  );

  // 사이드바가 펼쳐져 있고, 자식 중 선택된 항목이 있으면 열어두기
  useEffect(() => {
    if (!isCollapsed) setOpen(hasExactActiveChild);
    else setOpen(false);
  }, [isCollapsed, hasExactActiveChild]);

  const handleClick = () => {
    if (item.children) {
      if (isCollapsed) onExpandSidebar();
      else setOpen(prev => !prev);
    } else if (item.path) {
      // component=Link + href를 쓰면 push 불필요하지만,
      // 여기선 버튼 클릭도 허용하므로 남겨둠
      router.push(item.path);
    }
  };

  const Content = (
    <ListItemButton
      component={item.path ? Link : 'button'}
      href={item.path || undefined}
      onClick={handleClick}
      selected={isActiveExact} // ✅ 부모는 "정확히 같을 때만" 파란색
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
        className="MuiListItemIcon-root"
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
          {item.children.map((child, index) => {
            const childPath = normalize(child.path);
            const childActive = !!childPath && current === childPath; // ✅ 정확 일치
            return (
              <ListItem key={index} disablePadding sx={{ pl: 4 }}>
                <ListItemButton
                  component={Link}
                  href={child.path || ''}
                  selected={childActive}
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
            );
          })}
        </Collapse>
      )}
    </>
  );
}
