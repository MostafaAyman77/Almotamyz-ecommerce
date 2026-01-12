"use client";

import Wadfow from "@/../public/assets/images/wadfowLogo.png";
import Kendo from "@/../public/assets/images/kendoLogo.png";
import PowerAction from "@/../public/assets/images/powerActionLogo.png";
import Ronix from "@/../public/assets/images/ronixLogo.png";
import BrandItem from "@/components/BrandItem";
import Headings from "@/components/Headings";

const brandsData = [
  {
    id: 1,
    name: "Kendo",
    slug: "kendo",
    image: Kendo
  },
  {
    id: 2,
    name: "Wadfow",
    slug: "wadfow",
    image: Wadfow
  },
  {
    id: 3,
    name: "Power Action",
    slug: "power-action",
    image: PowerAction
  },
  {
    id: 4,
    name: "Ronix",
    slug: "ronix",
    image: Ronix
  }
];

const Brands = () => {
  return (
    <div className="bg-gradient-to-br from-gray-30 to-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
          <h2 className="text-4xl md:text-4xl font-extrabold text-center mb-4"
            style={{color: "var(--primary-color)"}} 
          >
            الماركات التي نتعامل معهم
          </h2>
        </div> */}
        <Headings title=" الماركات التي نتعامل معهم" />
        {/* شبكة تأخذ العرض الكامل بدون div إضافي */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {brandsData.map((brand, index) => (
            <BrandItem key={index} brand={brand} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Brands;