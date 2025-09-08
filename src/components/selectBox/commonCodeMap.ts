import { useEffect, useState } from 'react';
import api from '@/api/axios';

export default function useCommonCodeMap(groupCode: string) {
  const [map, setMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get('/common/getCommonCodes', {
        params: { groupCode },
      });
      const m: Record<string, string> = {};
      res.data.forEach((item: any) => {
        m[item.code] = item.codeName;
      });
      setMap(m);
    };
    fetch();
  }, [groupCode]);

  return map;
}
