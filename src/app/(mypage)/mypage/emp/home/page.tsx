'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Container,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import api from '@/api/axios';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ko';

import { LineChart, ColumnChart } from '@toast-ui/chart';
import '@toast-ui/chart/dist/toastui-chart.min.css';

type Granularity = 'day' | 'month' | 'year';
type SeriesDatum = { x: string; y: number };
type Metric = 'postings' | 'applicants';
type StatsResponse = SeriesDatum[] | { body: SeriesDatum[] };

const MAX_DAY_RANGE = 365;

/** 최대 365일 */
function clampDaySpan(from: Dayjs, to: Dayjs) {
  let f = from.startOf('day');
  let t = to.startOf('day');
  if (f.isAfter(t)) [f, t] = [t, f];
  const span = t.diff(f, 'day') + 1;
  if (span > MAX_DAY_RANGE) {
    return { from: t.subtract(MAX_DAY_RANGE - 1, 'day'), to: t };
  }
  return { from: f, to: t };
}

function makeRangeStrings(granularity: Granularity, from: Dayjs, to: Dayjs) {
  if (granularity === 'day') {
    const f = from.startOf('day');
    const t = to.endOf('day').add(1, 'day');
    return { fromStr: f.format('YYYY-MM-DD'), toStr: t.format('YYYY-MM-DD') };
  }
  if (granularity === 'month') {
    const f = from.startOf('month');
    const t = to.endOf('month').add(1, 'day');
    return { fromStr: f.format('YYYY-MM-DD'), toStr: t.format('YYYY-MM-DD') };
  }
  const f = from.startOf('year');
  const t = to.endOf('year').add(1, 'day');
  return { fromStr: f.format('YYYY-MM-DD'), toStr: t.format('YYYY-MM-DD') };
}

function a11yProps(index: number) {
  return { id: `admin-tab-${index}`, 'aria-controls': `admin-tabpanel-${index}` };
}

