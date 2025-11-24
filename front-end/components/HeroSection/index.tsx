import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Styles from "./styles.module.css"

const Hero = () => {
  return (
    <section
      className="relative w-100 py-20 md:py-28"
      style={{
        paddingTop: "25px",
        paddingBottom: "25px",
        background: "linear-gradient(to left, #EAF8EE, #F7FFF9)",
        fontFamily: "Cairo, sans-serif",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          
          {/* ===== TEXT CONTENT ===== */}

          <div className={`${Styles["hero-content"]}`}>
            <p className={`${Styles["hero-title"]}`}>
              اكتشف أفضل المنتجات 
              <span className={`${Styles["hero-span"]} block`}>
                  بأفضل الأسعار
              </span>
            </p>
            <p className={`${Styles["hero-text"]}`}>
              تسوق من مجموعة واسعة من المنتجات عالية الجودة مع توصيل سريع وآمن
            </p>
            <div className="flex gap-4 justify-end m-3">
              <Link href="/products">
                <Button
                  size="lg"
                  variant="outline"
                  className={`${Styles["hero-main-btn"]}`}
                >
                  تسوّق الآن
                  <ArrowLeft className="mr-2 h-5 w-5 text-white" />
                </Button>
              </Link>

              <Link href="/offers">
                <Button
                  size="lg"
                  variant="outline"
                  className={`${Styles["hero-second-btn"]}`}
                >
                  عروض خاصة
                </Button>
              </Link>
            </div>
          </div>
          

          {/* <div className="text-right space-y-6">
            <h1 className="text-[38px] md:text-[55px] font-extrabold leading-tight">
              اكتشف أفضل المنتجات
              <span className="block text-[#16A249]">
                بأفضل الأسعار
              </span>
            </h1>

            <p className="text-lg text-gray-600">
              تسوق من مجموعة واسعة من المنتجات عالية الجودة مع توصيل سريع وآمن
            </p>

            <div className="flex gap-4 justify-end">
              <Link href="/products">
                              <Button
                size="lg"
                className="text-lg px-10 py-6 rounded-xl bg-[#16A249]"
              >
                تسوّق الآن
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
              </Link>

              <Link href="/offers">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-6 rounded-xl border-gray-300 hover:bg-gray-100"
                >
                  عروض خاصة
                </Button>
              </Link>
            </div>
          </div> */}

          {/* ===== IMAGE BOX ===== */}
          <div className="hidden md:flex justify-center">
            <div
              className="rounded-3xl shadow-sm flex items-center justify-center border border-gray-200"
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                backgroundColor: "#F3F3F3",
              }}
            >
              <p className="text-gray-500 text-lg">صورة المنتجات</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
