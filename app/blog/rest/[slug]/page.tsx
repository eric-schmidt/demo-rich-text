import Image from "next/image";
import { createClient } from "contentful";
import {
  documentToReactComponents,
  Options,
} from "@contentful/rich-text-react-renderer";
import {
  BLOCKS,
  INLINES,
  Block,
  Inline,
  Document,
} from "@contentful/rich-text-types";
import { BlogPost, BlogPostParams, LinkTypes } from "../../../../types";

const getPosts = async (slug: string) => {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_DELIVERY_KEY!,
  });

  try {
    const response = await client.getEntries({
      content_type: "blogPost",
      "fields.slug": slug,
    });
    return response.items;
  } catch (error) {
    console.log(error);
  }
};

export const RestBlogPost = async ({ params }: BlogPostParams) => {
  const posts = await getPosts(params.slug);

  const renderOptions = {
    renderNode: {
      [INLINES.EMBEDDED_ENTRY]: (node: Inline) => {
        switch (node.data.target.sys.contentType.sys.id) {
          case "formattedText":
            return (
              <span
                style={{
                  color: node.data.target.fields.color,
                }}
                className="font-bold text-2xl m-1"
              >
                {node.data.target.fields.text}
              </span>
            );
          default:
        }
      },
      [BLOCKS.TABLE]: (node: Block, children: BLOCKS.TABLE_ROW) => {
        return (
          <table className="mx-auto table-auto border-separate border-spacing-2 border border-slate-500">
            {children}
          </table>
        );
      },
      [BLOCKS.EMBEDDED_ASSET]: (node: Block) => {
        if (node.data.target.fields.file.contentType.includes("image")) {
          return (
            <Image
              className="my-12 mx-auto"
              src={`https:${node.data.target.fields.file.url}?w=500&h=500`}
              width={500}
              height={500}
              alt="Alternative text"
            />
          );
        }
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node: Block) => {
        switch (node.data.target.sys.contentType.sys.id) {
          case "codeBlock":
            return (
              <pre className={"bg-slate-900 p-12 m-12"}>
                <code>{node.data.target.fields.code}</code>
              </pre>
            );

          case "videoEmbed":
            return (
              <iframe
                className="my-12 mx-auto"
                width="560"
                height="315"
                src={node.data.target.fields.embedUrl}
                title={node.data.target.fields.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            );

          default:
        }
      },
    },
  };

  return (
    <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
      <header className="App-header">
        {posts &&
          posts.map((post) =>
            documentToReactComponents(
              post.fields.body as Document,
              renderOptions as Options
            )
          )}
      </header>
    </div>
  );
};

export default RestBlogPost;
