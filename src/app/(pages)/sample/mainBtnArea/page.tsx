'use client';

import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import MainButtonArea from '@/components/mainBtn/mainButtonArea';
import FilterPanel from '@/components/mainBtn/filterPanel';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import RegionTabs from '@/app/(pages)/sample/mainBtnArea/filter/regionTabs';
import BasicFilters from '@/app/(pages)/sample/mainBtnArea/filter/basicFilters';
import ProvinceList from '@/app/(pages)/sample/mainBtnArea/filter/provinceList';

export default function Page() {
  const [keyword, setKeyword] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // 상세 필터 값
  const [tab, setTab] = useState(0);
  const [exp, setExp] = useState('');
  const [edu, setEdu] = useState('');
  const [province, setProvince] = useState<string | null>(null);

  const handleSearch = () => {
    // 실제로는 여기서 API 호출 후 결과를 state에 저장
    console.log('검색 →', { keyword, exp, edu, province });
    setShowFilter(false);
  };
  const handleSave = () => console.log('저장');
  const handleRegister = () => console.log('등록');

  return (
    <Box sx={{ pb: { xs: 18, sm: 14 }, minHeight: '40vh' }}>
      <Typography variant="h6" gutterBottom>
        메인검색영역 샘플
      </Typography>
      <Box
        sx={{
          pb: { xs: 18, sm: 14 },
          minHeight: '40vh',
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom>
          🌟 메인버튼 & 상세검색조건 필터
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          원하는 검색어를 입력하고 <strong>검색</strong> 버튼을 누르거나 Enter 키를 눌러보세요.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • 콘솔 로그로 상세 필터 값의 변화를 확인.
          <br />• “상세검색조건” 버튼을 눌러 추가 조건을 적용후 검색 버튼.
          <br />• “상세검색조건” 예시 컴포넌트 확인.
        </Typography>
      </Box>

      <MainButtonArea
        enableSearch
        searchValue={keyword}
        onSearchChange={e => setKeyword(e.target.value)}
        onSearch={handleSearch}
        enableFilter
        showFilter={showFilter}
        onToggleFilter={() => setShowFilter(v => !v)}
        onClickAway={() => setShowFilter(false)}
        advanced={
          <FilterPanel>
            <RegionTabs value={tab} onChange={setTab} />
            <BasicFilters exp={exp} edu={edu} onExpChange={setExp} onEduChange={setEdu} />
            {tab === 0 ? (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <ProvinceList selected={province} onSelect={setProvince} />
              </Stack>
            ) : (
              <Typography sx={{ mt: 2 }}>해외 필터 준비 중</Typography>
            )}
          </FilterPanel>
        }
        actions={[
          { label: '저장', icon: <SaveIcon />, onClick: handleSave },
          { label: '등록', icon: <AddIcon />, onClick: handleRegister },
        ]}
      />
    </Box>
  );
}
