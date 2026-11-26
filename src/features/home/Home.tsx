import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../shared/store/useStore';
import { seamlessIndex } from '../../shared/lib/metrics';
import SeamlessIndex from './components/SeamlessIndex';
import TodayCard from './components/TodayCard';
import ModuleGrid from './components/ModuleGrid';
import Onboarding from './components/Onboarding';
import DesktopDashboard from './components/DesktopDashboard';

const Home: React.FC = () => {
  const user = useStore((s) => s.user);
  const onboardingCompleted = useStore((s) => s.onboardingCompleted);
  const setOnboardingCompleted = useStore((s) => s.setOnboardingCompleted);
  const completedModules = useStore((s) => s.completedModules);
  const appliedTaskIds = useStore((s) => s.appliedTaskIds);

  const [showOnboarding, setShowOnboarding] = useState(!onboardingCompleted);

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <>
        <div className="lg:hidden">
          <Onboarding onComplete={handleOnboardingComplete} />
        </div>
        <div className="hidden lg:block">
          <DesktopDashboard />
        </div>
      </>
    );
  }

  // Демо-оценка бесшовности: растёт от действий пользователя в демо
  const seamlessValue = seamlessIndex(completedModules.length, appliedTaskIds.length);

  const firstName = user.displayName.split(' ')[0] ?? user.displayName;

  return (
    <div>
      <div className="lg:hidden">
        <header className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[color:var(--ink)]">Здравствуйте, {firstName}!</h1>
            <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
              Сегодняшний план собран алгоритмом под вашу зону развития.
            </p>
          </div>
          <Link
            to="/demo"
            className="shrink-0 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600"
          >
            Сценарии
          </Link>
        </header>

        <SeamlessIndex value={seamlessValue} />

        <section className="mt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-[color:var(--ink)]">Сегодня</h2>
            <span className="text-[11px] text-slate-500">рекомендации ИИ · демо</span>
          </div>

          <div className="space-y-3">
            <TodayCard
              title="Завершите модуль «Основы анализа данных»"
              description="Остался один шаг, чтобы закрыть зону ближайшего развития по данным."
              valueTag="Стремление к совершенству"
              reason="Модуль попал в рекомендации, потому что разрыв между текущим уровнем и целью по компетенции «Данные» — в зоне ближайшего развития. За прохождение начисляется +20 FinCoin как данные для обучения ИИ."
              to="/twin"
            />
            <TodayCard
              title="Откликнитесь на задачу партнёра"
              description="Прогноз оттока клиентов подходит вашему профилю и даёт зону роста."
              valueTag="Первенство"
              reason="В первой тройке рекомендаций по правилу MATCH-001 всегда есть задача на вырост: она даёт рост, а не быстрые баллы за простую работу."
              to="/matcher"
            />
            <TodayCard
              title="Наставничество для первокурсников"
              description="Ваш опыт в визуализации данных пригодится учебной группе."
              valueTag="Коллаборация"
              reason="Система видит, что вы уже прошли модули по визуализации, и предлагает передать знание другим. Награда +50 FinCoin начисляется после использования модуля, а не за сам факт создания."
              to="/wallet"
            />
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-base font-semibold text-[color:var(--ink)]">Модули</h2>
          <ModuleGrid />
        </section>
      </div>

      <div className="hidden lg:block">
        <DesktopDashboard />
      </div>
    </div>
  );
};

export default Home;
