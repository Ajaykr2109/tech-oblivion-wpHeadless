module.exports = {
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), forward: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => ({ get: () => null }),
  redirect: () => {},
  notFound: () => {},
}

// Dummy test
describe('nextNavigationMock', () => {
  it('is a mock', () => {
    expect(true).toBe(true)
  })
})
