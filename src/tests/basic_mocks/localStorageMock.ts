export const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = value.toString();
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

export const localStorageSpies = {
  getItem: jest.spyOn(localStorageMock, 'getItem'),
  setItem: jest.spyOn(localStorageMock, 'setItem'),
  removeItem: jest.spyOn(localStorageMock, 'removeItem'),
  clear: jest.spyOn(localStorageMock, 'clear'),
};
