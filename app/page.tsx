import Link from "next/link";

export default function Home() {
  return (
    <div className="z-10 w-full max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Rich Text Demo</h1>
      <p className="mb-8 opacity-80">
        Two example blog post routes that render the same Contentful entry via
        different APIs.
      </p>
      <ul className="space-y-3">
        <li>
          <Link
            className="underline"
            href="/blog/rest/blog-post-1"
          >
            REST — /blog/rest/blog-post-1
          </Link>
        </li>
        <li>
          <Link
            className="underline"
            href="/blog/graphql/blog-post-1"
          >
            GraphQL — /blog/graphql/blog-post-1
          </Link>
        </li>
      </ul>
    </div>
  );
}
