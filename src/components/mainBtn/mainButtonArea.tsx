'use client';

import React from 'react';
import {
  Box,
  Container,
  Stack,
  Button,
  Collapse,
  ClickAwayListener,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SaveIcon from '@mui/icons-material/Save';

export interface ActionButton {
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: React.ReactNode;
}

interface MainButtonAreaProps {
  /** 검색어 입력 활성화 */
  enableSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
  /** 상세 필터 토글 활성화 */
  enableFilter?: boolean;
  showFilter?: boolean;
  onToggleFilter?: () => void;
  onClickAway?: () => void;
  /** 상세 필터 컴포넌트 */
  advanced?: React.ReactNode;
  /** 기타 버튼 */
  actions?: ActionButton[];
  saveAction?: React.MouseEventHandler<HTMLButtonElement>;
  saveLabel?: string;
}

const MainButtonArea: React.FC<MainButtonAreaProps> = ({
  enableSearch = false,
  searchValue = '',
  onSearchChange = () => {},
  onSearch = () => {},
  enableFilter = false,
  showFilter = false,
  onToggleFilter = () => {},
  onClickAway = () => {},
  advanced,
  actions = [],
  saveAction,
  saveLabel = '저장',
}) => {
  // 버튼 그룹 구성
  const buttons: ActionButton[] = [];
  if (enableFilter)
    buttons.push({
      label: showFilter ? '상세검색조건 닫기' : '상세검색조건',
      onClick: onToggleFilter,
      icon: <FilterAltIcon />,
    });
  if (enableSearch) buttons.push({ label: '검색', onClick: onSearch, icon: <SearchIcon /> });
  buttons.push(...actions);
  const hasSave = Boolean(saveAction);

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          transition: 'max-height 0.3s ease',
          zIndex: 1100,
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems="center"
              justifyContent={enableSearch ? 'space-between' : 'flex-end'}
            >
              {enableSearch && (
                <TextField
                  size="small"
                  placeholder="검색어 입력"
                  value={searchValue}
                  onChange={onSearchChange}
                  onKeyDown={e => e.key === 'Enter' && onSearch()}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ width: { xs: '100%', sm: 240 } }}
                />
              )}
              <Stack direction="row" spacing={1}>
                {buttons.map((btn, idx) => {
                  return (
                    <Button
                      key={idx}
                      size="small"
                      variant="outlined"
                      startIcon={btn.icon}
                      onClick={btn.onClick}
                      sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 1 }}
                    >
                      {btn.label}
                    </Button>
                  );
                })}
                {hasSave && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={saveAction}
                    sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 1 }}
                  >
                    {saveLabel}
                  </Button>
                )}
              </Stack>
            </Stack>

            {/* 상세 필터 영역: 외부에서 advanced prop 으로 주입 */}
            {enableFilter && advanced && (
              <Collapse in={showFilter} timeout="auto" unmountOnExit>
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    maxHeight: '40vh',
                    overflowY: 'auto',
                  }}
                >
                  {advanced}
                </Box>
              </Collapse>
            )}
          </Stack>
        </Container>
      </Box>
    </ClickAwayListener>
  );
};

export default MainButtonArea;
