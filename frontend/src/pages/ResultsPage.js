import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  Warning,
  Download,
  ArrowBack,
  EmojiEvents,
  School,
  WorkOutline,
  AutoGraph,
  Psychology,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { analysisAPI } from '../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import FloatingChatbot from '../components/FloatingChatbot';

const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchAnalysis = React.useCallback(async () => {
    try {
      const response = await analysisAPI.getById(id);
      setAnalysis(response.data.data);
    } catch (error) {
      toast.error('Failed to load analysis');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const response = await analysisAPI.downloadReport(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `career-analysis-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (!analysis) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Analysis not found</Alert>
      </Container>
    );
  }

  const { prediction, skillGap, insights, inputData } = analysis;

  // Prepare chart data
  const alternativeCareerData = prediction.alternativeCareers?.map((career) => ({
    name: career.role,
    probability: (career.probability * 100).toFixed(1),
  })) || [];

  const skillMatchData = [
    { name: 'Matching Skills', value: skillGap.matchingSkills?.length || 0 },
    { name: 'Missing Skills', value: skillGap.missingSkills?.length || 0 },
  ];

  const radarData = [
    {
      skill: 'Overall Match',
      value: skillGap.overallMatch || 0,
    },
    {
      skill: 'Experience',
      value: Math.min((inputData.experience / 10) * 100, 100),
    },
    {
      skill: 'Confidence',
      value: prediction.confidence === 'High' ? 90 : prediction.confidence === 'Medium' ? 60 : 30,
    },
    {
      skill: 'Market Demand',
      value: insights.marketDemand === 'Very High' ? 100 : insights.marketDemand === 'High' ? 80 : insights.marketDemand === 'Medium' ? 60 : 40,
    },
  ];

  return (
    <MotionContainer
      maxWidth="lg"
      sx={{ mt: 4, mb: 4 }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ fontWeight: 'bold' }}
        >
          Back to Dashboard
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownloadReport}
          disabled={downloading}
          sx={{ borderRadius: 4, px: 3, background: 'linear-gradient(45deg, #2EC4B6 30%, #009387 90%)' }}
        >
          {downloading ? 'Downloading...' : 'Download Report'}
        </Button>
      </Box>

      {/* Main Prediction Card */}
      <MotionPaper
        variants={itemVariants}
        elevation={4}
        sx={{
          p: 5,
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box position="absolute" right={-30} top={-30} sx={{ opacity: 0.15 }}>
          <EmojiEvents sx={{ fontSize: 300 }} />
        </Box>

        <Box display="flex" alignItems="center" mb={1} position="relative">
          <Chip label="Top Recommendation" color="warning" sx={{ fontWeight: 'bold', mb: 1, mr: 2 }} />
        </Box>

        <Typography variant="h2" gutterBottom fontWeight="800" position="relative">
          {prediction.careerRole}
        </Typography>

        <Grid container spacing={4} mt={1} position="relative">
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>Match Probability</Typography>
              <Typography variant="h3" fontWeight="bold">{(prediction.probability * 100).toFixed(1)}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>Confidence Level</Typography>
              <Chip
                label={prediction.confidence}
                sx={{
                  mt: 0.5,
                  fontSize: '1.2rem',
                  py: 2.5,
                  px: 1,
                  bgcolor: prediction.confidence === 'High' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.9)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>Estimated Salary</Typography>
              <Typography variant="h4" fontWeight="bold">
                Rs.{prediction.salaryRange.average.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Range: {Number(prediction.salaryRange.min).toLocaleString()} - {Number(prediction.salaryRange.max).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </MotionPaper>

      <Grid container spacing={3}>
        {/* Skill Gap Analysis */}
        <Grid item xs={12} md={6}>
          <MotionCard variants={itemVariants} sx={{ height: '100%', borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <Psychology sx={{ mr: 1, color: 'primary.main' }} /> Skill Gap Analysis
              </Typography>
              <Box mt={3} mb={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">Overall Match</Typography>
                  <Typography variant="body2" fontWeight="bold">{skillGap.overallMatch}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={skillGap.overallMatch}
                  sx={{ height: 12, borderRadius: 6, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { borderRadius: 6 } }}
                />
              </Box>

              <Box height={220}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={skillMatchData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {skillMatchData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">Skill Distribution</Typography>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Alternative Careers */}
        <Grid item xs={12} md={6}>
          <MotionCard variants={itemVariants} sx={{ height: '100%', borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <AutoGraph sx={{ mr: 1, color: 'secondary.main' }} /> Alternative Paths
              </Typography>
              <Box height={300} mt={2}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={alternativeCareerData} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 10 }} />
                    <Bar dataKey="probability" fill="#8884d8" radius={[0, 10, 10, 0]} barSize={20}>
                      {alternativeCareerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Matching Skills */}
        <Grid item xs={12} md={6}>
          <MotionCard variants={itemVariants} sx={{ height: '100%', borderRadius: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Your Matching Skills</Typography>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {skillGap.matchingSkills?.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    sx={{
                      bgcolor: 'success.light',
                      color: 'success.dark',
                      fontWeight: 'bold',
                      borderRadius: 2
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Missing Skills */}
        <Grid item xs={12} md={6}>
          <MotionCard variants={itemVariants} sx={{ height: '100%', borderRadius: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Skills to Acquire</Typography>
              </Box>
              <List dense sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                {skillGap.missingSkills?.map((item, index) => (
                  <ListItem key={index} divider={index !== skillGap.missingSkills.length - 1}>
                    <ListItemIcon>
                      <School
                        fontSize="small"
                        color={
                          item.importance === 'Critical'
                            ? 'error'
                            : item.importance === 'Important'
                              ? 'warning'
                              : 'info'
                        }
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography fontWeight="600">{item.skill}</Typography>}
                      secondary={
                        <Box component="span" display="flex" alignItems="center" gap={1}>
                          <Chip label={item.importance} size="small" color={item.importance === 'Critical' ? 'error' : 'warning'} sx={{ height: 20, fontSize: '0.7rem' }} />
                          <Typography variant="caption" color="success.main" fontWeight="bold">+{item.impactOnSuccess}% Impact</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Radar & Insights (Combined Row for better layout) */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* Career Radar Chart */}
            <Grid item xs={12} md={6}>
              <MotionCard variants={itemVariants} sx={{ height: '100%', borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom align="center">
                    Career Profile Overview
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: '#666', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Your Profile" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Insights */}
            <Grid item xs={12} md={6}>
              <MotionCard variants={itemVariants} sx={{ height: '100%', borderRadius: 4 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={3}>
                    <TrendingUp color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Strategic Insights</Typography>
                  </Box>
                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={6}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderColor: 'primary.light' }}>
                        <Typography variant="caption" color="text.secondary">Market Demand</Typography>
                        <Typography variant="h6" color="primary.main">{insights.marketDemand}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderColor: 'secondary.light' }}>
                        <Typography variant="caption" color="text.secondary">Growth Potential</Typography>
                        <Typography variant="h6" color="secondary.main">{insights.growthPotential}</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    Key Recommendations:
                  </Typography>
                  <List dense>
                    {insights.recommendations?.map((rec, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <WorkOutline color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </MotionCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Industry Trends */}
        <Grid item xs={12}>
          <MotionCard variants={itemVariants} sx={{ borderRadius: 4, bgcolor: '#f8faff', border: '1px dashed #ccc' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="text.secondary">
                🚀 Emerging Industry Trends
              </Typography>
              <Grid container spacing={2} mt={1}>
                {insights.industryTrends?.map((trend, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Alert severity="info" icon={<TrendingUp />} sx={{ borderRadius: 2 }}>
                      {trend}
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Floating Chatbot */}
      <FloatingChatbot analysisData={analysis} />
    </MotionContainer>
  );
}

export default ResultsPage;
