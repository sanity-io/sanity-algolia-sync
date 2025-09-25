import {env} from 'node:process'
import {algoliasearch} from 'algoliasearch'
import {getCliClient} from 'sanity/cli'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file in project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const {
  ALGOLIA_APP_ID = '',
  ALGOLIA_WRITE_KEY = '',
} = env

// TODO: Allow this script to run on multiple indexes/post types (e.g. 'posts', 'products', 'events', etc.)
const ALGOLIA_INDEX_NAME = 'posts'

// Get Sanity client using CLI configuration
const sanityClient = getCliClient()

async function initialSync() {
  console.log('Starting initial sync to Algolia...')

  // Validate required environment variables
  if (!ALGOLIA_APP_ID || !ALGOLIA_WRITE_KEY) {
    console.error('Missing required environment variables:')
    console.error('- ALGOLIA_APP_ID:', ALGOLIA_APP_ID ? '✓' : '✗')
    console.error('- ALGOLIA_WRITE_KEY:', ALGOLIA_WRITE_KEY ? '✓' : '✗')
    console.error('')
    console.error('Note: Sanity configuration is automatically loaded from your studio configuration.')
    process.exit(1)
  }

  const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_KEY)

  try {
    // Fetch all post documents from Sanity
    const posts = await sanityClient.fetch(`
      *[_type == "post"] {
        _id,
        title,
        slug,
        "content": pt::text(content),
        _type,
        "coverImage": coverImage.asset->url,
        date,
        _createdAt,
        _updatedAt
      }
    `)

    console.log(`Found ${posts.length} posts to sync`)

    if (posts.length === 0) {
      console.log('No posts found to sync')
      return
    }

    // Prepare documents for Algolia
    const algoliaDocuments = posts.map((post: any) => {
      // Ensure content is within Algolia's size limits (10KB max per record)
      // We'll be more conservative and limit to 8000 characters to leave room for other fields
      const content = post.content ? post.content.slice(0, 8000) : ''
      
      const document = {
        objectID: post._id,
        title: post.title?.slice(0, 500) || '', // Limit title length
        slug: post.slug?.current || post.slug || '',
        content,
        _type: post._type,
        coverImage: post.coverImage || null,
        date: post.date,
        _createdAt: post._createdAt,
        _updatedAt: post._updatedAt,
      }

      // Check document size and warn if it's getting close to the limit
      const documentSize = JSON.stringify(document).length
      if (documentSize > 9000) {
        console.warn(`Document ${post._id} is ${documentSize} bytes (close to 10KB limit)`)
      }

      return document
    })

    // Clear existing documents in the index to ensure we're overwriting, not appending
    console.log('Clearing existing documents from Algolia index...')
    await algoliaClient.clearObjects({
      indexName: ALGOLIA_INDEX_NAME,
    })

    // Save all documents to Algolia
    console.log('Uploading documents to Algolia...')
    await algoliaClient.saveObjects({
      indexName: ALGOLIA_INDEX_NAME,
      objects: algoliaDocuments,
    })

    console.log('Initial sync to Algolia completed successfully')
    console.log(`Synced ${algoliaDocuments.length} documents to index: ${ALGOLIA_INDEX_NAME}`)
  } catch (error) {
    console.error('Error during initial sync to Algolia:', error)
    process.exit(1)
  }
}

// Run the script if called directly
if (require.main === module) {
  initialSync()
    .then(() => {
      console.log('Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Script failed:', error)
      process.exit(1)
    })
}

initialSync()
