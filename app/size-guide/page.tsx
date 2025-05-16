export default function SizeGuidePage() {
  const sizeGuides = {
    shirts: [
      { size: "XS", chest: "32-34", waist: "28-30", height: "5'2\"-5'4\"" },
      { size: "S", chest: "34-36", waist: "30-32", height: "5'4\"-5'6\"" },
      { size: "M", chest: "36-38", waist: "32-34", height: "5'6\"-5'8\"" },
      { size: "L", chest: "38-40", waist: "34-36", height: "5'8\"-5'10\"" },
      { size: "XL", chest: "40-42", waist: "36-38", height: "5'10\"-6'0\"" },
      { size: "XXL", chest: "42-44", waist: "38-40", height: "6'0\"-6'2\"" }
    ],
    pants: [
      { size: "28", waist: "28", inseam: "30", height: "5'6\"-5'8\"" },
      { size: "30", waist: "30", inseam: "30", height: "5'8\"-5'10\"" },
      { size: "32", waist: "32", inseam: "32", height: "5'10\"-6'0\"" },
      { size: "34", waist: "34", inseam: "32", height: "6'0\"-6'2\"" },
      { size: "36", waist: "36", inseam: "34", height: "6'2\"-6'4\"" },
      { size: "38", waist: "38", inseam: "34", height: "6'4\"-6'6\"" }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-light mb-8">Size Guide</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300">
          <h2 className="text-xl font-light mb-6 text-gray-900">Shirts</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-light">Size</th>
                  <th className="text-left py-3 px-4 font-light">Chest (inches)</th>
                  <th className="text-left py-3 px-4 font-light">Waist (inches)</th>
                  <th className="text-left py-3 px-4 font-light">Height</th>
                </tr>
              </thead>
              <tbody>
                {sizeGuides.shirts.map((size) => (
                  <tr key={size.size} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-500">{size.size}</td>
                    <td className="py-3 px-4 text-gray-500">{size.chest}</td>
                    <td className="py-3 px-4 text-gray-500">{size.waist}</td>
                    <td className="py-3 px-4 text-gray-500">{size.height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300">
          <h2 className="text-xl font-light mb-6 text-gray-900">Pants</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-light">Size</th>
                  <th className="text-left py-3 px-4 font-light">Waist (inches)</th>
                  <th className="text-left py-3 px-4 font-light">Inseam (inches)</th>
                  <th className="text-left py-3 px-4 font-light">Height</th>
                </tr>
              </thead>
              <tbody>
                {sizeGuides.pants.map((size) => (
                  <tr key={size.size} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-500">{size.size}</td>
                    <td className="py-3 px-4 text-gray-500">{size.waist}</td>
                    <td className="py-3 px-4 text-gray-500">{size.inseam}</td>
                    <td className="py-3 px-4 text-gray-500">{size.height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300">
          <h2 className="text-xl font-light mb-4 text-gray-900">How to Measure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 text-gray-500">
              <p><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape measure horizontal.</p>
              <p><strong>Waist:</strong> Measure around your natural waistline, keeping the tape measure horizontal.</p>
            </div>
            <div className="space-y-4 text-gray-500">
              <p><strong>Inseam:</strong> Measure from the crotch to the desired length of the pants.</p>
              <p><strong>Height:</strong> Stand straight against a wall and measure from the floor to the top of your head.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 