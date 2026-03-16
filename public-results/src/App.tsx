import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import OverviewCards from "./components/OverviewCards";
import Experiment1 from "./sections/Experiment1";
import Experiment2 from "./sections/Experiment2";
import Experiment3 from "./sections/Experiment3";
import References from "./components/References";

export function App() {
  return (
    <div className="min-h-screen bg-[#F5F0E6] text-slate-900">
      <Navbar />
      <Hero />
      <OverviewCards />

      <main className="max-w-6xl mx-auto px-4 space-y-20 py-12">
        <Experiment1 />
        <hr className="border-slate-200" />
        <Experiment2 />
        <hr className="border-slate-200" />
        <Experiment3 />
      </main>

      <References />

      <footer className="border-t border-slate-200 bg-slate-50 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-700">Temporal Binding &amp; Predictive Processing</p>
          <p className="mt-1">Master's Thesis · Vision Lab, Bogazici University</p>
          <p className="mt-1 text-xs text-slate-400">
            All statistical analyses performed using Linear Mixed Models (LMM) with iterative backward selection (LRT, χ²).
          </p>
        </div>
      </footer>
    </div>
  );
}
