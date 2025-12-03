
import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Textarea,
  Spinner,
} from "@material-tailwind/react";
import { SparklesIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";

const HealthChatbot = () => {
  const [messages, setMessages] = useState([
    { text: "👋 Bonjour ! Je suis votre assistant santé. Posez-moi vos questions sur la nutrition, l'exercice ou le bien-être !", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Ajouter le message utilisateur
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Appel à l'API Django
      const response = await fetch('/api/chatbot/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      
      // Ajouter la réponse du bot
      setMessages(prev => [...prev, { 
        text: data.response || "Je n'ai pas pu traiter votre demande.", 
        sender: 'bot' 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "⚠️ Désolé, je rencontre des difficultés techniques. Réessayez plus tard.", 
        sender: 'bot' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Questions rapides prédéfinies
  const quickQuestions = [
    "Quels aliments pour perdre du poids ?",
    "Combien d'eau dois-je boire ?",
    "Exercices pour débutants ?",
    "Comment mieux dormir ?"
  ];

  const handleClearChat = () => {
    setMessages([{ text: "👋 Bonjour ! Je suis votre assistant santé. Posez-moi vos questions sur la nutrition, l'exercice ou le bien-être !", sender: 'bot' }]);
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-t-2xl"
        style={{ backgroundColor: "#00357a" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white/20">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <Typography variant="h5" color="white" className="font-bold">
                Assistant Santé IA
              </Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Posez vos questions sur la nutrition et le fitness
              </Typography>
            </div>
          </div>
          <Button
            variant="text"
            size="sm"
            onClick={handleClearChat}
            className="text-white hover:bg-white/20"
          >
            Effacer
          </Button>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {/* Messages */}
        <div className="h-72 overflow-y-auto p-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 ${
                msg.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-[#00357a] text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
              >
                <Typography variant="paragraph">
                  {msg.text}
                </Typography>
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-left">
              <div className="inline-block max-w-[80%] px-4 py-3 rounded-2xl bg-white border border-gray-200 rounded-bl-none">
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  <Typography variant="small" className="text-gray-500">
                    L'assistant réfléchit...
                  </Typography>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Questions rapides */}
        <div className="p-4 border-t border-gray-200">
          <Typography variant="small" className="mb-2 text-gray-600">
            Questions rapides :
          </Typography>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, idx) => (
              <Button
                key={idx}
                variant="outlined"
                size="sm"
                onClick={() => setInput(question)}
                disabled={loading}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question santé..."
              disabled={loading}
              rows="2"
              className="min-h-[50px]"
              labelProps={{ className: "hidden" }}
              containerProps={{ className: "flex-1" }}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="self-end"
              style={{ backgroundColor: "#9b0e16" }}
            >
              {loading ? (
                <Spinner className="h-5 w-5" />
              ) : (
                "Envoyer"
              )}
            </Button>
          </div>
          <Typography variant="small" className="mt-2 text-gray-500">
            💡 Exemple : "Quels exercices pour les abdos ?"
          </Typography>
        </div>
      </CardBody>
    </Card>
  );
};

export default HealthChatbot;