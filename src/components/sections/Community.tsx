import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { posts } from '@/data/posts';

export function Community() {
  return (
    <section id="community" className="section-py bg-ink-50/60">
      <div className="container-px">
        <SectionHeading
          eyebrow="Community"
          title="Celebrate every achievement."
          description="Your progress deserves to be seen. Share your wins, milestones, and moments with people who understand your sport."
        />

        <div className="mx-auto mt-14 grid max-w-3xl gap-6">
          {posts.map((post, i) => (
            <article
              key={post.name}
              className="reveal overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-300 hover:shadow-card"
              data-delay={`${i * 120}`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-5 pb-3">
                <img
                  src={post.avatar}
                  alt={post.name}
                  className="h-11 w-11 rounded-xl object-cover ring-2 ring-ink-100"
                />
                <div className="flex-1">
                  <p className="font-display text-sm font-bold text-ink-950">{post.name}</p>
                  <p className="text-xs text-ink-400">
                    {post.emoji} {post.sport} · {post.time}
                  </p>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {post.emoji} {post.sport}
                </span>
              </div>

              {/* Body */}
              <div className="px-5 pb-4">
                <p className="text-base font-medium leading-relaxed text-ink-800">{post.text}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 border-t border-ink-100 px-5 py-3">
                <button className="flex items-center gap-2 text-sm font-semibold text-ink-500 transition-colors hover:text-accent-600">
                  <Heart className="h-4 w-4" />
                  {post.likes} Likes
                </button>
                <button className="flex items-center gap-2 text-sm font-semibold text-ink-500 transition-colors hover:text-brand-600">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments} Comments
                </button>
                <button className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-ink-400 transition-colors hover:text-ink-700">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
