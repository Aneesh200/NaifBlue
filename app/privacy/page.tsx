export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information that you provide directly to us, including:",
      list: [
        "Name and contact information",
        "Billing and shipping address",
        "Payment information",
        "Order history",
        "Account preferences"
      ]
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to:",
      list: [
        "Process your orders and payments",
        "Communicate with you about your orders",
        "Send you marketing communications (with your consent)",
        "Improve our website and services",
        "Prevent fraud and enhance security"
      ]
    },
    {
      title: "3. Information Sharing",
      content: "We do not sell your personal information. We may share your information with:",
      list: [
        "Service providers who assist in our operations",
        "Payment processors to handle transactions",
        "Shipping partners to deliver your orders",
        "Law enforcement when required by law"
      ]
    },
    {
      title: "4. Cookies and Tracking",
      content: "We use cookies and similar tracking technologies to:",
      list: [
        "Remember your preferences",
        "Analyze website traffic",
        "Improve your shopping experience",
        "Show you relevant advertisements"
      ]
    },
    {
      title: "5. Data Security",
      content: "We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure."
    },
    {
      title: "6. Your Rights",
      content: "You have the right to:",
      list: [
        "Access your personal information",
        "Correct inaccurate information",
        "Request deletion of your information",
        "Opt-out of marketing communications"
      ]
    },
    {
      title: "7. Changes to This Policy",
      content: "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page."
    },
    {
      title: "8. Contact Us",
      content: "If you have any questions about this privacy policy, please contact us at support@naifbleu.com."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-light mb-8">Privacy Policy</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <div 
            key={index}
            className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300"
          >
            <h2 className="text-xl font-light mb-3 text-gray-900">{section.title}</h2>
            <p className="text-gray-500 mb-3">{section.content}</p>
            {section.list && (
              <ul className="list-disc pl-6 space-y-2 text-gray-500">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 