import { useEffect, useState } from 'react';
import api from '@/api/axios';

export default function useCommonCodeMap(groupCode: string, parentCode?: string) {
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!groupCode) return;

    const fetch = async () => {
      let res;
      if (parentCode) {
        // 하위코드 조회
        res = await api.get('/common/children', {
          params: { groupCode: groupCode, parentCode: parentCode },
        });
      } else {
        // 상위코드 조회
        res = await api.get('/common/parents', {
          params: { groupCode: groupCode },
        });
      }

      const m: Record<string, string> = {};
      (res.data ?? []).forEach((item: any) => {
        m[item.code] = item.codeName;
      });
      setMap(m);
    };

    fetch();
  }, [groupCode, parentCode]);

  return map;
}
