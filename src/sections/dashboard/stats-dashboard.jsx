'use client';

import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { supabase } from 'src/lib/supabase';
import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// Status 状态翻译映射

// 月份翻译映射
const monthMap = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export function StatsDashboard() {
  const [stats, setStats] = useState({
    audio: [],
    video: [],
    picbook: [],
  });
  const [loading, setLoading] = useState(true);
  
  const theme = useTheme();

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Fetch audio data
        const { data: audioData, error: audioError } = await supabase
          .from('audio')
          .select('*');
        
        if (audioError) throw audioError;

        // Fetch video data
        const { data: videoData, error: videoError } = await supabase
          .from('video')
          .select('*');
        
        if (videoError) throw videoError;

        // Fetch picbook data
        const { data: picbookData, error: picbookError } = await supabase
          .from('picbook')
          .select('*');
        
        if (picbookError) throw picbookError;

        setStats({
          audio: audioData || [],
          video: videoData || [],
          picbook: picbookData || [],
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  // 计算月度数据
  const videoMonthlyData = useMemo(() => {
    const data = getMonthlyData(stats.video);
    return {
      ...data,
      labels: monthMap
    };
  }, [stats.video]);
  
  const audioMonthlyData = useMemo(() => {
    const data = getMonthlyData(stats.audio);
    return {
      ...data,
      labels: monthMap
    };
  }, [stats.audio]);
  
  const picbookMonthlyData = useMemo(() => {
    const data = getMonthlyData(stats.picbook);
    return {
      ...data,
      labels: monthMap
    };
  }, [stats.picbook]);

  // 计算年增长率
  const calculateYearlyGrowth = (data) => {
    if (!data || data.length === 0) return 0;
    const thisYear = new Date().getFullYear();
    const lastYear = thisYear - 1;
    
    const thisYearItems = data.filter(item => {
      const date = new Date(item.created_at || item.updated_at);
      return date.getFullYear() === thisYear;
    });
    
    const lastYearItems = data.filter(item => {
      const date = new Date(item.created_at || item.updated_at);
      return date.getFullYear() === lastYear;
    });
    
    if (lastYearItems.length === 0) return 100;
    
    return Math.round((thisYearItems.length - lastYearItems.length) / lastYearItems.length * 100);
  };

  const videoGrowth = useMemo(() => calculateYearlyGrowth(stats.video), [stats.video]);
  const audioGrowth = useMemo(() => calculateYearlyGrowth(stats.audio), [stats.audio]);
  const picbookGrowth = useMemo(() => calculateYearlyGrowth(stats.picbook), [stats.picbook]);

  // 图表配置
  const donutChartOptions = useChart({
    legend: { 
      position: 'bottom', 
      horizontalAlign: 'center',
      fontFamily: theme.typography.fontFamily,
      fontSize: 13,
      offsetY: 8,
      markers: {
        width: 12,
        height: 12,
        radius: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            value: {
              formatter: (val) => `${val}`,
              fontSize: 22,
              fontWeight: 600,
              fontFamily: theme.typography.fontFamily,
            },
            total: {
              formatter: (w) => `总计: ${w.globals.seriesTotals.reduce((a, b) => a + b, 0)}`,
              color: theme.palette.text.primary,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: theme.typography.fontFamily,
            }
          }
        }
      }
    },
    stroke: { show: false },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: 13,
        fontWeight: 600,
        fontFamily: theme.typography.fontFamily,
      },
      dropShadow: { enabled: false }
    },
    tooltip: {
      style: {
        fontSize: 14,
        fontFamily: theme.typography.fontFamily,
      }
    },
  });

  const lineChartOptions = useChart({
    stroke: { 
      width: 3, 
      curve: 'smooth' 
    },
    fill: { 
      opacity: 0.12,
      type: 'gradient',
      gradient: {
        type: 'vertical',
        shadeIntensity: 0.5,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100]
      }
    },
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider,
      xaxis: {
        lines: { show: true }
      }
    },
    xaxis: {
      categories: monthMap,
      labels: {
        style: {
          fontSize: 13,
          fontFamily: theme.typography.fontFamily,
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: 13,
          fontFamily: theme.typography.fontFamily,
        }
      }
    },
    tooltip: { 
      shared: true, 
      intersect: false,
      y: { formatter: (value) => `${value} 个` },
      theme: theme.palette.mode,
      style: {
        fontSize: 13,
        fontFamily: theme.typography.fontFamily,
      }
    },
    markers: {
      size: 5,
      strokeColors: 'transparent',
      hover: {
        size: 7
      }
    }
  });

  const barChartOptions = useChart({
    chart: {
      stacked: false,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '45%',
      },
    },
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider
    },
    stroke: {
      width: 0,
    },
    xaxis: {
      categories: monthMap,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontSize: 13,
          fontFamily: theme.typography.fontFamily,
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: 13,
          fontFamily: theme.typography.fontFamily,
        }
      }
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} 个`
      },
      theme: theme.palette.mode,
      style: {
        fontSize: 13,
        fontFamily: theme.typography.fontFamily,
      }
    }
  });

  if (loading) {
    return <LoadingScreen />; 
  }

  return (
    <DashboardContent maxWidth="1800px">
      <Grid container spacing={6}>
        {/* 顶部概览卡片 - 拓宽并增加内边距 */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card>
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: { xs: 'wrap', md: 'nowrap' }
              }}>
                <Box sx={{ mb: { xs: 2, md: 0 } }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>
                    数据统计 · 平台数据概览
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ mb: 3, maxWidth: '90%', lineHeight: 1.6 }}
                  >
                    内容平台覆盖视频、音频、绘本等多种媒体形式，提供丰富多样的优质教育资源
                  </Typography>
                </Box>
                <SeoIllustration sx={{ height: { xs: 140, md: 180 }, width: { xs: 180, md: 240 } }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ 
            bgcolor: 'primary.dark', 
            color: 'primary.contrastText', 
            height: '100%',
            minHeight: { md: 188 }
          }}>
            <CardContent sx={{ p: { xs: 4, md: 6 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h4" sx={{ mb: 3, color: 'primary.contrastText', fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                平台内容总量
              </Typography>
              <Typography variant="h2" sx={{ mb: 2, color: 'primary.contrastText', fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                {stats.video.length + stats.audio.length + stats.picbook.length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Iconify
                  icon="material-symbols:library-add-check"
                  sx={{ color: 'primary.lighter', width: 28, height: 28, mr: 1.5 }}
                />
                <Typography variant="body1" sx={{ color: 'primary.lighter', fontSize: '0.85rem' }}>
                  所有资源类型总数
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 三个资源卡片 - 增加高度和内部元素大小 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader 
              title="视频资源"
              sx={{ pb: 1, p: { xs: 4, md: 6 } }}
              titleTypographyProps={{ variant: 'h5', fontSize: '1.2rem' }}
              action={
                <Iconify 
                  icon="ph:video-fill" 
                  sx={{ 
                    width: 30, 
                    height: 30, 
                    color: 'primary.main',
                  }} 
                />
              }
            />
            <CardContent sx={{ pt: 1, px: { xs: 4, md: 6 }, pb: { xs: 4, md: 6 } }}>
              <Typography variant="h2" sx={{ mb: 0.5, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>{stats.video.length}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '0.9rem' }}>视频总数</Typography>
              
              <Chart
                type="donut"
                series={[
                  stats.video.filter(item => item.status === 'active').length,
                  stats.video.filter(item => item.status === 'pending').length,
                  stats.video.filter(item => item.status !== 'active' && item.status !== 'pending').length
                ]}
                options={{
                  ...donutChartOptions,
                  labels: ['已上线', '待审核', '未通过'],
                  colors: [
                    theme.palette.success.main,
                    theme.palette.warning.main,
                    theme.palette.error.light,
                  ],
                  legend: {
                    ...donutChartOptions.legend,
                    fontSize: 12,
                    offsetY: 5,
                  },
                  plotOptions: {
                    ...donutChartOptions.plotOptions,
                    pie: {
                      ...donutChartOptions.plotOptions.pie,
                      donut: {
                        ...donutChartOptions.plotOptions.pie.donut,
                        size: '70%',
                        labels: {
                          ...donutChartOptions.plotOptions.pie.donut.labels,
                          value: {
                            ...donutChartOptions.plotOptions.pie.donut.labels.value,
                            fontSize: 20,
                          },
                          total: {
                            ...donutChartOptions.plotOptions.pie.donut.labels.total,
                            fontSize: 14,
                          }
                        }
                      }
                    }
                  }
                }}
                height={320}
              />
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  display: 'block',
                  textAlign: 'right', 
                  color: videoGrowth > 0 ? 'success.main' : 'error.main',
                  fontWeight: 'bold',
                  mt: 1,
                  fontSize: '0.85rem'
                }}
              >
                同比增长 {videoGrowth > 0 ? '+' : ''}{videoGrowth}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader 
              title="音频资源"
              sx={{ pb: 1, p: { xs: 4, md: 6 } }}
              titleTypographyProps={{ variant: 'h5', fontSize: '1.2rem' }}
              action={
                <Iconify 
                  icon="ph:music-notes-fill" 
                  sx={{ 
                    width: 30, 
                    height: 30, 
                    color: 'info.main',
                  }} 
                />
              }
            />
            <CardContent sx={{ pt: 1, px: { xs: 4, md: 6 }, pb: { xs: 4, md: 6 } }}>
              <Typography variant="h2" sx={{ mb: 0.5, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>{stats.audio.length}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '0.9rem' }}>音频总数</Typography>
              
              <Chart
                type="donut"
                series={[
                  stats.audio.filter(item => item.status === 'active').length,
                  stats.audio.filter(item => item.status === 'pending').length,
                  stats.audio.filter(item => item.status !== 'active' && item.status !== 'pending').length
                ]}
                options={{
                  ...donutChartOptions,
                  labels: ['已上线', '待审核', '未通过'],
                  colors: [
                    theme.palette.success.main,
                    theme.palette.warning.main,
                    theme.palette.error.light,
                  ],
                  legend: {
                    ...donutChartOptions.legend,
                    fontSize: 12,
                    offsetY: 5,
                  },
                  plotOptions: {
                    ...donutChartOptions.plotOptions,
                    pie: {
                      ...donutChartOptions.plotOptions.pie,
                      donut: {
                        ...donutChartOptions.plotOptions.pie.donut,
                        size: '70%',
                        labels: {
                          ...donutChartOptions.plotOptions.pie.donut.labels,
                          value: {
                            ...donutChartOptions.plotOptions.pie.donut.labels.value,
                            fontSize: 20,
                          },
                          total: {
                            ...donutChartOptions.plotOptions.pie.donut.labels.total,
                            fontSize: 14,
                          }
                        }
                      }
                    }
                  }
                }}
                height={320}
              />
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  display: 'block',
                  textAlign: 'right', 
                  color: audioGrowth > 0 ? 'success.main' : 'error.main',
                  fontWeight: 'bold',
                  mt: 1,
                  fontSize: '0.85rem'
                }}
              >
                同比增长 {audioGrowth > 0 ? '+' : ''}{audioGrowth}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader 
              title="绘本资源"
              sx={{ pb: 1, p: { xs: 4, md: 6 } }}
              titleTypographyProps={{ variant: 'h5', fontSize: '1.2rem' }}
              action={
                <Iconify 
                  icon="ph:book-open-text-fill" 
                  sx={{ 
                    width: 30, 
                    height: 30, 
                    color: 'warning.main',
                  }} 
                />
              }
            />
            <CardContent sx={{ pt: 1, px: { xs: 4, md: 6 }, pb: { xs: 4, md: 6 } }}>
              <Typography variant="h2" sx={{ mb: 0.5, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>{stats.picbook.length}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '0.9rem' }}>绘本总数</Typography>
              
              <Chart
                type="donut"
                series={[
                  stats.picbook.filter(item => item.status === 'active').length,
                  stats.picbook.filter(item => item.status === 'pending').length,
                  stats.picbook.filter(item => item.status !== 'active' && item.status !== 'pending').length
                ]}
                options={{
                  ...donutChartOptions,
                  labels: ['已上线', '待审核', '未通过'],
                  colors: [
                    theme.palette.success.main,
                    theme.palette.warning.main,
                    theme.palette.error.light,
                  ],
                  legend: {
                    ...donutChartOptions.legend,
                    fontSize: 12,
                    offsetY: 5,
                  },
                  plotOptions: {
                    ...donutChartOptions.plotOptions,
                    pie: {
                      ...donutChartOptions.plotOptions.pie,
                      donut: {
                        ...donutChartOptions.plotOptions.pie.donut,
                        size: '70%',
                        labels: {
                          ...donutChartOptions.plotOptions.pie.donut.labels,
                          value: {
                            ...donutChartOptions.plotOptions.pie.donut.labels.value,
                            fontSize: 20,
                          },
                          total: {
                            ...donutChartOptions.plotOptions.pie.donut.labels.total,
                            fontSize: 14,
                          }
                        }
                      }
                    }
                  }
                }}
                height={320}
              />
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  display: 'block',
                  textAlign: 'right', 
                  color: picbookGrowth > 0 ? 'success.main' : 'error.main',
                  fontWeight: 'bold',
                  mt: 1,
                  fontSize: '0.85rem'
                }}
              >
                同比增长 {picbookGrowth > 0 ? '+' : ''}{picbookGrowth}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              title="平台资源状态概览"
              subheader="所有资源类别状态分布"
              titleTypographyProps={{ variant: 'h5', sx: { mb: 0.5, fontSize: '1.2rem' } }}
              subheaderTypographyProps={{ 
                variant: 'body2',
                sx: { mt: 0.5, fontSize: '0.85rem' }
              }}
              sx={{ pb: 1, p: { xs: 4, md: 6 } }}
            />
            <CardContent sx={{ p: { xs: 4, md: 6 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Chart
                type="pie"
                height={450}
                series={[
                  stats.video.filter(item => item.status === 'active').length,
                  stats.audio.filter(item => item.status === 'active').length,
                  stats.picbook.filter(item => item.status === 'active').length,
                  stats.video.filter(item => item.status === 'pending').length,
                  stats.audio.filter(item => item.status === 'pending').length,
                  stats.picbook.filter(item => item.status === 'pending').length,
                ]}
                options={{
                  labels: [
                    '已上线视频', 
                    '已上线音频', 
                    '已上线绘本',
                    '待审核视频',
                    '待审核音频',
                    '待审核绘本',
                  ],
                  colors: [
                    theme.palette.primary.main,
                    theme.palette.info.main,
                    theme.palette.warning.main,
                    theme.palette.primary.lighter,
                    theme.palette.info.lighter,
                    theme.palette.warning.lighter,
                  ],
                  legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    fontSize: 12,
                    fontFamily: theme.typography.fontFamily,
                    offsetY: 5,
                    itemMargin: {
                      horizontal: 12,
                      vertical: 6
                    },
                    markers: {
                      width: 14,
                      height: 14,
                      radius: 6,
                    },
                  },
                  dataLabels: {
                    enabled: true,
                    formatter: (val) => `${Math.round(val)}%`,
                    style: {
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: theme.typography.fontFamily,
                    }
                  },
                  tooltip: {
                    style: {
                      fontSize: 12,
                      fontFamily: theme.typography.fontFamily,
                    }
                  },
                  stroke: { width: 2 },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* 大型图表卡片 - 显著增加高度 */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardHeader 
              title="资源月度发布趋势"
              subheader="近12个月资源发布量统计"
              titleTypographyProps={{ variant: 'h5', sx: { mb: 0.5, fontSize: '1.2rem' } }}
              subheaderTypographyProps={{ 
                variant: 'body2',
                sx: { mt: 0.5, fontSize: '0.85rem' }
              }}
              sx={{ pb: 1, p: { xs: 4, md: 6 } }}
            />
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Chart
                type="line"
                series={[
                  { 
                    name: '视频', 
                    data: videoMonthlyData.series[0].data,
                  },
                  { 
                    name: '音频', 
                    data: audioMonthlyData.series[0].data,
                  },
                  { 
                    name: '绘本', 
                    data: picbookMonthlyData.series[0].data,
                  }
                ]}
                options={{
                  ...lineChartOptions,
                  colors: [
                    theme.palette.primary.main,
                    theme.palette.info.main,
                    theme.palette.warning.main,
                  ],
                  stroke: {
                    ...lineChartOptions.stroke,
                    width: 4,
                  },
                  markers: {
                    ...lineChartOptions.markers,
                    size: 6,
                    hover: {
                      size: 9
                    }
                  },
                  legend: {
                    position: 'top',
                    horizontalAlign: 'right',
                    fontSize: 12,
                    fontFamily: theme.typography.fontFamily,
                    offsetY: 0,
                    markers: {
                      width: 14,
                      height: 14,
                      radius: 6,
                    },
                  },
                  xaxis: {
                    ...lineChartOptions.xaxis,
                    labels: {
                      ...lineChartOptions.xaxis.labels,
                      style: {
                        ...lineChartOptions.xaxis.labels.style,
                        fontSize: 12,
                      }
                    }
                  },
                  yaxis: {
                    ...lineChartOptions.yaxis,
                    labels: {
                      ...lineChartOptions.yaxis.labels,
                      style: {
                        ...lineChartOptions.yaxis.labels.style,
                        fontSize: 12,
                      }
                    }
                  },
                }}
                height={500}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={6} sx={{ height: '100%' }}>
            <Card>
              <CardHeader
                title="资源状态统计"
                titleTypographyProps={{ variant: 'h5', fontSize: '1.2rem' }}
                sx={{ p: { xs: 4, md: 6 }, pb: 1 }}
              />
              <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                <Grid container spacing={3}>
                  <Grid size={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      py: 3,
                      bgcolor: 'success.lighter', 
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                      <Typography variant="h3" color="success.main" sx={{ mb: 1, fontSize: '1.6rem' }}>
                        {stats.video.filter(item => item.status === 'active').length + 
                         stats.audio.filter(item => item.status === 'active').length + 
                         stats.picbook.filter(item => item.status === 'active').length}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '0.9rem' }}>已上线</Typography>
                    </Box>
                  </Grid>
                  <Grid size={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      py: 3,
                      bgcolor: 'warning.lighter', 
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                      <Typography variant="h3" color="warning.main" sx={{ mb: 1, fontSize: '1.6rem' }}>
                        {stats.video.filter(item => item.status === 'pending').length + 
                         stats.audio.filter(item => item.status === 'pending').length + 
                         stats.picbook.filter(item => item.status === 'pending').length}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '0.9rem' }}>待审核</Typography>
                    </Box>
                  </Grid>
                  <Grid size={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      py: 3,
                      bgcolor: 'error.lighter', 
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                      <Typography variant="h3" color="error.main" sx={{ mb: 1, fontSize: '1.6rem' }}>
                        {stats.video.filter(item => item.status !== 'active' && item.status !== 'pending').length + 
                         stats.audio.filter(item => item.status !== 'active' && item.status !== 'pending').length + 
                         stats.picbook.filter(item => item.status !== 'active' && item.status !== 'pending').length}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '0.9rem' }}>未通过</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card sx={{ flex: 1 }}>
              <CardHeader
                title="内容类型占比"
                titleTypographyProps={{ variant: 'h5', fontSize: '1.2rem' }}
                sx={{ p: { xs: 4, md: 6 }, pb: 1 }}
              />
              <CardContent sx={{ p: { xs: 4, md: 6 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Chart
                  type="donut"
                  height={300}
                  series={[stats.video.length, stats.audio.length, stats.picbook.length]}
                  options={{
                    labels: ['视频', '音频', '绘本'],
                    colors: [
                      theme.palette.primary.main,
                      theme.palette.info.main,
                      theme.palette.warning.main
                    ],
                    legend: {
                      position: 'bottom',
                      horizontalAlign: 'center',
                      fontSize: 12,
                      fontFamily: theme.typography.fontFamily,
                      offsetY: 5,
                      markers: {
                        width: 14,
                        height: 14,
                        radius: 6,
                      },
                      itemMargin: {
                        horizontal: 15,
                        vertical: 5
                      },
                    },
                    dataLabels: {
                      enabled: true,
                      formatter: (val) => `${Math.round(val)}%`,
                      style: {
                        fontSize: 12,
                        fontFamily: theme.typography.fontFamily,
                      }
                    },
                    tooltip: {
                      style: {
                        fontSize: 12,
                        fontFamily: theme.typography.fontFamily,
                      }
                    },
                    plotOptions: {
                      pie: {
                        donut: {
                          size: '65%',
                          labels: {
                            show: true,
                            name: {
                              show: true,
                              fontSize: '14px',
                            },
                            value: {
                              show: true,
                              fontSize: '18px',
                              fontWeight: 600,
                            },
                            total: {
                              show: true,
                              label: '总计',
                              formatter: (w) => `${w.globals.seriesTotals.reduce((a, b) => a + b, 0)}`,
                              fontSize: '14px',
                              fontWeight: 600,
                            }
                          }
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>  

        {/* 下方图表和统计卡片 */}
        <Grid size={{ xs: 12, lg: 8 }}sx={{ mt: 6 }}>
          <Card>
            <CardHeader 
              title="内容月度分布对比"
              subheader="不同类别内容分布统计"
              titleTypographyProps={{ variant: 'h5', sx: { mb: 0.5, fontSize: '1.2rem' } }}
              subheaderTypographyProps={{ 
                variant: 'body2',
                sx: { mt: 0.5, fontSize: '0.85rem' }
              }}
              sx={{ pb: 1, p: { xs: 4, md: 6 } }}
            />
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Chart
                type="bar"
                series={[
                  { 
                    name: '视频', 
                    data: videoMonthlyData.series[0].data,
                  },
                  { 
                    name: '音频', 
                    data: audioMonthlyData.series[0].data,
                  },
                  { 
                    name: '绘本', 
                    data: picbookMonthlyData.series[0].data,
                  }
                ]}
                options={{
                  ...barChartOptions,
                  colors: [
                    theme.palette.primary.main,
                    theme.palette.info.main,
                    theme.palette.warning.main,
                  ],
                  legend: {
                    position: 'top',
                    horizontalAlign: 'right',
                    fontSize: 12,
                    fontFamily: theme.typography.fontFamily,
                    offsetY: 0,
                    markers: {
                      width: 14,
                      height: 14,
                      radius: 4,
                    },
                  },
                  plotOptions: {
                    ...barChartOptions.plotOptions,
                    bar: {
                      ...barChartOptions.plotOptions.bar,
                      columnWidth: '60%',
                    },
                  },
                  xaxis: {
                    ...barChartOptions.xaxis,
                    labels: {
                      ...barChartOptions.xaxis.labels,
                      style: {
                        ...barChartOptions.xaxis.labels.style,
                        fontSize: 12,
                      }
                    }
                  },
                  yaxis: {
                    ...barChartOptions.yaxis,
                    labels: {
                      ...barChartOptions.yaxis.labels,
                      style: {
                        ...barChartOptions.yaxis.labels.style,
                        fontSize: 12,
                      }
                    }
                  },
                }}
                height={420}
              />
            </CardContent>
          </Card>
        </Grid>

        
    </DashboardContent>
  );
}

// Helper functions

function getMonthlyData(data) {
  const months = Array(12).fill(0);
  
  data.forEach((item) => {
    const date = new Date(item.created_at || item.updated_at || Date.now());
    const month = date.getMonth();
    months[month] += 1;
  });
  
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [{ name: '项目数量', data: months }],
  };
}