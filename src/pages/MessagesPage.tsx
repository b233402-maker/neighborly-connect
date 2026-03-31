import { useState, useEffect, useRef } from "react";
import { Search, Send, Phone, Video, MoreVertical, CheckCheck, Smile, Paperclip, Mic, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { useConversations, useConversationMessages, useSendMessage, useUploadAttachment } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";
import { useIsUserOnline, useTypingIndicator } from "@/hooks/usePresence";

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function OnlineIndicator({ className = "" }: { className?: string }) {
  return (
    <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-success ring-2 ring-card ${className}`} />
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          className="block h-2 w-2 rounded-full bg-muted-foreground" />
        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          className="block h-2 w-2 rounded-full bg-muted-foreground" />
        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          className="block h-2 w-2 rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}

function ChatHeader({ activeConvo, onBack }: { activeConvo: any; onBack: () => void }) {
  const isOnline = useIsUserOnline(activeConvo.otherUser.user_id);

  return (
    <div className="flex items-center gap-3 p-4 border-b border-border bg-card shrink-0">
      <button onClick={onBack} className="p-1 rounded-full hover:bg-muted lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div className="relative">
        <img src={activeConvo.otherUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeConvo.otherUser.user_id}`} alt="" className="h-10 w-10 rounded-full bg-muted" />
        {isOnline && <OnlineIndicator />}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm text-foreground">{activeConvo.otherUser.display_name}</h3>
        <span className={`text-[11px] ${isOnline ? "text-success" : "text-muted-foreground"}`}>
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-muted"><Phone className="h-4 w-4 text-muted-foreground" /></button>
        <button className="p-2 rounded-full hover:bg-muted"><Video className="h-4 w-4 text-muted-foreground" /></button>
        <button className="p-2 rounded-full hover:bg-muted"><MoreVertical className="h-4 w-4 text-muted-foreground" /></button>
      </div>
    </div>
  );
}

