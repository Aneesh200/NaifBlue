export default function TermsPage() {
  const terms = [
    {
      title: "1. Agreement to Terms",
      content: "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement."
    },
    {
      title: "2. Use License",
      content: "Permission is granted to temporarily download one copy of the materials (information or software) on Naif Bleu's website for personal, non-commercial transitory viewing only."
    },
    {
      title: "3. Product Information",
      content: "We attempt to be as accurate as possible with our product descriptions and images. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free."
    },
    {
      title: "4. Pricing and Payment",
      content: "All prices are in USD and are subject to change without notice. We reserve the right to modify or discontinue any product without notice at any time."
    },
    {
      title: "5. Shipping and Delivery",
      content: "Shipping times are estimates only. We are not responsible for any delays in delivery due to circumstances beyond our control."
    },
    {
      title: "6. Returns and Refunds",
      content: "All sales are final. We do not accept returns or exchanges. Please ensure you select the correct size and style before placing your order."
    },
    {
      title: "7. Limitation of Liability",
      content: "In no event shall Naif Bleu be liable for any damages arising out of the use or inability to use the materials on our website."
    },
    {
      title: "8. Revisions and Errata",
      content: "The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials are accurate, complete, or current."
    },
    {
      title: "9. Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws of the United States and you irrevocably submit to the exclusive jurisdiction of the courts in that location."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-light mb-8">Terms and Conditions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {terms.map((term, index) => (
          <div 
            key={index}
            className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300"
          >
            <h2 className="text-xl font-light mb-3 text-gray-900">{term.title}</h2>
            <p className="text-gray-500">{term.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 