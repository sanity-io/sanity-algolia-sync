'use client';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { SearchBox, Hits, useSearchBox } from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import Link from 'next/link';

const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const algoliaApiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY!;

const searchClient = algoliasearch(algoliaAppId, algoliaApiKey);

function SearchResults() {
    const { query } = useSearchBox();

    if (!query) {
        return null;
    }

    return (
        <div className="text-left">
            <h2 className="text-2xl font-semibold mb-4">Results for: {query}</h2>
            <Hits
                hitComponent={({ hit }) => (
                    <div className="p-2 border-b">
                        <Link href={`/posts/${hit.slug}`}
                            passHref
                            className="text-blue-600 hover:text-blue-700 hover:underline">
                            {hit.title}
                        </Link>
                        <p>{hit.description}</p>
                    </div>
                )}
            />
        </div>
    );
}

export function Search() {
    return (
        <InstantSearchNext
            indexName="posts"
            searchClient={searchClient}
            ignoreMultipleHooksWarning={true}
            future={{ preserveSharedStateOnUnmount: true }}
            routing={{
                router: {
                    cleanUrlOnDispose: false,
                    windowTitle(routeState) {
                        const indexState = routeState.indexName || {};
                        return indexState.query
                            ? `MyWebsite - Results for: ${indexState.query}`
                            : 'MyWebsite - Results page';
                    },
                }
            }}
        >
            {/* SearchBox for input */}
            <SearchBox
                placeholder="Search for items..."
                classNames={{
                    input: `
                      border-2 border-gray-500 rounded-lg 
                      p-3 m-2 w-full max-w-2xl mx-auto
                      text-lg
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-400
                      shadow-sm
                    `,
                    submit: 'hidden',
                    reset: 'hidden',
                }}
            />

            {/* Search results component */}
            <SearchResults />
        </InstantSearchNext>
    );
}
