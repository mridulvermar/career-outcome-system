import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  Add,
  Visibility,
  Delete,
  TrendingUp,
  Assessment,
  History,
} from '@mui/icons-material';
import { analysisAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    highConfidence: 0,
    avgSkillMatch: 0,
  });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await analysisAPI.getHistory({ limit: 20 });
      const data = response.data.data;
      setAnalyses(data);
      
      // Calculate stats
      const total = data.length;
      const highConfidence = data.filter(a => a.prediction.confidence === 'High').length;
      const avgSkillMatch = data.reduce((sum, a) => sum + a.skillGap.overallMatch, 0) / (total || 1);
      
      setStats({
        total,
        highConfidence,
        avgSkillMatch: Math.round(avgSkillMatch),
      });
    } catch (error) {
      toast.error('Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        await analysisAPI.delete(id);
        toast.success('Analysis deleted successfully');
        fetchAnalyses();
      } catch (error) {
        toast.error('Failed to delete analysis');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your career analysis history and insights
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/analyze')}
            sx={{ mr: 2 }}
          >
            New Analysis
          </Button>
          <Button variant="outlined" onClick={logout}>
            Logout
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h3">{stats.total}</Typography>
                <Typography variant="body1">Total Analyses</Typography>
              </Box>
              <Assessment sx={{ fontSize: 60, opacity: 0.7 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h3">{stats.highConfidence}</Typography>
                <Typography variant="body1">High Confidence</Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 60, opacity: 0.7 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h3">{stats.avgSkillMatch}%</Typography>
                <Typography variant="body1">Avg Skill Match</Typography>
              </Box>
              <History sx={{ fontSize: 60, opacity: 0.7 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Analysis History */}
      <Typography variant="h5" gutterBottom>
        Analysis History
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : analyses.length === 0 ? (
        <Alert severity="info">
          No analyses yet. Click "New Analysis" to get started!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {analyses.map((analysis) => (
            <Grid item xs={12} md={6} lg={4} key={analysis._id}>
              <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" component="div">
                      {analysis.prediction.careerRole}
                    </Typography>
                    <Chip
                      label={analysis.prediction.confidence}
                      size="small"
                      color={
                        analysis.prediction.confidence === 'High'
                          ? 'success'
                          : analysis.prediction.confidence === 'Medium'
                          ? 'warning'
                          : 'default'
                      }
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {analysis.inputData.degree} • {analysis.inputData.experience} years exp
                  </Typography>

                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Probability: {(analysis.prediction.probability * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Skill Match: {analysis.skillGap.overallMatch}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Salary: Rs.{analysis.prediction.salaryRange.average.toLocaleString()}
                    </Typography>
                  </Box>

                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(analysis.createdAt), 'PPp')}
                    </Typography>
                  </Box>
                </CardContent>

                <Box p={2} display="flex" justifyContent="space-between">
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/results/${analysis._id}`)}
                  >
                    View Details
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(analysis._id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Dashboard;
