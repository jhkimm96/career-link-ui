'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Divider,
  Stack,
  Button,
  Skeleton,
  Pagination,
  Menu,
  MenuItem,
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useAuth } from '@/libs/authContext';
import MainButtonArea from '@/components/mainBtn/mainButtonArea';
import FilterPanel from '@/components/mainBtn/filterPanel';

import api from '@/api/axios';

interface JobPosting {
  jobId: string;
  title: string;
  companyName: string;
  location: string;
  employmentType?: string;
  experience?: string;
  education?: string;
  salary?: string;
  postedAt?: string | null;
  deadline?: string | null;
  tags?: string[];
}

/* 필터 응답 타입 */
interface CodeDto {
  id?: string;
  groupCode: string;
  code: string;
  codeName: string;
  parentCode?: string | null;
  sortOrder?: number;
  level?: number;
  useYn?: string;
}

interface JobFiltersResponse {
  jobFields: CodeDto[]; // 직군
  locations: CodeDto[]; // 지역
  employmentTypes: CodeDto[]; // 고용형태
  educationLevels: CodeDto[]; // 학력
  careerLevels: CodeDto[]; // 경력
  salary: CodeDto[]; // 연봉
}

type JobFieldNode = {
  code: string;
  codeName: string;
  sortOrder?: number;
  children: JobFieldNode[];
};

