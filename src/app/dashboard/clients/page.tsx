'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Brain } from 'lucide-react';

export default function ClientsPage() {
  // Mock data - in production, fetch from API
  const clients = [
    {
      id: 'client-1',
      name: 'Fitness Pro',
      industry: 'fitness',
      website: 'https://fitnesspro.com',
      context_count: 8,
    },
    {
      id: 'client-2',
      name: 'E-commerce Store',
      industry: 'ecommerce',
      website: 'https://store.com',
      context_count: 5,
    },
    {
      id: 'client-3',
      name: 'Real Estate Agency',
      industry: 'real_estate',
      website: 'https://realestate.com',
      context_count: 12,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Clients Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{client.name}</span>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Industry:</span>{' '}
                  <span className="capitalize">{client.industry.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Website:</span>{' '}
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {client.website}
                  </a>
                </div>
              </div>

              {/* AI Memory Indicator */}
              <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-xs text-primary font-medium">
                  {client.context_count} AI memories saved
                </span>
              </div>

              <Link href={`/dashboard/clients/${client.id}`}>
                <Button variant="outline" className="w-full">
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {clients.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first client to start generating AI-powered content
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Client
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
