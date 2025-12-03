import { StaticImageData } from "next/image";

export type BrandType = {
  id: number,
  name: string,
  slug: string,
image: StaticImageData | string;
}
