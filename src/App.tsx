import { useReveal } from '@/hooks/useReveal';
import { useRoute } from '@/hooks/useRoute';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AppNavbar } from '@/components/AppNavbar';
import { Hero } from '@/components/sections/Hero';
import { Sports } from '@/components/sections/Sports';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { AthleteProfile } from '@/components/sections/AthleteProfile';
import { Discovery } from '@/components/sections/Discovery';
import { Activities } from '@/components/sections/Activities';
import { Community } from '@/components/sections/Community';
import { WhyPlatform } from '@/components/sections/WhyPlatform';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { AuthPage } from '@/pages/AuthPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { ActivitiesPage } from '@/pages/ActivitiesPage';
import { MessagesPage } from '@/pages/MessagesPage';

function LandingPage() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Sports />
        <HowItWorks />
        <AthleteProfile />
        <Discovery />
        <Activities />
        <Community />
        <WhyPlatform />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const route = useRoute();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-ink-400">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          <span className="text-sm font-medium">Loading SportArena...</span>
        </div>
      </div>
    );
  }

  // Auth pages
  if (route.name === 'login') return <AuthPage mode="login" />;
  if (route.name === 'signup') return <AuthPage mode="signup" />;

  // Protected pages — require authentication
  if (route.name === 'discover' || route.name === 'activities' || route.name === 'profile' || route.name === 'messages' || route.name === 'messages-with') {
    if (!session) {
      // Redirect to login if not authenticated
      return <AuthPage mode="login" />;
    }
    return (
      <div className="min-h-screen bg-white">
        <AppNavbar />
        {route.name === 'discover' && <DiscoverPage />}
        {route.name === 'activities' && <ActivitiesPage />}
        {route.name === 'profile' && <ProfilePage />}
        {(route.name === 'messages' || route.name === 'messages-with') && <MessagesPage />}
      </div>
    );
  }

  // Default: landing page
  return <LandingPage />;
}

export default App;
