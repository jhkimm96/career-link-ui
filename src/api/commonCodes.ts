import api from '@/api/axios';

export type CommonCode = {
  groupCode: string;
  code: string;
  codeName: string;
  parentCode: string | null;
  sortOrder?: number;
  level?: number;
  useYn?: 'Y' | 'N';
};

function toItems<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export const CommonCodesApi = {
  async all(group: string): Promise<CommonCode[]> {
    const res = await api.get<CommonCode[] | { items: CommonCode[] }>('/common/common-codes', {
      params: { group },
    });
    return toItems<CommonCode>(res.data);
  },

  async parents(group: string): Promise<CommonCode[]> {
    const res = await api.get<CommonCode[] | { items: CommonCode[] }>('/common/parents', {
      params: { group, groupCode: group },
    });
    return toItems<CommonCode>(res.data);
  },

  async children(group: string, parent: string): Promise<CommonCode[]> {
    const res = await api.get<CommonCode[] | { items: CommonCode[] }>('/common/children', {
      params: { group, groupCode: group, parent, parentCode: parent },
    });
    return toItems<CommonCode>(res.data);
  },
};