function ConversationListItem({ conv, onSelect }: { conv: any; onSelect: (id: string) => void }) {
  const isOnline = useIsUserOnline(conv.otherUser.user_id);

  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={() => onSelect(conv.id)}
      className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left">
      <div className="relative shrink-0">
        <img src={conv.otherUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.otherUser.user_id}`} alt="" className="h-12 w-12 rounded-full bg-muted" />
        {isOnline && <OnlineIndicator />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${conv.unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{conv.otherUser.display_name}</span>
          {conv.lastMessage && (
            <span className={`text-xs ${conv.unreadCount > 0 ? "text-primary font-medium" : "text-muted-foreground"}`}>
              {getTimeAgo(conv.lastMessage.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isOnline && <span className="block h-1.5 w-1.5 rounded-full bg-success shrink-0" />}
          <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            {conv.lastMessage?.attachment_url ? (
              <span className="inline-flex items-center gap-1">
                {conv.lastMessage.attachment_type?.startsWith('image/') ? <ImageIcon className="h-3 w-3 inline" /> : <FileText className="h-3 w-3 inline" />}
                {conv.lastMessage.content?.startsWith('📎') ? conv.lastMessage.attachment_name || 'File' : conv.lastMessage.content || 'Attachment'}
              </span>
            ) : conv.lastMessage?.content || 'No messages yet'}
          </p>
        </div>
      </div>
      {conv.unreadCount > 0 && (
        <span className="h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5 shrink-0">
          {conv.unreadCount}
        </span>
      )}
    </motion.button>
  );
}

function AttachmentPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = file.type.startsWith('image/');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isImage]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="relative inline-flex items-center gap-2 bg-muted rounded-xl p-2 pr-8 border border-border">
      {isImage && preview ? (
        <img src={preview} alt="" className="h-12 w-12 rounded-lg object-cover" />
      ) : (
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{file.name}</p>
        <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
      </div>
      <button onClick={onRemove} className="absolute top-1 right-1 p-0.5 rounded-full bg-foreground/10 hover:bg-foreground/20">
        <X className="h-3 w-3 text-foreground" />
      </button>
    </motion.div>
  );
}

function MessageAttachment({ url, type, name, isMine }: { url: string; type: string; name: string; isMine: boolean }) {
  const isImage = type?.startsWith('image/');

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-1.5 -mx-1">
        <img src={url} alt={name || 'Image'} className="max-w-full max-h-52 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity" />
      </a>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className={`flex items-center gap-2 mt-1.5 px-3 py-2 rounded-xl transition-colors ${
        isMine ? "bg-primary-foreground/10 hover:bg-primary-foreground/20" : "bg-muted hover:bg-muted/80"
      }`}>
      <FileText className="h-4 w-4 shrink-0" />
      <span className="text-xs truncate max-w-[150px]">{name || 'File'}</span>
    </a>
  );
}

function ChatView({ activeConvo, selectedChat, onBack }: { activeConvo: any; selectedChat: string; onBack: () => void }) {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const { data: messages } = useConversationMessages(selectedChat);
  const sendMessage = useSendMessage();
  const uploadAttachment = useUploadAttachment();
  const { typingUserId, sendTyping } = useTypingIndicator(selectedChat);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingThrottleRef = useRef<number>(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUserId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    const now = Date.now();
    if (now - typingThrottleRef.current > 2000) {
      typingThrottleRef.current = now;
      sendTyping();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        return; // 10MB limit
      }
      setPendingFile(file);
    }
    e.target.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !pendingFile) || !selectedChat) return;

    const content = input.trim() || (pendingFile ? `📎 ${pendingFile.name}` : '');

    if (pendingFile) {
      const file = pendingFile;
      setPendingFile(null);
      setInput("");

      uploadAttachment.mutate(file, {
        onSuccess: (result) => {
          sendMessage.mutate({
            conversationId: selectedChat,
            content,
            attachmentUrl: result.url,
            attachmentType: result.type,
            attachmentName: result.name,
          });
        },
      });
    } else {
      sendMessage.mutate({ conversationId: selectedChat, content });
      setInput("");
    }
  };

  const isSending = uploadAttachment.isPending || sendMessage.isPending;

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)] lg:h-[calc(100vh-5rem)] bg-card rounded-2xl border border-border overflow-hidden">
      <ChatHeader activeConvo={activeConvo} onBack={onBack} />

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
        <div className="text-center py-2">
          <span className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full">Messages</span>
        </div>
        {(messages || []).map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
            {msg.sender_id !== user?.id && (
              <img src={msg.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`} alt="" className="h-7 w-7 rounded-full bg-muted mr-2 self-end" />
            )}
            <div className={`max-w-[70%] px-4 py-2.5 text-sm ${
              msg.sender_id === user?.id ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md" : "bg-card text-foreground rounded-2xl rounded-bl-md border border-border"
            }`}>
              {msg.attachment_url && (
                <MessageAttachment
                  url={msg.attachment_url}
                  type={msg.attachment_type || ''}
                  name={msg.attachment_name || ''}
                  isMine={msg.sender_id === user?.id}
                />
              )}
              {msg.content && !(msg.attachment_url && msg.content.startsWith('📎')) && (
                <p>{msg.content}</p>
              )}
              <div className={`flex items-center gap-1 mt-1 ${msg.sender_id === user?.id ? "justify-end" : ""}`}>
                <span className="text-[10px] opacity-60">{getTimeAgo(msg.created_at)}</span>
                {msg.sender_id === user?.id && <CheckCheck className="h-3 w-3 opacity-60" />}
              </div>
            </div>
          </motion.div>
        ))}
        {typingUserId && <TypingBubble />}
        {messages?.length === 0 && !typingUserId && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No messages yet. Say hello! 👋</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border bg-card shrink-0 space-y-2">
        <AnimatePresence>
          {pendingFile && (
            <AttachmentPreview file={pendingFile} onRemove={() => setPendingFile(null)} />
          )}
        </AnimatePresence>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.xlsx,.csv" />
          <button onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-muted shrink-0">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex-1 flex items-center bg-muted rounded-2xl px-4 py-2.5">
            <input value={input} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && !isSending && handleSend()}
              placeholder="Type a message..." className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
            <button className="ml-2"><Smile className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          {(input.trim() || pendingFile) ? (
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={isSending}
              className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0 disabled:opacity-50">
              {isSending ? <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" /> : <Send className="h-4 w-4 text-primary-foreground" />}
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
}

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState<string | null>(searchParams.get('chat'));
  const [search, setSearch] = useState("");

  useEffect(() => {
    const chatParam = searchParams.get('chat');
    if (chatParam) setSelectedChat(chatParam);
  }, [searchParams]);

  const { data: conversations, isLoading: loadingConvos } = useConversations();
  const activeConvo = conversations?.find((c) => c.id === selectedChat);
  const filteredConvos = (conversations || []).filter((c) =>
    c.otherUser.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
    <div className="lg:col-span-1 xl:col-span-2">
      {/* Hide title on mobile when chat is open */}
      <h1 className={`font-display font-bold text-2xl text-foreground mb-4 ${selectedChat && activeConvo ? 'hidden lg:block' : ''}`}>Messages</h1>
      <div className="hidden lg:grid lg:grid-cols-[320px_1fr] gap-4">
        <div>
          <ConversationList
            search={search} setSearch={setSearch}
            loading={loadingConvos} conversations={filteredConvos}
            onSelect={setSelectedChat}
          />
        </div>
        <div>
          {selectedChat && activeConvo ? (
            <ChatView activeConvo={activeConvo} selectedChat={selectedChat} onBack={() => setSelectedChat(null)} />
          ) : (
            <div className="flex items-center justify-center h-[calc(100vh-10rem)] bg-card rounded-2xl border border-border">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Send className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">Your Messages</h3>
                <p className="text-sm text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="lg:hidden">
        {selectedChat && activeConvo ? (
          <ChatView activeConvo={activeConvo} selectedChat={selectedChat} onBack={() => setSelectedChat(null)} />
        ) : (
          <ConversationList
            search={search} setSearch={setSearch}
            loading={loadingConvos} conversations={filteredConvos}
            onSelect={setSelectedChat}
          />
        )}
      </div>
    </div>
    {/* Hide mobile nav when chat is active on mobile */}
    {selectedChat && activeConvo && (
      <style>{`@media (max-width: 1023px) { .mobile-nav-bar { display: none !important; } }`}</style>
    )}
    </AppLayout>
  );
}

function ConversationList({ search, setSearch, loading, conversations, onSelect }: {
  search: string; setSearch: (s: string) => void; loading: boolean; conversations: any[]; onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-0">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..."
            className="w-full h-10 pl-9 pr-4 rounded-2xl bg-card text-sm outline-none text-foreground placeholder:text-muted-foreground border border-border focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      )}
      {!loading && conversations.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
          {conversations.map((conv) => (
            <ConversationListItem key={conv.id} conv={conv} onSelect={onSelect} />
          ))}
        </div>
      )}
      {!loading && conversations.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Send className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">No conversations yet</h3>
          <p className="text-sm text-muted-foreground">Start by helping a neighbor!</p>
        </div>
      )}
    </div>
  );
}
