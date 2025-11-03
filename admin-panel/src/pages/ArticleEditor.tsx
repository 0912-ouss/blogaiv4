import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Article, Category } from '../types';
import { toast } from 'react-toastify';
import ImageUpload from '../components/Media/ImageUpload';
import RichTextEditor from '../components/Common/RichTextEditor';
import ArticleVersionHistory from '../components/Articles/ArticleVersionHistory';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  ArrowLeftIcon, 
  PhotoIcon, 
  BoltIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  StarIcon
} from '@heroicons/react/24/outline';

type WizardStep = 'setup' | 'generating' | 'review' | 'image' | 'publish';

const ArticleEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [falAiRequestJson, setFalAiRequestJson] = useState<string | null>(null);
  const [falAiResponseJson, setFalAiResponseJson] = useState<string>('');
  const [storingImage, setStoringImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(id ? 'review' : 'setup');
  const [articleGenerated, setArticleGenerated] = useState(false);
  
  const [aiSettings, setAiSettings] = useState({
    mainKeyword: '',
    secondKeywords: '',
    category_id: '',
    titleInstructions: '',
    contentInstructions: '',
  });
  
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category_id: string;
    status: 'draft' | 'published' | 'archived';
    featured_image: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    tags: string;
    scheduled_at: string;
  }>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category_id: '',
    status: 'draft',
    featured_image: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    tags: '',
    scheduled_at: '',
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchArticle();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchArticle = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.getArticle(Number(id));
      if (response.success && response.data) {
        const article = response.data;
        setFormData({
          title: article.title || '',
          slug: article.slug || '',
          content: article.content || '',
          excerpt: article.excerpt || '',
          category_id: article.category_id?.toString() || '',
          status: article.status || 'draft',
          featured_image: article.featured_image || '',
          meta_title: article.meta_title || '',
          meta_description: article.meta_description || '',
          meta_keywords: Array.isArray(article.meta_keywords) 
            ? article.meta_keywords.join(', ') 
            : article.meta_keywords || '',
          tags: '',
          scheduled_at: article.scheduled_at ? new Date(article.scheduled_at).toISOString().slice(0, 16) : '',
        });
        setArticleGenerated(!!article.content);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
    });
  };

  const handleGenerateAI = async () => {
    if (!aiSettings.mainKeyword.trim()) {
      toast.error('Please enter a main keyword');
      return;
    }

    setGenerating(true);
    setCurrentStep('generating');
    
    try {
      const selectedCategory = categories.find(c => c.id.toString() === aiSettings.category_id);
      
      const response = await api.generateArticleWithAI({
        mainKeyword: aiSettings.mainKeyword,
        secondKeywords: aiSettings.secondKeywords || undefined,
        category_id: aiSettings.category_id ? Number(aiSettings.category_id) : undefined,
        category_name: selectedCategory?.name,
        titleInstructions: aiSettings.titleInstructions || undefined,
        contentInstructions: aiSettings.contentInstructions || undefined,
      });

      if (response.success && response.data) {
        const generated = response.data as Partial<Article> & { fal_ai_request?: any };
        
        setFormData({
          ...formData,
          title: generated.title || formData.title,
          slug: generated.slug || formData.slug,
          content: generated.content || formData.content,
          excerpt: generated.excerpt || formData.excerpt,
          category_id: generated.category_id?.toString() || formData.category_id || aiSettings.category_id,
          featured_image: generated.featured_image || formData.featured_image,
          meta_title: generated.meta_title || formData.meta_title,
          meta_description: generated.meta_description || formData.meta_description,
          meta_keywords: Array.isArray(generated.meta_keywords) 
            ? generated.meta_keywords.join(', ') 
            : generated.meta_keywords || formData.meta_keywords,
        });
        
        // Store Fal.ai JSON request if available
        if (generated.fal_ai_request) {
          setFalAiRequestJson(JSON.stringify(generated.fal_ai_request, null, 2));
        }
        
        setArticleGenerated(true);
        setCurrentStep('review');
        toast.success('Article generated successfully! ✨');
      }
    } catch (error: any) {
      console.error('Error generating article:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate article';
      toast.error(`Generation Failed: ${errorMessage}`, {
        autoClose: 5000,
      });
      setCurrentStep('setup');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const articleData: Partial<Article> = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        category_id: formData.category_id ? Number(formData.category_id) : undefined,
        status: formData.status,
        featured_image: formData.featured_image || undefined,
        meta_title: formData.meta_title || undefined,
        meta_description: formData.meta_description || undefined,
        meta_keywords: formData.meta_keywords.split(',').map(k => k.trim()).filter(k => k),
        scheduled_at: formData.scheduled_at || undefined,
        ai_generated: !id, // Mark as AI generated if creating new
      };

      if (id) {
        await api.updateArticle(Number(id), articleData);
        toast.success('Article updated successfully');
      } else {
        await api.createArticle(articleData);
        toast.success('Article published successfully!');
      }
      navigate('/articles');
    } catch (error: any) {
      console.error('Error saving article:', error);
      let errorMessage = error.response?.data?.error || error.message || `Failed to ${id ? 'update' : 'create'} article`;
      
      // Handle 413 Payload Too Large errors
      if (error.response?.status === 413 || errorMessage.includes('413') || errorMessage.includes('too large') || errorMessage.includes('Payload')) {
        errorMessage = 'Article content or image is too large. Please reduce the image size or split the content into smaller sections.';
      }
      
      toast.error(errorMessage, {
        autoClose: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const steps: { key: WizardStep; label: string; icon: React.ReactNode }[] = [
    { key: 'setup', label: 'Setup', icon: <StarIcon className="w-5 h-5" /> },
    { key: 'generating', label: 'Generating', icon: <BoltIcon className="w-5 h-5" /> },
    { key: 'review', label: 'Review', icon: <EyeIcon className="w-5 h-5" /> },
    { key: 'image', label: 'Image', icon: <PhotoIcon className="w-5 h-5" /> },
    { key: 'publish', label: 'Publish', icon: <CheckCircleIcon className="w-5 h-5" /> },
  ];

  const getStepIndex = (step: WizardStep) => steps.findIndex(s => s.key === step);
  const canGoNext = () => {
    if (currentStep === 'setup') {
      return aiSettings.mainKeyword.trim().length > 0;
    }
    if (currentStep === 'review') {
      return formData.title.trim().length > 0 && formData.content.trim().length > 0;
    }
    return true;
  };

  const handleNext = () => {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key as WizardStep);
    }
  };

  const handlePrev = () => {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key as WizardStep);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/articles')}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {id ? 'Edit Article' : 'Create Article'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {id ? 'Update your article' : 'Generate a new article with AI'}
            </p>
          </div>
        </div>
        {formData.content && (
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="btn-primary flex items-center gap-2"
          >
            <EyeIcon className="w-5 h-5" />
            <span>Preview</span>
          </button>
        )}
      </div>

      {/* Progress Steps */}
      {!id && (
        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const stepIndex = getStepIndex(step.key);
              const isActive = currentStep === step.key;
              const isCompleted = stepIndex < getStepIndex(currentStep);
              const isClickable = step.key !== 'generating' && (isCompleted || step.key === 'setup' || articleGenerated);
              
              return (
                <React.Fragment key={step.key}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isClickable && step.key !== 'generating') {
                        setCurrentStep(step.key);
                      }
                    }}
                    disabled={!isClickable}
                    className={`flex flex-col items-center gap-2 flex-1 ${
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                  >
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm transition-all
                      ${isActive 
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg' 
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }
                    `}>
                      {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : step.icon}
                    </div>
                    <span className={`text-xs font-medium ${
                      isActive 
                        ? 'text-slate-900 dark:text-slate-100' 
                        : isCompleted
                        ? 'text-emerald-600'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {step.label}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      stepIndex < getStepIndex(currentStep) 
                        ? 'bg-emerald-600' 
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Setup */}
        {currentStep === 'setup' && !id && (
          <div className="card-modern p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-slate-900 dark:bg-slate-100 rounded-lg">
                <StarIcon className="h-6 w-6 text-white dark:text-slate-900" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Article Setup</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Configure your article parameters</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Info Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <BoltIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Article Generation</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Enter your main keyword and let the system create a complete, SEO-optimized article for you. You can customize everything before publishing.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Main Keyword <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={aiSettings.mainKeyword}
                  onChange={(e) => setAiSettings({ ...aiSettings, mainKeyword: e.target.value })}
                  placeholder="e.g., 'artificial intelligence'"
                  className="input-field text-lg"
                  autoFocus
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Primary focus keyword for the article
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Second Keywords <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={aiSettings.secondKeywords}
                  onChange={(e) => setAiSettings({ ...aiSettings, secondKeywords: e.target.value })}
                  placeholder="e.g., 'machine learning, deep learning'"
                  className="input-field"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Additional keywords to include naturally</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Category <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(Optional)</span>
                </label>
                <select
                  value={aiSettings.category_id}
                  onChange={(e) => setAiSettings({ ...aiSettings, category_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Title Instructions <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(Optional)</span>
                  </label>
                  <textarea
                    value={aiSettings.titleInstructions}
                    onChange={(e) => setAiSettings({ ...aiSettings, titleInstructions: e.target.value })}
                    placeholder="e.g., 'Make it catchy and include 2024'"
                    rows={3}
                    className="textarea"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Content Instructions <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(Optional)</span>
                  </label>
                  <textarea
                    value={aiSettings.contentInstructions}
                    onChange={(e) => setAiSettings({ ...aiSettings, contentInstructions: e.target.value })}
                    placeholder="e.g., 'Include real-world examples'"
                    rows={3}
                    className="textarea"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate('/articles')}
                className="px-6 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={!canGoNext() || generating}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <BoltIcon className="w-5 h-5" />
                    <span>Generate Article</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Generating - Enhanced */}
        {currentStep === 'generating' && (
          <div className="card-modern p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-8">
              {/* Animated AI Icon */}
              <div className="relative">
                <div className="animate-spin rounded-full h-24 w-24 border-4 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500 border-t-blue-600 dark:border-t-blue-400"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BoltIcon className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                {/* Pulsing rings */}
                <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-75 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-50 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
              
              {/* Progress Steps */}
              <div className="w-full max-w-md space-y-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Generating Your Article</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">AI is crafting high-quality content for you...</p>
                
                {/* Progress Steps */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Analyzing keywords and topic</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 animate-pulse">
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center animate-spin">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Generating content with AI...</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 opacity-50">
                    <div className="w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center">
                      <span className="text-xs text-white">3</span>
                    </div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Optimizing and formatting</span>
                  </div>
                </div>
                
                {/* Estimated Time */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 uppercase tracking-wide mb-1">Estimated Time</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">10-30 seconds</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Edit */}
        {(currentStep === 'review' || id) && (
          <div className="space-y-6">
            <div className="card-modern p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 dark:bg-slate-100 rounded-lg">
                    <EyeIcon className="h-6 w-6 text-white dark:text-slate-900" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Review & Edit</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Review and customize your generated article</p>
                  </div>
                </div>
                {!id && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canGoNext()}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="input-field text-lg font-semibold"
                    placeholder="Article Title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    className="textarea"
                    placeholder="Short description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Content *</label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    height={600}
                    placeholder="Start writing your article..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="input-field"
                      placeholder="article-slug"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Image */}
        {currentStep === 'image' && !id && (
          <div className="card-modern p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900 dark:bg-slate-100 rounded-lg">
                  <PhotoIcon className="h-6 w-6 text-white dark:text-slate-900" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Featured Image</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Add or generate a featured image</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex items-center gap-2"
                >
                  Skip
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {formData.featured_image ? (
              <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-800">
                <img
                  src={formData.featured_image}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircleIcon className="h-4 w-4" />
                  Image Ready
                </div>
              </div>
            ) : (
              <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                <div className="text-center">
                  <PhotoIcon className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">No featured image</p>
                </div>
              </div>
            )}

            {falAiRequestJson && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300">Fal.ai Request JSON</h4>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(falAiRequestJson);
                        toast.success('JSON copied!');
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                      Copy
                    </button>
                  </div>
                  <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded-lg overflow-x-auto border border-purple-200 dark:border-purple-800 text-gray-800 dark:text-gray-200">
                    {falAiRequestJson}
                  </pre>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <h4 className="text-sm font-bold text-green-900 dark:text-green-300 mb-2">Fal.ai Response JSON</h4>
                  <textarea
                    value={falAiResponseJson}
                    onChange={(e) => setFalAiResponseJson(e.target.value)}
                    placeholder="Paste Fal.ai JSON response here..."
                    rows={6}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 rounded-lg focus:outline-none focus:border-green-500 transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 font-mono resize-none"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!falAiResponseJson.trim()) {
                        toast.error('Please paste the JSON response');
                        return;
                      }
                      try {
                        setStoringImage(true);
                        const responseData = JSON.parse(falAiResponseJson);
                        let imageUrl = responseData.images?.[0]?.url || responseData.image_url || responseData.output?.images?.[0]?.url || responseData.output?.image_url;
                        if (!imageUrl) {
                          toast.error('Image URL not found in response');
                          return;
                        }
                        const imageResponse = await fetch(imageUrl);
                        const blob = await imageResponse.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, featured_image: reader.result as string });
                          toast.success('Image loaded!');
                          setFalAiResponseJson('');
                        };
                        reader.readAsDataURL(blob);
                      } catch (error: any) {
                        toast.error(error.message || 'Failed to process image');
                      } finally {
                        setStoringImage(false);
                      }
                    }}
                    disabled={storingImage || !falAiResponseJson.trim()}
                    className="mt-3 w-full btn-success disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {storingImage ? (
                      <>
                        <div className="spinner h-4 w-4"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>Load Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Publish */}
        {currentStep === 'publish' && !id && (
          <div className="card-modern p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900 dark:bg-slate-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-white dark:text-slate-900" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Publish Article</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Final review and publish settings</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                Back
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
                    className="input-field"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Schedule Publication (Optional)
                  </label>
                  <DatePicker
                    selected={formData.scheduled_at ? new Date(formData.scheduled_at) : null}
                    onChange={(date: Date | null) => {
                      setFormData({
                        ...formData,
                        scheduled_at: date ? date.toISOString() : '',
                        status: date ? 'draft' : formData.status, // Auto-set to draft if scheduled
                      });
                    }}
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    placeholderText="Select date and time"
                    className="input-field w-full"
                    wrapperClassName="w-full"
                  />
                  {formData.scheduled_at && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, scheduled_at: '' })}
                      className="mt-2 text-xs text-red-600 hover:text-red-800"
                    >
                      Clear schedule
                    </button>
                  )}
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Article will be published automatically at the scheduled time
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="input-field"
                    placeholder="SEO title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Meta Description</label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={3}
                    className="textarea"
                    placeholder="SEO description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Meta Keywords</label>
                  <input
                    type="text"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    className="input-field"
                    placeholder="keyword1, keyword2"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="submit"
                disabled={saving || !formData.title.trim() || !formData.content.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="spinner h-5 w-5"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>{formData.status === 'published' ? 'Publish Article' : 'Save as Draft'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Edit Mode - Show all fields */}
        {id && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card-modern p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="input-field text-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Content *</label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    height={600}
                    placeholder="Start writing your article..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    className="textarea"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card-modern p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Publish</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
                      className="input-field"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Schedule Publication (Optional)
                    </label>
                    <DatePicker
                      selected={formData.scheduled_at ? new Date(formData.scheduled_at) : null}
                      onChange={(date: Date | null) => {
                        setFormData({
                          ...formData,
                          scheduled_at: date ? date.toISOString() : '',
                          status: date ? 'draft' : formData.status,
                        });
                      }}
                      showTimeSelect
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={new Date()}
                      placeholderText="Select date and time"
                      className="input-field w-full"
                      wrapperClassName="w-full"
                    />
                    {formData.scheduled_at && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, scheduled_at: '' })}
                        className="mt-2 text-xs text-red-600 hover:text-red-800"
                      >
                        Clear schedule
                      </button>
                    )}
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Article will be published automatically at the scheduled time
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : formData.scheduled_at ? 'Schedule Article' : 'Update Article'}
                  </button>
                </div>
                {id && (
                  <div className="mt-4">
                    <ArticleVersionHistory 
                      articleId={parseInt(id)} 
                      onRestore={() => {
                        // Refresh article data after restore
                        fetchArticle();
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="card-modern p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Featured Image</h3>
                <ImageUpload
                  onUploadComplete={(url) => setFormData({ ...formData, featured_image: url })}
                  currentImage={formData.featured_image}
                  folder="articles"
                  maxWidth={1920}
                  maxHeight={1080}
                  showPreview={true}
                />
                {formData.featured_image && (
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">
                      Image URL (or upload above)
                    </label>
                    <input
                      type="url"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      className="input-field text-sm"
                      placeholder="Image URL"
                    />
                  </div>
                )}
              </div>

              <div className="card-modern p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">SEO</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">Meta Description</label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      rows={2}
                      className="textarea text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-900 dark:bg-black transition-opacity"
              onClick={() => setShowPreview(false)}
            />
            <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="px-6 pt-5 pb-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  {formData.featured_image && (
                    <img src={formData.featured_image} alt={formData.title} className="w-full h-64 object-cover rounded-xl mb-6" />
                  )}
                  <h1 className="text-3xl font-semibold mb-4">{formData.title}</h1>
                  {formData.excerpt && <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 italic">{formData.excerpt}</p>}
                  <div className="post-content" dangerouslySetInnerHTML={{ __html: formData.content }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleEditor;
