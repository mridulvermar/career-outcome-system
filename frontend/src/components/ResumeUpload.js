import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Paper
} from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';
import { resumeAPI } from '../services/api';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

const ResumeUpload = ({ onUploadSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        setFileName(file.name);
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await resumeAPI.upload(formData);
            if (response.data.success) {
                onUploadSuccess(response.data.data);
            } else {
                setError(response.data.message || 'Failed to parse resume');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to upload resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MotionPaper
            variant="outlined"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
                p: 3,
                mb: 4,
                borderStyle: 'dashed',
                borderColor: 'primary.main',
                bgcolor: 'rgba(108, 99, 255, 0.05)',
                textAlign: 'center'
            }}
        >
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <CloudUpload color="primary" sx={{ fontSize: 48 }} />
                <Typography variant="h6" gutterBottom>
                    Auto-fill with Resume
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Upload your resume (PDF) and our AI will extract your skills and experience.
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Button
                    variant="contained"
                    component="label"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Description />}
                    sx={{ borderRadius: 20 }}
                >
                    {loading ? 'Parsing...' : 'Upload Resume'}
                    <input
                        type="file"
                        hidden
                        accept=".pdf"
                        onChange={handleFileChange}
                    />
                </Button>

                {fileName && !error && !loading && (
                    <Typography variant="caption" color="success.main" mt={1}>
                        Successfully parsed: {fileName}
                    </Typography>
                )}
            </Box>
        </MotionPaper>
    );
};

export default ResumeUpload;
