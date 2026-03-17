import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Send, Phone, Video, MoreVertical, CheckCheck, Smile, Paperclip, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { mockMessages, mockChatMessages, currentUser } from "@/data/mockData";
import { AppLayout } from "@/components/layout/AppLayout";

export default function MessagesPage() {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState(mockChatMessages);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  const activeConvo = mockMessages.find(m => m.id === selectedChat);
  const filteredMessages = mockMessages.filter(m => m.from.name.toLowerCase().includes(search.toLowerCase()));

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: `cm-${Date.now()}`, from: "me" as const, text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `cm-${Date.now()}`, from: "them" as const,
        text: ["Sounds great! 😊", "Sure thing, neighbor!", "No problem at all!", "Happy to help! 🤝"][Math.floor(Math.random() * 4)],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }, 1500);
  };

  const chatView = activeConvo && (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-5rem)] bg-card rounded-2xl border border-border overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card shrink-0">
        <button onClick={() => setSelectedChat(null)} className="p-1 rounded-full hover:bg-muted lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="relative">
          <img src={activeConvo.from.avatar} alt="" className="h-10 w-10 rounded-full bg-muted" />
          {activeConvo.online && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success border-2 border-card" />}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-foreground">{activeConvo.from.name}</h3>
          <span className="text-xs text-success">{activeConvo.online ? "Online" : "Offline"}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-muted"><Phone className="h-4 w-4 text-muted-foreground" /></button>
          <button className="p-2 rounded-full hover:bg-muted"><Video className="h-4 w-4 text-muted-foreground" /></button>
          <button className="p-2 rounded-full hover:bg-muted"><MoreVertical className="h-4 w-4 text-muted-foreground" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
        <div className="text-center py-2">
          <span className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full">Today</span>
        </div>
        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
            {msg.from !== "me" && <img src={activeConvo.from.avatar} alt="" className="h-7 w-7 rounded-full bg-muted mr-2 self-end" />}
            <div className={`max-w-[70%] px-4 py-2.5 text-sm ${
              msg.from === "me" ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md" : "bg-card text-foreground rounded-2xl rounded-bl-md border border-border"
            }`}>
              <p>{msg.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${msg.from === "me" ? "justify-end" : ""}`}>
                <span className="text-[10px] opacity-60">{msg.time}</span>
                {msg.from === "me" && <CheckCheck className="h-3 w-3 opacity-60" />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-muted shrink-0"><Paperclip className="h-4 w-4 text-muted-foreground" /></button>
          <div className="flex-1 flex items-center bg-muted rounded-2xl px-4 py-2.5">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..." className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
            <button className="ml-2"><Smile className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          {input.trim() ? (
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Send className="h-4 w-4 text-primary-foreground" />
            </motion.button>
          ) : (
            <button className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Mic className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const listView = (
    <div className="space-y-0">
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..."
            className="w-full h-10 pl-9 pr-4 rounded-2xl bg-card text-sm outline-none text-foreground placeholder:text-muted-foreground border border-border focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      {/* Online avatars */}
      <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
        {mockMessages.filter(m => m.online).map(m => (
          <button key={m.id} onClick={() => setSelectedChat(m.id)} className="flex flex-col items-center gap-1 shrink-0">
            <div className="relative">
              <img src={m.from.avatar} alt="" className="h-14 w-14 rounded-full bg-muted border-2 border-success/30" />
              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-success border-2 border-background" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">{m.from.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Conversations */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
        {filteredMessages.map((msg) => (
          <motion.button key={msg.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedChat(msg.id)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left">
            <div className="relative shrink-0">
              <img src={msg.from.avatar} alt="" className="h-12 w-12 rounded-full bg-muted" />
              {msg.online && <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-success border-2 border-card" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${msg.unread > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{msg.from.name}</span>
                <span className={`text-xs ${msg.unread > 0 ? "text-primary font-medium" : "text-muted-foreground"}`}>{msg.time}</span>
              </div>
              <p className={`text-sm truncate ${msg.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{msg.lastMessage}</p>
            </div>
            {msg.unread > 0 && (
              <span className="h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5 shrink-0">
                {msg.unread}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="lg:col-span-1 xl:col-span-2">
        <h1 className="font-display font-bold text-2xl text-foreground mb-4">Messages</h1>
        {/* Desktop: split view, Mobile: single view */}
        <div className="hidden lg:grid lg:grid-cols-[320px_1fr] gap-4">
          <div>{listView}</div>
          <div>{selectedChat && activeConvo ? chatView : (
            <div className="flex items-center justify-center h-[calc(100vh-10rem)] bg-card rounded-2xl border border-border">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Send className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">Your Messages</h3>
                <p className="text-sm text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            </div>
          )}</div>
        </div>
        <div className="lg:hidden">
          {selectedChat && activeConvo ? chatView : listView}
        </div>
      </div>
    </AppLayout>
  );
}
