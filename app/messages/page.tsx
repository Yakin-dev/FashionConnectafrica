"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { mockConversations, MockConversation } from "@/lib/mock-data";
import { Send, Sparkles, CheckCheck } from "lucide-react";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<MockConversation[]>(mockConversations);
  const [activeConvId, setActiveConvId] = useState<string>(mockConversations[0].id);
  const [inputVal, setInputVal] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Scroll to bottom on conversation change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, conversations]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMessage = {
      id: `m-new-${Date.now()}`,
      senderId: "me" as const,
      content: inputVal.trim(),
      timestamp: "Just Now",
    };

    // Update active conversations state
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      )
    );

    const typedVal = inputVal;
    setInputVal("");

    // Simulated Smart auto-reply after 1.5s
    setTimeout(() => {
      const smartReply = {
        id: `reply-${Date.now()}`,
        senderId: "them" as const,
        content: `Thank you for the message! I've received it and will coordinate with my team. Speak to you shortly.`,
        timestamp: "Just Now",
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, messages: [...c.messages, smartReply] }
            : c
        )
      );
    }, 1500);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#F8F5EF] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex h-[600px] border border-[#E7DED1] rounded-2xl bg-white overflow-hidden shadow-sm">
            {/* Left: Contact List */}
            <aside className="w-80 border-r border-[#E7DED1] bg-[#F8F5EF]/30 flex flex-col">
              <div className="p-4 border-b border-[#E7DED1] bg-white flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-[#1D1A16]">Conversations</h3>
                <span className="rounded-full bg-[#C8A96A]/10 text-[#C8A96A] text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                  Active
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#E7DED1]/60">
                {conversations.map((c) => {
                  const isActive = c.id === activeConvId;
                  const lastMsg = c.messages[c.messages.length - 1];
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveConvId(c.id)}
                      className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${
                        isActive ? "bg-white" : "hover:bg-[#F8F5EF]/50"
                      }`}
                    >
                      <div className="relative shrink-0 h-10 w-10 overflow-hidden rounded-full bg-[#E7DED1]">
                        <img src={c.contactAvatar} alt={c.contactName} className="object-cover w-full h-full" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#1D1A16] truncate uppercase">{c.contactName}</h4>
                          <span className="text-[9px] text-[#6B6257] shrink-0 font-medium uppercase tracking-wider">
                            {c.contactRole}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#6B6257] truncate mt-1">
                          {lastMsg ? lastMsg.content : "No messages yet"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Right: Message Window */}
            <div className="flex-1 flex flex-col justify-between bg-white">
              {/* Header */}
              <div className="p-4 border-b border-[#E7DED1] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#E7DED1]">
                    <img src={activeConv.contactAvatar} alt={activeConv.contactName} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1D1A16] uppercase">{activeConv.contactName}</h4>
                    <span className="text-[9px] font-bold text-[#C8A96A] uppercase tracking-widest block">
                      {activeConv.contactRole} Representative
                    </span>
                  </div>
                </div>
                
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100/10 px-2 py-0.5 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  <span>Secure Workspace</span>
                </span>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F5EF]/10">
                {activeConv.messages.map((m) => {
                  const isMe = m.senderId === "me";
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md rounded-2xl p-4 text-xs leading-relaxed space-y-1 ${
                          isMe
                            ? "bg-[#1D1A16] text-white rounded-br-none"
                            : "bg-[#F8F5EF] text-[#1D1A16] border border-[#E7DED1] rounded-bl-none"
                        }`}
                      >
                        <p>{m.content}</p>
                        <div className="flex items-center justify-end gap-1 text-[9px] opacity-75">
                          <span>{m.timestamp}</span>
                          {isMe && <CheckCheck className="h-3 w-3 text-[#C8A96A]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              {/* Message Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#E7DED1] flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Type secure message..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="flex-1 rounded-full bg-[#F8F5EF]/60 border border-[#E7DED1] py-3.5 px-6 text-xs text-[#1D1A16] placeholder-[#6B6257] focus:outline-none focus:bg-white"
                />
                
                <button
                  type="submit"
                  className="rounded-full bg-[#1D1A16] p-3.5 text-white hover:bg-[#C8A96A] transition-colors"
                  aria-label="Send message"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
