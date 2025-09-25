# Next.js + Sanity + Algolia Search Integration

This project combines a [Next.js](https://nextjs.org/) frontend with a [Sanity Studio](https://www.sanity.io/) for content management and **automatic Algolia search indexing** for powerful, real-time search functionality.

![Screenshot of Sanity Studio using Presentation Tool to do Visual Editing](/sanity-algolia.png)

## 🚀 Algolia Search Integration

### The Problem
Content teams need to keep their search functionality up-to-date with their latest content, but manually syncing content to search indexes is time-consuming and error-prone. This creates a gap between published content and searchable content.

### The Solution
This project automatically syncs documents to Algolia's search index, ensuring your search functionality always reflects your latest content. When content is published, updated, or deleted in Sanity, the system automatically:

- **Creates** new search records in Algolia
- **Updates** existing search records with latest content
- **Removes** deleted content from search indexes
- **Maintains** real-time synchronization between content and search

### Key Benefits

- **🔍 Real-time search updates** - Content becomes searchable immediately upon publishing
- **⚡ Reduced manual work** - No need for manual search index updates
- **🎯 Search accuracy** - Search results always reflect your latest published content
- **🛠️ Simplified implementation** - Automatic document synchronization with zero maintenance
- **📈 Scalable content** - Handles updates automatically as your content grows
- **🚀 Performance** - Leverages Algolia's lightning-fast search infrastructure

## 🏗️ Architecture Overview

This project consists of three main components:

1. **Frontend** (`/frontend`) - Next.js 15 app with search functionality
2. **Studio** (`/studio`) - Sanity Studio for content management
3. **Functions** (`/functions`) - Sanity Functions for automatic Algolia sync

## ✨ Features

### Next.js 15 Frontend
- **App Router** for blazing-fast performance and SEO-friendly static sites
- **Real-time Visual Editing** with Sanity's Presentation Tool
- **Live Content API** for dynamic, real-time experiences
- **Customizable Pages** with drag-and-drop page builder
- **AI-powered Media Support** with auto-generated alt text
- **On-demand Publishing** with Incremental Static Revalidation
- **Integrated Unsplash** support for seamless media handling

### Sanity Studio
- **Real-time collaboration** with team members
- **Fine-grained revision history**
- **Visual editing** with live preview
- **Content validation** and structured data

### Algolia Search Integration
- **Automatic sync** on content publish/update/delete
- **Real-time search** with sub-second response times

## 🚀 Getting Started

### Prerequisites

- Node.js v22.x
- A Sanity account
- An Algolia account with:
  - Application ID
  - Write API key
  - An index named 'posts' (or customize as needed)

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd algolia-sync-function

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the project root:

```env

# Algolia Configuration
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_WRITE_KEY=your_algolia_write_key
SANITY_PROJECT_ID=your_sanity_projectID
SANITY_DATASET=your_dataset_name
```

### 3. Run Development Servers

```bash
# Start both Next.js and Sanity Studio
npm run dev
```

This will start:
- **Next.js app**: [http://localhost:3000](http://localhost:3000)
- **Sanity Studio**: [http://localhost:3333](http://localhost:3333)

### 4. Set Up Algolia Sync Function

The Algolia sync function is already configured in `sanity.blueprint.ts`. It automatically:

- Triggers on `create`, `update`, and `delete` events for post documents
- Syncs document data to Algolia's search index
- Handles error cases and provides detailed logging

### 5. Initial Content Sync

For existing content, run the initial sync script:

```bash
# Sync all existing posts to Algolia
npm run sync:algolia
```

This script will:
- Connect to your Sanity project
- Fetch all documents of type "post"
- Transform data to match Algolia's format
- Upload all documents to the Algolia index
- Provide detailed logging of the sync process

## 📝 Content Management

### Creating Content

1. Open the Sanity Studio at [http://localhost:3333](http://localhost:3333)
2. Click "+ Create" and select "Post"
3. Add your content with title, body, and other fields
4. **Publish** the document

**Result**: The content is automatically synced to Algolia and becomes searchable immediately!

### Content Types

The project includes these document types:
- **Page** - Static pages with page builder
- **Post** - Blog posts and articles
- **Person** - Author profiles
- **Settings** - Site-wide configuration

### Visual Editing

- Edit content live with Sanity's Presentation Tool
- See changes in real-time on your Next.js app
- Collaborate with team members in real-time

## 🔍 Search Implementation

### Frontend Search Component

The project includes a search component (`/frontend/app/components/Search.tsx`) that:

- Connects to Algolia's search API
- Provides real-time search results

### Search Features

- **Instant search** with sub-second response times

## 🧪 Testing

### Test the Algolia Function

```bash
# Test with sample document
npx sanity functions test algolia-document-sync --file functions/algolia-document-sync/document.json --dataset production --with-user-token

# Test with custom data
npx sanity functions test algolia-document-sync --data '{
  "_type": "post",
  "_id": "test-post",
  "title": "Test Article"
}' --dataset production --with-user-token

# Interactive development mode
npx sanity functions dev
```

### Test with Real Data

```bash
# Export a real document for testing
cd studio
npx sanity documents get "your-post-id" > ../test-document.json
cd ..
npx sanity functions test algolia-document-sync --file test-document.json --dataset production --with-user-token
```

## 🚀 Deployment

### 1. Deploy Sanity Studio

```bash
cd studio
npx sanity deploy
```

### 2. Deploy Next.js App

Deploy to your preferred hosting provider (Vercel recommended):

1. Create a GitHub repository
2. Connect to Vercel
3. Set Root Directory to `/frontend`
4. Configure environment variables

### 3. Configure Production Environment

Ensure your production environment has:
- `ALGOLIA_APP_ID` environment variable
- `ALGOLIA_WRITE_KEY` environment variable
- Sanity project configuration

## 🛠️ Customization

### Modify Search Fields

Update the fields synced to Algolia in `functions/algolia-document-sync/index.ts`:

```typescript
await algolia.addOrUpdateObject({
  indexName: 'posts',
  objectID: _id,
  body: {
    title,
    slug: data.slug?.current,
    publishedAt: data.publishedAt,
    author: data.author?.name,
    // Add more fields as needed
  },
})
```

### Change Target Index

Modify the index name or sync to multiple indexes:

```typescript
await algolia.addOrUpdateObject({
  indexName: 'your-custom-index',
  objectID: _id,
  body: { title },
})
```

### Add Document Filtering

Update the filter to sync specific document types:

```typescript
filter: "_type == 'post' && defined(publishedAt)"
```

### Customize Search UI

Modify the search component in `/frontend/app/components/Search.tsx` to:
- Change search result layout
- Add custom filters
- Implement search analytics
- Customize search suggestions

## 📊 Monitoring and Analytics

### Algolia Analytics

- Track search queries and results
- Monitor search performance
- Understand user search behavior
- Optimize search relevance

### Function Logs

Monitor the sync function for:
- Successful syncs
- Error handling
- Performance metrics
- Content update frequency

## 🔧 Troubleshooting

### Common Issues

1. **Search not working**: Check Algolia credentials and index configuration
2. **Content not syncing**: Verify function deployment and environment variables
3. **Slow search**: Check Algolia index configuration and search settings
4. **Missing content**: Run initial sync script for existing content

### Debug Mode

Enable detailed logging in the sync function:

```typescript
console.log('Event data:', JSON.stringify(event.data, null, 2))
console.log('Syncing to Algolia:', data._id)
```

## 📚 Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Algolia Documentation](https://www.algolia.com/doc/)
- [Sanity Functions](https://www.sanity.io/docs/compute-and-ai/functions-introduction)
- [Join the Sanity Community](https://snty.link/community)
- [Learn Sanity](https://www.sanity.io/learn)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).