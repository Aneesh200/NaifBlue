import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTestimonialsAndPortfolio() {
  console.log('Seeding testimonials and portfolio items...');

  // Create testimonials
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Parent",
      school_name: "Greenwood Elementary",
      content: "Naif Bleu made uniform shopping so easy! The quality is excellent and my daughter loves her new uniforms. The ordering process was seamless and delivery was quick.",
      rating: 5,
      is_featured: true,
      is_active: true
    },
    {
      name: "Michael Chen",
      role: "School Administrator",
      school_name: "Riverside High School",
      content: "We've been partnering with Naif Bleu for three years now. Their attention to detail and commitment to quality has made them our go-to uniform supplier.",
      rating: 5,
      is_featured: true,
      is_active: true
    },
    {
      name: "Emma Williams",
      role: "Parent",
      school_name: "St. Mary's Academy",
      content: "The uniforms are durable and comfortable. My son has been wearing them for a full school year and they still look brand new. Highly recommend!",
      rating: 5,
      is_featured: true,
      is_active: true
    },
    {
      name: "David Rodriguez",
      role: "Teacher",
      school_name: "Oakwood Middle School",
      content: "As a teacher, I appreciate how professional and well-fitted the uniforms look on our students. Naif Bleu has really elevated our school's appearance.",
      rating: 5,
      is_featured: false,
      is_active: true
    }
  ];

  // Create portfolio items
  const portfolioItems = [
    {
      title: "Greenwood Elementary Complete Uniform Set",
      description: "A comprehensive uniform collection featuring polo shirts, skirts, trousers, and blazers in the school's signature navy and white colors.",
      image_url: "/images/portfolio/greenwood-elementary.jpg",
      school_name: "Greenwood Elementary",
      category: "Elementary School",
      year: 2024,
      is_featured: true,
      is_active: true
    },
    {
      title: "Riverside High School Athletic Wear",
      description: "Custom athletic uniforms including sports jerseys, shorts, and tracksuits designed for comfort and performance.",
      image_url: "/images/portfolio/riverside-athletics.jpg",
      school_name: "Riverside High School",
      category: "Athletic Wear",
      year: 2024,
      is_featured: true,
      is_active: true
    },
    {
      title: "St. Mary's Academy Formal Collection",
      description: "Elegant formal uniforms featuring blazers, dress shirts, ties, and pleated skirts in traditional school colors.",
      image_url: "/images/portfolio/st-marys-formal.jpg",
      school_name: "St. Mary's Academy",
      category: "Formal Wear",
      year: 2023,
      is_featured: true,
      is_active: true
    },
    {
      title: "Oakwood Middle School Casual Line",
      description: "Comfortable everyday uniforms including polo shirts, chinos, and cardigans perfect for middle school students.",
      image_url: "/images/portfolio/oakwood-casual.jpg",
      school_name: "Oakwood Middle School",
      category: "Casual Wear",
      year: 2023,
      is_featured: true,
      is_active: true
    },
    {
      title: "Sunshine Primary Summer Collection",
      description: "Lightweight summer uniforms designed for comfort in warmer weather, featuring breathable fabrics and bright colors.",
      image_url: "/images/portfolio/sunshine-summer.jpg",
      school_name: "Sunshine Primary",
      category: "Summer Wear",
      year: 2024,
      is_featured: false,
      is_active: true
    },
    {
      title: "Heritage Academy Winter Uniforms",
      description: "Warm and stylish winter uniforms including wool blazers, sweaters, and thermal undergarments.",
      image_url: "/images/portfolio/heritage-winter.jpg",
      school_name: "Heritage Academy",
      category: "Winter Wear",
      year: 2023,
      is_featured: false,
      is_active: true
    }
  ];

  try {
    // Insert testimonials
    for (const testimonial of testimonials) {
      await prisma.testimonial.create({
        data: testimonial
      });
    }

    // Insert portfolio items
    for (const item of portfolioItems) {
      await prisma.portfolioItem.create({
        data: item
      });
    }

    console.log('Testimonials and portfolio items seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestimonialsAndPortfolio()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} 