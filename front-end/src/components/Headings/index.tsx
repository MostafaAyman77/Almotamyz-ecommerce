"use client";

type HeadingsProps = {
  title: string;
};


const Headings = ({ title }: HeadingsProps) => {
  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
        <h2 className="text-4xl md:text-4xl font-extrabold text-center mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          {title}
        </h2>
      </div>
    </>
  )
}

export default Headings;