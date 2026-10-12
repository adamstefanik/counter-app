import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';
import { NotificationService } from '../services/notification.service';
import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  const addMock = vi.fn();
  const showMock = vi.fn();

  beforeEach(() => {
    addMock.mockReset();
    showMock.mockReset();
    addMock.mockResolvedValue(undefined);
    showMock.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        { provide: CounterService, useValue: { add: addMock } },
        { provide: NotificationService, useValue: { show: showMock } },
      ],
    });

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save the counter and show a toast', async () => {
    const counter: SavedCounter = {
      id: 'first',
      name: 'První',
      value: 1,
      createdAt: '2026-09-17T08:00:00.000Z',
    };

    await component.onSaved(counter);

    expect(addMock).toHaveBeenCalledWith(counter);
    expect(showMock).toHaveBeenCalledTimes(1);
  });
});