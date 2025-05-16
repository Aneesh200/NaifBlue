export default function FAQPage() {
  const faqs = [
    {
      question: "Is return available?",
      answer: "No, we do not accept returns or exchanges. All sales are final. Please ensure you select the correct size and style before placing your order."
    },
    {
      question: "How long does shipping take?",
      answer: "Orders are typically processed within 1-2 business days. Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you will receive a tracking number via email. You can also track your order status by logging into your account."
    },
    {
      question: "What if my item arrives damaged?",
      answer: "If your item arrives damaged, please contact our customer service within 24 hours of delivery with photos of the damage. We will review your case and provide appropriate assistance."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within the United States."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-light mb-8">Frequently Asked Questions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300"
          >
            <h2 className="text-xl font-light mb-3 text-gray-900">{faq.question}</h2>
            <p className="text-gray-500">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 