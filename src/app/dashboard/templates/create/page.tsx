'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { TemplateCategory, Industry, Platform, Objective, Tone } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ad_copy' as TemplateCategory,
    industry: 'general' as Industry,
    is_public: false,
    template_json: {
      platform: 'meta' as Platform,
      objective: 'sales' as Objective,
      tone: 'professional' as Tone,
      offer: '',
      target_audience: '',
      headline_pattern: '',
      cta_pattern: '',
      hook_pattern: '',
      body_pattern: '',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create template');

      router.push('/dashboard/templates');
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('Failed to create template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/templates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Template</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  placeholder="e.g., Limited Time Offer - Fitness"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TemplateCategory })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                >
                  <option value="ad_copy">Ad Copy</option>
                  <option value="reel_script">Reel Script</option>
                  <option value="social_post">Social Post</option>
                  <option value="email">Email</option>
                  <option value="landing_page">Landing Page</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                rows={3}
                placeholder="Brief description of this template..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value as Industry })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                >
                  <option value="general">General</option>
                  <option value="fitness">Fitness</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="coaching">Coaching</option>
                  <option value="local_business">Local Business</option>
                  <option value="saas">SaaS</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-8">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Make this template public</span>
                </label>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  Public templates can be used by all agencies
                </p>
              </div>
            </div>

            {/* Template Configuration */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Template Configuration</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Platform</label>
                  <select
                    value={formData.template_json.platform}
                    onChange={(e) => setFormData({
                      ...formData,
                      template_json: { ...formData.template_json, platform: e.target.value as Platform }
                    })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="meta">Meta (Facebook/Instagram)</option>
                    <option value="google">Google Ads</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Objective</label>
                  <select
                    value={formData.template_json.objective}
                    onChange={(e) => setFormData({
                      ...formData,
                      template_json: { ...formData.template_json, objective: e.target.value as Objective }
                    })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="leads">Leads</option>
                    <option value="sales">Sales</option>
                    <option value="awareness">Awareness</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tone</label>
                  <select
                    value={formData.template_json.tone}
                    onChange={(e) => setFormData({
                      ...formData,
                      template_json: { ...formData.template_json, tone: e.target.value as Tone }
                    })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                    <option value="authoritative">Authoritative</option>
                    <option value="playful">Playful</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Offer</label>
                  <input
                    type="text"
                    value={formData.template_json.offer}
                    onChange={(e) => setFormData({
                      ...formData,
                      template_json: { ...formData.template_json, offer: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    placeholder="e.g., 50% off first month"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Target Audience</label>
                  <input
                    type="text"
                    value={formData.template_json.target_audience}
                    onChange={(e) => setFormData({
                      ...formData,
                      template_json: { ...formData.template_json, target_audience: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    placeholder="e.g., Fitness enthusiasts aged 25-45"
                  />
                </div>
              </div>

              {/* Patterns */}
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Headline Pattern</label>
                  <input
                    type="text"
                    value={formData.template_json.headline_pattern}
                    onChange={(e) => setFormData({
                      ...formData,
                      template_json: { ...formData.template_json, headline_pattern: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    placeholder="e.g., Limited Time: [Discount] Off [Product]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use [brackets] for dynamic placeholders
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">CTA Pattern</label>
                  <input
                    type="text"
                    value={formData.template_json.cta_pattern}
                    onChange={(e) => setFormData({
                      ...formData,
                      template_json: { ...formData.template_json, cta_pattern: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    placeholder="e.g., Claim Your Discount Now"
                  />
                </div>

                {formData.category === 'reel_script' && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Hook Pattern</label>
                      <input
                        type="text"
                        value={formData.template_json.hook_pattern}
                        onChange={(e) => setFormData({
                          ...formData,
                          template_json: { ...formData.template_json, hook_pattern: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                        placeholder="e.g., POV: You just discovered [Solution]"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Body Pattern</label>
                      <textarea
                        value={formData.template_json.body_pattern}
                        onChange={(e) => setFormData({
                          ...formData,
                          template_json: { ...formData.template_json, body_pattern: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                        rows={3}
                        placeholder="e.g., Here's what changed: [3 key benefits]"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Link href="/dashboard/templates">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
