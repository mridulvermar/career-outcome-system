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
  Fade,
} from '@mui/material';
import {
  Add,
  Visibility,
  Delete,
  TrendingUp,
  Assessment,
  History,
  RocketLaunch,
} from '@mui/icons-material';
import { analysisAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const MotionContainer = motion(Container);
const MotionCard = motion(Card);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <MotionContainer
      maxWidth="lg"
      sx={{ mt: 4, mb: 4 }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
        <Box>
          <Typography variant="h3" gutterBottom sx={{ background: 'linear-gradient(45deg, #6C63FF 30%, #2EC4B6 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Hello, {user?.name} 👋
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="400">
            Ready to shape your future today?
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<RocketLaunch />}
            onClick={() => navigate('/analyze')}
            sx={{ mr: 2, px: 4, py: 1.5 }}
          >
            New Analysis
          </Button>
          <Button variant="outlined" color="inherit" onClick={logout} sx={{ py: 1.5 }}>
            Logout
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={6}>
        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', overflow: 'hidden', position: 'relative' }}>
              <Box position="absolute" right={-20} top={-20} sx={{ opacity: 0.1 }}>
                <Assessment sx={{ fontSize: 150 }} />
              </Box>
              <Box display="flex" flexDirection="column" position="relative" zIndex={1}>
                <Typography variant="h2" fontWeight="800">{stats.total}</Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Total Analyses</Typography>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', overflow: 'hidden', position: 'relative' }}>
              <Box position="absolute" right={-20} top={-20} sx={{ opacity: 0.1 }}>
                <TrendingUp sx={{ fontSize: 150 }} />
              </Box>
              <Box display="flex" flexDirection="column" position="relative" zIndex={1}>
                <Typography variant="h2" fontWeight="800">{stats.highConfidence}</Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>High Confidence</Typography>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', overflow: 'hidden', position: 'relative' }}>
              <Box position="absolute" right={-20} top={-20} sx={{ opacity: 0.1 }}>
                <History sx={{ fontSize: 150 }} />
              </Box>
              <Box display="flex" flexDirection="column" position="relative" zIndex={1}>
                <Typography variant="h2" fontWeight="800">{stats.avgSkillMatch}%</Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Avg Skill Match</Typography>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Analysis History */}
      <Box display="flex" alignItems="center" mb={3}>
        <History sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="h5" fontWeight="700">
          Recent Analyses
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={8}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : analyses.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Alert severity="info" sx={{ borderRadius: 3, p: 2 }}>
            No analyses found. Start your first career analysis now!
          </Alert>
        </motion.div>
      ) : (
        <Grid container spacing={3}>
          {analyses.map((analysis) => (
            <Grid item xs={12} md={6} lg={4} key={analysis._id}>
              <MotionCard
                variants={itemVariants}
                layout
                whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.6)' }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Chip
                      label={analysis.prediction.careerRole}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 'bold', fontSize: '0.9rem', borderColor: 'primary.light' }}
                    />
                    <IconButton
                      size="small"
                      sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                      onClick={() => handleDelete(analysis._id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography variant="h4" gutterBottom fontWeight="700" color="text.primary">
                    {(analysis.prediction.probability * 100).toFixed(0)}%
                    <Typography component="span" variant="body2" color="text.secondary" ml={1}>
                      Probability
                    </Typography>
                  </Typography>

                  <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
                    <Chip
                      label={analysis.prediction.confidence + " Confidence"}
                      size="small"
                      sx={{
                        bgcolor: analysis.prediction.confidence === 'High' ? 'success.light' : 'warning.light',
                        color: analysis.prediction.confidence === 'High' ? 'success.dark' : 'warning.dark',
                        fontWeight: 'bold'
                      }}
                    />
                    <Chip
                      label={`${analysis.skillGap.overallMatch}% Match`}
                      size="small"
                      sx={{ bgcolor: 'secondary.light', color: 'secondary.dark', fontWeight: 'bold' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Assessment sx={{ fontSize: 16, mr: 1, opacity: 0.7 }} />
                    {analysis.inputData.degree} • {analysis.inputData.experience}y Exp
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ fontSize: 16, mr: 1, opacity: 0.7 }} />
                    Max: Rs.{analysis.prediction.salaryRange.max.toLocaleString()}
                  </Typography>
                </CardContent>

                <Box p={2} pt={0}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/results/${analysis._id}`)}
                    sx={{ borderRadius: 3, py: 1, background: 'linear-gradient(45deg, #6C63FF 30%, #8F89FF 90%)' }}
                  >
                    View Report
                  </Button>
                </Box>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      )}
    </MotionContainer>
  );
}

export default Dashboard;
