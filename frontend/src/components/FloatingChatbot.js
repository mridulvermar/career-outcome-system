import { useState } from "react";
import { sendMessageToBot } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
    Box,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    TextField,
    Paper,
    Typography,
    Avatar,
    CircularProgress,
} from "@mui/material";
import {
    Chat,
    Close,
    Send,
    SmartToy,
    Person,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const MotionPaper = motion(Paper);

const FloatingChatbot = ({ analysisData }) => {
    const { token } = useAuth();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMessage = { sender: "user", text: message };
        setChat([...chat, userMessage]);
        setMessage("");
        setLoading(true);

        try {
            console.log('Sending message to bot:', message);
            console.log('Analysis data:', analysisData);

            const data = await sendMessageToBot(message, token, analysisData);

            console.log('Received response from bot:', data);
            console.log('Bot reply text:', data.reply);

            const botReply = { sender: "bot", text: data.reply };
            setChat((prev) => [...prev, botReply]);
        } catch (error) {
            console.error('Chatbot error:', error);
            const errorReply = {
                sender: "bot",
                text: "Sorry, I encountered an error. Please try again.",
            };
            setChat((prev) => [...prev, errorReply]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <Fab
                color="primary"
                aria-label="chat"
                onClick={() => setOpen(true)}
                sx={{
                    position: "fixed",
                    bottom: 32,
                    right: 32,
                    background: "linear-gradient(45deg, #6C63FF 30%, #8F89FF 90%)",
                    boxShadow: "0 8px 20px rgba(108, 99, 255, 0.4)",
                    "&:hover": {
                        background: "linear-gradient(45deg, #5B54EE 30%, #7E78EE 90%)",
                        transform: "scale(1.1)",
                    },
                    transition: "all 0.3s ease",
                    zIndex: 1000,
                }}
            >
                <Chat sx={{ fontSize: 28 }} />
            </Fab>

            {/* Chat Dialog */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        minHeight: "600px",
                        maxHeight: "80vh",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 2,
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <SmartToy sx={{ fontSize: 28 }} />
                        <Typography variant="h6" fontWeight="bold">
                            Career Assistant
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => setOpen(false)}
                        sx={{ color: "white" }}
                        size="small"
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
                    {/* Chat Messages */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: "auto",
                            p: 3,
                            bgcolor: "#f5f5f5",
                            minHeight: "400px",
                        }}
                    >
                        {chat.length === 0 ? (
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                height="100%"
                                gap={2}
                            >
                                <SmartToy sx={{ fontSize: 64, color: "primary.main", opacity: 0.5 }} />
                                <Typography variant="body1" color="text.secondary" textAlign="center">
                                    Hi! I'm your career assistant. Ask me anything about your analysis results!
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                                    <Paper
                                        sx={{ p: 1, px: 2, cursor: "pointer", "&:hover": { bgcolor: "primary.light" } }}
                                        onClick={() => setMessage("What are my top skills?")}
                                    >
                                        <Typography variant="caption">What are my top skills?</Typography>
                                    </Paper>
                                    <Paper
                                        sx={{ p: 1, px: 2, cursor: "pointer", "&:hover": { bgcolor: "primary.light" } }}
                                        onClick={() => setMessage("How can I improve my chances?")}
                                    >
                                        <Typography variant="caption">How can I improve?</Typography>
                                    </Paper>
                                    <Paper
                                        sx={{ p: 1, px: 2, cursor: "pointer", "&:hover": { bgcolor: "primary.light" } }}
                                        onClick={() => setMessage("What skills should I learn?")}
                                    >
                                        <Typography variant="caption">What should I learn?</Typography>
                                    </Paper>
                                </Box>
                            </Box>
                        ) : (
                            <AnimatePresence>
                                {chat.map((msg, index) => (
                                    <MotionPaper
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            mb: 2,
                                            maxWidth: "80%",
                                            ml: msg.sender === "user" ? "auto" : 0,
                                            mr: msg.sender === "bot" ? "auto" : 0,
                                            bgcolor: msg.sender === "user" ? "primary.main" : "white",
                                            color: msg.sender === "user" ? "white" : "text.primary",
                                            borderRadius: 3,
                                        }}
                                    >
                                        <Box display="flex" alignItems="flex-start" gap={1}>
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: msg.sender === "user" ? "primary.dark" : "secondary.main",
                                                }}
                                            >
                                                {msg.sender === "user" ? <Person sx={{ fontSize: 20 }} /> : <SmartToy sx={{ fontSize: 20 }} />}
                                            </Avatar>
                                            <Box flexGrow={1}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        opacity: 0.8,
                                                        fontWeight: "bold",
                                                        display: "block",
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {msg.sender === "user" ? "You" : "Assistant"}
                                                </Typography>
                                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                                    {msg.text}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </MotionPaper>
                                ))}
                            </AnimatePresence>
                        )}
                        {loading && (
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <CircularProgress size={20} />
                                <Typography variant="caption" color="text.secondary">
                                    Assistant is typing...
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Input Area */}
                    <Box
                        sx={{
                            p: 2,
                            borderTop: "1px solid #e0e0e0",
                            bgcolor: "white",
                        }}
                    >
                        <Box display="flex" gap={1}>
                            <TextField
                                fullWidth
                                placeholder="Ask about your career analysis..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={loading}
                                variant="outlined"
                                size="small"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 3,
                                    },
                                }}
                            />
                            <IconButton
                                onClick={handleSend}
                                disabled={!message.trim() || loading}
                                color="primary"
                                sx={{
                                    bgcolor: "primary.main",
                                    color: "white",
                                    "&:hover": {
                                        bgcolor: "primary.dark",
                                    },
                                    "&:disabled": {
                                        bgcolor: "grey.300",
                                    },
                                }}
                            >
                                <Send />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default FloatingChatbot;
