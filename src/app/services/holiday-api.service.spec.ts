import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PublicHoliday } from '../models/public-holiday';
import { HolidayApiService } from './holiday-api.service';

describe('HolidayApiService', () => {
  let service: HolidayApiService;
  let httpMock: HttpTestingController;

  const apiUrl = 'https://openholidaysapi.org/PublicHolidays';

  const earlier: PublicHoliday = {
    id: 'earlier',
    startDate: '2026-12-24',
    name: [{ language: 'CS', text: 'Štědrý den' }],
  };

  const later: PublicHoliday = {
    id: 'later',
    startDate: '2026-12-26',
    name: [{ language: 'CS', text: 'Svátek vánoční' }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(HolidayApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request Czech holidays with the right parameters and sort them', async () => {
    const promise = service.getHolidays('2026-01-01', '2026-12-31');

    const request = httpMock.expectOne((req) => req.url === apiUrl);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('countryIsoCode')).toBe('CZ');
    expect(request.request.params.get('languageIsoCode')).toBe('CS');
    expect(request.request.params.get('validFrom')).toBe('2026-01-01');
    expect(request.request.params.get('validTo')).toBe('2026-12-31');

    request.flush([later, earlier]);

    expect(await promise).toEqual([earlier, later]);
  });

  it('should return an empty array for an empty response', async () => {
    const promise = service.getHolidays('2026-02-02', '2026-02-02');

    httpMock.expectOne((req) => req.url === apiUrl).flush([]);

    expect(await promise).toEqual([]);
  });

  it('should reject when the request fails', async () => {
    const promise = service.getHolidays('2026-01-01', '2026-12-31');

    httpMock
      .expectOne((req) => req.url === apiUrl)
      .flush('Chyba', { status: 500, statusText: 'Server Error' });

    await expect(promise).rejects.toBeTruthy();
  });
});