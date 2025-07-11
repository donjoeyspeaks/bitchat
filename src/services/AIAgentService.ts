/**
 * AI Agent Service for BitChat React Native
 * Local AI assistant using mobile-optimized models like Gemma-2B
 * TODO: Integrate with TensorFlow.js, ONNX Runtime, or Transformers.js for real inference
 */

import { AIAgent, BitchatMessage } from '../types';

export interface AIResponse {
  text: string;
  confidence: number;
  processingTime: number;
  tokens: number;
}

export interface AIQuery {
  id: string;
  text: string;
  context?: string;
  type: 'chat_assist' | 'spam_detection' | 'content_analysis' | 'translation' | 'summarization';
  priority: 'low' | 'normal' | 'high';
}

export class AIAgentService {
  private static instance: AIAgentService;
  private currentAgent: AIAgent | null = null;
  private isModelLoaded: boolean = false;
  private modelLoadingPromise: Promise<void> | null = null;
  private queryQueue: AIQuery[] = [];
  private isProcessing: boolean = false;
  private responseCache: Map<string, AIResponse> = new Map();

  // Pre-defined responses for common scenarios (fallback)
  private readonly fallbackResponses = new Map<string, string[]>([
    ['greeting', ['Hello! How can I help you?', 'Hi there!', 'Hey! What can I do for you?']],
    ['help', ['I can help with chat suggestions, content analysis, and translations.', 'Try asking me to summarize messages or detect spam.']],
    ['spam', ['This message appears to be spam.', 'This looks like unsolicited content.', 'This message seems suspicious.']],
    ['safe', ['This message appears safe.', 'Content looks legitimate.', 'No issues detected.']],
    ['error', ['Sorry, I encountered an error.', 'Something went wrong. Please try again.']],
  ]);

  static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  /**
   * Initialize AI agent with specified model
   */
  async initializeAgent(modelName: string = 'gemma-2b-it-q4'): Promise<AIAgent> {
    const agent: AIAgent = {
      id: this.generateId(),
      modelName,
      modelSize: this.getModelSize(modelName),
      isLoaded: false,
      isQuantized: modelName.includes('q4') || modelName.includes('q8'),
      capabilities: ['text', 'analysis'],
      lastUsed: Date.now(),
      usageStats: {
        totalQueries: 0,
        avgResponseTime: 0,
        batteryUsage: 0,
      },
    };

    this.currentAgent = agent;

    // Start loading model in background
    this.loadModel();

    return agent;
  }

  /**
   * Load AI model (mock implementation)
   */
  private async loadModel(): Promise<void> {
    if (this.modelLoadingPromise) {
      return this.modelLoadingPromise;
    }

    this.modelLoadingPromise = this._loadModelImpl();
    return this.modelLoadingPromise;
  }

  private async _loadModelImpl(): Promise<void> {
    if (!this.currentAgent) {
      throw new Error('No agent initialized');
    }

    try {
      console.log(`Loading AI model: ${this.currentAgent.modelName}`);

      // Mock loading delay based on model size
      const loadingTime = Math.min(this.currentAgent.modelSize / 50, 10000); // Max 10 seconds
      await new Promise(resolve => setTimeout(resolve, loadingTime));

      // In production, load actual model here:
      // - TensorFlow.js: tf.loadLayersModel() or tf.loadGraphModel()
      // - ONNX Runtime: new ort.InferenceSession()
      // - Transformers.js: pipeline('text-generation', 'model-name')

      this.isModelLoaded = true;
      this.currentAgent.isLoaded = true;

      console.log(`AI model loaded successfully: ${this.currentAgent.modelName}`);
    } catch (error) {
      console.error('Failed to load AI model:', error);
      this.isModelLoaded = false;
      this.currentAgent.isLoaded = false;
      throw error;
    }
  }

  /**
   * Process AI query
   */
  async query(query: AIQuery): Promise<AIResponse> {
    // Check cache first
    const cacheKey = this.getCacheKey(query);
    const cached = this.responseCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Add to queue if model is loading
    if (!this.isModelLoaded) {
      this.queryQueue.push(query);
      await this.loadModel();
      return this.processQueue();
    }

    return this.processQuery(query);
  }

