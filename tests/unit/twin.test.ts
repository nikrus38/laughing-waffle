import { describe, it, expect } from 'vitest';
import { updateTwinAfterModule, getDevelopmentZone, rateModuleForRecommendation } from '../../src/domain/twin';
import { mockStudent } from '../../src/data/students';
import { mockMicromodules } from '../../src/data/modules';

describe('Digital Twin Functions', () => {
  it('should update twin after module completion', () => {
    const originalLevel = mockStudent.competencies.data.level;
    const module = mockMicromodules[0]; // Модуль, который увеличивает уровень data
    const updatedTwin = updateTwinAfterModule(mockStudent, module, 1.0);
    
    // Уровень должен увеличиться
    expect(updatedTwin.competencies.data.level).toBeGreaterThan(originalLevel);
    
    // Модуль должен быть добавлен в список пройденных
    expect(updatedTwin.completedModules).toContain(module.id);
  });

  it('should respect diminishing returns', () => {
    // Создаем студента с высоким уровнем
    const highLevelStudent = JSON.parse(JSON.stringify(mockStudent));
    highLevelStudent.competencies.data.level = 90;
    
    const module = mockMicromodules[0];
    const updatedTwin = updateTwinAfterModule(highLevelStudent, module, 1.0);
    
    // Прирост должен быть меньше, чем у студента с низким уровнем
    const lowLevelStudent = JSON.parse(JSON.stringify(mockStudent));
    lowLevelStudent.competencies.data.level = 30;
    const updatedLowTwin = updateTwinAfterModule(lowLevelStudent, module, 1.0);
    
    const highLevelGain = updatedTwin.competencies.data.level - highLevelStudent.competencies.data.level;
    const lowLevelGain = updatedLowTwin.competencies.data.level - lowLevelStudent.competencies.data.level;
    
    expect(highLevelGain).toBeLessThan(lowLevelGain);
  });

  it('should calculate development zone correctly', () => {
    const developmentZone = getDevelopmentZone(mockStudent);
    
    // Проверяем, что зона развития рассчитана
    expect(Array.isArray(developmentZone)).toBe(true);
    
    // Проверяем, что все элементы зоны развития находятся в правильном диапазоне
    developmentZone.forEach(compId => {
      const comp = mockStudent.competencies[compId];
      const gap = comp.target - comp.level;
      expect(gap).toBeGreaterThanOrEqual(10);
      expect(gap).toBeLessThanOrEqual(35);
    });
  });

  it('should rate modules for recommendation', () => {
    const module = mockMicromodules[0];
    const rating = rateModuleForRecommendation(mockStudent, module);
    
    // Рейтинг должен быть числом
    expect(typeof rating).toBe('number');
    
    // Для модуля с положительным приростом рейтинг должен быть положительным
    if (module.gains.data && module.gains.data > 0) {
      expect(rating).toBeGreaterThan(0);
    }
  });

  it('should respect level limits (0-100)', () => {
    // Создаем студента с максимальным уровнем
    const maxLevelStudent = JSON.parse(JSON.stringify(mockStudent));
    maxLevelStudent.competencies.data.level = 100;
    
    const module = mockMicromodules[0];
    const updatedTwin = updateTwinAfterModule(maxLevelStudent, module, 1.0);
    
    // Уровень не должен превышать 100
    expect(updatedTwin.competencies.data.level).toBeLessThanOrEqual(100);
  });
});