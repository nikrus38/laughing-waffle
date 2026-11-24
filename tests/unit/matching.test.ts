import { describe, it, expect } from 'vitest';
import { calculateMatch } from '../../src/domain/matching';
import { mockStudent } from '../../src/data/students';
import { mockTasks } from '../../src/data/tasks';

describe('Matching Algorithm', () => {
  it('should calculate match score correctly', () => {
    const task = mockTasks[0]; // Первая задача
    const result = calculateMatch(mockStudent, task);
    
    // Проверяем, что результат имеет правильную структуру
    expect(result).toHaveProperty('taskId', task.id);
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('factors');
    expect(result).toHaveProperty('isStretch');
    expect(result).toHaveProperty('explanation');
    
    // Проверяем диапазон оценки
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('should handle perfect skill match', () => {
    // Создаем задачу, которая идеально соответствует навыкам студента
    const perfectTask = {
      ...mockTasks[0],
      required: {
        'data': 40, // Меньше, чем у студента (45)
        'finance': 50 // Меньше, чем у студента (55)
      }
    };
    
    const result = calculateMatch(mockStudent, perfectTask);
    
    // Должен быть высокий skillFit
    const skillFactor = result.factors.find(f => f.label.includes('навыкам'));
    expect(skillFactor?.value).toBeGreaterThan(0.5);
  });

  it('should identify stretch tasks', () => {
    // Создаем задачу с высокими требованиями (stretch)
    const stretchTask = {
      ...mockTasks[0],
      required: {
        'data': 80, // Намного выше уровня студента (45)
        'finance': 90 // Намного выше уровня студента (55)
      }
    };
    
    const result = calculateMatch(mockStudent, stretchTask);
    
    // Должна быть помечена как "на вырост"
    expect(result.isStretch).toBe(true);
  });

  it('should calculate interest fit using Jaccard coefficient', () => {
    const taskWithMatchingInterests = {
      ...mockTasks[0],
      tags: ['аналитика данных', 'искусственный интеллект', 'финансовые технологии']
    };
    
    const result = calculateMatch(mockStudent, taskWithMatchingInterests);
    
    // Проверяем, что interestFit рассчитан
    const interestFactor = result.factors.find(f => f.label.includes('интересам'));
    expect(interestFactor).toBeDefined();
  });
});