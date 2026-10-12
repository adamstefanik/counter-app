import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';
import { Tab2Page } from './tab2.page';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('Tab2Page', () => {
  const getMock = vi.mocked(Preferences.get);

  const stored: SavedCounter[] = [
    { id: 'a', name: 'A', value: 3, createdAt: '2026-09-17T08:00:00.000Z' },
    { id: 'b', name: 'B', value: -2, createdAt: '2026-09-17T09:00:00.000Z' },
    { id: 'c', name: 'C', value: 10, createdAt: '2026-09-17T10:00:00.000Z' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function createPage(data: SavedCounter[] | null): Promise<Tab2Page> {
    getMock.mockResolvedValue({
      value: data === null ? null : JSON.stringify(data),
    });

    const fixture = TestBed.createComponent(Tab2Page);
    fixture.detectChanges();
    await TestBed.inject(CounterService).initialize();

    return fixture.componentInstance;
  }

  it('should create', async () => {
    const component = await createPage(null);

    expect(component).toBeTruthy();
  });

  it('should return null min/max for an empty history', async () => {
    const component = await createPage(null);

    expect(component.minMax()).toBeNull();
  });

  it('should compute min and max of stored values', async () => {
    const component = await createPage(stored);

    expect(component.minMax()).toEqual({ min: -2, max: 10 });
  });

  it('should compute the total of stored values', async () => {
    const component = await createPage(stored);

    expect(component.total()).toBe(11);
  });
});