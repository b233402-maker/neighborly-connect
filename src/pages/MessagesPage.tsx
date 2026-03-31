import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Send, Phone, Video, CheckCheck, Smile, Paperclip, X, FileText, Image as ImageIcon, Loader2, ArrowLeft, Info, ThumbsUp, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { useConversations, useConversationMessages, useSendMessage, useUploadAttachment } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";
import { useIsUserOnline, useTypingIndicator } from "@/hooks/usePresence";

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 0) return timeStr;
  if (diffDays === 1) return `Yesterday ${timeStr}`;
  if (diffDays < 7) return `${date.toLocaleDateString([], { weekday: 'short' })} ${timeStr}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`;
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function OnlineIndicator({ className = "" }: { className?: string }) {
  return <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-success ring-2 ring-card ${className}`} />;
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2 pl-10">
      <div className="bg-muted rounded-[18px] rounded-bl-[4px] px-4 py-2.5 flex items-center gap-1">
        {[0, 0.2, 0.4].map((d) => (
          <motion.span key={d} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: d }}
            className="block h-[6px] w-[6px] rounded-full bg-muted-foreground" />
        ))}
      </div>
    </div>
  );
}

function ChatHeader({ activeConvo, onBack }: { activeConvo: any; onBack: () => void }) {
  const isOnline = useIsUserOnline(activeConvo.otherUser.user_id);
  const avatar = activeConvo.otherUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeConvo.otherUser.user_id}`;
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border bg-card shrink-0">
      <button onClick={onBack} className="p-1.5 -ml-1 rounded-full hover:bg-muted lg:hidden text-primary">
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="relative">
        <img src={avatar} alt="" className="h-9 w-9 rounded-full bg-muted" />
        {isOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-success ring-[1.5px] ring-card" />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[15px] text-foreground leading-tight truncate">{activeConvo.otherUser.display_name}</h3>
        <span className={`text-[11px] leading-tight ${isOnline ? "text-success" : "text-muted-foreground"}`}>
          {isOnline ? "Active now" : "Offline"}
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        <button className="p-2 rounded-full hover:bg-muted"><Phone className="h-5 w-5 text-primary" /></button>
        <button className="p-2 rounded-full hover:bg-muted"><Video className="h-5 w-5 text-primary" /></button>
      </div>
    </div>
  );
}

