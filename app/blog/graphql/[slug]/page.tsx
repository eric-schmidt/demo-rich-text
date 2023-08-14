import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, Block, Inline } from "@contentful/rich-text-types";
import { BlogPost, BlogPostParams, LinkTypes } from "../../../../types";

const renderOptions = (links: LinkTypes): object => {
  // create an asset map
  const assetMap = new Map();

  // loop through the assets and add them to the map
  for (const asset of links.assets.block) {
    assetMap.set(asset.sys.id, asset);
  }

  // create an entry map
  const entryMap = new Map();
  // loop through the block linked entries and add them to the map
  for (const entry of links.entries.block) {
    entryMap.set(entry.sys.id, entry);
  }
  // loop through inline linked entries and add them to the map
  for (const entry of links.entries.inline) {
    entryMap.set(entry.sys.id, entry);
  }

  return {
    renderNode: {
      [INLINES.EMBEDDED_ENTRY]: (node: Inline) => {
        // find the entry in the entryMap by ID
        const entry = entryMap.get(node.data.target.sys.id);

        switch (entry.__typename) {
          case "FormattedText":
            return (
              <span
                style={{
                  color: entry.color,
                }}
                className="font-bold text-2xl m-1"
              >
                {entry.text}
              </span>
            );

          default:
        }
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node: Block) => {
        const entry = entryMap.get(node.data.target.sys.id);

        switch (entry.__typename) {
          case "CodeBlock":
            return (
              <pre className={"bg-slate-900 p-12 m-12"}>
                <code>{entry.code}</code>
              </pre>
            );

          case "VideoEmbed":
            return (
              <iframe
                className="my-12 mx-auto"
                width="560"
                height="315"
                src={entry.embedUrl}
                title={entry.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            );

          default:
        }
      },
      [BLOCKS.EMBEDDED_ASSET]: (node: Block) => {
        const asset = assetMap.get(node.data.target.sys.id);
        if (asset.contentType.includes("image")) {
          return (
            <Image
              className="my-12 mx-auto"
              src={`${asset.url}?w=500&h=500`}
              width={500}
              height={500}
              alt="Alternative text"
            />
          );
        }
      },
    },
  };
};

export const GraphQLBlogPost = async ({ params }: BlogPostParams) => {
  const posts = await getPosts(params.slug);

  return (
    <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
      <header className="App-header">
        {posts.map((post: BlogPost) => {
          return documentToReactComponents(
            post.body.json,
            renderOptions(post.body.links)
          );
        })}
      </header>
    </div>
  );
};

export const getPosts = async (slug: string) => {
  const variables = {
    slug,
  };

  const query = `
  query GetBlogPostBySlug($slug: String!) {
    blogPostCollection (limit: 1, where: {
      slug: $slug
    }) {
      items {
        sys {
          id
        }
        title
        body {
          json
          links {
            entries {
              inline {
                __typename
                sys {
                  id
                }
                ...on FormattedText {
                  text
                  color
                } 
              }
              block {
                __typename
                sys {
                  id
                }
                ...CodeBlockFields
                ...VideoEmbedFields
              }
            }
            assets {
              block {
                sys {
                  id
                }
                url
                title
                width
                height
                description
                contentType
              }
            }
          }
        }
      }
    } 
  }
  
  fragment CodeBlockFields on CodeBlock {
    title
    description
    language
    code
  }
  
  fragment VideoEmbedFields on VideoEmbed {
    title
    embedUrl
  }
  `;

  return await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/${process.env.CONTENTFUL_ENV_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    }
  )
    .then((response) => response.json())
    .then(({ data }) => {
      return data.blogPostCollection.items;
    });
};

export default GraphQLBlogPost;
