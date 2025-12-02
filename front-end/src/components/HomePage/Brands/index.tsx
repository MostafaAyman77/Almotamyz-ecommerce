import { FaCaretRight } from "react-icons/fa";

const WebPlans = () => {
  return (
    <div className="bg-gradient-to-br from-gray-30 to-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
          <h2 className="text-4xl md:text-4xl font-extrabold text-center text-transparent mb-4"
            style={{color: "var(--primary-color"}}
          >
            الماركات التي نتعامل معهم
          </h2>
          {/* <p className="text-gray-600 text-center text-lg mx-auto max-w-2xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum
            quisquam facere excepturi, impedit officia perferendis.
          </p> */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Starter Plan
            </h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-gray-600">
                <FaCaretRight className="w-5 h-5 text-green-500 mr-2" />
                <span>Feature 1</span>
              </li>
              <li className="flex items-center text-gray-600">
                <FaCaretRight className="w-5 h-5 text-green-500 mr-2" />
                <span>Feature 2</span>
              </li>
              <li className="flex items-center text-gray-600">
                <FaCaretRight className="w-5 h-5 text-green-500 mr-2" />
                <span>Feature 3</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 transform scale-105 border-2 border-green-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Pro Plan</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-gray-600">
                <FaCaretRight className="w-5 h-5 text-green-500 mr-2" />
                <span>Feature 1</span>
              </li>
              <li className="flex items-center text-gray-600">
                <FaCaretRight className="w-5 h-5 text-green-500 mr-2" />
                <span>Feature 2</span>
              </li>
              <li className="flex items-center text-gray-600">
                <FaCaretRight className="w-5 h-5 text-green-500 mr-2" />
                <span>Feature 3</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Enterprise Plan
            </h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-gray-600">
                <FaCaretRight className="w-5 h-5 text-green-500 mr-2" />
                <span>Feature 1</span>
              </li>
              <li className="flex items-center text-gray-600">
                <FaCaretRight className="w-5 h-5 text-green-500 mr-2" />
                <span>Feature 2</span>
              </li>
              <li className="flex items-center text-gray-600">
                <FaCaretRight className="w-5 h-5 text-green-500 mr-2" />
                <span>Feature 3</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebPlans;
