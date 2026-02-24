'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Globe, Lock, TrendingUp, Filter } from 'lucide-react';
import { Template, TemplateCategory, Industry } from '@/types';
import Link from 'next/link';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | 'all'>('all');
  const [showPublicOnly, setShowPublicOnly] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, selectedIndustry, showPublicOnly]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedIndustry !== 'all') params.append('industry', selectedIndustry);
      if (showPublicOnly) params.append('public', 'true');

      const response = await fetch(`/api/templates?${params}`);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (template: Template) => {
    try {
      // Increment usage count
      await fetch(`/api/templates/${template.id}`, { method: 'POST' });

      // Navigate to generate page with template data
      const params = new URLSearchParams();
      if (template.template_json.platform) params.append('platform', template.template_json.platform);
      if (template.template_json.objective) params.append('objective', template.template_json.objective);
      if (template.template_json.tone) params.append('tone', template.template_json.tone);
      if (template.template_json.offer) params.append('offer', template.template_json.offer);
      if (template.template_json.target_audience) params.append('target_audience', template.template_json.target_audience);

      window.location.href = `/dashboard/generate?${params}`;
    } catch (error) {
      console.error('Failed to use template:', error);
    }
  };

  const categories: Array<{ value: TemplateCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All Categories' },
    { value: 'ad_copy', label: 'Ad Copy' },
    { value: 'reel_script', label: 'Reel Script' },
    { value: 'social_post', label: 'Social Post' },
    { value: 'email', label: 'Email' },
    { value: 'landing_page', label: 'Landing Page' },
  ];

  const industries: Array<{ value: Industry | 'all'; label: string }> = [
    { value: 'all', label: 'All Industries' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'coaching', label: 'Coaching' },
    { value: 'local_business', label: 'Local Business' },
    { value: 'saas', label: 'SaaS' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'general', label: 'General' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Templates Library</h1>
        <Link href="/dashboard/templates/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Industry Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value as Industry | 'all')}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg"
              >
                {industries.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Public Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Visibility</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPublicOnly}
                  onChange={(e) => setShowPublicOnly(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Show public templates only</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or create your first template
            </p>
            <Link href="/dashboard/templates/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  {template.is_public ? (
                    <Globe className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs capitalize">
                    {template.category.replace('_', ' ')}
                  </span>
                  {template.industry && (
                    <span className="px-2 py-1 bg-muted rounded text-xs capitalize">
                      {template.industry.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Template Preview */}
                <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
                  {template.template_json.platform && (
                    <div>
                      <span className="text-muted-foreground">Platform:</span>{' '}
                      <span className="capitalize">{template.template_json.platform}</span>
                    </div>
                  )}
                  {template.template_json.objective && (
                    <div>
                      <span className="text-muted-foreground">Objective:</span>{' '}
                      <span className="capitalize">{template.template_json.objective}</span>
                    </div>
                  )}
                  {template.template_json.tone && (
                    <div>
                      <span className="text-muted-foreground">Tone:</span>{' '}
                      <span className="capitalize">{template.template_json.tone}</span>
                    </div>
                  )}
                </div>

                {/* Usage Count */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>Used {template.usage_count} times</span>
                </div>

                <Button
                  onClick={() => handleUseTemplate(template)}
                  className="w-full"
                  variant="outline"
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
