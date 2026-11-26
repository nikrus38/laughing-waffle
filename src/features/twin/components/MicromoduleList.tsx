import React, { useMemo } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { rateModuleForRecommendation } from '../../../domain/twin';
import MicromoduleCard from './MicromoduleCard';

interface MicromoduleListProps {
  completedModules: string[];
  onComplete: (moduleId: string) => void;
}

const MicromoduleList: React.FC<MicromoduleListProps> = ({ completedModules, onComplete }) => {
  const user = useStore((s) => s.user);
  const modules = useStore((s) => s.modules);

  // Сортируем по вкладу в зону ближайшего развития (убывание)
  const sortedModules = useMemo(
    () =>
      [...modules].sort(
        (a, b) => rateModuleForRecommendation(user, b) - rateModuleForRecommendation(user, a),
      ),
    [modules, user],
  );

  if (sortedModules.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">
        Нет доступных микромодулей для вашего уровня
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedModules.map((module) => (
        <MicromoduleCard
          key={module.id}
          module={module}
          isCompleted={completedModules.includes(module.id)}
          onComplete={() => onComplete(module.id)}
        />
      ))}
    </div>
  );
};

export default MicromoduleList;
