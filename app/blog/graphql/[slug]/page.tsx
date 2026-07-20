import { Fragment, ReactNode } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  documentToReactComponents,
  Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, Block, Inline } from "@contentful/rich-text-types";
import { BlogPost, BlogPostParams, LinkTypes } from "../../../../types";

const warnUnknown = (kind: string, typename: unknown) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`Unhandled ${kind} content type: ${String(typename)}`);
  }
};

const getPosts = async (slug: string): Promise<BlogPost[]> => {
  const variables = { slug };

  const query = `
    query GetBlogPostBySlug($slug: String!) {
      blogPostCollection(limit: 1, where: { slug: $slug }) {
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
                  ...FormattedTextFields
                  ...ImageWrapperFields
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

    fragment FormattedTextFields on FormattedText {
      text
      color
    }

    fragment ImageWrapperFields on ImageWrapper {
      internalTitle
      image {
        url
      }
    }

    fragment VideoEmbedFields on VideoEmbed {
      title
      embedUrl
    }
  `;

  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/${process.env.CONTENTFUL_ENV_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Contentful GraphQL request failed: ${response.status} ${response.statusText}`
    );
  }

  const { data, errors } = await response.json();

  if (errors?.length) {
    throw new Error(
      `Contentful GraphQL returned errors: ${JSON.stringify(errors)}`
    );
  }

  return data.blogPostCollection.items;
};

const renderOptions = (links: LinkTypes): Options => {
  const assetMap = new Map();
  for (const asset of links.assets.block) {
    assetMap.set(asset.sys.id, asset);
  }

  const entryMap = new Map();
  for (const entry of links.entries.block) {
    entryMap.set(entry.sys.id, entry);
  }
  for (const entry of links.entries.inline) {
    entryMap.set(entry.sys.id, entry);
  }

  return {
    renderNode: {
      [INLINES.EMBEDDED_ENTRY]: (node: Block | Inline) => {
        const entry = entryMap.get(node.data.target.sys.id);
        if (!entry) return null;

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

          case "ImageWrapper":
            return (
              <Image
                style={{ display: "inline" }}
                src={entry.image.url}
                width={25}
                height={25}
                alt={entry.internalTitle}
              />
            );

          default:
            warnUnknown("inline entry", entry.__typename);
            return null;
        }
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node: Block | Inline) => {
        const entry = entryMap.get(node.data.target.sys.id);
        if (!entry) return null;

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
            warnUnknown("block entry", entry.__typename);
            return null;
        }
      },
      [BLOCKS.TABLE]: (_node: Block | Inline, children: ReactNode) => {
        return (
          <table className="mx-auto table-auto border-separate border-spacing-2 border border-slate-500">
            {children}
          </table>
        );
      },
      [BLOCKS.EMBEDDED_ASSET]: (node: Block | Inline) => {
        const asset = assetMap.get(node.data.target.sys.id);
        if (!asset) return null;

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

        return null;
      },
    },
  };
};

const GraphQLBlogPost = async ({ params }: BlogPostParams) => {
  const posts = await getPosts(params.slug);

  if (!posts.length) {
    notFound();
  }

  return (
    <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
      <header className="App-header">
        {posts.map((post: BlogPost) => (
          <Fragment key={post.sys.id}>
            {documentToReactComponents(
              post.body.json,
              renderOptions(post.body.links)
            )}
          </Fragment>
        ))}
      </header>
    </div>
  );
};

export default GraphQLBlogPost;
