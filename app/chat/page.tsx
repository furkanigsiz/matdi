"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { createClient } from '@supabase/supabase-js';
import { MusicCard } from "@/components/ui/music-card";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ChatMessage {
  message: string;
  user_id: string;
  created_at: string;
}

export default function ChatPage() {
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Chat mesajlarını dinle
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (data) {
        console.log('Gelen mesajlar:', data);
        setChatMessages(data as ChatMessage[]);
      }
      if (error) {
        console.error('Mesaj çekme hatası:', error);
      }
    };

    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel('public:chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          console.log('Yeni mesaj geldi:', payload);
          setChatMessages(prevMessages => {
            // Aynı mesajı tekrar eklemeyi önle
            const messageExists = prevMessages.some(msg => 
              msg.message === (payload.new as ChatMessage).message && 
              msg.created_at === (payload.new as ChatMessage).created_at
            );
            if (messageExists) return prevMessages;
            return [...prevMessages, payload.new as ChatMessage];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Chat mesajlarında otomatik scroll
  useEffect(() => {
    if (chatMessages?.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      const newMessage = {
        message: chatMessage,
        user_id: 'user',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert([newMessage]);

      if (!error) {
        setChatMessage('');
        // Optimistic update'i kaldırıyoruz çünkü realtime subscription zaten mesajı ekleyecek
      } else {
        console.error('Mesaj gönderme hatası:', error);
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-screen"
    >
      <div className="fixed top-4 right-4 z-50">
        <MusicCard 
          src="/hooverphonic.mp3"
          title="Mad About You"
          artist="Hooverphonic"
          mainColor="#10b981"

        />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages?.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.user_id === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.user_id === 'user'
                  ? 'bg-white text-black'
                  : 'bg-gray-700 text-white'
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 bg-zinc-900 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Mesajınızı yazın..."
            className="flex-1 px-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-2 rounded-full bg-white text-black"
          >
            Gönder
          </button>
        </div>
      </div>
    </motion.div>
  );
} 