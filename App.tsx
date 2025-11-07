
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, Type } from '@google/genai';
import { PlantInfo, ChatMessage, MessageAuthor } from './types';
import { analyzePlantImage, createChatSession } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { PlantCareGuide } from './components/PlantCareGuide';
import { ChatWindow } from './components/ChatWindow';
import { Spinner } from './components/Spinner';
import { LeafIcon, ChatBubbleIcon } from './components/icons';


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'identifier' | 'chat'>('identifier');
  
  // Plant Identifier State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Chat State
  const chatRef = useRef<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isBotReplying, setIsBotReplying] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isChatReady, setIsChatReady] = useState<boolean>(false);

  useEffect(() => {
    async function initializeChat() {
      try {
        chatRef.current = createChatSession();
        setChatMessages([{ author: MessageAuthor.BOT, text: "Hello! I'm your Gardening Guru. How can I help you with your plants today?" }]);
        setIsChatReady(true);
      } catch (error) {
        console.error("Failed to initialize chat session:", error);
        setChatError("Could not start the chat session. Please check your API key and refresh.");
      }
    }
    initializeChat();
  }, []);

  const handleImageChange = useCallback((file: File | null) => {
    setImageFile(file);
    setPlantInfo(null);
    setAnalysisError(null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      setImageBase64(null);
    }
  }, []);

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageBase64) return;
    setIsAnalyzing(true);
    setPlantInfo(null);
    setAnalysisError(null);
    try {
      const result = await analyzePlantImage(imageBase64);
      setPlantInfo(result);
    } catch (error) {
      console.error(error);
      setAnalysisError('Could not analyze the image. The plant may not be recognized or there could be an issue with the service. Please try another image.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageBase64]);

  // FIX: Refactored to use a unique ID for streaming messages, which resolves the TypeScript error
  // on line 98 and makes the update logic more robust. The 'id' property was added to ChatMessage type.
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isBotReplying || !chatRef.current) return;

    const userMessage: ChatMessage = { author: MessageAuthor.USER, text: message };
    
    const botMessageId = Date.now();
    const botPlaceholderMessage: ChatMessage = { author: MessageAuthor.BOT, text: '...', id: botMessageId };

    setChatMessages(prev => [...prev, userMessage, botPlaceholderMessage]);
    setIsBotReplying(true);
    setChatError(null);

    try {
        const stream = await chatRef.current.sendMessageStream({ message });
        let botResponse = '';
        
        for await (const chunk of stream) {
            botResponse += chunk.text;
            setChatMessages(prev => {
                const newMessages = [...prev];
                const botMessageIndex = newMessages.findIndex(m => m.id === botMessageId);
                if (botMessageIndex !== -1) {
                    newMessages[botMessageIndex] = { ...newMessages[botMessageIndex], text: botResponse + '▌' };
                }
                return newMessages;
            });
        }
        
        setChatMessages(prev => {
            const newMessages = [...prev];
            const botMessageIndex = newMessages.findIndex(m => m.id === botMessageId);
            if(botMessageIndex !== -1) {
                 const { id, ...rest } = newMessages[botMessageIndex];
                 newMessages[botMessageIndex] = { ...rest, text: botResponse };
            }
            return newMessages;
        });

    } catch (error) {
      console.error(error);
      const errorMessage = "Sorry, I couldn't process that. Please try again.";
      setChatMessages(prev => {
        const filteredMessages = prev.filter(m => m.id !== botMessageId);
        return [...filteredMessages, { author: MessageAuthor.BOT, text: errorMessage }];
      });
      setChatError("An error occurred while communicating with the assistant.");
    } finally {
      setIsBotReplying(false);
    }
  }, [isBotReplying]);


  return (
    <div className="min-h-screen bg-green-50/50 font-sans text-gray-800">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 tracking-tight">
            Gardening Guru
          </h1>
          <p className="text-lg md:text-xl text-green-600 mt-2">
            Your AI-powered plant companion
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-center border-b border-gray-200">
            <TabButton
              label="Plant Identifier"
              icon={<LeafIcon />}
              isActive={activeTab === 'identifier'}
              onClick={() => setActiveTab('identifier')}
            />
            <TabButton
              label="Chat Assistant"
              icon={<ChatBubbleIcon />}
              isActive={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
            />
          </div>

          <main>
            {activeTab === 'identifier' && (
              <div className="flex flex-col items-center gap-8">
                <ImageUploader
                  onImageChange={handleImageChange}
                  imagePreviewUrl={imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : null}
                />
                <button
                  onClick={handleAnalyzeClick}
                  disabled={!imageFile || isAnalyzing}
                  className="w-full max-w-sm px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Identify Plant & Get Care Guide'}
                </button>
                {isAnalyzing && <Spinner />}
                {analysisError && <div className="text-red-500 text-center p-4 bg-red-100 rounded-lg">{analysisError}</div>}
                {plantInfo && <PlantCareGuide info={plantInfo} />}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                {!isChatReady && !chatError && <div className="p-8 text-center"><Spinner /></div>}
                {chatError && <div className="p-8 text-center text-red-500 bg-red-50">{chatError}</div>}
                {isChatReady && 
                  <ChatWindow
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isReplying={isBotReplying}
                  />
                }
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};


interface TabButtonProps {
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm md:text-base transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded-t-lg ${
                isActive
                ? 'border-b-2 border-green-600 text-green-700'
                : 'text-gray-500 hover:text-green-600'
            }`}
        >
            {icon}
            {label}
        </button>
    )
}

export default App;
