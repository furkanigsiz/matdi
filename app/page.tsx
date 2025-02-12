"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { createClient } from '@supabase/supabase-js';
import { MusicCard } from "@/components/ui/music-card";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [step, setStep] = useState(0);
  const [anger, setAnger] = useState<number>(1);
  const [showAngerLevel, setShowAngerLevel] = useState(false);
  const [showAfterAnger, setShowAfterAnger] = useState(false);
  const [afterAngerStep, setAfterAngerStep] = useState(0);
  const [showCoffeeQuestion, setShowCoffeeQuestion] = useState(false);
  const [showDoubleCheck, setShowDoubleCheck] = useState(false);
  const [showDateQuestion, setShowDateQuestion] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showRelationshipQuestion, setShowRelationshipQuestion] = useState(false);
  const [showContinueMessage, setShowContinueMessage] = useState(false);

  // MusicCard'ı ana içerikten bağımsız olarak render et
  const musicCard = (
    <>
      {step >= 2 && (
        <div className="fixed top-4 right-4 z-50">
          <MusicCard 
            src="/hooverphonic.mp3"
            title="Mad About You"
            artist="Hooverphonic"
            mainColor="#10b981"
          />
        </div>
      )}
    </>
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/rain.mp3');
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
      audioRef.current.play();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Chat mesajlarını dinle
  useEffect(() => {
    if (showChat) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (data) {
          console.log('Gelen mesajlar:', data);
          setChatMessages(data);
        }
        if (error) {
          console.error('Mesaj çekme hatası:', error);
        }
      };

      fetchMessages();

      // Realtime subscription
      const channel = supabase
        .channel('chat_messages_channel')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages' 
          }, 
          (payload) => {
            console.log('Yeni mesaj:', payload);
            setChatMessages(current => [...current, payload.new]);
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [showChat]);

  // Chat mesajlarında otomatik scroll
  useEffect(() => {
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          message: chatMessage,
          user_id: 'user',
          created_at: new Date().toISOString()
        }
      ]);

    if (!error) {
      setChatMessage('');
    }
  };

  const handleCustomDateSubmit = async () => {
    if (!customDate.trim()) return;
    
    try {
      const { error } = await supabase
        .from('answers')
        .insert([{
          type: 'custom_date',
          answer: customDate,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      setShowCustomDate(false);
      setShowChat(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const messages = [
    "Selam mathilda...",
    "Her şeyden önce önemli bir soru - konuştuğun biri var mı?",
    "Yeniden ben evet",
    "Şuan bu şarkı gibi hissettiğini farkındayım",
    "Haklısında evet",
    "Neden bir yetişkin gibi yazmadım",
    "Because i was afraid of losing you forever without laying a solid foundation anyway",
  ];

  const afterAngerMessages = [
    "Umarım bu kızgınlığına sebep olduğum için senle en azından bir kere bile olsa konuşma fırsatını kaçırmamışımdır.",
    "Evet öyleyse asıl soru",
  ];

  const handleNext = async () => {
    if (step === 0) {
      try {
        const { error } = await supabase
          .from('answers')
          .insert([{
            type: 'message_view',
            answer: messages[step],
            created_at: new Date().toISOString()
          }]);

        if (error) console.error('Message save error:', error);
      } catch (error) {
        console.error('Error:', error);
      }

      setShowRelationshipQuestion(true);
    } else if (step < messages.length - 1) {
      try {
        const { error } = await supabase
          .from('answers')
          .insert([{
            type: 'message_view',
            answer: messages[step],
            created_at: new Date().toISOString()
          }]);

        if (error) console.error('Message save error:', error);
      } catch (error) {
        console.error('Error:', error);
      }

      setStep(step + 1);
    } else if (step === messages.length - 1) {
      try {
        const { error } = await supabase
          .from('answers')
          .insert([{
            type: 'message_view',
            answer: messages[step],
            created_at: new Date().toISOString()
          }]);

        if (error) console.error('Last message save error:', error);
      } catch (error) {
        console.error('Error:', error);
      }

      setShowAngerLevel(true);
    }
  };

  const handleAngerSubmit = async () => {
    try {
      const { error } = await supabase
        .from('answers')
        .insert([{
          type: 'anger_level',
          answer: anger.toString(),
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Anger save error:', error);
        return;
      }
      
      setShowAngerLevel(false);
      setShowAfterAnger(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAfterAngerNext = async () => {
    if (afterAngerStep < afterAngerMessages.length - 1) {
      setAfterAngerStep(afterAngerStep + 1);
    } else {
      setShowAfterAnger(false);
      setShowCoffeeQuestion(true);
    }
  };

  const handleAnswer = async (answer: string) => {
    try {
      const { error } = await supabase
        .from('answers')
        .insert([{
          type: 'coffee_answer',
          answer,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      if (showCoffeeQuestion) {
        if (answer === 'hayır') {
          setShowCoffeeQuestion(false);
          setShowDoubleCheck(true);
        } else {
          setShowCoffeeQuestion(false);
          setShowDateQuestion(true);
        }
      } else if (showDoubleCheck) {
        if (answer === 'hayır') {
          setShowDoubleCheck(false);
          setShowCoffeeQuestion(true);
        } else {
          setShowDoubleCheck(false);
          setIsComplete(true);
        }
      } else if (showDateQuestion) {
        if (answer === 'hayır') {
          setShowDateQuestion(false);
          setShowCustomDate(true);
        } else {
          setIsComplete(true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRelationshipAnswer = async (answer: string) => {
    try {
      const { error } = await supabase
        .from('answers')
        .insert([{
          type: 'relationship_status',
          answer,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      if (answer === 'evet') {
        setShowContinueMessage(true);
      } else {
        setShowRelationshipQuestion(false);
        setStep(2);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (showChat) {
    window.location.href = '/chat';
    return null;
  }

  if (showContinueMessage) {
    return (
      <>
        {musicCard}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-white text-center">
            Olsun sen gene de bir bak
          </h2>
          <button
            onClick={() => {
              setShowContinueMessage(false);
              setShowRelationshipQuestion(false);
              setStep(2);
            }}
            className="bg-white text-black rounded-full px-4 py-2"
          >
            Devam Et
          </button>
        </motion.div>
      </>
    );
  }

  if (isComplete) {
    return (
      <>
        {musicCard}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="text-3xl md:text-7xl font-bold text-white text-center">
            {showDoubleCheck ? 
              "Üzgünüm inandırıcı gelmeyecek biliyorum fakat seni aklımdan bir an olsun çıkaramıyorum... Her şey için teşekkürler son kez" :
              "O zaman cumartesi malavita? :)"}
          </div>
          {!showDoubleCheck && (
            <>
              <div className="text-xl text-white text-center mt-8">
                Siteyi yaparken hızımı alamadım chat kısmı da yaptım, şu an eğer ben de aktifsem bana yazabilirsin
              </div>
              <button
                onClick={() => window.location.href = '/chat'}
                className="bg-white text-black rounded-full px-4 py-2 mt-4"
              >
                Devam Et
              </button>
            </>
          )}
        </motion.div>
      </>
    );
  }

  if (showCustomDate) {
    return (
      <>
        {musicCard}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-screen p-4 text-white"
        >
          <div className="text-center space-y-6">
            <h2 className="text-2xl">gün malavite? :)</h2>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-4 py-2 rounded bg-gray-800 text-white"
            />
            <button
              onClick={handleCustomDateSubmit}
              className="px-6 py-2 rounded-full bg-white text-black mt-4 block mx-auto"
            >
              Devam Et
            </button>
          </div>
        </motion.div>
      </>
    );
  }

  if (showDateQuestion) {
    return (
      <>
        {musicCard}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-white text-center">
            Cumartesi?
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer('evet')}
              className="bg-white text-black rounded-full px-4 py-2"
            >
              Evet
            </button>
            <button
              onClick={() => handleAnswer('hayır')}
              className="bg-white text-black rounded-full px-4 py-2"
            >
              Hayır
            </button>
          </div>
        </motion.div>
      </>
    );
  }

  if (showDoubleCheck) {
    return (
      <>
        {musicCard}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl md:text-4xl font-bold text-white text-center">
            Emin misin?
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer('evet')}
              className="bg-white text-black rounded-full px-4 py-2"
            >
              Evet
            </button>
            <button
              onClick={() => handleAnswer('hayır')}
              className="bg-white text-black rounded-full px-4 py-2"
            >
              Hayır
            </button>
          </div>
        </motion.div>
      </>
    );
  }

  if (showCoffeeQuestion) {
    return (
      <>
        {musicCard}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-white text-center">
            Benimle bir kahve içer misin?
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer('evet')}
              className="bg-white text-black rounded-full px-4 py-2"
            >
              Evet
            </button>
            <button
              onClick={() => handleAnswer('hayır')}
              className="bg-white text-black rounded-full px-4 py-2"
            >
              Hayır
            </button>
          </div>
        </motion.div>
      </>
    );
  }

  if (showAfterAnger) {
    return (
      <>
        {musicCard}
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-4 items-center justify-center px-4"
        >
          <div className="text-3xl md:text-7xl font-bold text-white text-center">
            {afterAngerMessages[afterAngerStep]}
          </div>
          <button 
            onClick={handleAfterAngerNext}
            className="bg-white text-black rounded-full w-fit px-4 py-2 mt-4"
          >
            Devam Et
          </button>
        </motion.div>
      </>
    );
  }

  if (showAngerLevel) {
    return (
      <>
        {musicCard}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-white text-center">
            Bana ne kadar kızgınsın?
          </h2>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={anger}
              onChange={(e) => setAnger(Number(e.target.value))}
              className="w-64 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xl font-bold text-white">{anger}</span>
          </div>
          {anger >= 6 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl"
            >
              😢
            </motion.div>
          )}
          <button
            onClick={handleAngerSubmit}
            className="bg-white text-black rounded-full w-fit px-4 py-2 mt-4"
          >
            Devam Et
          </button>
        </motion.div>
      </>
    );
  }

  if (showRelationshipQuestion) {
    return (
      <>
        {musicCard}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-white text-center">
          Her şeyden önce önemli bir soru konuştuğun biri var mı?
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleRelationshipAnswer('evet')}
              className="bg-white text-black rounded-full px-4 py-2"
            >
              Evet
            </button>
            <button
              onClick={() => handleRelationshipAnswer('hayır')}
              className="bg-white text-black rounded-full px-4 py-2"
            >
              Hayır
            </button>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      {musicCard}
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className="text-3xl md:text-7xl font-bold text-white text-center">
          {messages[step]}
        </div>
        <button 
          onClick={handleNext}
          className="bg-white text-black rounded-full w-fit px-4 py-2 mt-4"
        >
          Devam Et
        </button>
      </motion.div>
    </>
  );
} 