import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from '@/hooks/useRoute';

export function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="section-py">
      <div className="container-px">
        <div className="reveal relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-16 text-center shadow-lift sm:px-12 sm:py-20">
          {/* Decorative pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand-400/30 blur-2xl" />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Your sport. Your people.
              <br />
              Your journey.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-brand-50/90">
              Create your free sports profile and start connecting today.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-white text-brand-700 hover:bg-brand-50 hover:shadow-lift"
                onClick={() => navigate('/signup')}
              >
                Create My Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <p className="mt-4 text-sm font-medium text-brand-100/80">It's free to get started.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
