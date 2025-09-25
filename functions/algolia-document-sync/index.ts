import {env} from 'node:process'

import {documentEventHandler} from '@sanity/functions'
import {algoliasearch} from 'algoliasearch'
import {buildImageUrl, parseImageAssetId, isImageAssetId} from '@sanity/asset-utils'

const {
  ALGOLIA_APP_ID = '',
  ALGOLIA_WRITE_KEY = '',
  SANITY_PROJECT_ID = '',
  SANITY_DATASET = '',
} = env

// This example is for 'posts' document type. You can modify it to run on multiple indexes/post types (e.g. 'posts', 'products', 'events', etc.)
const ALGOLIA_INDEX_NAME = 'posts'

const urlFromAssetRef = (assetRef?: string | null) => {
  if (!assetRef || !isImageAssetId(assetRef)) return null
  const parts = parseImageAssetId(assetRef)

  const url = buildImageUrl({
    ...parts,
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
  })

  return url
}

export const handler = documentEventHandler(async ({event}) => {
  const {_id, title, slug, content, _type, coverImage, date, _createdAt, _updatedAt, operation} =
    event.data

  const algolia = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_KEY)
  if (operation === 'delete') {
    try {
      // We are assuming you already have an algolia instance setup with an index called 'posts'
      // addOrUpdateObject documentation: https://www.algolia.com/doc/libraries/javascript/v5/methods/search/delete-object/?client=javascript
      await algolia.deleteObject({
        indexName: ALGOLIA_INDEX_NAME,
        objectID: _id,
      })

      console.log(`Successfully deleted document ${_id} ("${title}") from Algolia`)
    } catch (error) {
      console.error('Error syncing to Algolia:', error)
      throw error
    }
  } else {
    try {
      const coverImageUrl = urlFromAssetRef(coverImage?.assetRef)
      // Truncating the body if it's too long.
      // Another approach: defining multiple records:https://www.algolia.com/doc/guides/sending-and-managing-data/prepare-your-data/how-to/indexing-long-documents/
      const limitedContent = content ? content.slice(0, 8000) : ''
      const limitedTitle = title ? title.slice(0, 500) : ''
      const slugValue = slug?.current || slug || ''

      const document = {
        title: limitedTitle,
        slug: slugValue,
        content: limitedContent,
        _type,
        coverImage: coverImageUrl,
        coverImageAlt: coverImage?.alt ?? '',
        date,
        _createdAt,
        _updatedAt,
      }

      // Check document size and warn if it's getting close to the limit
      const documentSize = JSON.stringify(document).length
      if (documentSize > 9000) {
        console.warn(`Document ${_id} is ${documentSize} bytes (close to 10KB limit)`)
      }

      // We are assuming you already have an algolia instance setup with an index called 'posts'
      // addOrUpdateObject documentation: https://www.algolia.com/doc/libraries/javascript/v5/methods/search/add-or-update-object/?client=javascript
      await algolia.addOrUpdateObject({
        indexName: ALGOLIA_INDEX_NAME,
        objectID: _id,
        body: document,
      })

      console.log(`Synced ${_id} ("${limitedTitle}") – coverImage: ${coverImageUrl}`)
    } catch (error) {
      console.error('Error syncing to Algolia:', error)
      throw error
    }
  }
})
