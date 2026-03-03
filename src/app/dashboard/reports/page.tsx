'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Share2, Copy, Check } from 'lucide-react';
import { SuccessCelebrationModal } from '@/components/modals/success-celebration-modal';

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFirstReport, setIsFirstReport] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      // Fetch the latest upload for this user/agency
      const uploadsResponse = await fetch('/api/uploads');
      const uploads = await uploadsResponse.json();
      const latestUpload = uploads[0];

      if (!latestUpload) {
        throw new Error('No data found. Please upload a CSV first.');
      }

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upload_id: latestUpload.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setReportHtml(data.html);
      setReportId(data.id);

      // Check if this is the first report
      if (data.is_first_report) {
        setIsFirstReport(true);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = () => {
    if (reportHtml) {
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(reportHtml);
        previewWindow.document.close();
      }
    }
  };

  const handleDownload = async () => {
    if (reportHtml) {
      // Track activation
      try {
        await fetch('/api/onboarding/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'activated' }),
        });
      } catch (error) {
        console.error('Failed to track activation:', error);
      }

      // Download the report
      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${Date.now()}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = async () => {
    if (!reportId) return;

    setSharing(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/share`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate share link');
      }

      setShareUrl(data.share_url);
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to generate share link');
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Performance Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Generate comprehensive performance reports with AI insights, charts, and recommendations.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={handleGenerateReport}
                disabled={generating}
                size="lg"
              >
                <FileText className="mr-2 h-4 w-4" />
                {generating ? 'Generating...' : 'Generate Report'}
              </Button>

              {reportHtml && (
                <>
                  <Button
                    onClick={handlePreview}
                    variant="outline"
                    size="lg"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download HTML
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="lg"
                    disabled={sharing}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    {sharing ? 'Generating...' : 'Share'}
                  </Button>
                </>
              )}
            </div>

            {reportHtml && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    ✓ Report generated successfully! Use the buttons above to preview, download, or share.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: In production, this would generate a PDF file using Puppeteer.
                  </p>
                </div>

                {shareUrl && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-2">🔗 Public Share Link</p>
                        <code className="text-xs bg-background px-3 py-2 rounded border border-border block truncate">
                          {shareUrl}
                        </code>
                      </div>
                      <Button
                        onClick={handleCopyLink}
                        variant="outline"
                        size="sm"
                      >
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Anyone with this link can view the report. Share it with your clients or on social media to grow your business!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Features */}
      <Card>
        <CardHeader>
          <CardTitle>Report Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">📊 Performance Charts</h3>
              <p className="text-sm text-muted-foreground">
                Visual charts for Spend, CTR, CPC, and ROAS
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 Benchmark Comparison</h3>
              <p className="text-sm text-muted-foreground">
                Compare against industry standards
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">✅ What Worked</h3>
              <p className="text-sm text-muted-foreground">
                AI-identified successful patterns
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">⚠️ What to Change</h3>
              <p className="text-sm text-muted-foreground">
                Underperforming areas with fixes
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">📅 7-Day Action Plan</h3>
              <p className="text-sm text-muted-foreground">
                Step-by-step optimization roadmap
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">💵 Budget Allocation</h3>
              <p className="text-sm text-muted-foreground">
                Smart budget recommendations
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎨 Brand Theming</h3>
              <p className="text-sm text-muted-foreground">
                Client logo and brand colors
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">📄 Multiple Formats</h3>
              <p className="text-sm text-muted-foreground">
                A4 and US Letter support
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Celebration Modal */}
      <SuccessCelebrationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="first_report"
        data={{
          reportId: reportId || undefined,
          reportHtml: reportHtml || undefined,
        }}
      />
    </div>
  );
}
