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
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownloadReport}
          disabled={downloading}
        >
          {downloading ? 'Downloading...' : 'Download Report'}
        </Button>
      </Box>

      {/* Main Prediction Card */}
      <Paper elevation={3} sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <EmojiEvents sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4">Predicted Career Role</Typography>
        </Box>
        <Typography variant="h3" gutterBottom>
          {prediction.careerRole}
        </Typography>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Probability</Typography>
            <Typography variant="h4">{(prediction.probability * 100).toFixed(1)}%</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Confidence</Typography>
            <Chip
              label={prediction.confidence}
              color={prediction.confidence === 'High' ? 'success' : 'warning'}
              sx={{ fontSize: '1.1rem', p: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6">Avg. Salary</Typography>
            <Typography variant="h4">
              Rs.{prediction.salaryRange.average.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Rs.{prediction.salaryRange.min.toLocaleString()} - Rs.{prediction.salaryRange.max.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Skill Gap Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Skill Gap Analysis
              </Typography>
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Overall Skill Match
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <Box width="100%" mr={2}>
                    <LinearProgress
                      variant="determinate"
                      value={skillGap.overallMatch}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body1" fontWeight="bold">
                    {skillGap.overallMatch}%
                  </Typography>
                </Box>
              </Box>

              <Box mt={3}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={skillMatchData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {skillMatchData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Alternative Careers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alternative Career Paths
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={alternativeCareerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="probability" fill="#8884d8">
                    {alternativeCareerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Matching Skills */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Your Matching Skills</Typography>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {skillGap.matchingSkills?.map((skill) => (
                  <Chip key={skill} label={skill} color="success" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Missing Skills */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Skills to Acquire</Typography>
              </Box>
              <List dense>
                {skillGap.missingSkills?.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <School
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
                      primary={item.skill}
                      secondary={`${item.importance} - Impact: +${item.impactOnSuccess}%`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Career Radar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Career Profile
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Your Profile" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights & Recommendations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Insights & Recommendations</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Market Demand: <strong>{insights.marketDemand}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Growth Potential: <strong>{insights.growthPotential}</strong>
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Recommendations:
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
          </Card>
        </Grid>

        {/* Industry Trends */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Industry Trends
              </Typography>
              <Grid container spacing={2}>
                {insights.industryTrends?.map((trend, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Alert severity="info" icon={<TrendingUp />}>
                      {trend}
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analysis Metadata */}
      <Box mt={3} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          Analysis created on {format(new Date(analysis.createdAt), 'PPpp')}
        </Typography>
      </Box>
    </Container>
  );
}

export default ResultsPage;
