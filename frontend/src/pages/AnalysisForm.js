import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  OutlinedInput,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { AutoAwesome, School, Code, Work } from '@mui/icons-material';
import ResumeUpload from '../components/ResumeUpload';

const MotionPaper = motion(Paper);

const DEGREES = [
  'Computer Science',
  'Data Science',
  'Business',
  'Engineering',
  'Information Technology',
  'Mathematics',
];

const AVAILABLE_SKILLS = [
  'Python', 'JavaScript', 'Java', 'C++', 'SQL', 'Git',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
  'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask',
  'Machine Learning', 'Deep Learning', 'Data Analysis', 'Statistics',
  'TensorFlow', 'PyTorch', 'Scikit-learn',
  'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'CI/CD', 'DevOps', 'Linux', 'Networking',
  'Agile', 'Scrum', 'Project Management',
  'Communication', 'Problem Solving', 'Teamwork', 'Leadership',
];

const INTERESTS = [
  'Software Development',
  'Data Science',
  'Machine Learning',
  'Web Development',
  'Mobile Development',
  'Cloud Computing',
  'Cybersecurity',
  'DevOps',
  'Product Management',
  'Business Analysis',
  'Consulting',
  'Research',
];

function AnalysisForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    degree: '',
    skills: [],
    experience: 0,
    interests: [],
    education: '',
    certifications: [],
  });

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    setError('');
  };

  const handleResumeParsed = (data) => {
    setFormData((prev) => ({
      ...prev,
      skills: [...new Set([...prev.skills, ...data.skills])],
    }));
    toast.success(`Extracted ${data.skills.length} skills from resume!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.degree) {
      setError('Please select a degree');
      return;
    }
    if (formData.skills.length === 0) {
      setError('Please select at least one skill');
      return;
    }
    if (formData.experience < 0) {
      setError('Experience cannot be negative');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await analysisAPI.create(formData);
      toast.success('Analysis created successfully!');
      navigate(`/results/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create analysis');
      toast.error('Failed to create analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <MotionPaper
        elevation={0}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        sx={{
          p: 6,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
        }}
      >
        <Box textAlign="center" mb={4}>
          <Box
            sx={{
              display: 'inline-flex',
              p: 2,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6C63FF 0%, #4B45B2 100%)',
              color: 'white',
              mb: 2,
              boxShadow: '0 10px 20px rgba(108, 99, 255, 0.3)'
            }}
          >
            <AutoAwesome fontSize="large" />
          </Box>
          <Typography variant="h3" gutterBottom fontWeight="800">
            Career Outcome Analysis
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="400">
            Let AI predict your perfect career path based on your profile
          </Typography>
        </Box>

        <ResumeUpload onUploadSuccess={handleResumeParsed} />

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* Degree Selection */}
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight="600" display="flex" alignItems="center">
                <School sx={{ mr: 1, color: 'primary.main' }} /> Education Profile
              </Typography>
              <Box display="flex" gap={2}>
                <FormControl fullWidth required>
                  <InputLabel>Degree / Field of Study</InputLabel>
                  <Select
                    value={formData.degree}
                    onChange={handleChange('degree')}
                    label="Degree / Field of Study"
                  >
                    {DEGREES.map((degree) => (
                      <MenuItem key={degree} value={degree}>{degree}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Education Level</InputLabel>
                  <Select
                    value={formData.education}
                    onChange={handleChange('education')}
                    label="Education Level"
                  >
                    <MenuItem value="Bachelor's">Bachelor's Degree</MenuItem>
                    <MenuItem value="Master's">Master's Degree</MenuItem>
                    <MenuItem value="PhD">PhD</MenuItem>
                    <MenuItem value="Bootcamp">Bootcamp</MenuItem>
                    <MenuItem value="Self-taught">Self-taught</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Skills Selection */}
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight="600" display="flex" alignItems="center">
                <Code sx={{ mr: 1, color: 'secondary.main' }} /> Technical Skills
              </Typography>
              <FormControl fullWidth required>
                <InputLabel>Skills & Technologies</InputLabel>
                <Select
                  multiple
                  value={formData.skills}
                  onChange={handleChange('skills')}
                  input={<OutlinedInput label="Skills & Technologies" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 'bold' }} />
                      ))}
                    </Box>
                  )}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                >
                  {AVAILABLE_SKILLS.map((skill) => (
                    <MenuItem key={skill} value={skill}>{skill}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Experience & Interests */}
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight="600" display="flex" alignItems="center">
                <Work sx={{ mr: 1, color: 'success.main' }} /> Experience & Interests
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Years of Experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleChange('experience')}
                    required
                    inputProps={{ min: 0, max: 50 }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <FormControl fullWidth>
                    <InputLabel>Career Interests</InputLabel>
                    <Select
                      multiple
                      value={formData.interests}
                      onChange={handleChange('interests')}
                      input={<OutlinedInput label="Career Interests" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" color="secondary" variant="outlined" />
                          ))}
                        </Box>
                      )}
                    >
                      {INTERESTS.map((interest) => (
                        <MenuItem key={interest} value={interest}>{interest}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Submit Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                py: 2,
                fontSize: '1.2rem',
                borderRadius: 3,
                boxShadow: '0 8px 16px rgba(108, 99, 255, 0.3)'
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 2, color: 'white' }} />
                  Running AI Analysis...
                </>
              ) : (
                'Generate Career Prediction'
              )}
            </Button>
          </Box>
        </form>
      </MotionPaper>
    </Container>
  );
}

export default AnalysisForm;
