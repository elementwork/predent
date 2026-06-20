import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Lock, Brain, ChevronRight, Infinity, Zap, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const generators = [
  { category: 'Keyholes', color: '#14B8A6', variations: '2.5M+', description: 'Procedural 3D objects with varying face count, curves, and proportions. Unlimited unique aperture puzzles.' },
  { category: 'Top-Front-End', color: '#6366F1', variations: '1.8M+', description: 'Orthographic projection puzzles with configurable missing views and edge complexity.' },
  { category: 'Angle Ranking', color: '#F59E0B', variations: '3.2M+', description: 'Parametric angles with controlled separation from >15° (easy) to <5° (hard).' },
  { category: 'Hole Punching', color: '#F43F5E', variations: '1.5M+', description: 'Fold sequences from 1-4 folds with deterministic unfold validation.' },
  { category: 'Cube Counting', color: '#10B981', variations: '800K+', description: 'Stacked configurations with 3-5 layers and random paint patterns.' },
  { category: 'Pattern Folding', color: '#8B5CF6', variations: '1.2M+', description: '2D nets with symbol placement and validated 3D form options.' },
];

const features = [
  { icon: Infinity, title: 'Unlimited Questions', desc: 'Never run out of practice material. Our algorithms generate unique questions every time.' },
  { icon: Zap, title: '<2s Generation', desc: 'Questions generate instantly. No waiting, no loading screens.' },
  { icon: Shield, title: 'Validated Answers', desc: 'Every generated question is verified to have exactly one correct answer.' },
];

export default function PATGeneratorsPage() {
  return (
    <main className="min-h-screen bg-[#0F172A]">
      <div className="pt-20 pb-12">
        <div className="section-container max-w-5xl mx-auto">
          <Link to="/pat-academy" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to PAT Academy
          </Link>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-sm font-medium mb-4">
              <Lock className="w-3.5 h-3.5" />
              Premium Feature
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              <Sparkles className="w-8 h-8 text-[#F59E0B] inline mr-2" />
              Unlimited PAT Generators
            </h1>
            <p className="text-white/60 max-w-xl mx-auto">
              Our proprietary algorithms create an infinite supply of practice questions, each validated to have exactly one correct answer.
            </p>
          </div>

          {/* Generator Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {generators.map((gen) => (
              <Card key={gen.category} className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Brain className="w-5 h-5" style={{ color: gen.color }} />
                    <span className="text-xs font-medium text-white/40">{gen.variations} variations</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{gen.category} Generator</h3>
                  <p className="text-xs text-white/40 leading-relaxed mb-4">{gen.description}</p>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-[10px] text-white/30">Generator ready</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {features.map((f) => (
              <div key={f.title} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <f.icon className="w-6 h-6 text-[#2563EB] mx-auto mb-2" />
                <p className="text-sm font-medium text-white mb-1">{f.title}</p>
                <p className="text-xs text-white/40">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#F59E0B]/20 to-[#2563EB]/20 border border-[#F59E0B]/30">
            <h2 className="text-xl font-bold text-white mb-2">Unlock Unlimited Generators</h2>
            <p className="text-sm text-white/60 mb-6">Upgrade to Premium for $29/month and get access to all 6 generators with unlimited usage.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold px-6 h-11" onClick={() => alert('Payment integration coming in Step 6!')}>
                Get Premium $29/mo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button variant="outline" className="border-white/10 text-white/60 hover:text-white h-11" asChild>
                <Link to="/pat-academy/practice">Try Regular Practice</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
