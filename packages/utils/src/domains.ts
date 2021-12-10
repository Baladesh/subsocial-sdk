export const parseDomain = (domain: string) => {
  const parts = domain.includes('.')
      ? domain.split('.')
      : [ domain, undefined ]

  return {
      tld: parts.pop(),
      nested: parts.join('')
  }
}