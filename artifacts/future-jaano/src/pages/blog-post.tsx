import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/lib/language';
import { useGetBlogPostBySlug } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, Link } from 'wouter';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams();
  const { t } = useLanguage();
  const { data: post, isLoading, error } = useGetBlogPostBySlug(slug || '', { query: { enabled: !!slug, queryKey: ['blog-post', slug] } });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('Back to Blog', 'ब्लॉग पर वापस जाएं')}
        </Link>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error || !post ? (
          <div className="text-center text-muted-foreground py-20">
            {t('Post not found.', 'पोस्ट नहीं मिली।')}
          </div>
        ) : (
          <article className="space-y-8">
            <header className="space-y-4 text-center">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                {post.title}
              </h1>
              <div className="text-muted-foreground flex items-center justify-center gap-4 text-sm">
                <span>{post.author}</span>
                <span>•</span>
                <span>{format(new Date(post.publishedAt), 'MMMM dd, yyyy')}</span>
                {post.viewCount && (
                  <>
                    <span>•</span>
                    <span>{post.viewCount} views</span>
                  </>
                )}
              </div>
            </header>

            {post.imageUrl && (
              <div className="rounded-2xl overflow-hidden shadow-lg border border-border/50">
                <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
              </div>
            )}

            <div className="prose prose-invert prose-lg max-w-none prose-p:text-foreground/80 prose-headings:text-foreground prose-a:text-primary">
              {/* In a real app, you might want to use a markdown renderer here */}
              <div className="whitespace-pre-wrap leading-relaxed">{post.content}</div>
            </div>
          </article>
        )}
      </div>
    </Layout>
  );
}
