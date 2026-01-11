import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Target, CreditCard, AlertCircle, Coffee, ShoppingBag, Utensils, Car, Film, Zap, CheckCircle, XCircle, Loader, TrendingUp, Shield, Calculator, Lightbulb, Save, AlertTriangle, ChevronDown, ChevronUp, MessageCircle, Send, X, Minimize2, Sparkles } from 'lucide-react';

const FinancialCoach = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [insights, setInsights] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // New state for advanced features
  const [emergencyFund, setEmergencyFund] = useState(null);
  const [whatIfScenario, setWhatIfScenario] = useState(null);
  const [subOptimizations, setSubOptimizations] = useState([]);
  
  // AI Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  
  // Load data from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadFromStorage = () => {
    try {
      const txData = localStorage.getItem('financial-transactions');
      const goalsData = localStorage.getItem('financial-goals');
      const insightsData = localStorage.getItem('financial-insights');
      const subsData = localStorage.getItem('financial-subscriptions');
      const efData = localStorage.getItem('emergency-fund');
      const subOptData = localStorage.getItem('subscription-optimizations');
      const chatData = localStorage.getItem('chat-history');
      
      if (txData) setTransactions(JSON.parse(txData));
      if (goalsData) setGoals(JSON.parse(goalsData));
      if (insightsData) setInsights(JSON.parse(insightsData));
      if (subsData) setSubscriptions(JSON.parse(subsData));
      if (efData) setEmergencyFund(JSON.parse(efData));
      if (subOptData) setSubOptimizations(JSON.parse(subOptData));
      if (chatData) setChatMessages(JSON.parse(chatData));
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  // Sample transaction data generator
  const generateSampleTransactions = () => {
    const categories = [
      { name: 'Coffee & Cafes', icon: Coffee, merchants: ['Starbucks', 'Blue Bottle', 'Peets Coffee', 'Local Cafe'] },
      { name: 'Groceries', icon: ShoppingBag, merchants: ['Whole Foods', 'Trader Joes', 'Safeway', 'Target'] },
      { name: 'Dining', icon: Utensils, merchants: ['Chipotle', 'Panera', 'Local Restaurant', 'Pizza Place'] },
      { name: 'Transportation', icon: Car, merchants: ['Uber', 'Lyft', 'Gas Station', 'Parking'] },
      { name: 'Entertainment', icon: Film, merchants: ['Movie Theater', 'Concert Venue', 'Sports Event'] },
      { name: 'Utilities', icon: Zap, merchants: ['PG&E', 'Water Company', 'Internet'] },
    ];

    const sampleTx = [];
    const today = new Date();
    
    for (let i = 0; i < 90; i++) {
      const numTxPerDay = Math.floor(Math.random() * 4) + 1;
      
      for (let j = 0; j < numTxPerDay; j++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const merchant = category.merchants[Math.floor(Math.random() * category.merchants.length)];
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        let amount;
        if (category.name === 'Coffee & Cafes') amount = Math.random() * 8 + 3;
        else if (category.name === 'Groceries') amount = Math.random() * 80 + 20;
        else if (category.name === 'Dining') amount = Math.random() * 40 + 15;
        else if (category.name === 'Transportation') amount = Math.random() * 30 + 10;
        else if (category.name === 'Entertainment') amount = Math.random() * 50 + 20;
        else amount = Math.random() * 100 + 50;
        
        sampleTx.push({
          id: `tx_${i}_${j}`,
          date: date.toISOString(),
          merchant,
          category: category.name,
          amount: parseFloat(amount.toFixed(2)),
          recurring: false
        });
      }
    }

    // Add some recurring subscriptions
    const subscriptionMerchants = [
      { name: 'Netflix', amount: 15.99, category: 'Entertainment' },
      { name: 'Spotify', amount: 10.99, category: 'Entertainment' },
      { name: 'Amazon Prime', amount: 14.99, category: 'Shopping' },
      { name: 'Planet Fitness', amount: 24.99, category: 'Health' },
      { name: 'Adobe Creative Cloud', amount: 54.99, category: 'Software' },
      { name: 'NYT Digital', amount: 17.00, category: 'News' },
    ];

    subscriptionMerchants.forEach((sub, idx) => {
      for (let month = 0; month < 3; month++) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - month);
        date.setDate(15);
        
        sampleTx.push({
          id: `sub_${idx}_${month}`,
          date: date.toISOString(),
          merchant: sub.name,
          category: sub.category,
          amount: sub.amount,
          recurring: true
        });
      }
    });

    sampleTx.sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(sampleTx);
    saveToStorage('financial-transactions', sampleTx);
    return sampleTx;
  };

  const analyzeWithAI = async () => {
    setAiAnalyzing(true);
    setApiError('');
    
    try {
      // Filter for last 30 days FIRST
      const last30Days = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return txDate >= thirtyDaysAgo;
      });

      // Calculate category totals from ONLY last 30 days
      const categoryTotals = last30Days.reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
      }, {});

      const totalSpent = last30Days.reduce((sum, tx) => sum + tx.amount, 0);
      
      // Detect potential subscriptions from last 30 days transactions
      const merchantCounts = {};
      last30Days.forEach(tx => {
        merchantCounts[tx.merchant] = (merchantCounts[tx.merchant] || 0) + 1;
      });

      const potentialSubs = Object.entries(merchantCounts)
        .filter(([_, count]) => count >= 2)
        .map(([merchant]) => merchant);

      const prompt = `You are a friendly financial coach analyzing a user's spending data. Be conversational, encouraging, and provide actionable advice.

Transaction Summary (Last 30 days):
- Total Spent: $${totalSpent.toFixed(2)}
- Category Breakdown: ${JSON.stringify(categoryTotals, null, 2)}
- Potential Subscriptions: ${potentialSubs.join(', ')}
- Total Transactions: ${last30Days.length}

Please provide:
1. Three key spending insights with specific dollar amounts and friendly suggestions
2. Identify any concerning spending patterns or anomalies
3. One positive reinforcement about their financial behavior
4. A specific, actionable recommendation to save money this month

Format as JSON:
{
  "insights": [
    {"type": "warning|info|success", "title": "...", "message": "...", "amount": 0, "category": "..."},
    ...
  ],
  "recommendation": "..."
}`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      let aiResponse = '';
      if (data.content && Array.isArray(data.content)) {
        aiResponse = data.content.find(c => c.type === 'text')?.text || '';
      } else if (data.message) {
        aiResponse = data.message;
      } else if (typeof data === 'string') {
        aiResponse = data;
      }
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setInsights(parsed.insights || []);
        saveToStorage('financial-insights', parsed.insights || []);
        
        const detectedSubs = detectSubscriptions();
        setSubscriptions(detectedSubs);
        saveToStorage('financial-subscriptions', detectedSubs);
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      setApiError(error.message || 'Failed to connect to AI service. Using rule-based insights instead.');
      generateRuleBasedInsights();
    }
    
    setAiAnalyzing(false);
  };

  const generateRuleBasedInsights = () => {
    const last30Days = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return txDate >= thirtyDaysAgo;
    });

    const categoryTotals = last30Days.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

    const newInsights = [];

    if (categoryTotals['Coffee & Cafes'] > 50) {
      const annualSavings = (categoryTotals['Coffee & Cafes'] * 12 * 0.7).toFixed(0);
      newInsights.push({
        type: 'warning',
        title: '☕ Coffee Spending Alert',
        message: `You spent $${categoryTotals['Coffee & Cafes'].toFixed(2)} on coffee this month. Brewing at home 3 days a week could save you over $${annualSavings} annually!`,
        amount: categoryTotals['Coffee & Cafes'],
        category: 'Coffee & Cafes'
      });
    }

    if (categoryTotals['Dining'] > 200) {
      newInsights.push({
        type: 'info',
        title: '🍽️ Dining Out Frequently',
        message: `Your dining expenses are $${categoryTotals['Dining'].toFixed(2)} this month. Meal prepping 2-3 times a week could reduce this by 30-40%.`,
        amount: categoryTotals['Dining'],
        category: 'Dining'
      });
    }

    if (categoryTotals['Groceries'] && categoryTotals['Dining']) {
      const ratio = categoryTotals['Groceries'] / categoryTotals['Dining'];
      if (ratio > 1.5) {
        newInsights.push({
          type: 'success',
          title: '🌟 Great Job on Home Cooking!',
          message: `You're spending more on groceries than dining out. This shows excellent financial discipline and healthy habits!`,
          amount: 0,
          category: 'Groceries'
        });
      }
    }

    setInsights(newInsights);
    saveToStorage('financial-insights', newInsights);
    
    const detectedSubs = detectSubscriptions();
    setSubscriptions(detectedSubs);
    saveToStorage('financial-subscriptions', detectedSubs);
  };

  const detectSubscriptions = () => {
    const merchantFrequency = {};
    
    transactions.forEach(tx => {
      if (!merchantFrequency[tx.merchant]) {
        merchantFrequency[tx.merchant] = {
          merchant: tx.merchant,
          category: tx.category,
          amounts: [],
          dates: []
        };
      }
      merchantFrequency[tx.merchant].amounts.push(tx.amount);
      merchantFrequency[tx.merchant].dates.push(new Date(tx.date));
    });

    const detectedSubs = [];
    
    Object.values(merchantFrequency).forEach(data => {
      if (data.amounts.length >= 2) {
        const avgAmount = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
        const amountVariance = Math.max(...data.amounts) - Math.min(...data.amounts);
        
        if (amountVariance < 1) {
          data.dates.sort((a, b) => a - b);
          let isMonthly = true;
          
          for (let i = 1; i < data.dates.length; i++) {
            const daysDiff = (data.dates[i] - data.dates[i-1]) / (1000 * 60 * 60 * 24);
            if (daysDiff < 25 || daysDiff > 35) {
              isMonthly = false;
              break;
            }
          }
          
          if (isMonthly || data.amounts.length >= 3) {
            detectedSubs.push({
              id: `sub_${data.merchant.replace(/\s/g, '_')}`,
              merchant: data.merchant,
              amount: avgAmount,
              category: data.category,
              frequency: 'Monthly',
              lastCharge: data.dates[data.dates.length - 1].toLocaleDateString(),
              active: true
            });
          }
        }
      }
    });

    return detectedSubs;
  };

  const addGoal = async () => {
    const goalName = prompt('Goal name (e.g., "Emergency Fund", "Vacation"):');
    if (!goalName) return;
    
    const targetAmount = parseFloat(prompt('Target amount ($):'));
    if (!targetAmount || isNaN(targetAmount)) return;
    
    const months = parseInt(prompt('Timeframe (months):'));
    if (!months || isNaN(months)) return;

    const newGoal = {
      id: `goal_${Date.now()}`,
      name: goalName,
      targetAmount,
      currentAmount: 0,
      targetDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      monthlyTarget: targetAmount / months
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    saveToStorage('financial-goals', updatedGoals);
    
    forecastGoal(newGoal);
  };

  const forecastGoal = async (goal) => {
    setAiAnalyzing(true);
    setApiError('');
    
    try {
      const last30Days = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return txDate >= thirtyDaysAgo;
      });

      const totalSpent = last30Days.reduce((sum, tx) => sum + tx.amount, 0);
      const avgMonthlySpending = totalSpent;
      const assumedIncome = avgMonthlySpending * 1.3;
      
      const monthsToGoal = Math.ceil((new Date(goal.targetDate) - new Date()) / (30 * 24 * 60 * 60 * 1000));

      const prompt = `As a financial advisor, analyze if this savings goal is achievable:

Goal: ${goal.name}
Target Amount: $${goal.targetAmount}
Timeframe: ${monthsToGoal} months
Monthly Target: $${goal.monthlyTarget.toFixed(2)}

User's Financial Situation:
- Estimated Monthly Income: $${assumedIncome.toFixed(2)}
- Current Monthly Spending: $${avgMonthlySpending.toFixed(2)}

Provide a friendly, encouraging forecast with:
1. Whether they're on track (yes/no)
2. If not, specific categories to reduce spending
3. Realistic monthly savings target
4. One motivating tip

Keep it conversational and under 150 words.`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      let forecast = '';
      
      if (data.content && Array.isArray(data.content)) {
        forecast = data.content.find(c => c.type === 'text')?.text || 'Unable to generate forecast';
      } else if (data.message) {
        forecast = data.message;
      } else if (typeof data === 'string') {
        forecast = data;
      }
      
      alert(`Goal Forecast:\n\n${forecast}`);
    } catch (error) {
      console.error('Forecast error:', error);
      setApiError(error.message || 'Failed to connect to AI service.');
      alert('Error generating forecast. Your goal has been saved!');
    }
    
    setAiAnalyzing(false);
  };

  const cancelSubscription = (subId) => {
    const updatedSubs = subscriptions.map(sub => 
      sub.id === subId ? { ...sub, active: false } : sub
    );
    setSubscriptions(updatedSubs);
    saveToStorage('financial-subscriptions', updatedSubs);
  };

  // ===============================
  // NEW FEATURE: AI FINANCIAL ADVISOR CHAT
  // ===============================

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    saveToStorage('chat-history', updatedMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      // Build context from user's financial data
      const last30Days = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return txDate >= thirtyDaysAgo;
      });

      const categoryTotals = last30Days.reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
      }, {});

      const totalSpent = last30Days.reduce((sum, tx) => sum + tx.amount, 0);
      const estimatedIncome = totalSpent * 1.3;
      const monthlySavings = estimatedIncome - totalSpent;

      const activeSubs = subscriptions.filter(s => s.active);
      const totalSubCost = activeSubs.reduce((sum, s) => sum + s.amount, 0);

      // Build conversation history for context
      const conversationHistory = updatedMessages.slice(-6).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const systemContext = `You are a personal financial advisor AI with access to the user's actual financial data. Be conversational, supportive, and actionable.

USER'S FINANCIAL CONTEXT (Last 30 Days):
- Total Spending: $${totalSpent.toFixed(2)}
- Estimated Income: $${estimatedIncome.toFixed(2)}
- Monthly Savings: $${monthlySavings.toFixed(2)}
- Active Subscriptions: ${activeSubs.length} ($${totalSubCost.toFixed(2)}/month)

Spending by Category:
${Object.entries(categoryTotals).map(([cat, amt]) => `- ${cat}: $${amt.toFixed(2)}`).join('\n')}

Current Goals:
${goals.length > 0 ? goals.map(g => `- ${g.name}: $${g.currentAmount}/$${g.targetAmount} (${((g.currentAmount/g.targetAmount)*100).toFixed(0)}%)`).join('\n') : 'No active goals'}

INSTRUCTIONS:
- Give specific advice based on THEIR actual numbers
- Be encouraging but honest
- Suggest concrete next steps
- If they ask "can I afford X", do the math with their actual budget
- Keep responses under 150 words unless explaining something complex
- Use a friendly, conversational tone
- Reference their actual spending categories when relevant`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: systemContext + '\n\nConversation:\n' + conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n') + '\n\nassistant:'
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      let aiResponse = '';
      
      if (data.content && Array.isArray(data.content)) {
        aiResponse = data.content.find(c => c.type === 'text')?.text || 'I apologize, I had trouble processing that. Could you try rephrasing?';
      } else if (data.message) {
        aiResponse = data.message;
      } else if (typeof data === 'string') {
        aiResponse = data;
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setChatMessages(finalMessages);
      saveToStorage('chat-history', finalMessages);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the AI service. Please make sure your backend is running and try again.',
        timestamp: new Date().toISOString()
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setChatMessages(finalMessages);
      saveToStorage('chat-history', finalMessages);
    }

    setChatLoading(false);
  };

  const clearChatHistory = () => {
    if (window.confirm('Clear all chat history?')) {
      setChatMessages([]);
      saveToStorage('chat-history', []);
    }
  };

  const quickQuestions = [
    "Can I afford a $50 dinner tonight?",
    "How am I doing on my savings goals?",
    "What subscriptions should I cancel?",
    "Show me my biggest spending category",
    "Help me save $500 this month"
  ];

  // ===============================
  // FEATURE 1: Emergency Fund Stress Test
  // ===============================
  
  const runEmergencyFundStressTest = async () => {
    setAiAnalyzing(true);
    setApiError('');
    
    try {
      const last30Days = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return txDate >= thirtyDaysAgo;
      });

      const essentialCategories = ['Groceries', 'Utilities', 'Transportation'];
      const monthlyEssentials = last30Days
        .filter(tx => essentialCategories.includes(tx.category))
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalMonthlySpending = last30Days.reduce((sum, tx) => sum + tx.amount, 0);
      
      const currentFund = parseFloat(prompt('What is your current emergency fund balance? ($)') || '0');
      
      if (isNaN(currentFund)) {
        alert('Please enter a valid number');
        setAiAnalyzing(false);
        return;
      }

      const scenarios = {
        jobLoss: {
          name: 'Job Loss',
          monthlyExpense: monthlyEssentials,
          monthsCovered: currentFund / monthlyEssentials,
          description: 'Essential expenses only (groceries, utilities, transport)'
        },
        medicalEmergency: {
          name: 'Medical Emergency',
          oneTimeCost: 5000,
          monthlyExpense: totalMonthlySpending,
          monthsCovered: (currentFund - 5000) / totalMonthlySpending,
          description: '$5,000 medical bill + regular expenses'
        },
        carRepair: {
          name: 'Major Car Repair',
          oneTimeCost: 2000,
          monthlyExpense: totalMonthlySpending,
          monthsCovered: (currentFund - 2000) / totalMonthlySpending,
          description: '$2,000 repair + regular expenses'
        }
      };

      const stressTestPrompt = `Analyze this emergency fund situation and provide advice:

Current Emergency Fund: $${currentFund.toFixed(2)}
Monthly Essential Expenses: $${monthlyEssentials.toFixed(2)}
Total Monthly Spending: $${totalMonthlySpending.toFixed(2)}

Scenarios:
1. Job Loss: Can cover ${scenarios.jobLoss.monthsCovered.toFixed(1)} months of essentials
2. Medical Emergency ($5k): ${scenarios.medicalEmergency.monthsCovered > 0 ? `Can cover ${scenarios.medicalEmergency.monthsCovered.toFixed(1)} months after` : 'Would deplete fund'}
3. Car Repair ($2k): ${scenarios.carRepair.monthsCovered > 0 ? `Can cover ${scenarios.carRepair.monthsCovered.toFixed(1)} months after` : 'Would deplete fund'}

Provide:
1. Overall risk assessment (Low/Medium/High)
2. Recommended emergency fund target (3-6 months of expenses)
3. Specific action items to build the fund
4. One encouraging statement

Keep it under 200 words and actionable.`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: stressTestPrompt })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      let aiAnalysis = '';
      
      if (data.content && Array.isArray(data.content)) {
        aiAnalysis = data.content.find(c => c.type === 'text')?.text || '';
      } else if (data.message) {
        aiAnalysis = data.message;
      } else if (typeof data === 'string') {
        aiAnalysis = data;
      }

      const efAnalysis = {
        currentFund,
        monthlyEssentials,
        totalMonthlySpending,
        scenarios,
        aiAnalysis,
        recommendedFund: monthlyEssentials * 6,
        timestamp: new Date().toISOString()
      };

      setEmergencyFund(efAnalysis);
      saveToStorage('emergency-fund', efAnalysis);
      
    } catch (error) {
      console.error('Emergency fund analysis error:', error);
      setApiError(error.message || 'Failed to analyze emergency fund');
    }
    
    setAiAnalyzing(false);
  };

  // ===============================
  // FEATURE 2: What-If Financial Simulator
  // ===============================
  
  const runWhatIfSimulator = async () => {
    setAiAnalyzing(true);
    setApiError('');
    
    try {
      const last30Days = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return txDate >= thirtyDaysAgo;
      });

      const monthlySpending = last30Days.reduce((sum, tx) => sum + tx.amount, 0);
      const estimatedIncome = monthlySpending * 1.3;

      const scenarioChoice = prompt(`Choose a scenario to simulate:
      
1. Salary increase (10% raise)
2. Side hustle ($500/month)
3. Move to cheaper area (20% less rent)
4. Cancel all non-essential subscriptions
5. Custom scenario

Enter number (1-5):`);

      if (!scenarioChoice || isNaN(scenarioChoice) || scenarioChoice < 1 || scenarioChoice > 5) {
        setAiAnalyzing(false);
        return;
      }

      let scenarioData = {};
      const choice = parseInt(scenarioChoice);
      
      if (choice === 1) {
        scenarioData = {
          type: 'Salary Increase',
          description: '10% raise',
          incomeChange: estimatedIncome * 0.1,
          expenseChange: 0,
          timeframe: 12
        };
      } else if (choice === 2) {
        scenarioData = {
          type: 'Side Hustle',
          description: '$500/month freelancing',
          incomeChange: 500,
          expenseChange: 0,
          timeframe: 12
        };
      } else if (choice === 3) {
        const currentRent = parseFloat(prompt('Current monthly rent? ($)') || '1500');
        scenarioData = {
          type: 'Location Change',
          description: '20% cheaper rent',
          incomeChange: 0,
          expenseChange: -(currentRent * 0.2),
          timeframe: 12
        };
      } else if (choice === 4) {
        const subTotal = subscriptions.filter(s => s.active).reduce((sum, s) => sum + s.amount, 0);
        scenarioData = {
          type: 'Subscription Purge',
          description: 'Cancel all subscriptions',
          incomeChange: 0,
          expenseChange: -subTotal,
          timeframe: 12
        };
      } else {
        const customIncome = parseFloat(prompt('Monthly income change? (use negative for decrease, $)') || '0');
        const customExpense = parseFloat(prompt('Monthly expense change? (use negative for savings, $)') || '0');
        const customTime = parseInt(prompt('Timeframe in months?') || '12');
        scenarioData = {
          type: 'Custom Scenario',
          description: 'Custom financial change',
          incomeChange: customIncome,
          expenseChange: customExpense,
          timeframe: customTime
        };
      }

      const currentMonthlySavings = estimatedIncome - monthlySpending;
      const newIncome = estimatedIncome + scenarioData.incomeChange;
      const newExpenses = monthlySpending + scenarioData.expenseChange;
      const newMonthlySavings = newIncome - newExpenses;
      const totalSavingsIncrease = (newMonthlySavings - currentMonthlySavings) * scenarioData.timeframe;

      const whatIfPrompt = `Analyze this financial scenario change:

Current Situation:
- Monthly Income: ${estimatedIncome.toFixed(2)}
- Monthly Spending: ${monthlySpending.toFixed(2)}
- Monthly Savings: ${currentMonthlySavings.toFixed(2)}

Proposed Change: ${scenarioData.type} - ${scenarioData.description}
- Income Change: ${scenarioData.incomeChange >= 0 ? '+' : ''}${scenarioData.incomeChange.toFixed(2)}/month
- Expense Change: ${scenarioData.expenseChange >= 0 ? '+' : ''}${scenarioData.expenseChange.toFixed(2)}/month

Projected Outcome:
- New Monthly Income: ${newIncome.toFixed(2)}
- New Monthly Spending: ${newExpenses.toFixed(2)}
- New Monthly Savings: ${newMonthlySavings.toFixed(2)}
- Total Savings Over ${scenarioData.timeframe} Months: ${totalSavingsIncrease.toFixed(2)}

Provide:
1. Is this change worthwhile? (Yes/No and why)
2. Hidden costs or considerations
3. Opportunity cost analysis
4. Action steps to implement

Keep it under 200 words and practical.`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: whatIfPrompt })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      let aiAnalysis = '';
      
      if (data.content && Array.isArray(data.content)) {
        aiAnalysis = data.content.find(c => c.type === 'text')?.text || '';
      } else if (data.message) {
        aiAnalysis = data.message;
      } else if (typeof data === 'string') {
        aiAnalysis = data;
      }

      const simulation = {
        scenario: scenarioData,
        current: {
          income: estimatedIncome,
          expenses: monthlySpending,
          savings: currentMonthlySavings
        },
        projected: {
          income: newIncome,
          expenses: newExpenses,
          savings: newMonthlySavings
        },
        totalImpact: totalSavingsIncrease,
        aiAnalysis,
        timestamp: new Date().toISOString()
      };

      setWhatIfScenario(simulation);
      
    } catch (error) {
      console.error('What-if simulation error:', error);
      setApiError(error.message || 'Failed to run simulation');
    }
    
    setAiAnalyzing(false);
  };

  // ===============================
  // FEATURE 3: Subscription Optimization Engine
  // ===============================
  
  const optimizeSubscriptions = async () => {
    if (subscriptions.length === 0) {
      alert('No subscriptions detected. Run AI Analysis first!');
      return;
    }

    setAiAnalyzing(true);
    setApiError('');
    
    try {
      const activeSubs = subscriptions.filter(s => s.active);
      const totalSubCost = activeSubs.reduce((sum, s) => sum + s.amount, 0);

      const optimizationPrompt = `Analyze these subscriptions and provide optimization recommendations:

Current Subscriptions (${activeSubs.length} active, ${totalSubCost.toFixed(2)}/month):
${activeSubs.map(s => `- ${s.merchant}: ${s.amount}/month (${s.category})`).join('\n')}

For EACH subscription, provide as JSON array:
{
  "optimizations": [
    {
      "merchant": "subscription name",
      "currentCost": 15.99,
      "recommendation": "Keep|Downgrade|Cancel|Switch",
      "alternative": "specific alternative service or plan",
      "potentialSavings": 5.00,
      "reason": "why this recommendation",
      "actionSteps": ["step 1", "step 2"]
    }
  ],
  "totalPotentialSavings": 50.00,
  "priorityActions": ["most impactful action 1", "action 2"]
}

Consider:
- Family plan opportunities
- Free alternatives
- Bundling discounts
- Underutilization (if they have multiple streaming services)
- Cheaper tiers

Be specific with alternative services and actual pricing.`;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: optimizationPrompt })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      let aiResponse = '';
      
      if (data.content && Array.isArray(data.content)) {
        aiResponse = data.content.find(c => c.type === 'text')?.text || '';
      } else if (data.message) {
        aiResponse = data.message;
      } else if (typeof data === 'string') {
        aiResponse = data;
      }

      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setSubOptimizations(parsed.optimizations || []);
        saveToStorage('subscription-optimizations', parsed.optimizations || []);
      }
      
    } catch (error) {
      console.error('Subscription optimization error:', error);
      setApiError(error.message || 'Failed to optimize subscriptions');
      
      const activeSubs = subscriptions.filter(s => s.active);
      const fallbackOptimizations = activeSubs.map(sub => {
        let recommendation = 'Keep';
        let savings = 0;
        let alternative = '';
        let reason = '';
        
        if (sub.merchant === 'Netflix' && sub.amount > 15) {
          recommendation = 'Downgrade';
          savings = 6;
          alternative = 'Netflix Basic ($9.99)';
          reason = 'Basic plan sufficient for most users';
        } else if (sub.merchant === 'Spotify' && sub.amount > 10) {
          recommendation = 'Switch';
          savings = 11;
          alternative = 'Spotify Free with ads';
          reason = 'Free tier available if ads are acceptable';
        } else if (sub.amount > 50) {
          recommendation = 'Review';
          alternative = 'Check for annual plan discount';
          reason = 'High-cost subscription - verify necessity';
        }
        
        return {
          merchant: sub.merchant,
          currentCost: sub.amount,
          recommendation,
          alternative,
          potentialSavings: savings,
          reason,
          actionSteps: ['Review account settings', 'Compare alternatives', 'Make decision']
        };
      });
      
      setSubOptimizations(fallbackOptimizations);
      saveToStorage('subscription-optimizations', fallbackOptimizations);
    }
    
    setAiAnalyzing(false);
  };

  const SpendingChart = () => {
    const categoryTotals = transactions.reduce((acc, tx) => {
      const date = new Date(tx.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (date >= thirtyDaysAgo) {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      }
      return acc;
    }, {});

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Spending by Category (Last 30 Days)</h3>
        <div className="space-y-3">
          {sortedCategories.map(([category, amount]) => {
            const percentage = (amount / total) * 100;
            return (
              <div key={category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-sm font-semibold">${amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between font-bold">
            <span>Total Spending</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Emergency Fund Display Component
  const EmergencyFundDisplay = () => {
    if (!emergencyFund) {
      return (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Shield className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold mb-2">Emergency Fund Stress Test</h3>
          <p className="text-gray-600 mb-6">See how prepared you are for financial emergencies</p>
          <button
            onClick={runEmergencyFundStressTest}
            disabled={aiAnalyzing}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {aiAnalyzing ? 'Analyzing...' : 'Run Stress Test'}
          </button>
        </div>
      );
    }

    const riskLevel = emergencyFund.scenarios.jobLoss.monthsCovered < 3 ? 'High' : 
                      emergencyFund.scenarios.jobLoss.monthsCovered < 6 ? 'Medium' : 'Low';
    const riskColor = riskLevel === 'High' ? 'red' : riskLevel === 'Medium' ? 'yellow' : 'green';

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">Emergency Fund Analysis</h3>
              <p className="text-gray-600">Current Balance: ${emergencyFund.currentFund.toFixed(2)}</p>
            </div>
            <div className={`px-4 py-2 rounded-full bg-${riskColor}-100 text-${riskColor}-800 font-semibold`}>
              {riskLevel} Risk
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(emergencyFund.scenarios).map(([key, scenario]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={20} className="text-orange-600" />
                  <h4 className="font-semibold">{scenario.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                {scenario.oneTimeCost && (
                  <p className="text-sm text-red-600 mb-1">Initial Cost: ${scenario.oneTimeCost}</p>
                )}
                <p className="text-lg font-bold text-blue-600">
                  {scenario.monthsCovered > 0 
                    ? `${scenario.monthsCovered.toFixed(1)} months` 
                    : 'Insufficient funds'}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="text-blue-600" />
              AI Recommendation
            </h4>
            <p className="text-gray-700 whitespace-pre-line">{emergencyFund.aiAnalysis}</p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Recommended Fund Size</p>
              <p className="text-xl font-bold text-green-600">${emergencyFund.recommendedFund.toFixed(2)}</p>
              <p className="text-sm text-gray-500">({(emergencyFund.recommendedFund / emergencyFund.monthlyEssentials).toFixed(0)} months of essential expenses)</p>
            </div>
            <button
              onClick={runEmergencyFundStressTest}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Re-test
            </button>
          </div>
        </div>
      </div>
    );
  };

  // What-If Simulator Display Component
  const WhatIfSimulatorDisplay = () => {
    if (!whatIfScenario) {
      return (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Calculator className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold mb-2">What-If Financial Simulator</h3>
          <p className="text-gray-600 mb-6">Explore how life changes could impact your finances</p>
          <button
            onClick={runWhatIfSimulator}
            disabled={aiAnalyzing}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
          >
            {aiAnalyzing ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      );
    }

    const isPositive = whatIfScenario.totalImpact > 0;

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold">{whatIfScenario.scenario.type}</h3>
              <p className="text-gray-600">{whatIfScenario.scenario.description}</p>
            </div>
            <button
              onClick={runWhatIfSimulator}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              New Simulation
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-4 text-gray-700">Current Situation</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Income</span>
                  <span className="font-semibold">${whatIfScenario.current.income.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Expenses</span>
                  <span className="font-semibold text-red-600">-${whatIfScenario.current.expenses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Monthly Savings</span>
                  <span className="font-bold text-blue-600">${whatIfScenario.current.savings.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
              <h4 className="font-semibold mb-4 text-purple-700">Projected Outcome</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Income</span>
                  <span className="font-semibold">
                    ${whatIfScenario.projected.income.toFixed(2)}
                    {whatIfScenario.scenario.incomeChange !== 0 && (
                      <span className={`text-xs ml-2 ${whatIfScenario.scenario.incomeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({whatIfScenario.scenario.incomeChange > 0 ? '+' : ''}{whatIfScenario.scenario.incomeChange.toFixed(2)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Expenses</span>
                  <span className="font-semibold text-red-600">
                    -${whatIfScenario.projected.expenses.toFixed(2)}
                    {whatIfScenario.scenario.expenseChange !== 0 && (
                      <span className={`text-xs ml-2 ${whatIfScenario.scenario.expenseChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({whatIfScenario.scenario.expenseChange > 0 ? '+' : ''}{whatIfScenario.scenario.expenseChange.toFixed(2)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-purple-200">
                  <span className="font-semibold">Monthly Savings</span>
                  <span className="font-bold text-purple-700">${whatIfScenario.projected.savings.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg mb-4 ${isPositive ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold flex items-center gap-2">
                {isPositive ? <TrendingUp className="text-green-600" /> : <AlertTriangle className="text-red-600" />}
                Total Impact ({whatIfScenario.scenario.timeframe} months)
              </h4>
              <span className={`text-2xl font-bold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                {isPositive ? '+' : ''}${whatIfScenario.totalImpact.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Your monthly savings would {isPositive ? 'increase' : 'decrease'} by ${Math.abs(whatIfScenario.projected.savings - whatIfScenario.current.savings).toFixed(2)}
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="text-blue-600" />
              AI Analysis
            </h4>
            <p className="text-gray-700 whitespace-pre-line">{whatIfScenario.aiAnalysis}</p>
          </div>
        </div>
      </div>
    );
  };

  // Subscription Optimization Display Component
  const SubscriptionOptimizationDisplay = () => {
    const [expandedSub, setExpandedSub] = useState(null);

    if (subOptimizations.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Save className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold mb-2">Subscription Optimizer</h3>
          <p className="text-gray-600 mb-6">Find better deals and cut unnecessary subscriptions</p>
          <button
            onClick={optimizeSubscriptions}
            disabled={aiAnalyzing || subscriptions.length === 0}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
          >
            {aiAnalyzing ? 'Optimizing...' : subscriptions.length === 0 ? 'Detect Subscriptions First' : 'Optimize Subscriptions'}
          </button>
        </div>
      );
    }

    const totalSavings = subOptimizations.reduce((sum, opt) => sum + (opt.potentialSavings || 0), 0);
    const currentTotal = subOptimizations.reduce((sum, opt) => sum + opt.currentCost, 0);

    const getRecommendationColor = (rec) => {
      switch(rec) {
        case 'Cancel': return 'red';
        case 'Downgrade': return 'yellow';
        case 'Switch': return 'blue';
        case 'Keep': return 'green';
        default: return 'gray';
      }
    };

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Potential Annual Savings</h3>
              <p className="text-green-100">Based on AI optimization recommendations</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">${(totalSavings * 12).toFixed(2)}</div>
              <div className="text-green-100">${totalSavings.toFixed(2)}/month</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Optimization Recommendations</h3>
            <button
              onClick={optimizeSubscriptions}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Re-analyze
            </button>
          </div>

          <div className="space-y-3">
            {subOptimizations.map((opt, idx) => {
              const color = getRecommendationColor(opt.recommendation);
              const isExpanded = expandedSub === idx;

              return (
                <div key={idx} className={`border-2 border-${color}-200 rounded-lg overflow-hidden`}>
                  <div 
                    className={`bg-${color}-50 p-4 cursor-pointer hover:bg-${color}-100 transition-colors`}
                    onClick={() => setExpandedSub(isExpanded ? null : idx)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg">{opt.merchant}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${color}-200 text-${color}-800`}>
                            {opt.recommendation}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{opt.reason}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-gray-500 line-through text-sm">${opt.currentCost.toFixed(2)}/mo</div>
                        {opt.potentialSavings > 0 && (
                          <div className="text-green-600 font-bold">Save ${opt.potentialSavings.toFixed(2)}/mo</div>
                        )}
                        {isExpanded ? <ChevronUp className="mt-2" /> : <ChevronDown className="mt-2" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-white p-4 border-t-2 border-gray-100">
                      {opt.alternative && (
                        <div className="mb-4">
                          <p className="font-semibold text-sm text-gray-700 mb-1">Recommended Alternative:</p>
                          <p className="text-blue-600 font-medium">{opt.alternative}</p>
                        </div>
                      )}
                      
                      {opt.actionSteps && opt.actionSteps.length > 0 && (
                        <div>
                          <p className="font-semibold text-sm text-gray-700 mb-2">Action Steps:</p>
                          <ol className="list-decimal list-inside space-y-1">
                            {opt.actionSteps.map((step, i) => (
                              <li key={i} className="text-sm text-gray-600">{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {opt.potentialSavings > 0 && (
                        <div className="mt-4 pt-4 border-t bg-green-50 p-3 rounded">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Annual Impact:</span> Save ${(opt.potentialSavings * 12).toFixed(2)}/year
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Current Monthly Cost</p>
                  <p className="font-bold text-lg">${currentTotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Optimized Monthly Cost</p>
                  <p className="font-bold text-lg text-green-600">${(currentTotal - totalSavings).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 pb-32">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <DollarSign className="text-green-600" />
                Smart Financial Coach
              </h1>
              <p className="text-gray-600 mt-1">AI-powered insights for better financial decisions</p>
            </div>
            <div className="flex gap-3">
              {transactions.length === 0 && (
                <button
                  onClick={generateSampleTransactions}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Load Sample Data
                </button>
              )}
              {transactions.length > 0 && (
                <>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center gap-2 shadow-lg"
                  >
                    <Sparkles size={20} />
                    Ask AI Advisor
                  </button>
                  <button
                    onClick={analyzeWithAI}
                    disabled={aiAnalyzing}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {aiAnalyzing ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap size={20} />
                        AI Analysis
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
          
          {apiError && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <AlertCircle className="text-yellow-400 mr-3" size={20} />
                <div>
                  <p className="text-sm text-yellow-700 font-medium">API Connection Issue</p>
                  <p className="text-sm text-yellow-600 mt-1">{apiError}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b overflow-x-auto">
            {['dashboard', 'insights', 'goals', 'subscriptions', 'emergency-fund', 'what-if', 'sub-optimizer'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && transactions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingChart />
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transactions.slice(0, 10).map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{tx.merchant}</div>
                      <div className="text-sm text-gray-600">{new Date(tx.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">-${tx.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{tx.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">Click "AI Analysis" to get personalized insights</p>
              </div>
            ) : (
              insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                    insight.type === 'warning' ? 'border-yellow-500' :
                    insight.type === 'success' ? 'border-green-500' :
                    'border-blue-500'
                  }`}
                >
                  <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                  <p className="text-gray-700">{insight.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <button
              onClick={addGoal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium w-full"
            >
              + Add New Goal
            </button>
            
            {goals.map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const monthsLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (30 * 24 * 60 * 60 * 1000));
              
              return (
                <div key={goal.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{goal.name}</h3>
                      <p className="text-gray-600">Target: ${goal.targetAmount.toFixed(2)}</p>
                    </div>
                    <Target className="text-blue-600" size={32} />
                  </div>
                  
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span>${goal.currentAmount.toFixed(2)}</span>
                      <span className="font-semibold">{progress.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Monthly Target</div>
                      <div className="font-semibold">${goal.monthlyTarget.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Months Remaining</div>
                      <div className="font-semibold">{monthsLeft}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            {subscriptions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">Run AI Analysis to detect recurring subscriptions</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">Subscription Summary</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    ${subscriptions.filter(s => s.active).reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
                    <span className="text-sm text-gray-600 font-normal">/month</span>
                  </div>
                  <p className="text-gray-600 mt-1">{subscriptions.filter(s => s.active).length} active subscriptions</p>
                </div>
                
                {subscriptions.map(sub => (
                  <div key={sub.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{sub.merchant}</h3>
                        <p className="text-gray-600">{sub.category}</p>
                        <p className="text-sm text-gray-500 mt-1">Last charged: {sub.lastCharge}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">${sub.amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">{sub.frequency}</div>
                        {sub.active ? (
                          <button
                            onClick={() => cancelSubscription(sub.id)}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                          >
                            <XCircle size={16} />
                            Mark as Cancelled
                          </button>
                        ) : (
                          <div className="mt-2 text-green-600 text-sm font-medium flex items-center gap-1">
                            <CheckCircle size={16} />
                            Cancelled
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Emergency Fund Tab */}
        {activeTab === 'emergency-fund' && <EmergencyFundDisplay />}

        {/* What-If Simulator Tab */}
        {activeTab === 'what-if' && <WhatIfSimulatorDisplay />}

        {/* Subscription Optimizer Tab */}
        {activeTab === 'sub-optimizer' && <SubscriptionOptimizationDisplay />}

        {transactions.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <DollarSign className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-semibold mb-2">Welcome to Smart Financial Coach</h2>
            <p className="text-gray-600 mb-6">Get started by loading sample transaction data to see AI-powered insights in action</p>
          </div>
        )}
      </div>

      {/* AI Chat Interface - Floating Bottom Right */}
      {chatOpen && (
        <div className={`fixed ${chatMinimized ? 'bottom-4 right-4' : 'bottom-0 right-0 md:bottom-4 md:right-4'} z-50 transition-all duration-300`}>
          <div className={`bg-white rounded-lg shadow-2xl ${chatMinimized ? 'w-16 h-16' : 'w-full md:w-96 h-screen md:h-[600px]'} flex flex-col overflow-hidden`}>
            {chatMinimized ? (
              <button
                onClick={() => setChatMinimized(false)}
                className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                <MessageCircle size={28} />
              </button>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles size={24} />
                    <div>
                      <h3 className="font-bold text-lg">AI Financial Advisor</h3>
                      <p className="text-xs text-purple-100">Your personal CFO</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChatMinimized(true)}
                      className="p-2 hover:bg-purple-700 rounded transition-colors"
                    >
                      <Minimize2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setChatOpen(false);
                        setChatMinimized(false);
                      }}
                      className="p-2 hover:bg-purple-700 rounded transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <Sparkles className="mx-auto text-purple-400 mb-4" size={48} />
                      <h4 className="font-semibold text-gray-700 mb-2">Ask me anything about your finances!</h4>
                      <p className="text-sm text-gray-600 mb-4">I have access to all your spending data and can give personalized advice.</p>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 font-semibold">Quick questions:</p>
                        {quickQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setChatInput(q);
                            }}
                            className="block w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-purple-50 text-sm text-gray-700 transition-colors"
                          >
                            💡 {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-white text-gray-800 shadow'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-purple-100' : 'text-gray-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-800 shadow p-3 rounded-lg">
                        <Loader className="animate-spin" size={20} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Ask about your finances..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      disabled={chatLoading}
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || chatLoading}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  {chatMessages.length > 0 && (
                    <button
                      onClick={clearChatHistory}
                      className="text-xs text-gray-500 hover:text-gray-700 mt-2"
                    >
                      Clear history
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Chat Button when closed */}
      {!chatOpen && transactions.length > 0 && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center z-50"
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};

export default FinancialCoach;