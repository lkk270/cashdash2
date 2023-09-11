import { LandingNavbar } from '@/components/landing-page/landing-navbar';
import { LandingHero } from '@/components/landing-page/landing-hero';
import { LandingContent } from '@/components/landing-page/landing-content';

const LandingPage = () => {
  return (
    <div className="h-full ">
      <LandingNavbar />
      <LandingHero />
      <LandingContent />
    </div>
  );
};

export default LandingPage;
