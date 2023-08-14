import { Document } from "@contentful/rich-text-types";

export type Entry = {
  __typename: string;
  sys: {
    id: string;
  };
};

export interface BlogPost extends Entry {
  title: string;
  body: {
    json: Document;
    links: LinkTypes;
  };
}

export type Asset = {
  sys: {
    id: string;
  };
  url: string;
  title: string;
  width: number;
  height: number;
  description: string;
  contentType: string;
};

export type Entries = {
  inline: Entry[];
  block: Entry[];
};

export type Assets = {
  block: Asset[];
};

export type LinkTypes = {
  entries: Entries;
  assets: Assets;
};

export type BlogPostParams = {
  params: {
    slug: string;
  };
};
