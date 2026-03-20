/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Heart, RotateCcw, Play, ChevronRight, Globe, Flag, MapPin, Building2, Map as MapIcon, HelpCircle, Timer, CheckCircle2, XCircle, ArrowRight, LayoutGrid, ListOrdered, Home, Volume2, VolumeX, User, Star, Users, Calendar, Award, Shield, Zap, Link as LinkIcon, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { io, Socket } from "socket.io-client";
import { Country, Question, GameState, RankingEntry, Difficulty, Achievement } from './types';
import { COUNTRIES, BRAZIL_STATES } from './data';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const brazilGeoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const INITIAL_LIVES = 3;
const QUESTION_TIME = 15;
const FLAG_POINTS = 10;
const BONUS_POINTS = 5;
const REVEAL_PENALTY = 5;

const generateRandomClipPath = () => {
  const types = ['horizontal', 'vertical', 'diagonal'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  if (type === 'horizontal') {
    return Math.random() > 0.5 ? 'inset(0 0 50% 0)' : 'inset(50% 0 0 0)';
  } else if (type === 'vertical') {
    return Math.random() > 0.5 ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)';
  } else {
    const diagonals = [
      'polygon(0 0, 100% 0, 0 100%)',
      'polygon(100% 0, 100% 100%, 0 100%)',
      'polygon(0 0, 100% 100%, 0 100%)',
      'polygon(0 0, 100% 0, 100% 100%)'
    ];
    return diagonals[Math.floor(Math.random() * diagonals.length)];
  }
};

