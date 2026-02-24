import { AdPerformanceData } from '@/types';

export function parseMetaAdsCSV(csvText: string): AdPerformanceData[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  const data: AdPerformanceData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });

    data.push({
      campaign_name: row['campaign name'] || row['campaign_name'] || 'Unknown',
      spend: parseFloat(row['amount spent'] || row['spend'] || '0'),
      impressions: parseInt(row['impressions'] || '0'),
      clicks: parseInt(row['clicks'] || row['link clicks'] || '0'),
      ctr: parseFloat(row['ctr'] || '0'),
      cpc: parseFloat(row['cpc'] || '0'),
      cpm: parseFloat(row['cpm'] || '0'),
      conversions: parseInt(row['conversions'] || row['results'] || '0'),
      roas: parseFloat(row['roas'] || row['purchase roas'] || '0'),
    });
  }

  return data;
}
