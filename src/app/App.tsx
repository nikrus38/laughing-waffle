import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Layout from './Layout';
import TelegramBridge from './TelegramBridge';
import Home from '../features/home/Home';
import Twin from '../features/twin/Twin';
import Matcher from '../features/matcher/Matcher';
import Wallet from '../features/wallet/Wallet';
import Ethics from '../features/ethics/Ethics';
const Diagnostics = lazy(() => import('../features/diagnostics/Diagnostics'));
const Trajectory = lazy(() => import('../features/trajectory/Trajectory'));
const Decomposer = lazy(() => import('../features/decomposer/Decomposer'));
const Patents = lazy(() => import('../features/patents/Patents'));
const Demo = lazy(() => import('../features/demo/Demo'));
import { api, ApiError } from '../shared/api/client';
import { BootstrapPayload } from '../shared/api/types';
import { useStore } from '../shared/store/useStore';

/** Консоль живёт по адресу /app/, поэтому роутер должен знать префикс. */
const basename = window.location.pathname.startsWith('/app') ? '/app' : '/';

const Splash: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[color:var(--bg)] px-6 text-center">
    <span
      className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl text-2xl"
      style={{ background: 'var(--brand)', color: '#fff' }}
      aria-hidden="true"
    >
      Ф
    </span>
    <p className="text-sm text-[color:var(--ink-muted)]">Загружаем консоль…</p>
  </div>
);

const RouteFallback: React.FC = () => (
  <div className="py-16 text-center text-sm text-slate-500">Загружаем раздел…</div>
);

const NotFound: React.FC = () => (
  <div className="py-16 text-center">
    <p className="text-4xl" aria-hidden="true">
      🧭
    </p>
    <h1 className="mt-4 text-lg font-semibold">Такой страницы нет</h1>
    <p className="mt-2 text-sm text-slate-600">Вернитесь на главную и выберите модуль.</p>
    <Link
      to="/"
      className="mt-6 inline-flex min-h-[44px] items-center rounded-xl px-5 text-sm font-semibold text-white"
      style={{ background: 'var(--brand)' }}
    >
      На главную
    </Link>
  </div>
);

function App() {
  const hydrate = useStore((state) => state.hydrate);
  const isConsole = window.location.pathname.startsWith('/app');
  const [ready, setReady] = useState(!isConsole);

  useEffect(() => {
    if (!isConsole) return;
    let cancelled = false;

    api
      .get<BootstrapPayload>('/api/bootstrap/')
      .then((payload) => {
        if (!cancelled) hydrate(payload);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.assign(`/login/?next=${next}`);
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrate, isConsole]);

  if (!ready) return <Splash />;

  return (
    <Router basename={basename}>
      <TelegramBridge />
      <Layout>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/twin" element={<Twin />} />
          <Route path="/matcher" element={<Matcher />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/ethics" element={<Ethics />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="/trajectory" element={<Trajectory />} />
          <Route path="/decomposer" element={<Decomposer />} />
          <Route path="/patents" element={<Patents />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
