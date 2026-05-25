import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useGetBlogPosts } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';
import { Link } from 'wouter';

export default function Blog() {
  const { t, language } = useLanguage();
  const { data, isLoading } = useGetBlogPosts({ limit: 10, lang: language as 'en' | 'hi' });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-center text-primary mb-12 drop-shadow-md">
          {t('Spiritual Insights', 'आध्यात्मिक ज्ञान')}
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/50 cursor-pointer transition-all hover:-translate-y-1 overflow-hidden group">
                  {post.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md">{post.category}</span>
                      <span>{format(new Date(post.publishedAt), 'MMM dd, yyyy')}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-foreground/90 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h2>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
