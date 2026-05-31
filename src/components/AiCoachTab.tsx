import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Brain, 
  MessageSquare, 
  AlertCircle,
  TrendingDown,
  Moon,
  Zap,
  Activity,
  Heart,
  Key,
  Eye,
  EyeOff
} from "lucide-react";
import Markdown from "react-markdown";
import { OuraCombinedData } from "../types";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AiCoachTabProps {
  data: OuraCombinedData | null;
}

function getOptimizedOuraData(d: OuraCombinedData | null) {
  if (!d) return null;
  return {
    personalInfo: d.personalInfo,
    dailySleep: d.dailySleep,
    dailyReadiness: d.dailyReadiness,
    dailyActivity: d.dailyActivity,
  };
}

export default function AiCoachTab({ data }: AiCoachTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [showKey, setShowKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleKeyChange = (val: string) => {
    setGeminiKey(val);
    localStorage.setItem("gemini_api_key", val.trim());
  };

  // Suggested prompt templates in Russian for Oura context
  const quickPrompts = [
    {
      label: "Анализ готовности",
      text: "Проанализируй мою Готовность (Readiness) и баланс HRV за последние дни. Что влияет на это?",
      icon: Zap,
      color: "text-amber-400 border-amber-950/40 bg-amber-950/10",
    },
    {
      label: "Оптимизация сна",
      text: "Как мне улучшить фазу глубокого (Deep) и быстрого (REM) сна на основе моих показателей?",
      icon: Moon,
      color: "text-indigo-400 border-indigo-950/40 bg-indigo-950/10",
    },
    {
      label: "План активности",
      text: "Каковы рекомендации по тренировкам и активности на сегодня, учитывая мои шаги и калории?",
      icon: Activity,
      color: "text-emerald-400 border-emerald-950/40 bg-emerald-950/10",
    },
    {
      label: "Анализ пульса (RHR)",
      text: "Что говорит мой пульс в покое (Resting Heart Rate) о моей общей физической форме и усталости?",
      icon: Heart,
      color: "text-rose-400 border-rose-950/40 bg-rose-950/10",
    }
  ];

  // Auto-scroll to lowest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Initial greeting or general sync recommendations if there are no messages yet
  useEffect(() => {
    if (messages.length === 0 && data) {
      triggerInitialAnalysis();
    }
  }, [data]);

  // Reactive auto-retry of initial analysis when a Gemini API Key is pasted or typed
  useEffect(() => {
    const trimmedKey = geminiKey.trim();
    if (trimmedKey && trimmedKey.length >= 10 && data) {
      // If we are currently displaying the error fallback greeting, automatically reconnect!
      const isFallback = messages.length <= 1 && (
        messages.length === 0 || 
        messages[0]?.content.includes("введите ваш персональный API-ключ") ||
        apiError !== null
      );
      if (isFallback) {
        triggerInitialAnalysis(trimmedKey);
      }
    }
  }, [geminiKey, data]);

  const triggerInitialAnalysis = async (overrideKey?: string) => {
    setIsLoading(true);
    setApiError(null);
    const keyToSubmit = overrideKey !== undefined ? overrideKey : geminiKey;
    try {
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          ouraData: getOptimizedOuraData(data),
          geminiApiKey: keyToSubmit ? keyToSubmit.trim() : undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || `HTTP ${response.status} failed`);
      }

      const resData = await response.json();
      setMessages([
        {
          role: "assistant",
          content: resData.text || "Привет! Я твой ИИ-тренер. У меня есть твои последние данные Oura Ring — готов разобрать твои биомаркеры и составить план!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (err: any) {
      console.error("AI Coach initialization failed:", err);
      setApiError(err.message || "Не удалось связаться с сервером ИИ тренера.");
      // Fallback message so user isn't stuck
      setMessages([
        {
          role: "assistant",
          content: "Привет! Я твой ИИ-тренер Oura. Похоже, мне не удалось выполнить автоматический анализ. Пожалуйста, введите ваш персональный API-ключ Gemini слева, чтобы запустить тренера, или настройте переменную окружения GEMINI_API_KEY.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText?.trim() || inputValue.trim();
    if (!textToSend) return;

    if (!customText) {
      setInputValue("");
    }

    const newUserMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          ouraData: getOptimizedOuraData(data),
          geminiApiKey: geminiKey ? geminiKey.trim() : undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || `HTTP ${response.status} failed`);
      }

      const resData = await response.json();
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: resData.text || "Мне не удалось сформулировать ответ. Попробуйте еще раз.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (err: any) {
      console.error("Failed to fetch coach response:", err);
      setApiError(err.message || "Произошла непредвиденная ошибка на сервере ИИ тренера.");
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Произошла ошибка при генерации ответа. Пожалуйста, убедитесь, что в панели **Settings > Secrets** задан ключ `GEMINI_API_KEY`.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Decorative Dashboard Header card */}
      <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#D4AF37]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-3 py-1 text-[11px] text-[#D4AF37] font-semibold font-mono uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5 animate-pulse" />
              <span>Gemini 3.5 Active Coach</span>
            </div>
            <h2 className="text-3xl font-light tracking-tight text-[#F5F5F7]">
              ИИ Тренер &amp; Смарт-Аналитик
            </h2>
            <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
              Ваш персональный медицинский и спортивный наставник. Анализирует пульс, баланс HRV, циклы глубокого сна и активность Oura, чтобы дать точные спортивные протоколы восстановления и нагрузки.
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm("Очистить историю сообщений и сделать новый анализ?")) {
                setMessages([]);
                triggerInitialAnalysis();
              }
            }}
            className="text-xs font-semibold text-gray-400 hover:text-white border border-gray-850 px-4 py-3 rounded-2xl bg-[#0B0B0C] hover:bg-[#252527] transition-all cursor-pointer self-start md:self-auto flex items-center gap-2"
          >
            <span>Перезагрузить Анализ</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar panels */}
        <div className="lg:col-span-1 space-y-4">
          {/* Gemini API Key Configuration Panel */}
          <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-gray-300">
              <Key className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-widest font-mono">Настройка ИИ</span>
            </div>
            
            <p className="text-[11px] text-gray-400 leading-normal">
              Введите API-ключ Gemini для работы тренера. Нет ключа? Создайте бесплатно в <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:underline hover:text-[#c29f2f] font-semibold">Google AI Studio</a>.
            </p>
            
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={geminiKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="Вставьте AIzaSy..."
                className="w-full text-xs bg-[#0B0B0C] text-gray-150 border border-gray-800 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl pl-3.5 pr-10 py-2.5 outline-none font-mono transition-all placeholder:text-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-350 cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex flex-col gap-2 pt-1">
              {geminiKey ? (
                <span className="inline-flex items-center gap-1.5 text-[9px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Используется ваш ключ (сохранён)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[9px] text-amber-500 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Ожидание ключа (или ключ сервера)
                </span>
              )}

              {geminiKey && (
                <button
                  type="button"
                  onClick={() => triggerInitialAnalysis(geminiKey.trim())}
                  disabled={isLoading}
                  className="w-full text-xs font-semibold text-[#0B0B0C] hover:bg-[#c29f2f] active:bg-[#aa8b27] bg-[#D4AF37] mt-1 px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:bg-gray-800 disabled:text-gray-500 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Активировать &amp; Начать</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
              Быстрые Вопросы
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed leading-normal">
              Выберите один из вопросов ниже, чтобы ваш ИИ-Тренер мгновенно рассчитал советы на базе ваших биоимпортов Oura:
            </p>
            
            <div className="space-y-2.5 pt-1">
              {quickPrompts.map((prompt, idx) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => !isLoading && handleSendMessage(prompt.text)}
                    disabled={isLoading}
                    className={`w-full text-left p-3.5 rounded-2xl border border-gray-850 hover:border-gray-700 bg-[#0B0B0C]/40 hover:bg-[#0B0B0C] transition-all cursor-pointer text-xs space-y-2 transition-transform duration-200 active:scale-[0.98] ${prompt.color} disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{prompt.label}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-normal line-clamp-2">
                      {prompt.text}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt privacy widget */}
          <div className="bg-[#1C1C1E] border border-gray-800 rounded-3xl p-5 text-[11px] leading-relaxed text-gray-400 space-y-2">
            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Как это работает?</span>
            </div>
            <p>
              Ваши сырые логи сна и готовности (из кэша в вашем браузере) форматируются в структурированную анкету и отправляются через защищенный API-маршрут в Gemini.
            </p>
            <p className="text-gray-500 font-mono text-[9px] uppercase tracking-wider">
              Безопасная обработка в AI Studio
            </p>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="lg:col-span-3 flex flex-col h-[640px] bg-[#1C1C1E] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Top Info Bar */}
          <div className="px-6 py-4 border-b border-gray-850 flex items-center justify-between bg-[#19191B]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                <Brain className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-[#F5F5F7] block">Диалог с тренером</span>
                <span className="text-[10px] text-gray-500 block font-mono">Модель: gemini-3.5-flash</span>
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1 bg-[#2C2C2E]/40 border border-gray-800 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                <span className="text-[10px] font-semibold text-gray-400 font-mono uppercase tracking-wider">
                  Анализ биомаркеров...
                </span>
              </div>
            )}
          </div>

          {/* Chat message list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center text-center py-24 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1C1C1E] border border-gray-800 flex items-center justify-center text-[#D4AF37] shadow-xl">
                  <MessageSquare className="w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-300">История диалога пока пуста.</p>
                  <p className="text-xs text-gray-500 max-w-sm">
                    Нажмите кнопку «Перезагрузить Анализ», чтобы ИИ составил авто-отчет по вашему здоровью, либо спросите его напрямую.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, index) => {
              const isCoach = msg.role === "assistant";
              return (
                <div
                  key={index}
                  className={`flex gap-3 max-w-3/4 ${isCoach ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  {/* Avatar bubble */}
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold border ${
                    isCoach 
                      ? "bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]" 
                      : "bg-[#2C2C2E] border-gray-800 text-gray-300"
                  }`}>
                    {isCoach ? "ИИ" : "Вы"}
                  </div>

                  {/* Speech bubble */}
                  <div className={`rounded-2xl p-4 space-y-1.5 text-xs shadow-md leading-relaxed ${
                    isCoach 
                      ? "bg-[#1C1C1E] border border-gray-850 text-gray-200" 
                      : "bg-[#D4AF37] text-[#0B0B0C] font-semibold"
                  }`}>
                    {isCoach ? (
                      <div className="markdown-body prose prose-invert prose-xs max-w-none text-gray-200">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                    <span className={`block text-[8px] text-right mt-1 font-mono ${
                      isCoach ? "text-gray-500" : "text-[#0B0B0C]/60"
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
              <div className="flex gap-3 mr-auto max-w-3/4">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 text-[#D4AF37] font-bold text-[11px]">
                  ИИ
                </div>
                <div className="bg-[#1C1C1E] border border-gray-850 rounded-2xl p-4 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '300ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '450ms' }} />
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Составляю спортивный анализ...</span>
                </div>
              </div>
            )}

            {apiError && (
              <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-4 flex items-start gap-3 text-red-300 text-xs text-left animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-red-200">Ошибка спортивного сервера</span>
                  <p className="text-gray-400 leading-normal">
                    {apiError}. Проверьте конфигурацию secrets или обновите токен.
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!inputValue.trim() || isLoading) return;
              handleSendMessage();
            }}
            className="p-4 border-t border-gray-850 bg-[#161618] flex gap-3 items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={isLoading ? "Дождитесь ответа тренера..." : "Спросите тренера о сне, пульсе покоя или тренировке..."}
              className="flex-1 text-xs bg-[#0B0B0C] text-gray-150 border border-gray-800 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl px-4 py-3.5 outline-none transition-all placeholder:text-gray-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-[#D4AF37] hover:bg-[#c29f2f] active:bg-[#aa8b27] disabled:bg-gray-800 disabled:text-gray-500 text-[#0B0B0C] p-3.5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
