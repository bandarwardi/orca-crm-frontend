import '@angular/compiler';

// Vitest setup for Angular tests
if (typeof window !== 'undefined') {
  const storageMock: Record<string, string> = {};
  const mockStorage = {
    getItem: (key: string) => storageMock[key] || null,
    setItem: (key: string, value: string) => { storageMock[key] = value; },
    removeItem: (key: string) => { delete storageMock[key]; },
    clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); },
    length: 0,
    key: (i: number) => Object.keys(storageMock)[i] || null,
  };

  if (!window.localStorage) {
    Object.defineProperty(window, 'localStorage', { value: mockStorage });
  }
}
