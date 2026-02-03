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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { toast } from 'react-toastify';

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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Career Outcome Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph align="center">
          Fill in your details to get personalized career predictions and insights
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Degree Selection */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Degree / Field of Study</InputLabel>
            <Select
              value={formData.degree}
              onChange={handleChange('degree')}
              label="Degree / Field of Study"
            >
              {DEGREES.map((degree) => (
                <MenuItem key={degree} value={degree}>
                  {degree}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Skills Selection */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Skills</InputLabel>
            <Select
              multiple
              value={formData.skills}
              onChange={handleChange('skills')}
              input={<OutlinedInput label="Skills" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {AVAILABLE_SKILLS.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  {skill}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Experience */}
          <TextField
            fullWidth
            margin="normal"
            label="Years of Experience"
            type="number"
            value={formData.experience}
            onChange={handleChange('experience')}
            required
            inputProps={{ min: 0, max: 50 }}
          />

          {/* Interests */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Career Interests</InputLabel>
            <Select
              multiple
              value={formData.interests}
              onChange={handleChange('interests')}
              input={<OutlinedInput label="Career Interests" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" color="primary" />
                  ))}
                </Box>
              )}
            >
              {INTERESTS.map((interest) => (
                <MenuItem key={interest} value={interest}>
                  {interest}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Education Level */}
          <FormControl fullWidth margin="normal">
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

          {/* Submit Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Analyzing...
              </>
            ) : (
              'Analyze Career Outcomes'
            )}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default AnalysisForm;
