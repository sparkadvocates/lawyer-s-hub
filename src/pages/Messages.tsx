import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Star,
  Archive,
  Trash2,
  Circle,
  Check,
  CheckCheck,
  Smile,
  Image,
  File,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { useClients } from "@/hooks/useClients";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  status: "sent" | "delivered" | "read";
  type: "text" | "file" | "image";
  fileName?: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isStarred: boolean;
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "রহমান এন্টারপ্রাইজ",
    lastMessage: "ধন্যবাদ, মামলার আপডেট পেলাম।",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 2,
    isOnline: true,
    isStarred: true,
    messages: [
      {
        id: "m1",
        content: "আসসালামু আলাইকুম, মামলার অগ্রগতি জানতে চাচ্ছিলাম।",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        senderId: "client",
        status: "read",
        type: "text",
      },
      {
        id: "m2",
        content: "ওয়ালাইকুম আসসালাম। আগামীকাল কোর্টে শুনানি আছে। আপডেট জানাবো।",
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        senderId: "me",
        status: "read",
        type: "text",
      },
      {
        id: "m3",
        content: "ধন্যবাদ, মামলার আপডেট পেলাম।",
        timestamp: new Date().toISOString(),
        senderId: "client",
        status: "read",
        type: "text",
      },
    ],
  },
  {
    id: "2",
    name: "করিম গ্রুপ",
    lastMessage: "ডকুমেন্টগুলো পাঠিয়েছি, দেখুন প্লিজ।",
    lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
    unreadCount: 0,
    isOnline: false,
    isStarred: false,
    messages: [
      {
        id: "m4",
        content: "সম্পত্তির কাগজপত্র দরকার।",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        senderId: "me",
        status: "read",
        type: "text",
      },
      {
        id: "m5",
        content: "ডকুমেন্টগুলো পাঠিয়েছি, দেখুন প্লিজ।",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        senderId: "client",
        status: "read",
        type: "text",
      },
    ],
  },
  {
    id: "3",
    name: "হাসান ট্রেডার্স",
    lastMessage: "চেক ডিস অনারের নোটিশ পাঠানো হয়েছে।",
    lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 0,
    isOnline: true,
    isStarred: true,
    messages: [
      {
        id: "m6",
        content: "চেক ডিস অনারের নোটিশ পাঠানো হয়েছে।",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        senderId: "me",
        status: "delivered",
        type: "text",
      },
    ],
  },
  {
    id: "4",
    name: "আলম ইন্ডাস্ট্রিজ",
    lastMessage: "শ্রম মামলার জন্য মিটিং কবে?",
    lastMessageTime: new Date(Date.now() - 172800000).toISOString(),
    unreadCount: 1,
    isOnline: false,
    isStarred: false,
    messages: [
      {
        id: "m7",
        content: "শ্রম মামলার জন্য মিটিং কবে?",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        senderId: "client",
        status: "read",
        type: "text",
      },
    ],
  },
];

const Messages = () => {
  const { clients } = useClients();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toISOString(),
      senderId: "me",
      status: "sent",
      type: "text",
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: newMessage,
          lastMessageTime: new Date().toISOString(),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
      lastMessage: newMessage,
      lastMessageTime: new Date().toISOString(),
    } : null);
    setNewMessage("");
  };

  const toggleStar = (convId: string) => {
    setConversations(conversations.map(conv =>
      conv.id === convId ? { ...conv, isStarred: !conv.isStarred } : conv
    ));
  };

  const getMessageStatus = (status: Message["status"]) => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-primary" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2);
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col pl-16 md:pl-0">
        <Header />
        <main className="flex-1 p-3 sm:p-6 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full">
            {/* Header */}
            <div className="mb-4">
              <h1 className="text-3xl font-display font-bold text-foreground">মেসেজ</h1>
              <p className="text-muted-foreground mt-1">
                ক্লায়েন্টদের সাথে যোগাযোগ করুন
                {totalUnread > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {totalUnread} নতুন
                  </Badge>
                )}
              </p>
            </div>

            {/* Main Chat Container */}
            <Card className="h-[calc(100vh-220px)] flex overflow-hidden">
              {/* Conversations List */}
              <div className="w-80 border-r flex flex-col">
                {/* Search */}
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="কথোপকথন খুঁজুন..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Conversation List */}
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                          selectedConversation?.id === conv.id
                            ? "bg-primary/10"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conv.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getInitials(conv.name)}
                            </AvatarFallback>
                          </Avatar>
                          {conv.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "font-medium truncate",
                              conv.unreadCount > 0 && "text-foreground"
                            )}>
                              {conv.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conv.lastMessageTime), { 
                                addSuffix: false, 
                                locale: bn 
                              })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className={cn(
                              "text-sm truncate",
                              conv.unreadCount > 0 
                                ? "text-foreground font-medium" 
                                : "text-muted-foreground"
                            )}>
                              {conv.lastMessage}
                            </p>
                            <div className="flex items-center gap-1">
                              {conv.isStarred && (
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              )}
                              {conv.unreadCount > 0 && (
                                <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Chat Area */}
              {selectedConversation ? (
                <div className="flex-1 flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedConversation.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(selectedConversation.name)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedConversation.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {selectedConversation.isOnline ? "অনলাইন" : "অফলাইন"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStar(selectedConversation.id)}
                      >
                        <Star className={cn(
                          "w-4 h-4",
                          selectedConversation.isStarred && "text-amber-500 fill-amber-500"
                        )} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Archive className="w-4 h-4 mr-2" />
                            আর্কাইভ করুন
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            মুছে ফেলুন
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.senderId === "me" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-2",
                              message.senderId === "me"
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            )}
                          >
                            <p>{message.content}</p>
                            <div className={cn(
                              "flex items-center gap-1 mt-1",
                              message.senderId === "me" ? "justify-end" : "justify-start"
                            )}>
                              <span className={cn(
                                "text-xs",
                                message.senderId === "me" 
                                  ? "text-primary-foreground/70" 
                                  : "text-muted-foreground"
                              )}>
                                {format(new Date(message.timestamp), "hh:mm a")}
                              </span>
                              {message.senderId === "me" && getMessageStatus(message.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Paperclip className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Image className="w-5 h-5" />
                      </Button>
                      <Input
                        placeholder="মেসেজ লিখুন..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon">
                        <Smile className="w-5 h-5" />
                      </Button>
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="gradient-gold text-primary-foreground"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">কোনো কথোপকথন নির্বাচন করুন</h3>
                    <p className="text-muted-foreground mt-1">বাম দিক থেকে একটি কথোপকথন বেছে নিন</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Messages;
