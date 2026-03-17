import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Send, Phone, Video, MoreVertical, Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { mockMessages, mockChatMessages, currentUser } from "@/data/mockData";

export default function MessagesPage() {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState(mockChatMessages);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  const activeConvo = mockMessages.find(m => m.id === selectedChat);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: `cm-${Date.now()}`, from: "me" as const, text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
    // Simulate reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `cm-${Date.now()}`,
        from: "them" as const,
        text: ["Sounds great! 😊", "Sure thing, neighbor!", "No problem at all!", "Happy to help! 🤝"][Math.floor(Math.random() * 4)],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }, 1500);
  };

  const filteredMessages = mockMessages.filter(m =>
    m.from.name.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedChat && activeConvo) {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
          <button onClick={() => setSelectedChat(null)} className="p-1 rounded-full hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
          <div className="relative">
            <img src={activeConvo.from.avatar} alt="" className="h-10 w-10 rounded-full bg-muted" />
            {activeConvo.online && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">{activeConvo.from.name}</h3>
            <span className="text-xs text-success">{activeConvo.online ? "Online" : "Offline"}</span>
          </div>
          <button className="p-2 rounded-full hover:bg-muted"><Phone className="h-4 w-4 text-muted-foreground" /></button>
          <button className="p-2 rounded-full hover:bg-muted"><Video className="h-4 w-4 text-muted-foreground" /></button>
          <button className="p-2 rounded-full hover:bg-muted"><MoreVertical className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.from === "me" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
              }`}>
                <p>{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${msg.from === "me" ? "justify-end" : ""}`}>
                  <span className="text-[10px] opacity-70">{msg.time}</span>
                  {msg.from === "me" && <CheckCheck className="h-3 w-3 opacity-70" />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card pb-20 lg:pb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-muted rounded-full px-4 py-2.5">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..." className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend}
              className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Send className="h-4 w-4 text-primary-foreground" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate("/")} className="p-1 rounded-full hover:bg-muted lg:hidden"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-display font-bold text-xl text-foreground flex-1">Messages</h1>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..."
              className="w-full h-9 pl-9 pr-4 rounded-full bg-muted text-sm outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Conversations */}
      <div className="divide-y divide-border">
        {filteredMessages.map((msg) => (
          <motion.button key={msg.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedChat(msg.id)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left">
            <div className="relative">
              <img src={msg.from.avatar} alt="" className="h-12 w-12 rounded-full bg-muted" />
              {msg.online && <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-success border-2 border-background" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">{msg.from.name}</span>
                <span className="text-xs text-muted-foreground">{msg.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{msg.lastMessage}</p>
            </div>
            {msg.unread > 0 && (
              <span className="h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                {msg.unread}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
