// Vitest global setup — runs before every test file

// Clean up localStorage between tests to prevent cross-test pollution
beforeEach(() => {
  localStorage.clear()
})
