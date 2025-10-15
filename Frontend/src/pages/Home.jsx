import HeroSection from '../components/Home/HeroSection';
import PricingSection from '../components/Home/PricingSection';
import SolutionsSection from '../components/Home/SolutionsSection';

export default function Home() {
    return (
        <div>
            <HeroSection />
            <SolutionsSection />
            <PricingSection />
        </div>
    );
}