// Sound Utility
const playSound = (type: 'start' | 'correct' | 'wrong' | 'gameover' | 'click', isMuted: boolean = false) => {
  if (isMuted) return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  switch (type) {
    case 'start':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    case 'correct':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
      break;
    case 'wrong':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    case 'gameover':
      osc.type = 'square';
      osc.frequency.setValueAtTime(196, now);
      osc.frequency.setValueAtTime(164.81, now + 0.2);
      osc.frequency.setValueAtTime(130.81, now + 0.4);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
      break;
    case 'click':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
  }
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-win', title: 'First Steps', description: 'Correctly identify your first flag', icon: '🌱', condition: (s) => s.correctPrimary >= 1 },
  { id: 'streak-5', title: 'High Five', description: 'Get 5 correct answers in a row', icon: '✋', condition: (s) => s.score >= 50 },
  { id: 'hard-mode', title: 'Hardcore Explorer', description: 'Play a game on Hard difficulty', icon: '🔥', condition: (s) => s.difficulty === 'hard' },
  { id: 'xhard-mode', title: 'Geography Legend', description: 'Play a game on Extremely Hard difficulty', icon: '👑', condition: (s) => s.difficulty === 'extremely-hard' },
  { id: 'daily-hero', title: 'Daily Hero', description: 'Complete a Daily Challenge', icon: '📅', condition: (s) => s.mode === 'daily' && s.gameStatus === 'gameover' },
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: INITIAL_LIVES,
    currentCountry: null,
    currentQuestion: null,
    isBonusPhase: false,
    gameStatus: 'landing',
    mode: null,
    difficulty: 'easy',
    history: [],
    totalTime: 0,
    correctPrimary: 0,
    wrongPrimary: 0,
    correctBonus: 0,
    wrongBonus: 0,
    achievements: [],
  });

  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [guessInput, setGuessInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [dailyFact, setDailyFact] = useState<string | null>(null);
  const [loadingFact, setLoadingFact] = useState(false);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [hasSaved, setHasSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [rankingDifficulty, setRankingDifficulty] = useState<Difficulty>('easy');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [multiplayerStatus, setMultiplayerStatus] = useState<'idle' | 'waiting' | 'ready'>('idle');
  const [showPassport, setShowPassport] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const joinedViaUrl = useRef(false);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("waiting-for-opponent", ({ roomId }) => {
      setMultiplayerStatus('waiting');
      setGameState(prev => ({ ...prev, multiplayerRoomId: roomId }));
    });

    newSocket.on("duel-ready", ({ roomId, players, countryIndex, maxRounds }) => {
      const opponent = players.find((p: any) => p.id !== newSocket.id);
      setGameState(prev => ({
        ...prev,
        gameStatus: 'multiplayer-game',
        multiplayerRoomId: roomId,
        opponent: { name: opponent?.name || 'Opponent', score: 0 },
        roundResults: undefined,
        opponentAnswered: false,
        readyCount: 0,
        totalCount: 2,
        currentRound: 1,
        maxRounds: maxRounds
      }));
      setMultiplayerStatus('ready');
      startMultiplayerGame(countryIndex);
    });

    newSocket.on("round-results", ({ results, players }) => {
      const opponent = players.find((p: any) => p.id !== newSocket.id);
      const me = players.find((p: any) => p.id === newSocket.id);
      
      setGameState(prev => ({
        ...prev,
        score: me.score,
        opponent: { ...prev.opponent!, score: opponent.score },
        roundResults: results,
        opponentAnswered: true
      }));

      const myResult = results[newSocket.id];
      if (myResult && myResult.isCorrect) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // If I haven't answered yet (time ran out), I should see the results now
      if (isCorrect === null) {
        setIsCorrect(myResult.isCorrect);
      }
    });

    newSocket.on("player-answered", ({ playerId }) => {
      if (playerId !== newSocket.id) {
        setGameState(prev => ({ ...prev, opponentAnswered: true }));
      }
    });

    newSocket.on("next-round-status", ({ readyCount, totalCount }) => {
      setGameState(prev => ({ ...prev, readyCount, totalCount }));
    });

    newSocket.on("start-next-round", ({ countryIndex, currentRound }) => {
      const nextCountry = COUNTRIES[countryIndex % COUNTRIES.length];
      setGameState(prev => ({
        ...prev,
        isBonusPhase: false,
        currentCountry: nextCountry,
        currentQuestion: generateFlagQuestion(nextCountry, 'countries'),
        history: [...prev.history, nextCountry.id],
        isFlagRevealed: false,
        roundResults: undefined,
        opponentAnswered: false,
        readyCount: 0,
        currentRound: currentRound || prev.currentRound
      }));
      setTimeLeft(QUESTION_TIME);
      setSelectedOption(null);
      setGuessInput('');
      setIsCorrect(null);
    });

    newSocket.on("duel-over", ({ players }) => {
      const me = players.find((p: any) => p.id === newSocket.id);
      const opponent = players.find((p: any) => p.id !== newSocket.id);
      
      setGameState(prev => ({
        ...prev,
        gameStatus: 'gameover',
        score: me.score,
        opponent: { ...prev.opponent!, score: opponent.score }
      }));
    });

    newSocket.on("duel-update", ({ players }) => {
      const opponent = players.find((p: any) => p.id !== newSocket.id);
      if (opponent) {
        setGameState(prev => ({
          ...prev,
          opponent: prev.opponent ? { ...prev.opponent, score: opponent.score } : { name: opponent.name, score: opponent.score }
        }));
      }
    });

    newSocket.on("update-rankings", (updatedRankings: RankingEntry[]) => {
      setRankings(updatedRankings);
    });

    newSocket.on("player-left", () => {
      alert("Opponent left the game!");
      backToMenu();
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const savedAchievements = localStorage.getItem('geoquiz_achievements');
    if (savedAchievements) {
      setGameState(prev => ({ ...prev, achievements: JSON.parse(savedAchievements) }));
    }
  }, []);

  useEffect(() => {
    // Check for new achievements
    const newAchievements = ACHIEVEMENTS.filter(a => !gameState.achievements.includes(a.id) && a.condition(gameState));
    if (newAchievements.length > 0) {
      const updatedAchievements = [...gameState.achievements, ...newAchievements.map(a => a.id)];
      setGameState(prev => ({ ...prev, achievements: updatedAchievements }));
      localStorage.setItem('geoquiz_achievements', JSON.stringify(updatedAchievements));
      // Show notification?
    }
  }, [gameState]);

  useEffect(() => {
    const savedName = localStorage.getItem('geoquiz_player_name');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  const saveScore = (score: number, totalTime: number, difficulty: Difficulty, name: string) => {
    const finalName = name.trim() || 'Anonymous Explorer';
    const newEntry: RankingEntry = {
      name: finalName,
      score,
      totalTime,
      difficulty,
      date: new Date().toLocaleDateString()
    };

    // Emit to server for global sync
    socket?.emit("save-ranking", newEntry);

    // Also keep local for immediate feedback (will be overwritten by server broadcast)
    const updatedRankings = [newEntry, ...rankings]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.totalTime - b.totalTime;
      })
      .slice(0, 100);

    setRankings(updatedRankings);
    localStorage.setItem('geoquiz_player_name', finalName);
    setHasSaved(true);
    
    if (gameState.gameStatus === 'gameover') {
      setGameState(prev => ({ ...prev, gameStatus: 'ranking' }));
    }
  };

  useEffect(() => {
    const fetchFact = async () => {
      if (gameState.gameStatus !== 'landing') return;
      setLoadingFact(true);
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: "Give me one short, interesting, and surprising geography fact for a trivia game. Keep it under 100 characters.",
        });
        setDailyFact(response.text || "Did you know? Russia has more surface area than Pluto!");
      } catch (e) {
        setDailyFact("Did you know? Russia has more surface area than Pluto!");
      } finally {
        setLoadingFact(false);
      }
    };
    fetchFact();
  }, [gameState.gameStatus]);

  const startDailyChallenge = async () => {
    playSound('click', isMuted);
    try {
      const response = await fetch('/api/daily-seed');
      const { seed } = await response.json();
      
      // Use seed to pick 10 countries consistently
      const seededRandom = (s: number) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
      };

      const dailyCountries: Country[] = [];
      let currentSeed = seed;
      while (dailyCountries.length < 10) {
        const index = Math.floor(seededRandom(currentSeed++) * COUNTRIES.length);
        const country = COUNTRIES[index];
        if (!dailyCountries.find(c => c.id === country.id)) {
          dailyCountries.push(country);
        }
      }

      setGameState(prev => ({
        ...prev,
        gameStatus: 'question',
        mode: 'daily',
        difficulty: 'medium',
        score: 0,
        lives: 5, // Extra lives for daily
        history: [dailyCountries[0].id],
        currentCountry: dailyCountries[0],
        currentQuestion: generateFlagQuestion(dailyCountries[0], 'countries'),
        dailySeed: seed,
        dailyCountries,
        isDailyChallenge: true
      }));
      setTimeLeft(QUESTION_TIME);
    } catch (error) {
      console.error("Failed to fetch daily seed", error);
    }
  };

  const startMultiplayerGame = (countryIndex?: number) => {
    const firstCountry = countryIndex !== undefined ? COUNTRIES[countryIndex % COUNTRIES.length] : COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    setGameState(prev => ({
      ...prev,
      gameStatus: 'multiplayer-game',
      mode: 'multiplayer',
      difficulty: 'medium',
      currentCountry: firstCountry,
      currentQuestion: generateFlagQuestion(firstCountry, 'countries'),
      history: [firstCountry.id],
      score: 0,
      lives: 999, // No lives in duel
    }));
    setTimeLeft(QUESTION_TIME);
  };

  useEffect(() => {
    if (joinedViaUrl.current) return;
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId && playerName && socket) {
      // Don't auto-join, just set the room ID so the UI can show a "Join Friend" button
      setGameState(prev => ({ ...prev, multiplayerRoomId: roomId }));
    }
  }, [socket, playerName]);

  const joinDuel = (roomId?: string) => {
    if (!playerName.trim()) {
      alert("Please enter your name first!");
      return;
    }
    playSound('click', isMuted);
    socket?.emit("join-duel", { playerName, roomId });
    setGameState(prev => ({ ...prev, gameStatus: 'multiplayer-lobby', multiplayerRoomId: roomId || null }));
  };

  const challengeFriend = () => {
    const roomId = `private-${Math.random().toString(36).substring(2, 9)}`;
    joinDuel(roomId);
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${gameState.multiplayerRoomId}`;
    navigator.clipboard.writeText(link);
    alert("Invite link copied to clipboard!");
  };

  const MapView = ({ country }: { country: Country }) => {
    if (!country.coordinates) return null;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-48 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative"
      >
        <ComposableMap
          projectionConfig={{ scale: gameState.mode === 'brazil' ? 600 : 150, center: gameState.mode === 'brazil' ? [-55, -15] : [0, 0] }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={gameState.mode === 'brazil' ? brazilGeoUrl : geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#EAEAEC"
                  stroke="#D6D6DA"
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          <Marker coordinates={country.coordinates}>
            <circle r={8} fill="#3b82f6" stroke="#fff" strokeWidth={2} className="animate-pulse" />
          </Marker>
        </ComposableMap>
        <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-slate-600">
          {country.name} Location
        </div>
      </motion.div>
    );
  };

  const Passport = () => (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-8 text-white relative">
          <button 
            onClick={() => setShowPassport(false)}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Award className="w-10 h-10 text-blue-200" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">World Passport</h2>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Explorer: {playerName || 'Anonymous'}</p>
            </div>
          </div>
        </div>
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-4">
            {ACHIEVEMENTS.map(achievement => {
              const isUnlocked = gameState.achievements.includes(achievement.id);
              return (
                <div 
                  key={achievement.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${isUnlocked ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 grayscale opacity-50'}`}
                >
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <h3 className="font-black text-slate-800">{achievement.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{achievement.description}</p>
                  </div>
                  {isUnlocked && <CheckCircle2 className="w-5 h-5 text-blue-500 ml-auto" />}
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {gameState.achievements.length} / {ACHIEVEMENTS.length} Achievements Unlocked
          </p>
        </div>
      </div>
    </motion.div>
  );
  const startNewGame = () => {
    playSound('click', isMuted);
    setHasSaved(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setTimeLeft(QUESTION_TIME);
    setGameState(prev => ({
      ...prev,
      gameStatus: 'mode-selection',
      score: 0,
      lives: INITIAL_LIVES,
      history: [],
      isBonusPhase: false,
      currentCountry: null,
      currentQuestion: null,
      mode: null,
      difficulty: selectedDifficulty,
      totalTime: 0,
      correctPrimary: 0,
      wrongPrimary: 0,
      correctBonus: 0,
      wrongBonus: 0,
    }));
    setGuessInput('');
  };

  const selectMode = (mode: 'countries' | 'brazil') => {
    playSound('start', isMuted);
    const dataSet = mode === 'brazil' ? BRAZIL_STATES : COUNTRIES;
    const firstCountry = dataSet[Math.floor(Math.random() * dataSet.length)];
    const isHardOrXHard = selectedDifficulty === 'hard' || selectedDifficulty === 'extremely-hard';
    
    setGameState(prev => ({
      ...prev,
      score: 0,
      lives: INITIAL_LIVES,
      currentCountry: firstCountry,
      currentQuestion: generateFlagQuestion(firstCountry, mode),
      isBonusPhase: false,
      gameStatus: 'question',
      mode,
      difficulty: selectedDifficulty,
      history: [firstCountry.id],
      totalTime: 0,
      correctPrimary: 0,
      wrongPrimary: 0,
      correctBonus: 0,
      wrongBonus: 0,
      isFlagRevealed: false,
      currentClipPath: isHardOrXHard ? generateRandomClipPath() : undefined
    }));
    setTimeLeft(QUESTION_TIME);
    setGuessInput('');
    setSelectedOption(null);
    setIsCorrect(null);
  };

  const generateFlagQuestion = (country: Country, mode: GameState['mode']): Question => {
    const dataSet = mode === 'brazil' ? BRAZIL_STATES : COUNTRIES;
    const otherCountries = dataSet.filter(c => c.id !== country.id);
    const shuffledOthers = [...otherCountries].sort(() => 0.5 - Math.random());
    const options = [country.name, ...shuffledOthers.slice(0, 3).map(c => c.name)].sort(() => 0.5 - Math.random());
    
    return {
      id: `flag-${country.id}`,
      type: 'flag',
      countryId: country.id,
      question: mode === 'brazil' ? 'Which state does this flag belong to?' : 'Which country does this flag belong to?',
      image: country.flag,
      options,
      correctAnswer: country.name
    };
  };

  const generateBonusQuestion = (country: Country, mode: GameState['mode']): Question => {
    const types: ('capital' | 'continent')[] = ['capital', 'continent'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    const dataSet = mode === 'brazil' ? BRAZIL_STATES : COUNTRIES;
    const otherCountries = dataSet.filter(c => c.id !== country.id);
    const shuffledOthers = [...otherCountries].sort(() => 0.5 - Math.random());

    let question = '';
    let options: string[] = [];
    let correctAnswer = '';

    if (type === 'capital') {
      question = mode === 'brazil' ? `What is the capital of ${country.name}?` : `What is the capital of ${country.name}?`;
      correctAnswer = country.capital;
      options = [country.capital, ...shuffledOthers.slice(0, 3).map(c => c.capital)].sort(() => 0.5 - Math.random());
    } else if (type === 'continent') {
      if (mode === 'brazil') {
        question = `In which region is ${country.name} located?`;
        correctAnswer = country.continent; // Using continent field for region in Brazil data
        options = ['North', 'Northeast', 'Central-West', 'Southeast', 'South'].sort(() => 0.5 - Math.random()).slice(0, 4);
        if (!options.includes(correctAnswer)) options[0] = correctAnswer;
      } else {
        question = `In which continent is ${country.name} located?`;
        correctAnswer = country.continent;
        options = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'].sort(() => 0.5 - Math.random()).slice(0, 4);
        if (!options.includes(correctAnswer)) options[0] = correctAnswer;
      }
      options = options.sort(() => 0.5 - Math.random());
    }

    return {
      id: `bonus-${type}-${country.id}`,
      type: type as any,
      countryId: country.id,
      question,
      options,
      correctAnswer
    };
  };

  const handleAnswer = (option: string) => {
    if (selectedOption || isCorrect !== null) return;

    const normalizedOption = option.trim().toLowerCase();
    const normalizedAnswer = gameState.currentQuestion?.correctAnswer.toLowerCase() || '';
    
    // Simple normalization for accents (especially for Brazil states)
    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    const isCorrectGuess = normalize(normalizedOption) === normalize(normalizedAnswer);

    setSelectedOption(option);
    setIsCorrect(isCorrectGuess);

    const timeSpent = QUESTION_TIME - timeLeft;

    if (isCorrectGuess) {
      playSound('correct', isMuted);
      
      if (gameState.mode !== 'multiplayer') {
        let points = gameState.isBonusPhase ? BONUS_POINTS : FLAG_POINTS;
        if (gameState.isFlagRevealed && !gameState.isBonusPhase) {
          points = Math.max(1, points - REVEAL_PENALTY);
        }
        
        setGameState(prev => ({ 
          ...prev, 
          score: prev.score + points,
          totalTime: prev.totalTime + timeSpent,
          correctPrimary: prev.isBonusPhase ? prev.correctPrimary : prev.correctPrimary + 1,
          correctBonus: prev.isBonusPhase ? prev.correctBonus + 1 : prev.correctBonus
        }));

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        socket?.emit("submit-answer", { roomId: gameState.multiplayerRoomId, isCorrect: true, timeSpent });
      }
    } else {
      playSound('wrong', isMuted);
      if (gameState.mode !== 'multiplayer') {
        setGameState(prev => ({
          ...prev,
          totalTime: prev.totalTime + timeSpent,
          wrongPrimary: prev.isBonusPhase ? prev.wrongPrimary : prev.wrongPrimary + 1,
          wrongBonus: prev.isBonusPhase ? prev.wrongBonus + 1 : prev.wrongBonus,
          lives: !prev.isBonusPhase ? prev.lives - 1 : prev.lives
        }));
      } else {
        socket?.emit("submit-answer", { roomId: gameState.multiplayerRoomId, isCorrect: false, timeSpent });
      }
    }

    if (timerRef.current) clearInterval(timerRef.current);
  };

  const nextTurn = () => {
    playSound('click', isMuted);
    
    if (gameState.lives <= 0) {
      playSound('gameover', isMuted);
      setGameState(prev => ({ ...prev, gameStatus: 'gameover' }));
      setHasSaved(false);
      return;
    }

    // If we just finished a flag question correctly, go to bonus
    if (!gameState.isBonusPhase && isCorrect) {
      setGameState(prev => ({
        ...prev,
        isBonusPhase: true,
        currentQuestion: generateBonusQuestion(prev.currentCountry!, prev.mode!)
      }));
      setTimeLeft(QUESTION_TIME);
      setSelectedOption(null);
      setGuessInput('');
      setIsCorrect(null);
    } else {
      // Pick a new country
      let nextCountry: Country | undefined;
      
      if (gameState.mode === 'daily' && gameState.dailyCountries) {
        // Find next country in the daily list
        nextCountry = gameState.dailyCountries.find(c => !gameState.history.includes(c.id));
      } else {
        const dataSet = gameState.mode === 'brazil' ? BRAZIL_STATES : COUNTRIES;
        const availableCountries = dataSet.filter(c => !gameState.history.includes(c.id));
        if (availableCountries.length > 0) {
          nextCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)];
        }
      }
      
      if (!nextCountry) {
        // No more flags left! End the game as a victory/finish
        setGameState(prev => ({ ...prev, gameStatus: 'gameover' }));
        setHasSaved(false);
        return;
      }

      const isHardOrXHard = gameState.difficulty === 'hard' || gameState.difficulty === 'extremely-hard';

      setGameState(prev => ({
        ...prev,
        isBonusPhase: false,
        currentCountry: nextCountry,
        currentQuestion: generateFlagQuestion(nextCountry, prev.mode!),
        history: [...prev.history, nextCountry.id],
        isFlagRevealed: false,
        currentClipPath: isHardOrXHard ? generateRandomClipPath() : undefined
      }));
      setTimeLeft(QUESTION_TIME);
      setSelectedOption(null);
      setGuessInput('');
      setIsCorrect(null);
    }
  };

  const backToMenu = () => {
    playSound('click', isMuted);
    setSelectedOption(null);
    setIsCorrect(null);
    setTimeLeft(QUESTION_TIME);
    
    // Clear URL room parameter
    const url = new URL(window.location.href);
    if (url.searchParams.has('room')) {
      url.searchParams.delete('room');
      window.history.replaceState({}, '', url.toString());
    }

    if (gameState.multiplayerRoomId) {
      socket?.emit("leave-room", gameState.multiplayerRoomId);
    }

    setGameState(prev => ({ 
      ...prev, 
      gameStatus: 'landing', 
      mode: null,
      multiplayerRoomId: undefined,
      opponent: undefined
    }));
    joinedViaUrl.current = false;
  };

  const showRanking = () => {
    playSound('click', isMuted);
    setGameState(prev => ({ ...prev, gameStatus: 'ranking' }));
  };

  const revealFlag = () => {
    if (gameState.difficulty !== 'hard' || gameState.isFlagRevealed || isCorrect !== null) return;
    playSound('click', isMuted);
    setGameState(prev => ({ ...prev, isFlagRevealed: true }));
  };

  useEffect(() => {
    if ((gameState.gameStatus === 'question' || gameState.gameStatus === 'multiplayer-game') && timeLeft > 0 && isCorrect === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAnswer(''); // Time's up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.gameStatus, timeLeft, isCorrect]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] font-sans text-slate-900 selection:bg-globe-green/20 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-globe-blue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-globe-green/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute -bottom-24 left-1/4 w-64 h-64 bg-globe-yellow/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={backToMenu}>
          <div className="w-10 h-10 bg-gradient-to-br from-globe-blue to-globe-deep rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500">
            <Globe className="w-6 h-6 globe-spin" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-800">GeoQuiz</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          {gameState.gameStatus !== 'landing' && gameState.gameStatus !== 'ranking' && (
            <div className="flex items-center gap-4">
              {gameState.mode === 'multiplayer' && (
                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 shadow-sm">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="font-bold text-sm text-purple-700">{gameState.opponent?.score}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                <Trophy className="w-4 h-4 text-globe-yellow" />
                <span className="font-bold text-sm">{gameState.score}</span>
              </div>
              {gameState.mode !== 'multiplayer' && (
                <div className="flex items-center gap-1">
                  {[...Array(INITIAL_LIVES)].map((_, i) => (
                    <Heart 
                      key={i} 
                      className={`w-5 h-5 transition-all duration-300 ${i < gameState.lives ? 'text-red-500 fill-red-500 scale-100' : 'text-slate-200 scale-75'}`} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 pt-20 pb-12 px-4 max-w-xl mx-auto min-h-screen flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState.gameStatus === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-10 w-full"
            >
              <div className="relative inline-block">
                {/* Character/Globe Container */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <div className="w-48 h-48 rounded-full border-8 border-white shadow-2xl overflow-hidden bg-white">
                    <img 
                      src="https://picsum.photos/seed/world-map/600/600" 
                      alt="GeoQuiz" 
                      className="w-full h-full object-cover globe-spin"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Playful Eyes */}
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex gap-8">
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                      <div className="w-2 h-2 bg-slate-900 rounded-full" />
                    </div>
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                      <div className="w-2 h-2 bg-slate-900 rounded-full" />
                    </div>
                  </div>
                </motion.div>
                {/* Shadow */}
                <div className="w-32 h-4 bg-slate-900/10 rounded-full blur-md mx-auto mt-4 animate-pulse" />
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl font-black text-slate-800 leading-none tracking-tight">
                  Ready for an <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-globe-blue to-globe-green">Adventure?</span>
                </h2>
                <p className="text-slate-500 font-medium text-lg">Travel the world, one flag at a time!</p>
              </div>

              {dailyFact && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm max-w-sm mx-auto"
                >
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Did you know?</p>
                  <p className="text-slate-700 text-sm font-medium italic">"{dailyFact}"</p>
                </motion.div>
              )}

              <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Enter your name..."
                    value={playerName}
                    onChange={(e) => {
                      setPlayerName(e.target.value);
                      localStorage.setItem('geoquiz_player_name', e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-globe-blue focus:ring-0 transition-all font-bold text-slate-800"
                  />
                </div>
                <button 
                  onClick={startNewGame}
                  className="bubbly-button w-full bg-gradient-to-r from-globe-green to-emerald-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl shadow-globe-green/20 flex items-center justify-center gap-3"
                >
                  <Play className="w-8 h-8 fill-white" />
                  PLAY NOW
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={startDailyChallenge}
                    className="bubbly-button bg-white text-slate-700 py-4 rounded-2xl font-bold text-sm border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1"
                  >
                    <Calendar className="w-5 h-5 text-globe-blue" />
                    Daily
                  </button>
                  {gameState.multiplayerRoomId && !joinedViaUrl.current ? (
                    <button 
                      onClick={() => {
                        joinDuel(gameState.multiplayerRoomId);
                        joinedViaUrl.current = true;
                      }}
                      className="bubbly-button bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-purple-500/20 flex flex-col items-center justify-center gap-1"
                    >
                      <Users className="w-5 h-5" />
                      Join Duel
                    </button>
                  ) : (
                    <button 
                      onClick={() => joinDuel()}
                      className="bubbly-button bg-white text-slate-700 py-4 rounded-2xl font-bold text-sm border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1"
                    >
                      <Users className="w-5 h-5 text-purple-500" />
                      Duel
                    </button>
                  )}
                </div>
                <button 
                  onClick={challengeFriend}
                  className="bubbly-button w-full bg-white text-slate-700 py-4 rounded-2xl font-bold text-sm border-2 border-slate-100 shadow-sm flex items-center justify-center gap-2"
                >
                  <LinkIcon className="w-5 h-5 text-indigo-500" />
                  Invite Friend
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={showRanking}
                    className="bubbly-button bg-white text-slate-700 py-4 rounded-2xl font-bold text-sm border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1"
                  >
                    <Trophy className="w-5 h-5 text-globe-yellow" />
                    Hall of Fame
                  </button>
                  <button 
                    onClick={() => setShowPassport(true)}
                    className="bubbly-button bg-white text-slate-700 py-4 rounded-2xl font-bold text-sm border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center gap-1"
                  >
                    <Award className="w-5 h-5 text-blue-500" />
                    Passport
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {gameState.gameStatus === 'mode-selection' && (
            <motion.div 
              key="mode-selection"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-10 w-full"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-800 leading-none tracking-tight">
                  Choose your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-globe-blue to-globe-green">Mission</span>
                </h2>
                <p className="text-slate-500 font-medium text-lg">Select a category to start your journey</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Difficulty</p>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                    <button 
                      onClick={() => setSelectedDifficulty('easy')}
                      className={`py-3 rounded-xl font-bold transition-all ${selectedDifficulty === 'easy' ? 'bg-white text-globe-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Easy
                    </button>
                    <button 
                      onClick={() => setSelectedDifficulty('medium')}
                      className={`py-3 rounded-xl font-bold transition-all ${selectedDifficulty === 'medium' ? 'bg-white text-globe-orange shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Medium
                    </button>
                    <button 
                      onClick={() => setSelectedDifficulty('hard')}
                      className={`py-3 rounded-xl font-bold transition-all ${selectedDifficulty === 'hard' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Hard
                    </button>
                    <button 
                      onClick={() => setSelectedDifficulty('extremely-hard')}
                      className={`py-3 rounded-xl font-bold transition-all ${selectedDifficulty === 'extremely-hard' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      X-Hard
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 w-full max-w-xs mx-auto">
                  <button 
                    onClick={() => selectMode('countries')}
                    className="bubbly-button w-full bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-lg flex flex-col items-center gap-3 group hover:border-globe-blue transition-all"
                  >
                    <div className="w-16 h-16 bg-globe-blue/10 rounded-2xl flex items-center justify-center text-globe-blue group-hover:scale-110 transition-transform">
                      <Globe className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="font-black text-xl text-slate-800">World Flags</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Challenge</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => selectMode('brazil')}
                    className="bubbly-button w-full bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-lg flex flex-col items-center gap-3 group hover:border-globe-green transition-all"
                  >
                    <div className="w-16 h-16 bg-globe-green/10 rounded-2xl flex items-center justify-center text-globe-green group-hover:scale-110 transition-transform">
                      <MapIcon className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="font-black text-xl text-slate-800">Brazil States</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">National Challenge</p>
                    </div>
                  </button>
                </div>

                <button 
                  onClick={backToMenu}
                  className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {gameState.gameStatus === 'multiplayer-lobby' && (
            <motion.div 
              key="lobby"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 w-full"
            >
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center text-purple-500 mx-auto border-4 border-white shadow-xl">
                  <Users className="w-16 h-16 animate-bounce" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-800">Finding Opponent...</h2>
                <p className="text-slate-500 font-medium">Get ready for a 1v1 Geography Duel!</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm max-w-xs mx-auto space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Searching Global Servers</span>
                </div>
                {gameState.multiplayerRoomId && (
                  <button 
                    onClick={copyInviteLink}
                    className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-500 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Invite Link
                  </button>
                )}
              </div>
              <button 
                onClick={backToMenu}
                className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
              >
                Cancel Search
              </button>
            </motion.div>
          )}

          {(gameState.gameStatus === 'question' || gameState.gameStatus === 'multiplayer-game') && gameState.currentQuestion && (
            <motion.div 
              key="question"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full space-y-6"
            >
              {/* Progress & Timer */}
              <div className="flex items-center justify-between gap-4">
                {gameState.gameStatus === 'multiplayer-game' && gameState.opponent ? (
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs">YOU</div>
                        <span className="font-black text-slate-700">{gameState.score}</span>
                      </div>
                      <div className="h-4 w-[1px] bg-slate-100" />
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-700">{gameState.opponent?.score || 0}</span>
                        <div className="px-2 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-black text-[10px] uppercase tracking-tighter">
                          {gameState.opponent?.name.split(' ')[0].substring(0, 6) || 'OPP'}
                        </div>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-4 shrink-0 ${timeLeft < 5 ? 'bg-red-50 border-red-200 text-red-500 animate-pulse' : 'bg-white border-slate-100 text-slate-700'}`}>
                      {timeLeft}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 bg-white h-4 rounded-full border border-slate-100 p-1 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
                        className={`h-full rounded-full transition-colors duration-500 ${timeLeft < 5 ? 'bg-red-500' : 'bg-globe-blue'}`}
                      />
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-4 ${timeLeft < 5 ? 'bg-red-50 border-red-200 text-red-500 animate-pulse' : 'bg-white border-slate-100 text-slate-700'}`}>
                      {timeLeft}
                    </div>
                  </>
                )}
              </div>

              {/* Question Box */}
              <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative">
                {/* Header Badge */}
                <div className={`py-3 px-6 text-center text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 ${gameState.isBonusPhase ? 'bg-gradient-to-r from-globe-yellow to-globe-orange' : 'bg-gradient-to-r from-globe-blue to-globe-green'}`}>
                  {gameState.isBonusPhase ? <Star className="w-4 h-4 fill-white" /> : <Flag className="w-4 h-4" />}
                  {gameState.isBonusPhase ? 'Bonus Round!' : 'Identify the Flag'}
                </div>

                <div className="p-8 space-y-8">
                  <h3 className="text-3xl font-black text-slate-800 text-center leading-tight">
                    {gameState.currentQuestion.question}
                  </h3>

                  {gameState.currentQuestion.image && (
                    <div className="flex justify-center">
                      <motion.div
                        initial={{ scale: 0.8, rotate: -5 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="p-4 bg-slate-50 rounded-3xl border-4 border-white shadow-lg"
                      >
                        <img 
                          src={gameState.currentQuestion.image} 
                          alt="Question" 
                          className="max-h-40 object-contain rounded-xl transition-all duration-500"
                          style={{ clipPath: gameState.isFlagRevealed ? 'none' : gameState.currentClipPath }}
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                    </div>
                  )}

                  {isCorrect && gameState.currentCountry && (
                    <MapView country={gameState.currentCountry} />
                  )}

                  {gameState.difficulty === 'hard' && !gameState.isFlagRevealed && !gameState.isBonusPhase && isCorrect === null && (
                    <div className="flex justify-center -mt-4">
                      <button 
                        onClick={revealFlag}
                        className="text-[10px] font-black text-red-500 bg-red-50 px-4 py-2 rounded-full border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Star className="w-3 h-3 fill-red-500" />
                        REVEAL FULL FLAG (-{REVEAL_PENALTY} pts)
                      </button>
                    </div>
                  )}

                  {(gameState.difficulty === 'medium' || gameState.difficulty === 'extremely-hard') && !gameState.isBonusPhase ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <input 
                          type="text"
                          placeholder="Type your guess..."
                          value={guessInput}
                          onChange={(e) => setGuessInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAnswer(guessInput)}
                          disabled={isCorrect !== null}
                          className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-globe-blue focus:ring-0 transition-all font-bold text-xl text-slate-800 text-center"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={() => handleAnswer(guessInput)}
                        disabled={isCorrect !== null || !guessInput.trim()}
                        className={`bubbly-button w-full py-5 rounded-2xl font-black text-xl shadow-lg transition-all ${isCorrect !== null ? 'bg-slate-100 text-slate-400' : 'bg-globe-blue text-white shadow-globe-blue/20'}`}
                      >
                        GUESS
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {gameState.currentQuestion.options.map((option, i) => {
                        const isSelected = selectedOption === option;
                        const isCorrectOption = option === gameState.currentQuestion?.correctAnswer;
                        const showFeedback = isCorrect !== null;
                        
                        let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-globe-blue';
                        
                        if (showFeedback) {
                          if (isCorrectOption) {
                            btnStyle = 'bg-globe-green border-globe-green text-white shadow-lg shadow-globe-green/20';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20';
                          } else {
                            btnStyle = 'bg-slate-50 border-slate-100 text-slate-300 opacity-50';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-globe-blue border-globe-blue text-white';
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => handleAnswer(option)}
                            disabled={showFeedback}
                            className={`bubbly-button w-full p-5 rounded-2xl border-b-4 text-left font-bold text-lg flex items-center gap-4 ${btnStyle}`}
                          >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${isSelected || (showFeedback && isCorrectOption) ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                              {i + 1}
                            </span>
                            {option}
                            {showFeedback && isCorrectOption && <CheckCircle2 className="w-6 h-6 ml-auto" />}
                            {showFeedback && isSelected && !isCorrect && <XCircle className="w-6 h-6 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Feedback Overlay */}
                <AnimatePresence>
                  {isCorrect !== null && (
                    <motion.div 
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col items-center gap-4"
                    >
                      <div className="text-center">
                        <p className={`text-2xl font-black ${isCorrect ? 'text-globe-green' : 'text-red-500'}`}>
                          {isCorrect ? 'AWESOME!' : 'OOH, SO CLOSE!'}
                        </p>
                        {isCorrect && gameState.isBonusPhase && gameState.currentCountry?.fact && (
                          <p className="text-sm text-slate-500 italic mt-1">"{gameState.currentCountry.fact}"</p>
                        )}
                        
                        {gameState.mode === 'multiplayer' && !gameState.roundResults && (
                          <p className="text-xs font-bold text-slate-400 mt-2 animate-pulse">
                            WAITING FOR OPPONENT...
                          </p>
                        )}

                        {gameState.mode === 'multiplayer' && gameState.roundResults && (
                          <div className="mt-4 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-xs space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-500 uppercase">You</span>
                              <span className={`text-sm font-black ${gameState.roundResults[socket?.id || ''].isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                +{gameState.roundResults[socket?.id || ''].points}
                              </span>
                            </div>
                            <div className="h-[1px] bg-slate-100" />
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-500 uppercase">{gameState.opponent?.name}</span>
                              <span className={`text-sm font-black ${gameState.roundResults[Object.keys(gameState.roundResults).find(id => id !== socket?.id) || ''].isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                +{gameState.roundResults[Object.keys(gameState.roundResults).find(id => id !== socket?.id) || ''].points}
                              </span>
                            </div>
                          </div>
                        )}
                        {gameState.mode === 'multiplayer' && gameState.currentRound && gameState.maxRounds && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Round</span>
                            <span className="text-xs font-black text-slate-600">{gameState.currentRound}/{gameState.maxRounds}</span>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          if (gameState.mode === 'multiplayer') {
                            socket?.emit("next-round", gameState.multiplayerRoomId);
                          } else {
                            nextTurn();
                          }
                        }}
                        disabled={gameState.mode === 'multiplayer' && !gameState.roundResults}
                        className={`bubbly-button bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-lg flex items-center gap-2 shadow-xl ${gameState.mode === 'multiplayer' && !gameState.roundResults ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {gameState.lives <= 0 ? 'FINISH' : (gameState.mode === 'multiplayer' ? 'NEXT MISSION' : (isCorrect && !gameState.isBonusPhase ? 'BONUS ROUND!' : 'NEXT MISSION'))}
                        {gameState.mode === 'multiplayer' && gameState.readyCount !== undefined && gameState.readyCount > 0 && (
                          <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                            {gameState.readyCount}/{gameState.totalCount}
                          </span>
                        )}
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {gameState.gameStatus === 'gameover' && (
            <motion.div 
              key="gameover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-6"
            >
              <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center space-y-8">
                <div className="relative inline-block">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg ${gameState.mode === 'multiplayer' ? (gameState.opponent && gameState.score > gameState.opponent.score ? 'bg-globe-green text-white' : 'bg-globe-blue text-white') : 'bg-red-50 text-red-500'}`}>
                    {gameState.mode === 'multiplayer' ? (
                      gameState.opponent && gameState.score > gameState.opponent.score ? <Trophy className="w-12 h-12" /> : <Award className="w-12 h-12" />
                    ) : (
                      <RotateCcw className="w-12 h-12" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-full shadow-lg">
                    {gameState.mode === 'multiplayer' ? <Users className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-slate-800">
                    {gameState.mode === 'multiplayer' ? (
                      gameState.opponent && gameState.score > gameState.opponent.score ? 'VICTORY!' : 
                      gameState.opponent && gameState.score < gameState.opponent.score ? 'DEFEAT!' : 'IT\'S A TIE!'
                    ) : 'Journey\'s End!'}
                  </h2>
                  <p className="text-slate-400 font-medium">
                    {gameState.mode === 'multiplayer' ? 'The duel has concluded.' : `You've explored ${gameState.history.length} countries.`}
                  </p>
                </div>

                {gameState.mode === 'multiplayer' ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">You</p>
                        <p className="text-3xl font-black text-globe-blue">{gameState.score}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{gameState.opponent?.name}</p>
                        <p className="text-3xl font-black text-purple-600">{gameState.opponent?.score}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
                        <p className="text-5xl font-black text-globe-blue">{gameState.score}</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Time</p>
                        <p className="text-5xl font-black text-globe-orange">{formatTime(gameState.totalTime)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Questions</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-globe-green">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-bold">{gameState.correctPrimary}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-500">
                            <XCircle className="w-4 h-4" />
                            <span className="font-bold">{gameState.wrongPrimary}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bonus Questions</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-globe-yellow">
                            <Star className="w-4 h-4 fill-globe-yellow" />
                            <span className="font-bold">{gameState.correctBonus}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-300">
                            <XCircle className="w-4 h-4" />
                            <span className="font-bold">{gameState.wrongBonus}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          type="text"
                          placeholder="Your Explorer Name"
                          value={playerName}
                          onChange={(e) => {
                            setPlayerName(e.target.value);
                            localStorage.setItem('geoquiz_player_name', e.target.value);
                          }}
                          className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-globe-blue focus:ring-0 transition-all font-bold text-lg text-slate-800"
                        />
                      </div>
                      <button 
                        onClick={() => saveScore(gameState.score, gameState.totalTime, gameState.difficulty, playerName)}
                        disabled={hasSaved}
                        className={`bubbly-button w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all duration-300 ${hasSaved ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed' : 'bg-globe-blue text-white shadow-globe-blue/20'}`}
                      >
                        {hasSaved ? 'SCORE SAVED!' : 'SAVE SCORE'}
                      </button>
                    </div>
                  </>
                )}

                <div className={`grid gap-3 ${gameState.mode === 'multiplayer' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {gameState.mode !== 'multiplayer' && (
                    <button 
                      onClick={startNewGame}
                      className="bubbly-button bg-globe-green text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-globe-green/20"
                    >
                      <RotateCcw className="w-5 h-5" />
                      RETRY
                    </button>
                  )}
                  <button 
                    onClick={backToMenu}
                    className="bubbly-button bg-white text-slate-600 py-4 rounded-2xl font-black border-2 border-slate-100 shadow-sm flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    MENU
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {gameState.gameStatus === 'ranking' && (
            <motion.div 
              key="ranking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-6"
            >
              <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 space-y-8">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-globe-yellow/10 rounded-2xl flex items-center justify-center text-globe-yellow mx-auto border-2 border-globe-yellow/20 relative">
                    <Trophy className="w-8 h-8" />
                    <div className="absolute -top-2 -right-2 bg-globe-blue text-white text-[8px] font-black px-2 py-1 rounded-full shadow-sm uppercase tracking-tighter">
                      Global
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800">Global Hall of Fame</h2>
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button 
                    onClick={() => setRankingDifficulty('easy')}
                    className={`py-2 rounded-xl font-bold text-sm transition-all ${rankingDifficulty === 'easy' ? 'bg-white text-globe-blue shadow-sm' : 'text-slate-400'}`}
                  >
                    Easy
                  </button>
                  <button 
                    onClick={() => setRankingDifficulty('medium')}
                    className={`py-2 rounded-xl font-bold text-sm transition-all ${rankingDifficulty === 'medium' ? 'bg-white text-globe-orange shadow-sm' : 'text-slate-400'}`}
                  >
                    Medium
                  </button>
                  <button 
                    onClick={() => setRankingDifficulty('hard')}
                    className={`py-2 rounded-xl font-bold text-sm transition-all ${rankingDifficulty === 'hard' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
                  >
                    Hard
                  </button>
                  <button 
                    onClick={() => setRankingDifficulty('extremely-hard')}
                    className={`py-2 rounded-xl font-bold text-sm transition-all ${rankingDifficulty === 'extremely-hard' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    X-Hard
                  </button>
                </div>

                <div className="space-y-3">
                  {rankings.filter(r => r.difficulty === rankingDifficulty).length > 0 ? (
                    rankings.filter(r => r.difficulty === rankingDifficulty).map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-globe-yellow text-white' : i === 1 ? 'bg-slate-300 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800">{entry.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{entry.date}</p>
                              <span className="text-[10px] text-slate-300">•</span>
                              <p className="text-[10px] text-globe-orange font-bold uppercase tracking-widest">{formatTime(entry.totalTime)}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-2xl font-black text-globe-blue">{entry.score}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto">
                        <Globe className="w-8 h-8" />
                      </div>
                      <p className="text-slate-300 italic font-medium">No global legends yet for this difficulty...</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={backToMenu}
                  className="bubbly-button w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl"
                >
                  <Home className="w-6 h-6" />
                  BACK TO MENU
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Elements */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-100 shadow-xl flex items-center gap-3">
          <div className="w-2 h-2 bg-globe-green rounded-full animate-ping" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Server Live</span>
        </div>
      </div>

      <AnimatePresence>
        {showPassport && <Passport />}
      </AnimatePresence>
    </div>
  );
}
