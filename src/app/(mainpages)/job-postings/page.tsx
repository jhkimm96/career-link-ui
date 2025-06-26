'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
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
  Avatar,
  Tooltip,
  ListItemIcon,
  Checkbox,
  CardActionArea,
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
  companyLogoUrl?: string;
  jobField: string;
  location: string;
  employmentType?: string;
  experience?: string;
  education?: string;
  salary?: string;
  postedAt?: string | null;
  deadline?: string | null;
  tags?: string[];
  scrapped?: boolean;
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
  parentCode?: string | null;
  children: JobFieldNode[];
  isLeaf?: boolean;
};

type Envelope<T> = {
  header?: { result?: boolean; message?: string; code?: string | null };
  body: T;
  pagination?: {
    page: number; // 0-base
    size: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

export default function JobPostingPage() {
  const { role } = useAuth();
  const isEmp = role === 'EMP';
  const router = useRouter();

  const [keyword, setKeyword] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const [jobFields, setJobFields] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [exps, setExps] = useState<string[]>([]);
  const [edus, setEdus] = useState<string[]>([]);
  const [empTypes, setEmpTypes] = useState<string[]>([]);
  const [sals, setSals] = useState<string[]>([]);

  const [rows, setRows] = useState<JobPosting[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const pageSize = 16;

  const toggleBookmark = async (job: JobPosting) => {
    if (job.scrapped) {
      await api.delete(`/job/scrap/removeScrap/${job.jobId}`);
      job.scrapped = false;
    } else {
      await api.post(`/job/scrap/addScrap/${job.jobId}`);
      job.scrapped = true;
    }
    setRows(prev => [...prev]); // 상태 갱신
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

    // 모든 노드 기본 생성
    for (const c of codes) {
      map.set(c.code, {
        code: c.code,
        codeName: c.codeName,
        sortOrder: c.sortOrder,
        parentCode: c.parentCode ?? null,
        children: [],
      });
    }

    // 부모-자식 연결
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

    // 정렬
    const sortTree = (nodes: JobFieldNode[]) => {
      nodes.sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.codeName.localeCompare(b.codeName)
      );
      nodes.forEach(n => sortTree(n.children));
    };
    sortTree(roots);

    const markLeaf = (nodes: JobFieldNode[]) => {
      nodes.forEach(n => {
        n.isLeaf = n.children.length === 0;
        if (n.children.length) markLeaf(n.children);
      });
    };
    markLeaf(roots);

    return roots;
  };

  const jobFieldTree = useMemo(() => buildJobFieldTree(filters?.jobFields), [filters]);

  const toggleIn = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const labelForMulti = (opts: Option[], selected: string[], prefix: string) => {
    if (selected.length === 0) return `${prefix} • 전체`;
    const names = selected.map(c => opts.find(o => o.code === c)?.name).filter(Boolean) as string[];
    if (names.length === 1) return `${prefix} • ${names[0]}`;
    return `${prefix} • ${names[0]} 외 ${names.length - 1}`;
  };

  const jobLabel = labelForMulti(jobFieldOptions, jobFields, '직군');
  const locLabel = labelForMulti(locOptions, locations, '지역');
  const expLabel = labelForMulti(expOptions, exps, '경력');
  const eduLabel = labelForMulti(eduOptions, edus, '학력');
  const empTypeLabel = labelForMulti(empTypeOptions, empTypes, '고용형태');
  const salLabel = labelForMulti(salOptions, sals, '연봉');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();

      p.set('page', String(page - 1)); // 1-base → 0-base
      p.set('size', String(pageSize));
      if (keyword && keyword.trim()) p.set('keyword', keyword.trim());

      const appendAll = (key: string, arr: string[]) => {
        (arr ?? []).forEach(v => {
          const vv = (v ?? '').trim();
          if (vv) p.append(key, vv);
        });
      };

      appendAll('jobField', jobFields);
      appendAll('location', locations);
      appendAll('exp', exps);
      appendAll('edu', edus);
      appendAll('empType', empTypes);
      appendAll('sal', sals);

      const res = await api.get(`/job/jobList?${p.toString()}`);

      const body = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
      const pg = (res as any).pagination as {
        page: number;
        size: number;
        totalPages: number;
        totalElements: number;
        hasNext: boolean;
        hasPrevious: boolean;
      } | null;

      const list: JobPosting[] = body.map((r: any) => ({
        jobId: String(r.jobId ?? r.id),
        title: r.title,
        companyName: r.companyName ?? r.employerName,
        companyLogoUrl: r.companyLogoUrl ?? r.logoUrl ?? r.employerLogoUrl ?? undefined,
        jobField: r.jobField ?? r.jobFieldCode ?? '',
        location: r.location ?? r.locationCode ?? '',
        employmentType: r.employmentType ?? r.employmentTypeCode ?? '',
        experience: r.experience ?? r.careerLevel ?? r.careerLevelCode ?? '',
        education: r.education ?? r.educationLevel ?? r.educationLevelCode ?? '',
        salary: r.salaryText ?? r.salary ?? r.salaryCode ?? '',
        postedAt: r.postedAt ? String(r.postedAt) : null,
        deadline: r.deadline ? String(r.deadline) : null,
        tags: r.tags ?? [],
        scrapped: r.scrapped ?? false,
      }));

      setRows(list);
      const totalElements = pg?.totalElements ?? list.length;
      const totalPages = pg?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize));

      setRowCount(totalElements);
      setServerTotalPages(totalPages);
    } catch (e: any) {
      console.log(e.message ?? '채용공고 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchJobs();
  }, [page, keyword, jobFields, locations, exps, edus, empTypes, sals]);

  const handleSearch = () => setPage(1);

  const [anchorLocation, setAnchorLocation] = useState<HTMLElement | null>(null);
  const [anchorJob, setAnchorJob] = useState<HTMLElement | null>(null);
  const [anchorExp, setAnchorExp] = useState<HTMLElement | null>(null);
  const [anchorEdu, setAnchorEdu] = useState<HTMLElement | null>(null);
  const [anchorEmpType, setAnchorEmpType] = useState<HTMLElement | null>(null);
  const [anchorSal, setAnchorSal] = useState<HTMLElement | null>(null);

  const hasOpenMenu = Boolean(
    anchorLocation || anchorJob || anchorExp || anchorEdu || anchorEmpType || anchorSal
  );

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
                  <MenuItem onClick={() => setLocations([])}>
                    <ListItemIcon>
                      <Checkbox edge="start" checked={locations.length === 0} />
                    </ListItemIcon>
                    전체
                  </MenuItem>
                  {locOptions.map(o => {
                    const checked = locations.includes(o.code);
                    return (
                      <MenuItem
                        key={o.code}
                        onClick={() => setLocations(prev => toggleIn(prev, o.code))}
                      >
                        <ListItemIcon>
                          <Checkbox edge="start" checked={checked} />
                        </ListItemIcon>
                        {o.name}
                      </MenuItem>
                    );
                  })}
                </Box>
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Button size="small" onClick={() => setLocations([])}>
                    초기화
                  </Button>
                  <Box flex={1} />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setAnchorLocation(null);
                      setPage(1);
                    }}
                  >
                    적용
                  </Button>
                </Stack>
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
                  <MenuItem onClick={() => setJobFields([])}>
                    <ListItemIcon>
                      <Checkbox edge="start" checked={jobFields.length === 0} />
                    </ListItemIcon>
                    전체
                  </MenuItem>

                  {jobFieldTree.map(parent => {
                    if (parent.isLeaf) {
                      const checked = jobFields.includes(parent.code);
                      return (
                        <MenuItem
                          key={parent.code}
                          onClick={() => setJobFields(prev => toggleIn(prev, parent.code))}
                        >
                          <ListItemIcon>
                            <Checkbox edge="start" checked={checked} />
                          </ListItemIcon>
                          {parent.codeName}
                        </MenuItem>
                      );
                    }

                    return (
                      <Box key={parent.code} sx={{ px: 0.5 }}>
                        <MenuItem disabled sx={{ fontWeight: 600 }}>
                          {parent.codeName}
                        </MenuItem>

                        {parent.children.map(child => {
                          const checked = jobFields.includes(child.code);
                          return (
                            <MenuItem
                              key={child.code}
                              sx={{ pl: 3 }}
                              onClick={() => setJobFields(prev => toggleIn(prev, child.code))}
                            >
                              <ListItemIcon>
                                <Checkbox edge="start" checked={checked} />
                              </ListItemIcon>
                              {child.codeName}
                            </MenuItem>
                          );
                        })}
                      </Box>
                    );
                  })}
                </Box>
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Button size="small" onClick={() => setJobFields([])}>
                    초기화
                  </Button>
                  <Box flex={1} />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setAnchorJob(null);
                      setPage(1);
                    }}
                  >
                    적용
                  </Button>
                </Stack>
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
                  <MenuItem onClick={() => setExps([])}>
                    <ListItemIcon>
                      <Checkbox checked={exps.length === 0} />
                    </ListItemIcon>
                    전체
                  </MenuItem>
                  {expOptions.map(o => {
                    const checked = exps.includes(o.code);
                    return (
                      <MenuItem
                        key={o.code}
                        onClick={() => setExps(prev => toggleIn(prev, o.code))}
                      >
                        <ListItemIcon>
                          <Checkbox checked={checked} />
                        </ListItemIcon>
                        {o.name}
                      </MenuItem>
                    );
                  })}
                </Box>
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Button size="small" onClick={() => setExps([])}>
                    초기화
                  </Button>
                  <Box flex={1} />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setAnchorExp(null);
                      setPage(1);
                    }}
                  >
                    적용
                  </Button>
                </Stack>
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
                  <MenuItem onClick={() => setEdus([])}>
                    <ListItemIcon>
                      <Checkbox checked={edus.length === 0} />
                    </ListItemIcon>
                    전체
                  </MenuItem>
                  {eduOptions.map(o => {
                    const checked = edus.includes(o.code);
                    return (
                      <MenuItem
                        key={o.code}
                        onClick={() => setEdus(prev => toggleIn(prev, o.code))}
                      >
                        <ListItemIcon>
                          <Checkbox checked={checked} />
                        </ListItemIcon>
                        {o.name}
                      </MenuItem>
                    );
                  })}
                </Box>
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Button size="small" onClick={() => setEdus([])}>
                    초기화
                  </Button>
                  <Box flex={1} />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setAnchorEdu(null);
                      setPage(1);
                    }}
                  >
                    적용
                  </Button>
                </Stack>
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
                  <MenuItem onClick={() => setEmpTypes([])}>
                    <ListItemIcon>
                      <Checkbox checked={empTypes.length === 0} />
                    </ListItemIcon>
                    전체
                  </MenuItem>
                  {empTypeOptions.map(o => {
                    const checked = empTypes.includes(o.code);
                    return (
                      <MenuItem
                        key={o.code}
                        onClick={() => setEmpTypes(prev => toggleIn(prev, o.code))}
                      >
                        <ListItemIcon>
                          <Checkbox checked={checked} />
                        </ListItemIcon>
                        {o.name}
                      </MenuItem>
                    );
                  })}
                </Box>
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Button size="small" onClick={() => setEmpTypes([])}>
                    초기화
                  </Button>
                  <Box flex={1} />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setAnchorEmpType(null);
                      setPage(1);
                    }}
                  >
                    적용
                  </Button>
                </Stack>
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
                  <MenuItem onClick={() => setSals([])}>
                    <ListItemIcon>
                      <Checkbox checked={sals.length === 0} />
                    </ListItemIcon>
                    전체
                  </MenuItem>
                  {salOptions.map(o => {
                    const checked = sals.includes(o.code);
                    return (
                      <MenuItem
                        key={o.code}
                        onClick={() => setSals(prev => toggleIn(prev, o.code))}
                      >
                        <ListItemIcon>
                          <Checkbox checked={checked} />
                        </ListItemIcon>
                        {o.name}
                      </MenuItem>
                    );
                  })}
                </Box>
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Button size="small" onClick={() => setSals([])}>
                    초기화
                  </Button>
                  <Box flex={1} />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setAnchorSal(null);
                      setPage(1);
                    }}
                  >
                    적용
                  </Button>
                </Stack>
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
            return (
              <Card
                key={row.jobId}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid #ddd',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                  transition: 'transform .2s ease, box-shadow .2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 14px 34px rgba(0,0,0,0.12)',
                  },
                  position: 'relative',
                  pb: 6,
                }}
              >
                <CardActionArea
                  component="div"
                  onClick={() => router.push(`/job-postings/detail?id=${row.jobId}`)}
                  disableRipple
                  sx={{ borderRadius: 'inherit', height: '100%', alignSelf: 'stretch' }}
                >
                  <CardHeader
                    avatar={
                      <Avatar
                        alt={row.companyName}
                        src={row.companyLogoUrl}
                        variant="rounded"
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'grey.100',
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                        imgProps={{ loading: 'lazy' }}
                      >
                        {row.companyName?.[0]}
                      </Avatar>
                    }
                    title={
                      <Tooltip title={row.title ?? ''} arrow disableInteractive>
                        <Typography
                          variant="h6"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            wordBreak: 'break-word',
                            lineHeight: 1.25,
                          }}
                        >
                          {row.title}
                        </Typography>
                      </Tooltip>
                    }
                    subheader={row.companyName}
                    action={
                      role === 'USER' && (
                        <Button
                          size="small"
                          onClick={e => {
                            e.stopPropagation();
                            toggleBookmark(row);
                          }}
                          sx={{ minWidth: 'auto' }}
                        >
                          {row.scrapped ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                        </Button>
                      )
                    }
                  />
                  <Divider sx={{ borderColor: 'transparent' }} />

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {row.jobField && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={labelOfCode(filters?.jobFields, row.jobField) ?? row.jobField}
                            sx={{
                              height: 24,
                              borderRadius: '999px',
                              border: 'none',
                              bgcolor: 'action.hover',
                              '& .MuiChip-label': { px: 1.2 },
                            }}
                          />
                        )}
                        {row.location && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={labelOfCode(filters?.locations, row.location) ?? row.location}
                            sx={{
                              height: 24,
                              borderRadius: '999px',
                              border: 'none',
                              bgcolor: 'action.hover',
                              '& .MuiChip-label': { px: 1.2 },
                            }}
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
                            sx={{
                              height: 24,
                              borderRadius: '999px',
                              border: 'none',
                              bgcolor: 'action.hover',
                              '& .MuiChip-label': { px: 1.2 },
                            }}
                          />
                        )}
                        {row.experience && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={
                              labelOfCode(filters?.careerLevels, row.experience) ?? row.experience
                            }
                            sx={{
                              height: 24,
                              borderRadius: '999px',
                              border: 'none',
                              bgcolor: 'action.hover',
                              '& .MuiChip-label': { px: 1.2 },
                            }}
                          />
                        )}
                        {row.education && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={
                              labelOfCode(filters?.educationLevels, row.education) ?? row.education
                            }
                            sx={{
                              height: 24,
                              borderRadius: '999px',
                              border: 'none',
                              bgcolor: 'action.hover',
                              '& .MuiChip-label': { px: 1.2 },
                            }}
                          />
                        )}
                        {row.salary && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={labelOfCode(filters?.salary, row.salary) ?? row.salary}
                            sx={{
                              height: 24,
                              borderRadius: '999px',
                              border: 'none',
                              bgcolor: 'action.hover',
                              '& .MuiChip-label': { px: 1.2 },
                            }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>

                  <Divider sx={{ borderColor: 'transparent' }} />

                  {/*<CardActions sx={{ justifyContent: 'flex-end' }}>*/}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0, // 하단에서 고정 (값 조정 가능)
                      right: 16, // 오른쪽 정렬
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: isOpenEnded ? 'success.main' : 'text.secondary' }}
                    >
                      마감: {isOpenEnded ? '상시모집' : fmtDate(row.deadline)}
                    </Typography>
                  </Box>
                  {/*</CardActions>*/}
                </CardActionArea>
              </Card>
            );
          })
        )}
      </Box>

      <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
        <Pagination
          page={page}
          count={serverTotalPages}
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
          onClick={() => {
            router.push('/job-postings/form');
          }}
          sx={{ position: 'fixed', right: 24, bottom: 80, zIndex: 1500 }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