// ===== 차트 섹션 =====
function ChartSection({
  metric,
  title,
  defaultGranularity = 'day',
  chartType = 'line',
}: {
  metric: 'postings' | 'applicants';
  title: string;
  defaultGranularity?: Granularity;
  chartType?: 'line' | 'col';
}) {
  const [granularity, setGranularity] = useState<Granularity>(defaultGranularity);
  const [from, setFrom] = useState<Dayjs>(() => dayjs().subtract(29, 'day').startOf('day'));
  const [to, setTo] = useState<Dayjs>(() => dayjs().endOf('day'));
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState<SeriesDatum[]>([]);

  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<LineChart | ColumnChart | null>(null);
  const skipNextFetch = useRef(false);

  // from/to 잘못 역전된 경우 보정
  useEffect(() => {
    if (from.isAfter(to)) setTo(from);
  }, [from, to]);

  const fetchNow = useCallback(
    async (g?: Granularity, f?: Dayjs, t?: Dayjs) => {
      const gNow = (g ?? granularity) as Granularity;
      let fNow = (f ?? from) as Dayjs;
      let tNow = (t ?? to) as Dayjs;

      // day는 365일 제한
      if (gNow === 'day') {
        const c = clampDaySpan(fNow, tNow);
        fNow = c.from;
        tNow = c.to;
      }

      setLoading(true);
      try {
        const gg = gNow.toUpperCase(); // 서버 Enum: DAY/MONTH/YEAR
        const { fromStr, toStr } = makeRangeStrings(gNow, fNow, tNow);

        const res = await api.get<StatsResponse>(`/emp/dashboard/stats/${metric}`, {
          params: { granularity: gg, from: fromStr, to: toStr },
        });

        const payload = (res as any).data;
        const rows: SeriesDatum[] = Array.isArray(payload) ? payload : (payload?.body ?? []);
        setSeries(rows);
      } catch (e) {
        setSeries([]);
      } finally {
        setLoading(false);
      }
    },
    [metric, granularity, from, to]
  );

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    fetchNow();
  }, [granularity, from, to, fetchNow]);

  const onGranularityChange = useCallback(
    (value: Granularity) => {
      if (!value) return;

      let nf = from;
      let nt = to;

      if (value === 'day') {
        // 최근 30일 기본 + 365일 제한
        nf = dayjs().subtract(29, 'day').startOf('day');
        nt = dayjs().endOf('day');
        const c = clampDaySpan(nf, nt);
        nf = c.from;
        nt = c.to;
      } else if (value === 'month') {
        nf = dayjs().subtract(11, 'month').startOf('month');
        nt = dayjs().endOf('month');
      } else {
        nf = dayjs().subtract(4, 'year').startOf('year');
        nt = dayjs().endOf('year');
      }

      setGranularity(value);
      setFrom(nf);
      setTo(nt);

      skipNextFetch.current = true;
      fetchNow(value, nf, nt);
    },
    [from, to, fetchNow]
  );

  // 카테고리/시리즈 준비
  const categories = useMemo(() => series.map(d => d.x), [series]);
  const dataSeries = useMemo(() => [{ name: title, data: series.map(d => d.y) }], [series, title]);

  // 차트 렌더/업데이트
  useEffect(() => {
    if (!chartRef.current) return;
    const options = {
      chart: { width: chartRef.current.clientWidth, height: 360 },
      xAxis: { title: granularity === 'day' ? '일자' : granularity === 'month' ? '월' : '년도' },
      yAxis: { title: '건수' },
      series: { spline: chartType === 'line' },
      legend: { align: 'bottom' as const },
      tooltip: { formatter: (val: number) => `${val.toLocaleString()}건` },
      exportMenu: { visible: true },
      theme: {
        chart: {
          fontFamily:
            "Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
        },
      },
    } as const;

    if (!chartInstance.current) {
      chartInstance.current =
        chartType === 'col'
          ? new ColumnChart({
              el: chartRef.current,
              data: { categories, series: dataSeries as any },
              options,
            })
          : new LineChart({
              el: chartRef.current,
              data: { categories, series: dataSeries as any },
              options,
            });

      return () => {
        chartInstance.current?.destroy();
        chartInstance.current = null;
      };
    }

    chartInstance.current.setData({ categories, series: dataSeries as any });
    chartInstance.current.resize({ width: chartRef.current.clientWidth, height: 360 });
  }, [categories, dataSeries, chartType, granularity]);

  useEffect(() => {
    const onResize = () => {
      if (!chartRef.current || !chartInstance.current) return;
      chartInstance.current.resize({ width: chartRef.current.clientWidth, height: 360 });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onChangeDayFrom = useCallback(
    (v: Dayjs | null) => {
      if (!v) return;
      const newFrom = v.startOf('day');
      const c = clampDaySpan(newFrom, to);
      setFrom(c.from);
      setTo(c.to);
      skipNextFetch.current = true;
      fetchNow(granularity, c.from, c.to);
    },
    [to, granularity, fetchNow]
  );

  const onChangeDayTo = useCallback(
    (v: Dayjs | null) => {
      if (!v) return;
      const newTo = v.endOf('day');
      const c = clampDaySpan(from, newTo);
      setFrom(c.from);
      setTo(c.to);
      skipNextFetch.current = true;
      fetchNow(granularity, c.from, c.to);
    },
    [from, granularity, fetchNow]
  );

  const onChangeMonthFrom = useCallback(
    (v: Dayjs | null) => {
      if (!v) return;
      const nf = v.startOf('month');
      setFrom(nf);
      skipNextFetch.current = true;
      fetchNow(granularity, nf, to);
    },
    [to, granularity, fetchNow]
  );

  const onChangeMonthTo = useCallback(
    (v: Dayjs | null) => {
      if (!v) return;
      const nt = v.endOf('month');
      setTo(nt);
      skipNextFetch.current = true;
      fetchNow(granularity, from, nt);
    },
    [from, granularity, fetchNow]
  );

  const onChangeYearFrom = useCallback(
    (v: Dayjs | null) => {
      if (!v) return;
      const nf = v.startOf('year');
      setFrom(nf);
      skipNextFetch.current = true;
      fetchNow(granularity, nf, to);
    },
    [to, granularity, fetchNow]
  );

  const onChangeYearTo = useCallback(
    (v: Dayjs | null) => {
      if (!v) return;
      const nt = v.endOf('year');
      setTo(nt);
      skipNextFetch.current = true;
      fetchNow(granularity, from, nt);
    },
    [from, granularity, fetchNow]
  );

  return (
    <Card variant="outlined">
      <CardHeader
        title={title}
        subheader={
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}
          >
            <ToggleButtonGroup
              exclusive
              size="small"
              value={granularity}
              onChange={(_, v) => v && onGranularityChange(v)}
            >
              <ToggleButton value="day">일자별</ToggleButton>
              <ToggleButton value="month">월별</ToggleButton>
              <ToggleButton value="year">년도별</ToggleButton>
            </ToggleButtonGroup>

            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
              {granularity === 'day' && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <DatePicker
                    label="시작"
                    value={from}
                    onChange={onChangeDayFrom}
                    format="YYYY.MM.DD"
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <DatePicker
                    label="종료"
                    value={to}
                    onChange={onChangeDayTo}
                    format="YYYY.MM.DD"
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Stack>
              )}

              {granularity === 'month' && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <DatePicker
                    label="시작월"
                    views={['year', 'month']}
                    value={from}
                    onChange={onChangeMonthFrom}
                    format="YYYY.MM"
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <DatePicker
                    label="종료월"
                    views={['year', 'month']}
                    value={to}
                    onChange={onChangeMonthTo}
                    format="YYYY.MM"
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Stack>
              )}

              {granularity === 'year' && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <DatePicker
                    label="시작년도"
                    views={['year']}
                    value={from}
                    onChange={onChangeYearFrom}
                    format="YYYY"
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <DatePicker
                    label="종료년도"
                    views={['year']}
                    value={to}
                    onChange={onChangeYearTo}
                    format="YYYY"
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Stack>
              )}
            </LocalizationProvider>

            <Divider flexItem orientation="vertical" />
            <Typography variant="body2" color="text.secondary">
              범위:
              {from.format(
                granularity === 'year' ? 'YYYY' : granularity === 'month' ? 'YYYY.MM' : 'YYYY.MM.DD'
              )}
              ~
              {to.format(
                granularity === 'year' ? 'YYYY' : granularity === 'month' ? 'YYYY.MM' : 'YYYY.MM.DD'
              )}
              {'  '}(최대 1년)
            </Typography>
          </Stack>
        }
      />
      <CardContent>
        <Box sx={{ position: 'relative' }}>
          <Box ref={chartRef} sx={{ width: '100%', minHeight: 360 }} />
          {loading && (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ position: 'absolute', inset: 0 }}
            >
              <CircularProgress />
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        관리자
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary">
        <Tab label="일자별/월별/년도별 등록 공고 수" {...a11yProps(1)} />
        <Tab label="일자별/월별/년도별 지원자 수" {...a11yProps(2)} />
      </Tabs>

      {tab === 0 && (
        <ChartSection
          metric="postings"
          title="등록 공고 수"
          defaultGranularity="day"
          chartType="col"
        />
      )}
      {tab === 1 && (
        <ChartSection
          metric="applicants"
          title="지원자 수"
          defaultGranularity="day"
          chartType="line"
        />
      )}
    </Container>
  );
}
