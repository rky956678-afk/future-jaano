import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';

export default function AdminDashboard() {
  const { t } = useLanguage();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold text-primary mb-6">
          Admin Dashboard
        </h1>
        <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-8 text-center text-muted-foreground">
          Admin features coming soon.
        </div>
      </div>
    </Layout>
  );
}
