export interface IERC721TokenMetadata {
  name: string;
  image: ipfsURI;
  description: string;
}

export interface IOpenSeaMetadata extends IERC721TokenMetadata {
  external_url: string;
  attributes: {
    trait_type: string;
    value: number | string | boolean;
  }[];
}

export type PanelMetadata = IOpenSeaMetadata & {
  attributes: {
    trait_type: "height" | "width" | "page" | "panel";
    value: number | string | boolean;
  }[];
};