  /**
   * Process a single query
   */
  private async processQuery(query: AIQuery): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      if (!this.currentAgent) {
        throw new Error('No agent available');
      }

      let response: string;
      let confidence: number;

      // Mock AI processing based on query type
      switch (query.type) {
        case 'spam_detection':
          response = this.detectSpam(query.text);
          confidence = 0.8;
          break;

        case 'content_analysis':
          response = this.analyzeContent(query.text);
          confidence = 0.7;
          break;

        case 'translation':
          response = this.translateText(query.text);
          confidence = 0.6;
          break;

        case 'summarization':
          response = this.summarizeText(query.text);
          confidence = 0.7;
          break;

        case 'chat_assist':
        default:
          response = this.generateChatResponse(query.text, query.context);
          confidence = 0.6;
          break;
      }

      const processingTime = Date.now() - startTime;
      const tokens = this.estimateTokens(query.text + response);

      // Update usage stats
      this.updateUsageStats(processingTime, tokens);

      const aiResponse: AIResponse = {
        text: response,
        confidence,
        processingTime,
        tokens,
      };

      // Cache response
      this.responseCache.set(this.getCacheKey(query), aiResponse);

      return aiResponse;
    } catch (error) {
      console.error('AI query processing failed:', error);
      return {
        text: this.getFallbackResponse('error'),
        confidence: 0.1,
        processingTime: Date.now() - startTime,
        tokens: 0,
      };
    }
  }

  /**
   * Process queued queries
   */
  private async processQueue(): Promise<AIResponse> {
    if (this.queryQueue.length === 0) {
      throw new Error('No queries in queue');
    }

    const query = this.queryQueue.shift()!;
    return this.processQuery(query);
  }

  /**
   * Detect spam in message content
   */
  private detectSpam(text: string): string {
    const spamKeywords = [
      'buy now', 'limited time', 'click here', 'free money', 'urgent',
      'congratulations', 'winner', 'lottery', 'inheritance', 'prince'
    ];

    const lowerText = text.toLowerCase();
    const spamScore = spamKeywords.filter(keyword => lowerText.includes(keyword)).length;

    if (spamScore >= 2) {
      return this.getFallbackResponse('spam');
    } else {
      return this.getFallbackResponse('safe');
    }
  }

  /**
   * Analyze message content
   */
  private analyzeContent(text: string): string {
    const analysis = {
      length: text.length,
      words: text.split(/\s+/).length,
      sentences: text.split(/[.!?]+/).length,
      hasLinks: /https?:\/\//.test(text),
      hasNumbers: /\d/.test(text),
      sentiment: this.analyzeSentiment(text),
    };

    return `Content analysis: ${analysis.words} words, ${analysis.sentences} sentences, sentiment: ${analysis.sentiment}`;
  }

  /**
   * Simple sentiment analysis
   */
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['good', 'great', 'awesome', 'love', 'happy', 'excellent'];
    const negativeWords = ['bad', 'hate', 'terrible', 'awful', 'sad', 'angry'];

    const lowerText = text.toLowerCase();
    const positiveScore = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeScore = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  /**
   * Mock translation
   */
  private translateText(text: string): string {
    // Mock translation - in production, use actual translation model
    return `[Translated] ${text}`;
  }

  /**
   * Mock summarization
   */
  private summarizeText(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 2) {
      return text;
    }

    // Return first and last sentence as summary
    return `${sentences[0].trim()}. ${sentences[sentences.length - 1].trim()}.`;
  }

  /**
   * Generate chat response
   */
  private generateChatResponse(text: string, context?: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return this.getFallbackResponse('greeting');
    }

    if (lowerText.includes('help')) {
      return this.getFallbackResponse('help');
    }

    if (lowerText.includes('bsv') || lowerText.includes('bitcoin')) {
      return 'I can help with BSV transactions and wallet operations. What would you like to do?';
    }

    if (lowerText.includes('send') && lowerText.includes('message')) {
      return 'Try typing your message and I can help optimize it for clarity.';
    }

    // Generic response
    return 'I understand. How can I assist you further?';
  }

  /**
   * Suggest message improvements
   */
  async suggestMessageImprovements(message: string): Promise<string[]> {
    const suggestions: string[] = [];

    // Check message length
    if (message.length > 280) {
      suggestions.push('Consider shortening your message for better readability.');
    }

    // Check for all caps
    if (message === message.toUpperCase() && message.length > 10) {
      suggestions.push('Avoid using all caps - it can appear as shouting.');
    }

    // Check for typos (basic)
    const words = message.split(/\s+/);
    const shortWords = words.filter(word => word.length < 3 && word.match(/[a-z]/i));
    if (shortWords.length / words.length > 0.3) {
      suggestions.push('Check for potential typos or abbreviations.');
    }

    return suggestions;
  }

  /**
   * Auto-complete message suggestions
   */
  async getMessageSuggestions(partial: string, context: BitchatMessage[]): Promise<string[]> {
    const suggestions: string[] = [];

    // Command suggestions
    if (partial.startsWith('/')) {
      const commands = ['/join', '/msg', '/who', '/channels', '/sendbsv', '/wallet'];
      suggestions.push(...commands.filter(cmd => cmd.startsWith(partial)));
    }

    // User mentions
    if (partial.includes('@')) {
      const lastAtIndex = partial.lastIndexOf('@');
      const userPrefix = partial.substring(lastAtIndex + 1);

      // Extract unique users from context
      const users = new Set(context.map(msg => msg.nickname).filter(Boolean));
      const matchingUsers = Array.from(users).filter(user =>
        user!.toLowerCase().startsWith(userPrefix.toLowerCase())
      );

      suggestions.push(...matchingUsers.map(user => `@${user}`));
    }

    // Channel suggestions
    if (partial.includes('#')) {
      const channels = ['#general', '#random', '#tech', '#trading'];
      const lastHashIndex = partial.lastIndexOf('#');
      const channelPrefix = partial.substring(lastHashIndex + 1);

      suggestions.push(...channels.filter(channel =>
        channel.substring(1).toLowerCase().startsWith(channelPrefix.toLowerCase())
      ));
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Get current agent status
   */
  getAgentStatus(): AIAgent | null {
    return this.currentAgent;
  }

  /**
   * Unload model to save memory
   */
  async unloadModel(): Promise<void> {
    if (this.currentAgent) {
      this.currentAgent.isLoaded = false;
    }
    this.isModelLoaded = false;
    this.modelLoadingPromise = null;
    this.responseCache.clear();

    console.log('AI model unloaded');
  }

  // Private helper methods

  private getModelSize(modelName: string): number {
    // Estimated sizes in MB
    const sizes: Record<string, number> = {
      'gemma-2b-it-q4': 150,
      'gemma-2b-it': 300,
      'phi-2-q4': 100,
      'phi-2': 200,
      'tinyllama-q4': 50,
      'tinyllama': 100,
    };

    return sizes[modelName] || 200;
  }

  private updateUsageStats(processingTime: number, tokens: number): void {
    if (!this.currentAgent) return;

    const stats = this.currentAgent.usageStats;
    stats.totalQueries++;
    stats.avgResponseTime = (stats.avgResponseTime * (stats.totalQueries - 1) + processingTime) / stats.totalQueries;
    stats.batteryUsage += this.estimateBatteryUsage(processingTime, tokens);

    this.currentAgent.lastUsed = Date.now();
  }

  private estimateBatteryUsage(processingTime: number, tokens: number): number {
    // Rough estimate: 1 mAh per 1000ms of processing + token overhead
    return (processingTime / 1000) + (tokens * 0.001);
  }

  private estimateTokens(text: string): number {
    // Rough estimate: 1 token per 4 characters
    return Math.ceil(text.length / 4);
  }

  private getCacheKey(query: AIQuery): string {
    return `${query.type}:${query.text.substring(0, 50)}`;
  }

  private getFallbackResponse(type: string): string {
    const responses = this.fallbackResponses.get(type) || ['I understand.'];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