export default function JobPostingPage() {
  const { role } = useAuth();
  const isEmp = role === 'EMP';
  const [keyword, setKeyword] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const [jobField, setJobField] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [exp, setExp] = useState('');
  const [edu, setEdu] = useState('');
  const [empType, setEmpType] = useState('');
  const [sal, setSal] = useState('');

  const [rows, setRows] = useState<JobPosting[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 16;

  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const toggleBookmark = (jobId: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const fmtDate = (v?: string | null) => {
    if (!v) return '-';
    const d = dayjs(v);
    return d.isValid() ? d.format('YYYY-MM-DD') : '-';
  };

  // ================= 필터 한방 로딩 =================
  const [filters, setFilters] = useState<JobFiltersResponse | null>(null);
  const [filtersLoading, setFiltersLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setFiltersLoading(true);
      try {
        const res = await api.get<JobFiltersResponse>('/job/filters');
        setFilters(res.data);
      } catch (e) {
        console.error('필터 로딩 실패', e);
      } finally {
        setFiltersLoading(false);
      }
    })();
  }, []);

  type Option = { code: string; name: string };
  const jobFieldOptions: Option[] = useMemo(
    () => (filters?.jobFields ?? []).map(x => ({ code: x.code, name: x.codeName })),
    [filters]
  );
  const locOptions: Option[] = useMemo(
    () => (filters?.locations ?? []).map(x => ({ code: x.code, name: x.codeName })),
    [filters]
  );
  const empTypeOptions: Option[] = useMemo(
    () => (filters?.employmentTypes ?? []).map(x => ({ code: x.code, name: x.codeName })),
    [filters]
  );
  const eduOptions: Option[] = useMemo(
    () => (filters?.educationLevels ?? []).map(x => ({ code: x.code, name: x.codeName })),
    [filters]
  );
  const expOptions: Option[] = useMemo(
    () => (filters?.careerLevels ?? []).map(x => ({ code: x.code, name: x.codeName })),
    [filters]
  );
  const salOptions: Option[] = useMemo(
    () => (filters?.salary ?? []).map(x => ({ code: x.code, name: x.codeName })),
    [filters]
  );

  const labelOf = (arr: Option[], code: string) => arr.find(o => o.code === code)?.name ?? '전체';

  const labelOfCode = (arr: CodeDto[] | undefined, code?: string) =>
    (code && arr?.find(x => x.code === code)?.codeName) ?? undefined;

  const buildJobFieldTree = (codes: CodeDto[] | undefined): JobFieldNode[] => {
    if (!codes?.length) return [];
    const map = new Map<string, JobFieldNode>();
    const roots: JobFieldNode[] = [];

    for (const c of codes) {
      map.set(c.code, { code: c.code, codeName: c.codeName, sortOrder: c.sortOrder, children: [] }); // ✅ CHANGED
    }

    for (const c of codes) {
      const node = map.get(c.code)!;
      if (!c.parentCode) {
        roots.push(node);
      } else {
        const parent = map.get(c.parentCode);
        if (parent) parent.children.push(node);
        else roots.push(node);
      }
    }

    const sortTree = (nodes: JobFieldNode[]) => {
      nodes.sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.codeName.localeCompare(b.codeName)
      );
      nodes.forEach(n => sortTree(n.children));
    };
    sortTree(roots);
    return roots;
  };

  const jobFieldTree = useMemo(() => buildJobFieldTree(filters?.jobFields), [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/job/jobList', {
        params: {
          page: page - 1,
          size: pageSize,
          keyword: keyword || undefined,
          jobField: jobField || undefined,
          location: location || undefined,
          exp: exp || undefined,
          edu: edu || undefined,
          empType: empType || undefined,
          sal: sal || undefined,
        },
      });

      const data = res.data;
      const list: JobPosting[] = (data?.content ?? data ?? []).map((r: any) => ({
        jobId: r.jobId ?? r.id,
        title: r.title,
        companyName: r.companyName ?? r.employerName,
        location: r.location ?? r.locationCode ?? '',
        employmentType: r.employmentType ?? r.employmentTypeCode ?? '',
        experience: r.experience ?? r.careerLevel ?? r.careerLevelCode ?? '',
        education: r.education ?? r.educationLevel ?? r.educationLevelCode ?? '',
        salary: r.salaryText ?? r.salary ?? r.salaryCode ?? '',
        postedAt: r.postedAt ? String(r.postedAt) : null,
        deadline: r.deadline ? String(r.deadline) : null,
        tags: r.tags ?? [],
      }));

      setRows(list);
      setRowCount(data?.totalElements ?? list.length);
    } catch (e: any) {
      console.log(e.message ?? '채용공고 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchJobs();
  }, [page]); // 페이지 변경 시 재조회

  const handleSearch = () => {
    setPage(1);
    void fetchJobs();
  };

  const [anchorLocation, setAnchorLocation] = useState<HTMLElement | null>(null);
  const [anchorJob, setAnchorJob] = useState<HTMLElement | null>(null);
  const [anchorExp, setAnchorExp] = useState<HTMLElement | null>(null);
  const [anchorEdu, setAnchorEdu] = useState<HTMLElement | null>(null);
  const [anchorEmpType, setAnchorEmpType] = useState<HTMLElement | null>(null);
  const [anchorSal, setAnchorSal] = useState<HTMLElement | null>(null);

  const hasOpenMenu = Boolean(
    anchorLocation || anchorJob || anchorExp || anchorEdu || anchorEmpType || anchorSal
  );

  const jobLabel = jobField ? `직군 • ${labelOf(jobFieldOptions, jobField)}` : '직군 • 전체';
  const locLabel = location ? `지역 • ${labelOf(locOptions, location)}` : '지역 • 전체';
  const expLabel = exp ? `경력 • ${labelOf(expOptions, exp)}` : '경력 • 전체';
  const eduLabel = edu ? `학력 • ${labelOf(eduOptions, edu)}` : '학력 • 전체';
  const empTypeLabel = empType ? `형태 • ${labelOf(empTypeOptions, empType)}` : '고용형태 • 전체';
  const salLabel = sal ? `연봉 • ${labelOf(salOptions, sal)}` : '연봉 • 전체';

  const skeletons = Array.from({ length: pageSize }).map((_, i) => (
    <Card key={`s-${i}`} sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
      <CardHeader
        title={<Skeleton variant="text" width="70%" />}
        subheader={<Skeleton variant="text" width="40%" />}
      />
      <Divider />
      <CardContent>
        <Stack spacing={1.2}>
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="rounded" height={24} />
        </Stack>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Skeleton variant="rounded" width={90} height={32} />
      </CardActions>
    </Card>
  ));

  const totalPages = Math.max(1, Math.ceil(rowCount / pageSize));

  return (
    <Box>
      <MainButtonArea
        enableSearch
        searchValue={keyword}
        onSearchChange={e => setKeyword(e.target.value)}
        onSearch={handleSearch}
        enableFilter
        showFilter={showFilter}
        onToggleFilter={() => setShowFilter(v => !v)}
        onClickAway={() => {
          if (!hasOpenMenu) setShowFilter(false);
        }}
        advanced={
          <FilterPanel>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {[
                { label: locLabel, onOpen: (e: any) => setAnchorLocation(e.currentTarget) },
                { label: jobLabel, onOpen: (e: any) => setAnchorJob(e.currentTarget) },
                { label: expLabel, onOpen: (e: any) => setAnchorExp(e.currentTarget) },
                { label: eduLabel, onOpen: (e: any) => setAnchorEdu(e.currentTarget) },
                { label: empTypeLabel, onOpen: (e: any) => setAnchorEmpType(e.currentTarget) },
                { label: salLabel, onOpen: (e: any) => setAnchorSal(e.currentTarget) },
              ].map(({ label, onOpen }, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  onMouseDown={onOpen}
                  sx={{ flex: '0 0 200px', height: 40, borderRadius: 2 }}
                >
                  {label}
                </Button>
              ))}
            </Box>

            <Menu
              anchorEl={anchorLocation}
              open={Boolean(anchorLocation)}
              onClose={() => setAnchorLocation(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              keepMounted
            >
              <Box sx={{ p: 1.5, minWidth: 260 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  지역선택
                </Typography>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  <MenuItem
                    selected={!location}
                    onClick={() => {
                      setLocation('');
                      setAnchorLocation(null);
                    }}
                  >
                    전체
                  </MenuItem>
                  {locOptions.map(o => (
                    <MenuItem
                      key={o.code}
                      selected={location === o.code}
                      onClick={() => {
                        setLocation(o.code);
                        setAnchorLocation(null);
                      }}
                    >
                      {o.name}
                    </MenuItem>
                  ))}
                </Box>
              </Box>
            </Menu>

            <Menu
              anchorEl={anchorJob}
              open={Boolean(anchorJob)}
              onClose={() => setAnchorJob(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              keepMounted
            >
              <Box sx={{ p: 1.5, minWidth: 320 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  직군 선택
                </Typography>
                <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
                  <MenuItem
                    selected={!jobField}
                    onClick={() => {
                      setJobField('');
                      setAnchorJob(null);
                    }}
                  >
                    전체
                  </MenuItem>

                  {jobFieldTree.map(parent => (
                    <Box key={parent.code} sx={{ px: 0.5 }}>
                      <MenuItem
                        disabled={parent.children.length > 0}
                        selected={jobField === parent.code}
                        onClick={() => {
                          if (parent.children.length === 0) {
                            setJobField(parent.code);
                            setAnchorJob(null);
                          }
                        }}
                        sx={{ fontWeight: 600, opacity: 1 }}
                      >
                        {parent.codeName}
                      </MenuItem>

                      {parent.children.map(child => (
                        <MenuItem
                          key={child.code}
                          sx={{ pl: 3 }}
                          selected={jobField === child.code}
                          onClick={() => {
                            setJobField(child.code);
                            setAnchorJob(null);
                          }}
                        >
                          {child.codeName}
                        </MenuItem>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Menu>

            <Menu
              anchorEl={anchorExp}
              open={Boolean(anchorExp)}
              onClose={() => setAnchorExp(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              keepMounted
            >
              <Box sx={{ p: 1.5, minWidth: 220 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  경력 선택
                </Typography>
                <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
                  <MenuItem
                    selected={!exp}
                    onClick={() => {
                      setExp('');
                      setAnchorExp(null);
                    }}
                  >
                    전체
                  </MenuItem>
                  {expOptions.map(o => (
                    <MenuItem
                      key={o.code}
                      selected={exp === o.code}
                      onClick={() => {
                        setExp(o.code);
                        setAnchorExp(null);
                      }}
                    >
                      {o.name}
                    </MenuItem>
                  ))}
                </Box>
              </Box>
            </Menu>

            <Menu
              anchorEl={anchorEdu}
              open={Boolean(anchorEdu)}
              onClose={() => setAnchorEdu(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              keepMounted
            >
              <Box sx={{ p: 1.5, minWidth: 220 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  학력 선택
                </Typography>
                <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
                  <MenuItem
                    selected={!edu}
                    onClick={() => {
                      setEdu('');
                      setAnchorEdu(null);
                    }}
                  >
                    전체
                  </MenuItem>
                  {eduOptions.map(o => (
                    <MenuItem
                      key={o.code}
                      selected={edu === o.code}
                      onClick={() => {
                        setEdu(o.code);
                        setAnchorEdu(null);
                      }}
                    >
                      {o.name}
                    </MenuItem>
                  ))}
                </Box>
              </Box>
            </Menu>

            <Menu
              anchorEl={anchorEmpType}
              open={Boolean(anchorEmpType)}
              onClose={() => setAnchorEmpType(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              keepMounted
            >
              <Box sx={{ p: 1.5, minWidth: 220 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  고용형태 선택
                </Typography>
                <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
                  <MenuItem
                    selected={!empType}
                    onClick={() => {
                      setEmpType('');
                      setAnchorEmpType(null);
                    }}
                  >
                    전체
                  </MenuItem>
                  {empTypeOptions.map(o => (
                    <MenuItem
                      key={o.code}
                      selected={empType === o.code}
                      onClick={() => {
                        setEmpType(o.code);
                        setAnchorEmpType(null);
                      }}
                    >
                      {o.name}
                    </MenuItem>
                  ))}
                </Box>
              </Box>
            </Menu>

            <Menu
              anchorEl={anchorSal}
              open={Boolean(anchorSal)}
              onClose={() => setAnchorSal(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              keepMounted
            >
              <Box sx={{ p: 1.5, minWidth: 220 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  연봉 선택
                </Typography>
                <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
                  <MenuItem
                    selected={!sal}
                    onClick={() => {
                      setSal('');
                      setAnchorSal(null);
                    }}
                  >
                    전체
                  </MenuItem>
                  {salOptions.map(o => (
                    <MenuItem
                      key={o.code}
                      selected={sal === o.code}
                      onClick={() => {
                        setSal(o.code);
                        setAnchorSal(null);
                      }}
                    >
                      {o.name}
                    </MenuItem>
                  ))}
                </Box>
              </Box>
            </Menu>
          </FilterPanel>
        }
      />

      <Typography sx={{ mt: 2, mb: 1 }} color="text.secondary">
        총 {rowCount.toLocaleString()}건
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {loading ? (
          skeletons
        ) : rows.length === 0 ? (
          <Box sx={{ gridColumn: '1 / -1', p: 6, textAlign: 'center', color: 'text.secondary' }}>
            검색 결과가 없습니다.
          </Box>
        ) : (
          rows.map(row => {
            const isOpenEnded = !row.deadline || row.deadline === '';
            const isBookmarked = bookmarks.has(row.jobId);
            return (
              <Card
                key={row.jobId}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: 3,
                }}
              >
                <CardHeader
                  title={
                    <Typography variant="h6" noWrap title={row.title}>
                      {row.title}
                    </Typography>
                  }
                  subheader={row.companyName}
                  action={
                    <Button
                      size="small"
                      onClick={() => toggleBookmark(row.jobId)}
                      sx={{ minWidth: 'auto' }}
                    >
                      {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                    </Button>
                  }
                />
                <Divider />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {row.location && (
                        <Chip
                          size="small"
                          label={labelOfCode(filters?.locations, row.location) ?? row.location}
                        />
                      )}
                      {row.employmentType && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={
                            labelOfCode(filters?.employmentTypes, row.employmentType) ??
                            row.employmentType
                          }
                        />
                      )}
                      {row.experience && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={
                            labelOfCode(filters?.careerLevels, row.experience) ?? row.experience
                          }
                        />
                      )}
                      {row.education && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={
                            labelOfCode(filters?.educationLevels, row.education) ?? row.education
                          }
                        />
                      )}
                      {row.salary && (
                        <Chip
                          size="small"
                          label={labelOfCode(filters?.salary, row.salary) ?? row.salary}
                        />
                      )}
                      {(row.tags ?? []).slice(0, 3).map(t => (
                        <Chip key={t} label={t} size="small" variant="outlined" />
                      ))}
                    </Stack>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Typography variant="body2" color="text.secondary">
                        게시일: {fmtDate(row.postedAt)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: isOpenEnded ? 'success.main' : 'text.secondary' }}
                      >
                        마감: {isOpenEnded ? '상시모집' : fmtDate(row.deadline)}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    variant="contained"
                    component={Link}
                    href={`/jobs/${row.jobId}`}
                    disableElevation
                  >
                    상세보기
                  </Button>
                </CardActions>
              </Card>
            );
          })
        )}
      </Box>

      <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
        <Pagination
          page={page}
          count={totalPages}
          onChange={(_, p) => setPage(p)}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
        />
      </Stack>

      {/* 기업회원에게만 표시되는 공고등록 FAB */}
      {isEmp && (
        <Fab
          color="primary"
          aria-label="공고등록"
          component={Link}
          href="/job-postings/form"
          sx={{ position: 'fixed', right: 24, bottom: 80, zIndex: 1500 }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
