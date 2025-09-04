'use client';

import { MenuDto } from '@/app/(mypage)/mypage/admin/menu/page';
import api from '@/api/axios';
import { getMenuIcon } from '@/components/icons';
import React from 'react';

export type UserType = 'ADMIN' | 'EMP' | 'USER';

export interface SidebarMenuItem {
  id: number;
  label: string;
  path?: string;
  icon?: React.ElementType;
  children?: SidebarMenuItem[];
}

export async function getSidebarMenus(userType: UserType): Promise<SidebarMenuItem[]> {
  const res = await api.get<MenuDto[]>('/admin/menu', { params: { accessRole: userType } });
  return convertFlatToTree(res.data);
}

function convertFlatToTree(flat: MenuDto[]): SidebarMenuItem[] {
  const idMap = new Map<number, SidebarMenuItem>();
  const roots: SidebarMenuItem[] = [];

  flat.forEach(item => {
    idMap.set(item.menuId as number, {
      id: item.menuId as number,
      label: item.menuName,
      path: item.menuPath,
      icon: getMenuIcon(item.icon),
      children: [],
    });
  });

  flat.forEach(item => {
    const current = idMap.get(item.menuId as number);
    if (!current) return;

    if (item.parentId === null) {
      roots.push(current);
    } else {
      const parent = idMap.get(item.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(current);
      }
    }
  });

  return roots;
}
