'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/modals/upgrade-modal';
import { UsageUpgradeModal } from '@/components/modals/usage-upgrade-modal';
import { SuccessCelebrationModal } from '@/components/modals/success-celebration-modal';
import { Sparkles, ThumbsUp, ThumbsDown, Star, Copy } from 'lucide-react';
import { SubscriptionPlan, ActionType, AdCopy, ReelScript, Platform, Objective, Tone } from '@/types';

function GenerateContentPageContent() {
  const searchParams = useSearchParams();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isUsageUpgradeModalOpen, setIsUsageUpgradeModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [upgradeData, setUpgradeData] = useState<any>(null);
  const [usageWarningData, setUsageWarningData] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);
  
  // Form state with template pre-fill support
  const [formData, setFormData] = useState({
    platform: 'meta' as Platform,
    objective: 'leads' as Objective,
    tone: 'professional' as Tone,
    offer: '',
    target_audience: '',
  });

  // Pre-fill form from URL params (template usage)
  useEffect(() => {
    const platform = searchParams.get('platform') as Platform;
    const objective = searchParams.get('objective') as Objective;
    const tone = searchParams.get('tone') as Tone;
    const offer = searchParams.get('offer');
    const target_audience = searchParams.get('target_audience');

    if (platform || objective || tone || offer || target_audience) {
      setFormData({
        platform: platform || 'meta',
        objective: objective || 'leads',
        tone: tone || 'professional',
        offer: offer || '',
        target_audience: target_audience || '',
      });
    }
  }, [searchParams]);

  const handleGenerateContent = async () => {
    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: 'example-client-id',
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.status === 429 && data.code === 'LIMIT_EXCEEDED') {
        setUpgradeData({
          currentPlan: data.plan,
          recommendedPlan: data.recommended_plan,
          actionType: data.action_type,
          currentUsage: data.current_usage,
          limit: data.limit,
        });
        setIsUpgradeModalOpen(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setGeneratedContent(data);
      
      // Show success modal if first content
      if (data.is_first_content) {
        setShowSuccessModal(true);
      }
      
      // Show usage warning modal if approaching limit
      if (data.usage_warning) {
        setUsageWarningData(data.usage_warning);
        setIsUsageUpgradeModalOpen(true);
      }
    } catch (error) {
      console.error('Generation error:', error);
    }
  };

  const handleFeedback = async (
    generationId: string,
    feedbackType: 'winner' | 'failed' | 'save_hook',
    content: string,
    contentType: 'ad_copy' | 'reel_script' | 'hook'
  ) => {
    const feedbackKey = `${feedbackType}-${content}`;
    setFeedbackLoading(feedbackKey);

    try {
      const response = await fetch('/api/content/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generation_id: generationId,
          feedback_type: feedbackType,
          content,
          content_type: contentType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save feedback');
      }

      // Show success message
      alert(data.message);
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Failed to save feedback');
    } finally {
      setFeedbackLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Generate Content</h1>

      <Card>
        <CardHeader>
          <CardTitle>AI Content Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value as Platform })}
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
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value as Objective })}
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
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value as Tone })}
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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Offer</label>
                <input
                  type="text"
                  value={formData.offer}
                  onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  placeholder="e.g., 50% off first month"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Target Audience</label>
                <input
                  type="text"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  placeholder="e.g., Fitness enthusiasts aged 25-45"
                />
              </div>
            </div>

            <Button onClick={handleGenerateContent} size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Content
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <>
          {/* Ad Copies */}
          <Card>
            <CardHeader>
              <CardTitle>Ad Copies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedContent.ad_copies?.map((copy: AdCopy, index: number) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Primary Text</div>
                    <div className="text-sm">{copy.primary_text}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Headline</div>
                    <div className="text-sm font-semibold">{copy.headline}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">CTA</div>
                    <div className="text-sm">{copy.cta}</div>
                  </div>
                  
                  {/* Feedback Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(
                        generatedContent.id,
                        'winner',
                        copy.primary_text,
                        'ad_copy'
                      )}
                      disabled={feedbackLoading === `winner-${copy.primary_text}`}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Winner
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(
                        generatedContent.id,
                        'failed',
                        copy.primary_text,
                        'ad_copy'
                      )}
                      disabled={feedbackLoading === `failed-${copy.primary_text}`}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Failed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(
                        generatedContent.id,
                        'save_hook',
                        copy.headline,
                        'hook'
                      )}
                      disabled={feedbackLoading === `save_hook-${copy.headline}`}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Save Hook
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(`${copy.primary_text}\n\n${copy.headline}\n\n${copy.cta}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reel Scripts */}
          <Card>
            <CardHeader>
              <CardTitle>Reel Scripts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedContent.reel_scripts?.map((script: ReelScript, index: number) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Hook (First 3 seconds)</div>
                    <div className="text-sm font-semibold">{script.hook}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Body</div>
                    <div className="text-sm">{script.body}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">CTA</div>
                    <div className="text-sm">{script.cta}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Duration</div>
                    <div className="text-sm">{script.duration}</div>
                  </div>
                  
                  {/* Feedback Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(
                        generatedContent.id,
                        'winner',
                        script.hook,
                        'reel_script'
                      )}
                      disabled={feedbackLoading === `winner-${script.hook}`}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Winner
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(
                        generatedContent.id,
                        'failed',
                        script.hook,
                        'reel_script'
                      )}
                      disabled={feedbackLoading === `failed-${script.hook}`}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Failed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(
                        generatedContent.id,
                        'save_hook',
                        script.hook,
                        'hook'
                      )}
                      disabled={feedbackLoading === `save_hook-${script.hook}`}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Save Hook
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(`${script.hook}\n\n${script.body}\n\n${script.cta}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* Upgrade Modal */}
      {upgradeData && (
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          currentPlan={upgradeData.currentPlan}
          recommendedPlan={upgradeData.recommendedPlan}
          actionType={upgradeData.actionType}
          currentUsage={upgradeData.currentUsage}
          limit={upgradeData.limit}
        />
      )}

      {/* Success Celebration Modal */}
      <SuccessCelebrationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="first_content"
        data={{
          contentId: generatedContent?.id,
        }}
      />

      {/* Usage Upgrade Modal */}
      {usageWarningData && (
        <UsageUpgradeModal
          isOpen={isUsageUpgradeModalOpen}
          onClose={() => setIsUsageUpgradeModalOpen(false)}
          currentPlan={usageWarningData.plan}
          recommendedPlan={usageWarningData.recommended_plan}
          usagePercentage={usageWarningData.usage_percentage}
          currentUsage={usageWarningData.current_usage}
          limit={usageWarningData.limit}
          actionType="content_generation"
        />
      )}
    </div>
  );
}

export default function GenerateContentPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <GenerateContentPageContent />
    </Suspense>
  );
}
