import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { daysUntil } from '../models/holiday-date';
import { PublicHoliday } from '../models/public-holiday';
import { HolidayApiService } from '../services/holiday-api.service';
import { Tab3Page } from './tab3.page';

describe('Tab3Page', () => {
  let component: Tab3Page;
  let fixture: ComponentFixture<Tab3Page>;
  const getHolidaysMock = vi.fn();

  const first: PublicHoliday = {
    id: 'first',
    startDate: '2099-12-24',
    name: [{ language: 'CS', text: 'Štědrý den' }],
  };

  const second: PublicHoliday = {
    id: 'second',
    startDate: '2099-12-26',
    name: [{ language: 'CS', text: 'Svátek vánoční' }],
  };

  const past: PublicHoliday = {
    id: 'past',
    startDate: '2000-01-01',
    name: [{ language: 'CS', text: 'Starý svátek' }],
  };

  beforeEach(() => {
    getHolidaysMock.mockReset();
    getHolidaysMock.mockResolvedValue([first, second]);

    TestBed.configureTestingModule({
      providers: [
        { provide: HolidayApiService, useValue: { getHolidays: getHolidaysMock } },
      ],
    });

    fixture = TestBed.createComponent(Tab3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load holidays and select the nearest one', async () => {
    await component.loadHolidays();

    expect(component.holidays()).toEqual([first, second]);
    expect(component.selectedId()).toBe('first');
    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe('');
  });

  it('should not offer past holidays', async () => {
    getHolidaysMock.mockResolvedValue([past, first]);

    await component.loadHolidays();

    expect(component.holidays()).toEqual([first]);
  });

  it('should compute the countdown and recompute it after selecting another holiday', async () => {
    await component.loadHolidays();
    const expected = daysUntil('2099-12-24', component.today());

    expect(component.remainingDays()).toBe(expected);

    component.selectedId.set('second');

    expect(component.remainingDays()).toBe(expected + 2);
    expect(getHolidaysMock).toHaveBeenCalledTimes(1);
  });

  it('should show an error message when loading fails', async () => {
    getHolidaysMock.mockRejectedValue(new Error('Network error'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await component.loadHolidays();

    expect(component.errorMessage()).not.toBe('');
    expect(component.holidays()).toEqual([]);
    expect(component.loading()).toBe(false);

    errorSpy.mockRestore();
  });

  it('should handle an empty response without an error', async () => {
    getHolidaysMock.mockResolvedValue([]);

    await component.loadHolidays();

    expect(component.holidays()).toEqual([]);
    expect(component.selectedId()).toBe('');
    expect(component.errorMessage()).toBe('');
    expect(component.remainingDays()).toBeNull();
  });

  it('should return the Czech name of a holiday with a fallback', () => {
    expect(component.holidayName(first)).toBe('Štědrý den');
    expect(component.holidayName({ id: 'x', startDate: '2099-01-01', name: [] })).toBe(
      'Svátek bez názvu',
    );
  });
});