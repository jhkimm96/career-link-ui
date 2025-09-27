'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import Lottie from 'lottie-react';
import hotAnim from '@/assets/hot.json';
import tipsAnim from '@/assets/tips.json';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function Banner() {
  const router = useRouter();

  const slides = [
    {
      title: 'HOT 100 채용 공고!',
      desc: '지원자들이 가장 많이 몰리는 TOP 100 공고를 만나보세요.',
      color: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
      lottie: hotAnim,
      btnText: 'HOT 100 보러가기',
      btnLink: '/job-postings/hot',
    },
    {
      title: '취준 꿀팁 모아보기',
      desc: '이력서 작성 가이드부터 면접 준비까지 한눈에 확인하세요.',
      color: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
      lottie: tipsAnim,
      btnText: '꿀팁 보러가기',
      btnLink: '/notice/detail/7',
    },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 350, md: 400 },
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
      }}
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        speed={900}
        loop
        style={{ height: '100%' }}
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <Box
              sx={{
                height: '100%',
                background: slide.color,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 2, md: 8 },
                textAlign: { xs: 'center', md: 'left' },
                px: { xs: 2, md: 6 },
              }}
            >
              {/* Lottie 아이콘 크게 */}
              {slide.lottie && (
                <Lottie
                  animationData={slide.lottie}
                  loop
                  autoplay
                  style={{
                    width: '100%',
                    maxWidth: 320,
                    height: 'auto',
                  }}
                />
              )}

              {/* 텍스트 */}
              <Box sx={{ maxWidth: 400 }}>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  sx={{ mb: 1, textShadow: '2px 3px 8px rgba(0,0,0,0.4)' }}
                >
                  {slide.title}
                </Typography>
                <Typography
                  sx={{
                    mb: 2,
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    opacity: 0.9,
                  }}
                >
                  {slide.desc}
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#333',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => router.push(slide.btnLink)}
                >
                  {slide.btnText}
                </Button>
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
