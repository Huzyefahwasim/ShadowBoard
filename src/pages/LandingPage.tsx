import { LandingNav } from '../components/landing/LandingNav';
import { Hero } from '../components/landing/Hero';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { ScrollStory } from '../components/landing/ScrollStory';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-white">
            <LandingNav />
            <Hero />
            <FeatureGrid />
            <ScrollStory />
            <Footer />
        </div>
    );
}
