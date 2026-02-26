import { TestBed } from '@angular/core/testing';

import { AuthIntercepInterceptor } from './auth-intercep.interceptor';

describe('AuthIntercepInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AuthIntercepInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: AuthIntercepInterceptor = TestBed.inject(AuthIntercepInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
