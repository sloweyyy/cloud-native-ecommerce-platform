import { ProductResponse, Brand, ProductType } from '../../products/schemas';

export const mockProducts: ProductResponse[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description:
      'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals who demand the best audio experience.',
    summary:
      'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music...',
    imageFile: '/images/products/headphones.png',
    brands: { id: '1', name: 'TechGear' },
    types: { id: '1', name: 'Electronics' },
    price: 99.99,
  },
  {
    id: '2',
    name: 'Smart Watch',
    description:
      'Advanced fitness tracker with heart rate monitoring, GPS, and smartphone notifications. Track your health and stay connected on the go with this feature-rich smartwatch.',
    summary:
      'Advanced fitness tracker with heart rate monitoring, GPS, and smartphone notifications. Track your health and stay connected on the go...',
    imageFile: '/images/products/smartwatch.png',
    brands: { id: '1', name: 'TechGear' },
    types: { id: '1', name: 'Electronics' },
    price: 199.99,
  },
  {
    id: '3',
    name: 'Laptop Stand',
    description:
      'Ergonomic aluminum laptop stand that improves posture and provides better airflow for your device. Adjustable height and angle for maximum comfort during long work sessions.',
    summary:
      'Ergonomic aluminum laptop stand that improves posture and provides better airflow for your device. Adjustable height and angle for maximum comfort...',
    imageFile: '/images/products/laptop-stand.png',
    brands: { id: '2', name: 'SmartLife' },
    types: { id: '2', name: 'Accessories' },
    price: 49.99,
  },
  {
    id: '4',
    name: 'USB-C Cable',
    description:
      'High-speed USB-C cable with fast charging support and data transfer rates up to 10Gbps. Durable braided design for long-lasting use.',
    summary:
      'High-speed USB-C cable with fast charging support and data transfer rates up to 10Gbps. Durable braided design for long-lasting use.',
    imageFile: '/images/products/usb-cable.png',
    brands: { id: '2', name: 'SmartLife' },
    types: { id: '2', name: 'Accessories' },
    price: 19.99,
  },
  {
    id: '5',
    name: 'Phone Case',
    description:
      'Protective phone case with military-grade drop protection and wireless charging compatibility. Slim design that fits in your pocket while providing maximum protection.',
    summary:
      'Protective phone case with military-grade drop protection and wireless charging compatibility. Slim design that fits in your pocket while providing maximum...',
    imageFile: '/images/products/phone-case.png',
    brands: { id: '2', name: 'SmartLife' },
    types: { id: '2', name: 'Accessories' },
    price: 29.99,
  },
  {
    id: '6',
    name: 'Portable Charger',
    description:
      '20000mAh portable power bank with fast charging and multiple USB ports. Keep all your devices charged on the go with this high-capacity power bank.',
    summary:
      '20000mAh portable power bank with fast charging and multiple USB ports. Keep all your devices charged on the go with this high-capacity power bank.',
    imageFile: '/images/products/power-bank.png',
    brands: { id: '1', name: 'TechGear' },
    types: { id: '1', name: 'Electronics' },
    price: 39.99,
  },
  {
    id: '7',
    name: 'Bluetooth Speaker',
    description:
      'Portable wireless speaker with rich sound and 12-hour battery life. Perfect for outdoor adventures, parties, or home use.',
    summary:
      'Portable wireless speaker with rich sound and 12-hour battery life. Perfect for outdoor adventures, parties, or home use.',
    imageFile: '/images/products/speaker.png',
    brands: { id: '1', name: 'TechGear' },
    types: { id: '1', name: 'Electronics' },
    price: 79.99,
  },
  {
    id: '8',
    name: 'Wireless Mouse',
    description:
      'Ergonomic wireless mouse with precision tracking and long battery life. Comfortable design for extended use.',
    summary:
      'Ergonomic wireless mouse with precision tracking and long battery life. Comfortable design for extended use.',
    imageFile: '/images/products/mouse.png',
    brands: { id: '2', name: 'SmartLife' },
    types: { id: '2', name: 'Accessories' },
    price: 34.99,
  },
  {
    id: '9',
    name: 'Mechanical Keyboard',
    description:
      'RGB mechanical keyboard for gaming and productivity. Customizable backlighting and premium key switches.',
    summary:
      'RGB mechanical keyboard for gaming and productivity. Customizable backlighting and premium key switches.',
    imageFile: '/images/products/keyboard.png',
    brands: { id: '3', name: 'ProGear' },
    types: { id: '2', name: 'Accessories' },
    price: 129.99,
  },
  {
    id: '10',
    name: 'Webcam HD',
    description:
      '1080p HD webcam for video calls with autofocus and built-in microphone. Perfect for remote work and online meetings.',
    summary:
      '1080p HD webcam for video calls with autofocus and built-in microphone. Perfect for remote work and online meetings.',
    imageFile: '/images/products/webcam.png',
    brands: { id: '1', name: 'TechGear' },
    types: { id: '1', name: 'Electronics' },
    price: 69.99,
  },
  {
    id: '11',
    name: 'Gaming Headset',
    description:
      'Professional gaming headset with 7.1 surround sound and noise-canceling microphone. Immersive audio experience for competitive gaming.',
    summary:
      'Professional gaming headset with 7.1 surround sound and noise-canceling microphone. Immersive audio experience for competitive gaming.',
    imageFile: '/images/products/gaming-headset.png',
    brands: { id: '3', name: 'ProGear' },
    types: { id: '1', name: 'Electronics' },
    price: 149.99,
  },
  {
    id: '12',
    name: 'Monitor Stand',
    description:
      'Adjustable monitor stand with storage compartments. Organize your workspace and improve ergonomics.',
    summary:
      'Adjustable monitor stand with storage compartments. Organize your workspace and improve ergonomics.',
    imageFile: '/images/products/monitor-stand.png',
    brands: { id: '2', name: 'SmartLife' },
    types: { id: '2', name: 'Accessories' },
    price: 54.99,
  },
  {
    id: '13',
    name: 'Graphics Tablet',
    description:
      'Digital drawing tablet for artists and designers. Pressure-sensitive pen for natural drawing experience.',
    summary:
      'Digital drawing tablet for artists and designers. Pressure-sensitive pen for natural drawing experience.',
    imageFile: '/images/products/tablet.png',
    brands: { id: '3', name: 'ProGear' },
    types: { id: '1', name: 'Electronics' },
    price: 189.99,
  },
  {
    id: '14',
    name: 'Cable Organizer',
    description:
      'Desk cable management system to keep your workspace tidy. Multiple channels and adhesive backing.',
    summary:
      'Desk cable management system to keep your workspace tidy. Multiple channels and adhesive backing.',
    imageFile: '/images/products/cable-organizer.png',
    brands: { id: '2', name: 'SmartLife' },
    types: { id: '2', name: 'Accessories' },
    price: 15.99,
  },
  {
    id: '15',
    name: 'Desk Lamp',
    description:
      'LED desk lamp with adjustable brightness and color temperature. Eye-friendly lighting for work and study.',
    summary:
      'LED desk lamp with adjustable brightness and color temperature. Eye-friendly lighting for work and study.',
    imageFile: '/images/products/desk-lamp.png',
    brands: { id: '2', name: 'SmartLife' },
    types: { id: '2', name: 'Accessories' },
    price: 44.99,
  },
  {
    id: '16',
    name: 'External SSD',
    description:
      '1TB portable external SSD with USB-C connectivity. Fast data transfer for professionals on the go.',
    summary:
      '1TB portable external SSD with USB-C connectivity. Fast data transfer for professionals on the go.',
    imageFile: '/images/products/ssd.png',
    brands: { id: '1', name: 'TechGear' },
    types: { id: '1', name: 'Electronics' },
    price: 119.99,
  },
  {
    id: '17',
    name: 'Smartphone Gimbal',
    description:
      '3-axis smartphone stabilizer for smooth video recording. Perfect for vloggers and content creators.',
    summary:
      '3-axis smartphone stabilizer for smooth video recording. Perfect for vloggers and content creators.',
    imageFile: '/images/products/gimbal.png',
    brands: { id: '3', name: 'ProGear' },
    types: { id: '1', name: 'Electronics' },
    price: 159.99,
  },
  {
    id: '18',
    name: 'Laptop Sleeve',
    description:
      'Protective laptop sleeve for 15.6 inch laptops. Padded protection with stylish design.',
    summary:
      'Protective laptop sleeve for 15.6 inch laptops. Padded protection with stylish design.',
    imageFile: '/images/products/laptop-sleeve.png',
    brands: { id: '2', name: 'SmartLife' },
    types: { id: '2', name: 'Accessories' },
    price: 24.99,
  },
  {
    id: '19',
    name: 'Screen Protector',
    description:
      'Tempered glass screen protector with easy installation. Crystal clear protection for your device.',
    summary:
      'Tempered glass screen protector with easy installation. Crystal clear protection for your device.',
    imageFile: '/images/products/screen-protector.png',
    brands: { id: '2', name: 'SmartLife' },
    types: { id: '2', name: 'Accessories' },
    price: 12.99,
  },
  {
    id: '20',
    name: 'Gaming Mouse Pad',
    description:
      'Extended gaming mouse pad with RGB lighting. Large surface area for gaming and productivity.',
    summary:
      'Extended gaming mouse pad with RGB lighting. Large surface area for gaming and productivity.',
    imageFile: '/images/products/mousepad.png',
    brands: { id: '3', name: 'ProGear' },
    types: { id: '2', name: 'Accessories' },
    price: 29.99,
  },
];

export const mockBrands: Brand[] = [
  { id: '1', name: 'TechGear' },
  { id: '2', name: 'SmartLife' },
  { id: '3', name: 'ProGear' },
];

export const mockTypes: ProductType[] = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Accessories' },
];
