import { useState } from "react";
import { sendMessageToBot } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Chatbot = () => {
    const { token } = useAuth();
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMessage = { sender: "user", text: message };
        setChat([...chat, userMessage]);

        const data = await sendMessageToBot(message, token);

        const botReply = { sender: "bot", text: data.reply };
        setChat(prev => [...prev, botReply]);

        setMessage("");
    };

    return (
        <div style={{ border: "1px solid #ccc", padding: "15px" }}>
            <h3>Career Assistant 🤖</h3>

            <div style={{ height: "300px", overflowY: "auto" }}>
                {chat.map((msg, index) => (
                    <div key={index} style={{
                        textAlign: msg.sender === "user" ? "right" : "left"
                    }}>
                        <p><strong>{msg.sender}:</strong> {msg.text}</p>
                    </div>
                ))}
            </div>

            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about your career..."
            />

            <button onClick={handleSend}>Send</button>
        </div>
    );
};

export default Chatbot;
