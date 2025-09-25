import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'
import 'dotenv/config'
import process from 'node:process'

const {
  ALGOLIA_APP_ID,
  ALGOLIA_WRITE_KEY,
  SANITY_PROJECT_ID,
  SANITY_DATASET,
} = process.env

if (typeof ALGOLIA_APP_ID !== 'string' || typeof ALGOLIA_WRITE_KEY !== 'string') {
  throw new Error('ALGOLIA_APP_ID and ALGOLIA_WRITE_KEY must be set')
}

if (typeof SANITY_PROJECT_ID !== 'string' || typeof SANITY_DATASET !== 'string') {
  throw new Error('SANITY_PROJECT_ID and SANITY_DATASET must be set')
}

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      type: 'sanity.function.document',
      name: 'algolia-document-sync',
      memory: 1,
      timeout: 10,
      src: './functions/algolia-document-sync',
      event: {
        on: ['create', 'update', 'delete'],
        filter: "_type == 'post'",
        projection: `{
          _id,
          title,
          slug,
          "content": pt::text(content),
          _type,
           "coverImage": {
          "assetRef": coverImage.asset._ref,
          "alt": coverImage.alt
          },
          date,
          _createdAt,
          _updatedAt,
          "operation": delta::operation()
        }`,
      },
      env: {
        COMMENT:
          'ALGOLIA_APP_ID and ALGOLIA_WRITE_KEY env variables are required to sync documents to Algolia',
        ALGOLIA_APP_ID,
        ALGOLIA_WRITE_KEY,
        SANITY_PROJECT_ID,
        SANITY_DATASET,
      },
    }),
  ],
})
