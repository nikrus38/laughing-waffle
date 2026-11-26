import React from 'react';
import { StudentTwin } from '../../../domain/types';

interface CompetencyRadarProps {
  user: StudentTwin;
}

const SHORT_LABELS: Record<string, string> = {
  data: 'Данные',
  code: 'Код',
  finance: 'Финансы',
  comm: 'Общение',
  research: 'Наука',
  entre: 'Бизнес',
  ai: 'ИИ',
  lead: 'Лидерство',
};

const CompetencyRadar: React.FC<CompetencyRadarProps> = ({ user }) => {
  const competencies = Object.entries(user.competencies).map(([id, value]) => ({
    id,
    label: SHORT_LABELS[id] ?? id,
    level: value.level,
    target: value.target,
  }));

  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 46;

  const pointFor = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / competencies.length - Math.PI / 2;
    const ratio = Math.max(0, Math.min(100, value)) / 100;
    return {
      x: center + Math.cos(angle) * radius * ratio,
      y: center + Math.sin(angle) * radius * ratio,
    };
  };

  const polygon = (key: 'level' | 'target') =>
    competencies
      .map((competency, index) => {
        const point = pointFor(competency[key], index);
        return `${point.x},${point.y}`;
      })
      .join(' ');

  return (
    <div className="mt-2">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto h-auto w-full max-w-[300px]"
        role="img"
        aria-label="Радар компетенций: текущий и целевой профиль"
      >
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <circle
            key={scale}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            stroke="#e6ebf3"
            strokeWidth="1"
          />
        ))}

        {competencies.map((competency, index) => {
          const outer = pointFor(100, index);
          return (
            <line
              key={competency.id}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#e6ebf3"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={polygon('target')}
          fill="rgba(18, 58, 99, 0.12)"
          stroke="var(--brand)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <polygon
          points={polygon('level')}
          fill="rgba(15, 155, 142, 0.22)"
          stroke="var(--mint)"
          strokeWidth="2"
          style={{ transition: 'all 300ms var(--ease)' }}
        />

        {competencies.map((competency, index) => {
          const angle = (Math.PI * 2 * index) / competencies.length - Math.PI / 2;
          const labelRadius = radius + 26;
          const x = center + Math.cos(angle) * labelRadius;
          const y = center + Math.sin(angle) * labelRadius;
          return (
            <text
              key={competency.id}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="#5a6b82"
            >
              {competency.label}
            </text>
          );
        })}
      </svg>

      <div className="mt-2 flex justify-center gap-5 text-[11px] text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--mint)' }} />
          Сейчас
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--brand)' }} />
          Цель
        </span>
      </div>
    </div>
  );
};

export default CompetencyRadar;
