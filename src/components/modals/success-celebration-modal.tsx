'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Sparkles, PartyPopper, CheckCircle2 } from 'lucide-react';

interface SuccessCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'first_report' | 'first_content' | 'first_client';
  data?: {
    reportId?: string;
    reportHtml?: string;
    contentId?: string;
    clientName?: string;
  };
}

export function SuccessCelebrationModal({
  isOpen,
  onClose,
  type,
  data = {},
}: SuccessCelebrationModalProps) {
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfetti(true);
      // Trigger confetti animation
      const timer = setTimeout(() => setConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getContent = () => {
    switch (type) {
      case 'first_report':
        return {
          icon: PartyPopper,
          title: '🎉 Your First AI-Powered Client Report is Ready!',
          subtitle: 'You just created a professional performance report in minutes, not hours.',
          stats: [
            { label: 'Time Saved', value: '2+ hours' },
            { label: 'Professional Quality', value: '100%' },
            { label: 'Client Ready', value: 'Yes!' },
          ],
          actions: [
            {
              label: 'Download Report',
              icon: Download,
              variant: 'default' as const,
              onClick: () => handleDownload(),
            },
            {
              label: 'Share with Client',
              icon: Share2,
              variant: 'outline' as const,
              onClick: () => handleShare(),
            },
            {
              label: 'Generate Another',
              icon: Sparkles,
              variant: 'outline' as const,
              onClick: () => handleGenerateAnother(),
            },
          ],
        };
      case 'first_content':
        return {
          icon: Sparkles,
          title: '✨ Your First AI Content is Live!',
          subtitle: 'You just generated high-converting ad copy in seconds.',
          stats: [
            { label: 'Ad Copies', value: '3' },
            { label: 'Reel Scripts', value: '3' },
            { label: 'Time Saved', value: '1+ hour' },
          ],
          actions: [
            {
              label: 'Generate More',
              icon: Sparkles,
              variant: 'default' as const,
              onClick: () => handleGenerateMore(),
            },
            {
              label: 'View Content',
              icon: CheckCircle2,
              variant: 'outline' as const,
              onClick: onClose,
            },
          ],
        };
      case 'first_client':
        return {
          icon: CheckCircle2,
          title: `🎊 Welcome ${data.clientName || 'Your First Client'}!`,
          subtitle: 'Your client profile is set up. Ready to create amazing content?',
          stats: [
            { label: 'Clients', value: '1' },
            { label: 'Ready to Scale', value: 'Yes' },
          ],
          actions: [
            {
              label: 'Generate Content',
              icon: Sparkles,
              variant: 'default' as const,
              onClick: () => handleGenerateContent(),
            },
            {
              label: 'Add Brand Kit',
              icon: CheckCircle2,
              variant: 'outline' as const,
              onClick: () => handleAddBrandKit(),
            },
          ],
        };
      default:
        return null;
    }
  };

  const handleDownload = () => {
    if (data.reportHtml) {
      const blob = new Blob([data.reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${Date.now()}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
    onClose();
  };

  const handleShare = () => {
    // In production, this would open a share dialog or copy link
    alert('Share functionality coming soon!');
    onClose();
  };

  const handleGenerateAnother = () => {
    window.location.href = '/dashboard/reports';
    onClose();
  };

  const handleGenerateMore = () => {
    window.location.href = '/dashboard/generate';
    onClose();
  };

  const handleGenerateContent = () => {
    window.location.href = '/dashboard/generate';
    onClose();
  };

  const handleAddBrandKit = () => {
    window.location.href = '/dashboard/clients';
    onClose();
  };

  const content = getContent();
  if (!content) return null;

  const Icon = content.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-0">
        {/* Confetti Background Effect */}
        {confetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: [
                      '#FF6B6B',
                      '#4ECDC4',
                      '#45B7D1',
                      '#FFA07A',
                      '#98D8C8',
                      '#F7DC6F',
                      '#BB8FCE',
                    ][Math.floor(Math.random() * 7)],
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/10" />
        
        {/* Content */}
        <div className="relative p-8 sm:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary to-purple-600 rounded-full p-6">
                <Icon className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {content.title}
          </h2>

          {/* Subtitle */}
          <p className="text-center text-muted-foreground text-lg mb-8">
            {content.subtitle}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {content.stats.map((stat, index) => (
              <div
                key={index}
                className="bg-background/50 backdrop-blur-sm rounded-lg p-4 text-center border border-border/50"
              >
                <div className="text-2xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {content.actions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant}
                  size="lg"
                  onClick={action.onClick}
                  className="flex-1"
                >
                  <ActionIcon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              );
            })}
          </div>

          {/* Close */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
