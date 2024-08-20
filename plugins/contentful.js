import { createClient } from 'contentful'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  console.log('Runtime Config:', config.public) // Log the config to verify

  const client = createClient({
    space: config.public.contentfulSpaceId,
    accessToken: config.public.contentfulAccessToken,
  })

  return {
    provide: {
      contentful: client,
    },
  }
})
