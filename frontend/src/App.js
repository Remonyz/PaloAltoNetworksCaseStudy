import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Target, CreditCard, AlertCircle, Lightbulb, Save, Shield, Calculator, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, MessageCircle, Send, X, Minimize2, Sparkles, Menu, Loader, Zap, CheckCircle, XCircle } from 'lucide-react';

const FinancialCoach = () => {
  // Core state management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [insights, setInsights] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // Advanced features state
  const [emergencyFund, setEmergencyFund] = useState(null);
  const [whatIfScenario, setWhatIfScenario] = useState(null);
  const [subOptimizations, setSubOptimizations] = useState([]);
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const chatEndRef = useRef(null);
  
  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadFromStorage = () => {
    try {
      const storageKeys = {
        'financial-transactions': setTransactions,
        'financial-goals': setGoals,
        'financial-insights': setInsights,
        'financial-subscriptions': setSubscriptions,
        'emergency-fund': setEmergencyFund,
        'subscription-optimizations': setSubOptimizations,
        'chat-history': setChatMessages
      };

      Object.entries(storageKeys).forEach(([key, setter]) => {
        const data = localStorage.getItem(key);
        if (data) {
          setter(JSON.parse(data));
        }
      });
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

  const generateSampleTransactions = () => {
    const categories = [
      { name: 'Coffee & Cafes', merchants: ['Starbucks', 'Blue Bottle', 'Peets Coffee', 'Local Cafe'] },
      { name: 'Groceries', merchants: ['Whole Foods', 'Trader Joes', 'Safeway', 'Target'] },
      { name: 'Dining', merchants: ['Chipotle', 'Panera', 'Local Restaurant', 'Pizza Place'] },
      { name: 'Transportation', merchants: ['Uber', 'Lyft', 'Gas Station', 'Parking'] },
      { name: 'Entertainment', merchants: ['Movie Theater', 'Concert Venue', 'Sports Event'] },
      { name: 'Utilities', merchants: ['PG&E', 'Water Company', 'Internet'] },
    ];

    const sampleTx = [];
    const today = new Date();
    
    // Generate 90 days of transactions
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

    // Add recurring subscriptions
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
        body: JSON.stringify({ prompt })
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
        title: 'Coffee Spending Alert',
        message: `You spent $${categoryTotals['Coffee & Cafes'].toFixed(2)} on coffee this month. Brewing at home 3 days a week could save you over $${annualSavings} annually.`,
        amount: categoryTotals['Coffee & Cafes'],
        category: 'Coffee & Cafes'
      });
    }

    if (categoryTotals['Dining'] > 200) {
      newInsights.push({
        type: 'info',
        title: 'Dining Out Frequently',
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
          title: 'Great Job on Home Cooking',
          message: `You're spending more on groceries than dining out. This shows excellent financial discipline and healthy habits.`,
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
        body: JSON.stringify({ prompt })
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
      alert('Error generating forecast. Your goal has been saved.');
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

  // AI Chat functionality
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
        content: 'Sorry, I encountered an error. Please make sure your backend is running and try again.',
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

  // Advanced features functions
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
          description: 'Essential expenses only'
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

  const optimizeSubscriptions = async () => {
    if (subscriptions.length === 0) {
      alert('No subscriptions detected. Run AI Analysis first.');
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

  // Emergency Fund Display Component
  const EmergencyFundDisplay = () => {
    if (!emergencyFund) {
      return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 text-center shadow-sm border border-gray-100">
          <Shield className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Emergency Fund Stress Test</h3>
          <p className="text-gray-500 mb-8">Test your financial resilience against unexpected events</p>
          <button
            onClick={runEmergencyFundStressTest}
            disabled={aiAnalyzing}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {aiAnalyzing ? 'Analyzing...' : 'Run Stress Test'}
          </button>
        </div>
      );
    }

    const riskLevel = emergencyFund.scenarios.jobLoss.monthsCovered < 3 ? 'High' : 
                      emergencyFund.scenarios.jobLoss.monthsCovered < 6 ? 'Medium' : 'Low';
    const riskColors = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-amber-100 text-amber-800',
      Low: 'bg-emerald-100 text-emerald-800'
    };

    return (
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Emergency Fund Analysis</h3>
              <p className="text-gray-500">Current Balance: ${emergencyFund.currentFund.toFixed(2)}</p>
            </div>
            <div className={`px-4 py-2 rounded-2xl font-semibold ${
              emergencyFund.scenarios.jobLoss.monthsCovered < 3 ? 'bg-red-100 text-red-700' :
              emergencyFund.scenarios.jobLoss.monthsCovered < 6 ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {emergencyFund.scenarios.jobLoss.monthsCovered < 3 ? 'High Risk' :
               emergencyFund.scenarios.jobLoss.monthsCovered < 6 ? 'Medium Risk' : 'Low Risk'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(emergencyFund.scenarios).map(([key, scenario]) => (
              <div key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={20} className="text-amber-600" />
                  <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                {scenario.oneTimeCost && (
                  <p className="text-sm text-red-600 mb-2">Initial Cost: ${scenario.oneTimeCost}</p>
                )}
                <p className="text-xl font-bold text-indigo-600">
                  {scenario.monthsCovered > 0 
                    ? `${scenario.monthsCovered.toFixed(1)} months` 
                    : 'Insufficient funds'}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 p-6 rounded-3xl mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
              <Lightbulb className="text-indigo-600" />
              AI Recommendation
            </h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{emergencyFund.aiAnalysis}</p>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500 mb-1">Recommended Fund</p>
              <p className="text-2xl font-bold text-emerald-600">${emergencyFund.recommendedFund.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{(emergencyFund.recommendedFund / emergencyFund.monthlyEssentials).toFixed(0)} months coverage</p>
            </div>
            <button
              onClick={runEmergencyFundStressTest}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              Re-test
            </button>
          </div>
        </div>
      </div>
    );
  };

  // What-If Simulator Display
  const WhatIfSimulatorDisplay = () => {
    if (!whatIfScenario) {
      return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 text-center shadow-sm border border-gray-100">
          <Calculator className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial Scenarios</h3>
          <p className="text-gray-500 mb-6">Explore how life changes could impact your finances</p>
          <button
            onClick={runWhatIfSimulator}
            disabled={aiAnalyzing}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {aiAnalyzing ? 'Analyzing...' : 'Run Simulation'}
          </button>
        </div>
      );
    }

    const isPositive = whatIfScenario.totalImpact > 0;

    return (
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{whatIfScenario.scenario.type}</h3>
              <p className="text-gray-500 mt-1">{whatIfScenario.scenario.description}</p>
            </div>
            <button
              onClick={runWhatIfSimulator}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              New Scenario
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="font-semibold mb-4 text-gray-700">Current Situation</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Income</span>
                  <span className="font-semibold text-gray-900">${whatIfScenario.current.income.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Expenses</span>
                  <span className="font-semibold text-red-600">-${whatIfScenario.current.expenses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-700">Monthly Savings</span>
                  <span className="font-bold text-indigo-600">${whatIfScenario.current.savings.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
              <h4 className="font-semibold mb-4 text-indigo-700">Projected Outcome</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Income</span>
                  <span className="font-semibold text-gray-900">
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
                <div className="flex justify-between pt-3 border-t border-indigo-200">
                  <span className="font-semibold text-gray-700">Monthly Savings</span>
                  <span className="font-bold text-purple-700">${whatIfScenario.projected.savings.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-6 p-6 rounded-2xl ${whatIfScenario.totalImpact > 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className={whatIfScenario.totalImpact > 0 ? 'text-green-600' : 'text-red-600'} />
                Total Impact ({whatIfScenario.scenario.timeframe} months)
              </h4>
              <span className={`text-2xl font-bold ${whatIfScenario.totalImpact > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {whatIfScenario.totalImpact > 0 ? '+' : ''}${whatIfScenario.totalImpact.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Your monthly savings would {whatIfScenario.totalImpact > 0 ? 'increase' : 'decrease'} by ${Math.abs(whatIfScenario.projected.savings - whatIfScenario.current.savings).toFixed(2)}
            </p>
          </div>

          <div className="mt-6 bg-indigo-50 rounded-2xl p-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-indigo-900">
              <Lightbulb className="text-indigo-600" />
              AI Analysis
            </h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{whatIfScenario.aiAnalysis}</p>
          </div>
        </div>
      </div>
    );
  };

  const SubscriptionOptimizerDisplay = () => {
    const [expandedSub, setExpandedSub] = useState(null);

    if (subOptimizations.length === 0) {
      return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 text-center shadow-sm border border-gray-100">
          <Save className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Subscription Optimizer</h3>
          <p className="text-gray-500 mb-6">Find better deals and eliminate wasteful spending</p>
          <button
            onClick={optimizeSubscriptions}
            disabled={aiAnalyzing || subscriptions.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {aiAnalyzing ? 'Optimizing...' : subscriptions.length === 0 ? 'Detect Subscriptions First' : 'Optimize Now'}
          </button>
        </div>
      );
    }

    const totalSavings = subOptimizations.reduce((sum, opt) => sum + (opt.potentialSavings || 0), 0);
    const currentTotal = subOptimizations.reduce((sum, opt) => sum + opt.currentCost, 0);

    const getRecommendationColor = (rec) => {
      switch(rec) {
        case 'Cancel': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-200' };
        case 'Downgrade': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-200' };
        case 'Switch': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-200' };
        case 'Keep': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-200' };
        default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', badge: 'bg-gray-200' };
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-3xl p-8 shadow-lg shadow-green-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Potential Annual Savings</h3>
              <p className="text-green-100">Based on AI recommendations</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">${(totalSavings * 12).toFixed(2)}</div>
              <div className="text-green-100 text-lg mt-1">${totalSavings.toFixed(2)}/month</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Optimization Recommendations</h3>
            <button
              onClick={optimizeSubscriptions}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Re-analyze
            </button>
          </div>

          <div className="space-y-4">
            {subOptimizations.map((opt, idx) => {
              const colors = getRecommendationColor(opt.recommendation);
              const isExpanded = expandedSub === idx;

              return (
                <div key={idx} className={`border-2 ${colors.border} rounded-2xl overflow-hidden`}>
                  <div 
                    className={`${colors.bg} p-5 cursor-pointer hover:opacity-90 transition-all`}
                    onClick={() => setExpandedSub(isExpanded ? null : idx)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg text-gray-900">{opt.merchant}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.badge} ${colors.text}`}>
                            {opt.recommendation}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{opt.reason}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-gray-500 line-through text-sm">${opt.currentCost.toFixed(2)}/mo</div>
                        {opt.potentialSavings > 0 && (
                          <div className="text-green-600 font-bold text-lg">Save ${opt.potentialSavings.toFixed(2)}/mo</div>
                        )}
                        {isExpanded ? <ChevronUp className="mt-2 text-gray-400" size={20} /> : <ChevronDown className="mt-2 text-gray-400" size={20} />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-white p-5 border-t-2 border-gray-100">
                      {opt.alternative && (
                        <div className="mb-4">
                          <p className="font-semibold text-sm text-gray-700 mb-1">Recommended Alternative:</p>
                          <p className="text-indigo-600 font-medium">{opt.alternative}</p>
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
                        <div className="mt-4 pt-4 border-t bg-green-50 rounded-xl p-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Annual Impact:</span> Save ${(opt.potentialSavings * 12).toFixed(2)} per year
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-indigo-50 rounded-2xl p-6">
              <h4 className="font-semibold mb-4 text-indigo-900">Summary</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Current Monthly Cost</p>
                  <p className="font-bold text-2xl text-gray-900">${currentTotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Optimized Monthly Cost</p>
                  <p className="font-bold text-2xl text-green-600">${(currentTotal - totalSavings).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // UI Components with premium design
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

    const categoryColors = {
      'Coffee & Cafes': '#8B4513',
      'Groceries': '#10B981',
      'Dining': '#F59E0B',
      'Transportation': '#3B82F6',
      'Entertainment': '#8B5CF6',
      'Utilities': '#EF4444',
      'Software': '#06B6D4',
      'Health': '#EC4899',
      'Shopping': '#F97316',
      'News': '#6366F1'
    };

    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Spending Overview</h3>
        <div className="space-y-4">
          {sortedCategories.map(([category, amount]) => {
            const percentage = (amount / total) * 100;
            const color = categoryColors[category] || '#6B7280';
            
            return (
              <div key={category}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <span className="text-sm font-semibold text-gray-900">${amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-2 rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total</div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Spending</span>
            <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Overview', icon: DollarSign },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'emergency-fund', label: 'Safety Net', icon: Shield },
    { id: 'what-if', label: 'Scenarios', icon: Calculator },
    { id: 'sub-optimizer', label: 'Optimize', icon: Save },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <DollarSign className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">FinanceAI</h1>
                  <p className="text-xs text-gray-500">Your Personal CFO</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {transactions.length === 0 ? (
                <button
                  onClick={generateSampleTransactions}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200"
                >
                  Get Started
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200"
                  >
                    <Sparkles size={18} />
                    <span>Ask AI</span>
                  </button>
                  <button
                    onClick={analyzeWithAI}
                    disabled={aiAnalyzing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-50"
                  >
                    {aiAnalyzing ? (
                      <>
                        <Loader className="animate-spin" size={18} />
                        <span className="hidden sm:inline">Analyzing</span>
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        <span className="hidden sm:inline">Analyze</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Display */}
        {apiError && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">Connection Issue</p>
              <p className="text-sm text-amber-700 mt-1">{apiError}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
            <div className="sticky top-24">
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && transactions.length > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Stats Cards */}
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
                    <p className="text-indigo-100 text-sm font-medium mb-1">Total Spending</p>
                    <p className="text-3xl font-bold">
                      ${transactions
                        .filter(tx => {
                          const txDate = new Date(tx.date);
                          const thirtyDaysAgo = new Date();
                          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                          return txDate >= thirtyDaysAgo;
                        })
                        .reduce((sum, tx) => sum + tx.amount, 0)
                        .toFixed(2)}
                    </p>
                    <p className="text-indigo-100 text-sm mt-1">Last 30 days</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-600 text-sm font-medium mb-1">Active Subscriptions</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {subscriptions.filter(s => s.active).length}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      ${subscriptions.filter(s => s.active).reduce((sum, s) => sum + s.amount, 0).toFixed(2)}/mo
                    </p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-600 text-sm font-medium mb-1">Active Goals</p>
                    <p className="text-3xl font-bold text-gray-900">{goals.length}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {goals.length > 0 ? 'Keep pushing forward' : 'Set your first goal'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SpendingChart />
                  
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold mb-6 text-gray-900">Recent Activity</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {transactions.slice(0, 10).map(tx => (
                        <div key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                          <div>
                            <div className="font-medium text-gray-900">{tx.merchant}</div>
                            <div className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">-${tx.amount.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">{tx.category}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-4">
                {insights.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                    <Lightbulb className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Insights Yet</h3>
                    <p className="text-gray-500 mb-6">Run an AI analysis to get personalized financial insights</p>
                    <button
                      onClick={analyzeWithAI}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all"
                    >
                      Analyze Now
                    </button>
                  </div>
                ) : (
                  insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className={`bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border-l-4 ${
                        insight.type === 'warning' ? 'border-amber-400' :
                        insight.type === 'success' ? 'border-emerald-400' :
                        'border-indigo-400'
                      }`}
                    >
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">{insight.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{insight.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Goals Tab */}
            {activeTab === 'goals' && (
              <div className="space-y-6">
                <button
                  onClick={addGoal}
                  className="w-full p-6 bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-gray-600 hover:text-indigo-600 font-medium"
                >
                  + Add New Goal
                </button>
                
                {goals.map(goal => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  const monthsLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (30 * 24 * 60 * 60 * 1000));
                  
                  return (
                    <div key={goal.id} className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{goal.name}</h3>
                          <p className="text-gray-500">Target: ${goal.targetAmount.toFixed(2)}</p>
                        </div>
                        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                          <Target className="text-indigo-600" size={28} />
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-3">
                          <span className="text-sm text-gray-600">${goal.currentAmount.toFixed(2)}</span>
                          <span className="text-sm font-semibold text-indigo-600">{progress.toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Monthly Target</div>
                          <div className="text-lg font-semibold text-gray-900">${goal.monthlyTarget.toFixed(2)}</div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <div className="text-sm text-gray-600 mb-1">Time Remaining</div>
                          <div className="text-lg font-semibold text-gray-900">{monthsLeft} months</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                {subscriptions.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                    <CreditCard className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subscriptions Found</h3>
                    <p className="text-gray-500">Run AI Analysis to detect recurring subscriptions</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg shadow-indigo-200">
                      <h3 className="text-lg font-medium mb-1 text-indigo-100">Monthly Subscriptions</h3>
                      <div className="text-4xl font-bold mb-2">
                        ${subscriptions.filter(s => s.active).reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
                      </div>
                      <p className="text-indigo-100">{subscriptions.filter(s => s.active).length} active subscriptions</p>
                    </div>
                    
                    {subscriptions.map(sub => (
                      <div key={sub.id} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{sub.merchant}</h3>
                            <p className="text-gray-500 text-sm mt-1">{sub.category}</p>
                            <p className="text-gray-400 text-xs mt-2">Last charged: {sub.lastCharge}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">${sub.amount.toFixed(2)}</div>
                            <div className="text-sm text-gray-500 mb-3">{sub.frequency}</div>
                            {sub.active ? (
                              <button
                                onClick={() => cancelSubscription(sub.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                              >
                                <XCircle size={16} />
                                Cancel
                              </button>
                            ) : (
                              <div className="text-emerald-600 text-sm font-medium flex items-center gap-1">
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

            {/* Safety Net (Emergency Fund) Tab */}
            {activeTab === 'emergency-fund' && <EmergencyFundDisplay />}

            {/* Scenarios (What-If) Tab */}
            {activeTab === 'what-if' && <WhatIfSimulatorDisplay />}

            {/* Optimize (Subscription Optimizer) Tab */}
            {activeTab === 'sub-optimizer' && <SubscriptionOptimizerDisplay />}

            {/* Empty State */}
            {transactions.length === 0 && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <DollarSign className="text-indigo-600" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to FinanceAI</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Your AI-powered personal CFO. Get started with sample data to explore powerful financial insights.</p>
                <button
                  onClick={generateSampleTransactions}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-indigo-200 transition-all duration-200"
                >
                  Load Sample Data
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* AI Chat Interface */}
      {chatOpen && (
        <div className={`fixed ${chatMinimized ? 'bottom-6 right-6' : 'bottom-0 right-0 md:bottom-6 md:right-6'} z-50 transition-all duration-300`}>
          <div className={`bg-white rounded-3xl shadow-2xl ${chatMinimized ? 'w-16 h-16' : 'w-full md:w-96 h-screen md:h-[600px]'} flex flex-col overflow-hidden border border-gray-200`}>
            {chatMinimized ? (
              <button
                onClick={() => setChatMinimized(false)}
                className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl hover:shadow-lg transition-all"
              >
                <MessageCircle size={28} />
              </button>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">AI Advisor</h3>
                      <p className="text-xs text-indigo-100">Always here to help</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChatMinimized(true)}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <Minimize2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setChatOpen(false);
                        setChatMinimized(false);
                      }}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Sparkles className="text-indigo-600" size={28} />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">How can I help?</h4>
                      <p className="text-sm text-gray-500 mb-6 px-4">I have access to your spending data and can provide personalized advice.</p>
                      <div className="space-y-2 px-2">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Quick Questions</p>
                        {quickQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => setChatInput(q)}
                            className="block w-full text-left px-4 py-3 bg-white rounded-2xl hover:bg-indigo-50 text-sm text-gray-700 transition-all hover:shadow-sm border border-gray-100"
                          >
                            {q}
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
                          className={`max-w-[85%] p-4 rounded-2xl ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                              : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-indigo-100' : 'text-gray-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-800 shadow-sm p-4 rounded-2xl border border-gray-100">
                        <Loader className="animate-spin" size={20} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Ask me anything..."
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-sm"
                      disabled={chatLoading}
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || chatLoading}
                      className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  {chatMessages.length > 0 && (
                    <button
                      onClick={clearChatHistory}
                      className="text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors"
                    >
                      Clear conversation
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      {!chatOpen && transactions.length > 0 && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl shadow-indigo-300 hover:scale-110 transition-transform flex items-center justify-center z-50"
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};

export default FinancialCoach;