function ConversationListItem({ conv, onSelect }: { conv: any; onSelect: (id: string) => void }) {
  const isOnline = useIsUserOnline(conv.otherUser.user_id);
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={() => onSelect(conv.id)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 active:bg-muted/70 transition-colors text-left">
      <div className="relative shrink-0">
        <img src={conv.otherUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.otherUser.user_id}`} alt="" className="h-14 w-14 rounded-full bg-muted" />
        {isOnline && <span className="absolute bottom-0.5 right-0.5 block h-3.5 w-3.5 rounded-full bg-success ring-2 ring-card" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[15px] truncate ${conv.unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>{conv.otherUser.display_name}</span>
          {conv.lastMessage && (
            <span className={`text-xs shrink-0 ${conv.unreadCount > 0 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              {getTimeAgo(conv.lastMessage.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className={`text-[13px] truncate ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            {conv.lastMessage?.attachment_url ? (
              <span className="inline-flex items-center gap-1">
                {conv.lastMessage.attachment_type?.startsWith('image/') ? <ImageIcon className="h-3 w-3 inline" /> : <FileText className="h-3 w-3 inline" />}
                {conv.lastMessage.content?.startsWith('📎') ? conv.lastMessage.attachment_name || 'File' : conv.lastMessage.content || 'Attachment'}
              </span>
            ) : conv.lastMessage?.content || 'No messages yet'}
          </p>
          {conv.unreadCount > 0 && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
        </div>
      </div>
    </motion.button>
  );
}

function AttachmentPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = file.type.startsWith('image/');
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (isImage) { const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }
  }, [file, isImage]);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="relative inline-flex items-center gap-2 bg-muted rounded-xl p-2 pr-8">
      {isImage && preview ? <img src={preview} alt="" className="h-14 w-14 rounded-lg object-cover" /> : (
        <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{file.name}</p>
        <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
      </div>
      <button onClick={onRemove} className="absolute top-1 right-1 p-1 rounded-full bg-foreground/20 hover:bg-foreground/30">
        <X className="h-3 w-3 text-card" />
      </button>
    </motion.div>
  );
}

function MessageAttachment({ url, type, name, isMine }: { url: string; type: string; name: string; isMine: boolean }) {
  const isImage = type?.startsWith('image/');
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block -mx-1 -my-0.5">
        <img src={url} alt={name || 'Image'} className="max-w-full max-h-52 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity" />
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${isMine ? "bg-primary-foreground/15 hover:bg-primary-foreground/25" : "bg-background hover:bg-muted"}`}>
      <FileText className="h-4 w-4 shrink-0" />
      <span className="text-xs truncate max-w-[150px]">{name || 'File'}</span>
    </a>
  );
}

function groupMessages(messages: any[]) {
  if (!messages?.length) return [];
  const groups: { senderId: string; messages: any[]; timeLabel: string | null }[] = [];
  const TIME_GAP = 15 * 60 * 1000;
  const GROUP_GAP = 5 * 60 * 1000;

  messages.forEach((msg, i) => {
    const prev = i > 0 ? messages[i - 1] : null;
    const gap = prev ? new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() : Infinity;
    const needsLabel = gap > TIME_GAP;
    const continueGroup = prev?.sender_id === msg.sender_id && gap < GROUP_GAP && !needsLabel;

    if (continueGroup && groups.length > 0) {
      groups[groups.length - 1].messages.push(msg);
    } else {
      groups.push({ senderId: msg.sender_id, messages: [msg], timeLabel: needsLabel ? formatMessageTime(msg.created_at) : null });
    }
  });
  return groups;
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
  const messageGroups = useMemo(() => groupMessages(messages || []), [messages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typingUserId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    const now = Date.now();
    if (now - typingThrottleRef.current > 2000) { typingThrottleRef.current = now; sendTyping(); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) setPendingFile(file);
    e.target.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !pendingFile) || !selectedChat) return;
    const content = input.trim() || (pendingFile ? `📎 ${pendingFile.name}` : '');
    if (pendingFile) {
      const file = pendingFile; setPendingFile(null); setInput("");
      uploadAttachment.mutate(file, {
        onSuccess: (r) => sendMessage.mutate({ conversationId: selectedChat, content, attachmentUrl: r.url, attachmentType: r.type, attachmentName: r.name }),
      });
    } else { sendMessage.mutate({ conversationId: selectedChat, content }); setInput(""); }
  };

  const isSending = uploadAttachment.isPending || sendMessage.isPending;
  const otherAvatar = activeConvo.otherUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeConvo.otherUser.user_id}`;

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)] lg:h-[calc(100vh-5rem)] bg-background lg:bg-card lg:rounded-2xl lg:border lg:border-border overflow-hidden">
      <ChatHeader activeConvo={activeConvo} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {messages && messages.length > 0 && (
          <div className="flex flex-col items-center py-4 mb-2">
            <img src={otherAvatar} alt="" className="h-16 w-16 rounded-full bg-muted mb-2" />
            <p className="font-semibold text-foreground text-[15px]">{activeConvo.otherUser.display_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">You're connected on Neighborly</p>
          </div>
        )}

        {messageGroups.map((group, gi) => {
          const isMine = group.senderId === user?.id;
          return (
            <div key={gi}>
              {group.timeLabel && (
                <div className="flex justify-center py-3">
                  <span className="text-[11px] text-muted-foreground font-medium">{group.timeLabel}</span>
                </div>
              )}
              <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} gap-[2px] mb-2`}>
                {group.messages.map((msg: any, mi: number) => {
                  const isLast = mi === group.messages.length - 1;
                  const isFirst = mi === 0;
                  const isOnly = group.messages.length === 1;
                  const isEmojiOnly = /^[\p{Emoji}\s]{1,5}$/u.test(msg.content) && !msg.attachment_url;

                  // Messenger-style bubble corners
                  let r: string;
                  if (isMine) {
                    if (isOnly) r = "rounded-[18px] rounded-br-[4px]";
                    else if (isFirst) r = "rounded-[18px] rounded-br-[4px]";
                    else if (isLast) r = "rounded-[18px] rounded-tr-[4px]";
                    else r = "rounded-[18px] rounded-tr-[4px] rounded-br-[4px]";
                  } else {
                    if (isOnly) r = "rounded-[18px] rounded-bl-[4px]";
                    else if (isFirst) r = "rounded-[18px] rounded-bl-[4px]";
                    else if (isLast) r = "rounded-[18px] rounded-tl-[4px]";
                    else r = "rounded-[18px] rounded-tl-[4px] rounded-bl-[4px]";
                  }

                  return (
                    <div key={msg.id} className={`flex items-end gap-2 max-w-[75%] ${isMine ? "flex-row-reverse" : ""}`}>
                      {!isMine && (
                        <div className="w-7 shrink-0">
                          {isLast && <img src={msg.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`} alt="" className="h-7 w-7 rounded-full bg-muted" />}
                        </div>
                      )}
                      {isEmojiOnly ? (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-3xl leading-none py-1 px-0.5">{msg.content}</motion.div>
                      ) : (
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          className={`px-3 py-[7px] text-[15px] leading-snug ${r} ${isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                          {msg.attachment_url && <MessageAttachment url={msg.attachment_url} type={msg.attachment_type || ''} name={msg.attachment_name || ''} isMine={isMine} />}
                          {msg.content && !(msg.attachment_url && msg.content.startsWith('📎')) && <p>{msg.content}</p>}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
                {/* Time under the last bubble of each group */}
                <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end pr-1" : "justify-start pl-9"}`}>
                  <span className="text-[10px] text-muted-foreground">{formatMessageTime(group.messages[group.messages.length - 1].created_at)}</span>
                  {isMine && <CheckCheck className="h-3 w-3 text-muted-foreground" />}
                </div>
              </div>
            </div>
          );
        })}

        {typingUserId && <TypingBubble />}
        {messages?.length === 0 && !typingUserId && (
          <div className="flex flex-col items-center py-12">
            <img src={otherAvatar} alt="" className="h-20 w-20 rounded-full bg-muted mb-3" />
            <p className="font-semibold text-foreground text-lg">{activeConvo.otherUser.display_name}</p>
            <p className="text-sm text-muted-foreground mt-1">Say hello to start the conversation 👋</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Messenger-style input */}
      <div className="px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] bg-card shrink-0">
        <AnimatePresence>
          {pendingFile && <div className="px-2 pb-2"><AttachmentPreview file={pendingFile} onRemove={() => setPendingFile(null)} /></div>}
        </AnimatePresence>
        <div className="flex items-center gap-1 min-w-0">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.txt,.zip,.xlsx,.csv" />
          <button onClick={() => fileInputRef.current?.click()} className="h-9 w-9 rounded-full hover:bg-muted shrink-0 flex items-center justify-center">
            <Paperclip className="h-5 w-5 text-primary" />
          </button>
          <button className="h-9 w-9 rounded-full hover:bg-muted shrink-0 lg:hidden flex items-center justify-center">
            <Camera className="h-5 w-5 text-primary" />
          </button>
          <div className="flex-1 min-w-0 flex items-center bg-muted rounded-full px-3 py-2 min-h-[40px]">
            <input value={input} onChange={handleInputChange} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && !isSending && handleSend()}
              placeholder="Aa" className="flex-1 min-w-0 bg-transparent text-[15px] outline-none text-foreground placeholder:text-muted-foreground" />
            <button className="ml-1.5 shrink-0"><Smile className="h-5 w-5 text-primary" /></button>
          </div>
          {(input.trim() || pendingFile) ? (
            <motion.button whileTap={{ scale: 0.85 }} onClick={handleSend} disabled={isSending} className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center disabled:opacity-50">
              {isSending ? <Loader2 className="h-5 w-5 text-primary animate-spin" /> : <Send className="h-5 w-5 text-primary" />}
            </motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => sendMessage.mutate({ conversationId: selectedChat, content: '👍' })}
              className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center">
              <ThumbsUp className="h-5 w-5 text-primary" />
            </motion.button>
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
