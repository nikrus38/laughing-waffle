/** Демонстрационная метрика траектории В: доля активностей, связанных сквозной задачей. */
export function seamlessIndex(completedModules: number, appliedTasks: number): number {
  return Math.min(100, 55 + completedModules * 6 + appliedTasks * 9);
}
