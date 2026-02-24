'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ThumbsUp, ThumbsDown, Edit, Trash2 } from 'lucide-react';
import { ClientContext } from '@/types';

interface ClientProfileProps {
  params: {
    id: string;
  };
}

export default function ClientProfilePage({ params }: ClientProfileProps) {
  const [clientContext, setClientContext] = useState<ClientContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientContext();
  }, [params.id]);

  const fetchClientContext = async () => {
    try {
      // In production, this would be a real API call
      const mockContext: ClientContext = {
        id: 'context-id',
        client_id: params.id,
        winning_hooks: [
          'Get 50% off your first month',
          'Limited time: Free trial for 30 days',
          'Join 10,000+ satisfied customers',
          'Transform your business in 7 days',
          'No credit card required',
        ],
        failed_angles: [
          'Generic benefits without specifics',
          'Too technical jargon',
          'Weak call-to-action',
        ],
        seasonal_notes: 'Q4 holiday season - focus on gift-giving angles',
        audience_pain_points: [
          'Time constraints',
          'Budget concerns',
          'Lack of expertise',
        ],
        best_performing_platforms: ['meta', 'linkedin'],
        optimal_posting_times: 'Weekdays 9-11 AM, 2-4 PM',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setClientContext(mockContext);
    } catch (error) {
      console.error('Failed to fetch client context:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveHook = async (hook: string, type: 'winning' | 'failed') => {
    if (!confirm(`Remove this ${type} hook?`)) return;

    try {
      // In production, call API to update context
      const updatedHooks = type === 'winning'
        ? clientContext?.winning_hooks.filter(h => h !== hook)
        : clientContext?.failed_angles.filter(h => h !== hook);

      setClientContext(prev => prev ? {
        ...prev,
        [type === 'winning' ? 'winning_hooks' : 'failed_angles']: updatedHooks,
      } : null);

      alert('Hook removed successfully');
    } catch (error) {
      console.error('Failed to remove hook:', error);
      alert('Failed to remove hook');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading client profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Client Profile</h1>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Client
        </Button>
      </div>

      {/* Client Memory Panel */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>Client Memory (AI Learning)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Winning Hooks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <h3 className="font-semibold">Top Winning Hooks</h3>
              <span className="text-xs text-muted-foreground">
                ({clientContext?.winning_hooks.length || 0} saved)
              </span>
            </div>
            {clientContext?.winning_hooks && clientContext.winning_hooks.length > 0 ? (
              <div className="space-y-2">
                {clientContext.winning_hooks.slice(0, 5).map((hook, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="text-sm">{hook}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveHook(hook, 'winning')}
                      className="ml-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No winning hooks saved yet. Mark content as "Winner" to build AI memory.
              </p>
            )}
          </div>

          {/* Failed Angles */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <h3 className="font-semibold">Failed Angles to Avoid</h3>
              <span className="text-xs text-muted-foreground">
                ({clientContext?.failed_angles.length || 0} saved)
              </span>
            </div>
            {clientContext?.failed_angles && clientContext.failed_angles.length > 0 ? (
              <div className="space-y-2">
                {clientContext.failed_angles.slice(0, 5).map((angle, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="text-sm">{angle}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveHook(angle, 'failed')}
                      className="ml-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No failed angles saved yet. Mark content as "Failed" to help AI avoid similar approaches.
              </p>
            )}
          </div>

          {/* Additional Context */}
          {clientContext && (
            <div className="pt-4 border-t border-border space-y-3">
              {clientContext.audience_pain_points.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Audience Pain Points
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {clientContext.audience_pain_points.map((point, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted rounded text-xs"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {clientContext.best_performing_platforms.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Best Performing Platforms
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {clientContext.best_performing_platforms.map((platform, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary rounded text-xs capitalize"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {clientContext.seasonal_notes && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Seasonal Notes
                  </div>
                  <p className="text-sm">{clientContext.seasonal_notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              💡 This memory helps AI generate better content over time. The more feedback you provide, the smarter it gets!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Client Details */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Client Name</div>
              <div className="font-medium">Example Client</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Industry</div>
              <div className="font-medium">Fitness</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Website</div>
              <div className="font-medium">https://example.com</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
