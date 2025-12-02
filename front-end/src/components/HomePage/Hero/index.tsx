import Image from "next/image";
import HeroImage from "@/../public/assets/images/photo.png";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const Hero = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mt-16 mb-16">
      <div className="flex flex-col items-center md:items-start gap-8">
        <h2 className="text-6xl font-bold text-blue-500 text-center md:text-right" style={{color: "var(--black-color)"}}>
          اكتشف أفضل المنتجات
          <span className={`block mt-3`} style={{color: "var(--primary-color) "}}>
            بأفضل الأسعار
          </span>
        </h2>
        <p className="max-w-2xl text-center md:text-left" >
          تَسوق عبر مجموعة واسعة من المنتجات عالية الجودة مع توصيل سريع وآمن
        </p>
        <div className="flex gap-4 justify-end m-3">
              <Link href="/products">
                <button
                    className={`flex items-center justify-center text-white px-8 py-3 font-semibold rounded-xl border border-gray-300 bg-white text-gray-900 hover:bg-gray-50`}
                    style={{backgroundColor: "var(--primary-color)", cursor: "pointer"}}
                >
                  تسوق الآن
                  <ArrowLeft className="mr-2 h-5 w-5 text-white" />
                </button>
              </Link>

              <Link href="/offers">
                <button
                    className={`px-8 py-3 font-semibold rounded-xl border border-gray-300 bg-white text-gray-900 hover:bg-gray-50`}
                    style={{cursor: "pointer"}}
                >
                  عروض خاصة
                </button>
              </Link>
            </div>
      </div>
      <div>
        {/* Image */}
        <Image src={HeroImage} className="" alt="hero" width={500} height={500} />
      </div>
    </div>
  );
};

export default Hero;
