const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load Models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Service = require('./models/Service');
const Order = require('./models/Order');
const Commission = require('./models/Commission');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

// --- Real Unsplash Image URLs ---
const IMAGES = {
    // Physical Art
    varanasi: 'https://images.unsplash.com/photo-1565355830436-e8d1c750b3f8?q=80&w=800&auto=format&fit=crop',
    abstract_paint: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop',
    charcoal: 'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=800&auto=format&fit=crop',
    sculpture: 'https://images.unsplash.com/photo-1555588337-67500593b4a2?q=80&w=800&auto=format&fit=crop',
    pottery: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
    mural: 'https://images.unsplash.com/photo-1684360349646-95b058c4263b?q=80&w=800&auto=format&fit=crop',
    
    // Merchandise
    tshirt_art: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop',
    tote: 'https://images.unsplash.com/photo-1597484661643-2f6f332063f3?q=80&w=800&auto=format&fit=crop',
    mug: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop',
    decor: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',

    // Digital
    cyberpunk: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    brushes: 'https://images.unsplash.com/photo-1626785774573-4b799312299d?q=80&w=800&auto=format&fit=crop',
    templates: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop',
    
    // Services / Workshops
    workshop: 'https://images.unsplash.com/photo-1460661414924-913d08da4776?q=80&w=800&auto=format&fit=crop',
    portrait_service: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=800&auto=format&fit=crop',
    logo_design: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?q=80&w=800&auto=format&fit=crop'
};

const categoriesStub = [
    // --- Product Categories ---
    { name: 'Physical Art', slug: 'physical-art', type: 'product', icon: '🎨', description: 'Original paintings, sketches, and sculptures' },
    { name: 'Merchandise', slug: 'merchandise', type: 'product', icon: '👕', description: 'Art-printed apparel and accessories' },
    { name: 'Digital Assets', slug: 'digital-assets', type: 'product', icon: '💻', description: 'Downloadable brushes, wallpapers, and templates' },
    
    // --- Service Categories ---
    { name: 'Commissions', slug: 'commissions', type: 'service', icon: '🤝', description: 'Custom artwork requests' },
    { name: 'Workshops', slug: 'workshops', type: 'service', icon: '🎓', description: 'Learn from the masters' },
    { name: 'Professional Services', slug: 'professional-services', type: 'service', icon: '✒️', description: 'Branding, curation, and design' }
];

const seedFullData = async () => {
    await connectDB();

    try {
        console.log('🧹 Clearing data (Users preserved)...');
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Service.deleteMany({});
        await Order.deleteMany({});
        await Commission.deleteMany({});

        // --- 1. Fetch Users ---
        // Ensure these users exist in your DB from the previous step!
        const admin = await User.findOne({ role: 'admin' });
        const vendorA = await User.findOne({ email: 'vendor1@gmail.com' }); // Vivid Strokes (Physical/Service)
        const vendorB = await User.findOne({ email: 'vendor2@gmail.com' }); // Pixel Perfect (Digital/Merch)
        const customer = await User.findOne({ email: 'customer@gmail.com' });

        if (!vendorA || !vendorB || !customer) {
            throw new Error('❌ Users not found! Please run your user seed script first.');
        }
        console.log('👤 Users fetched successfully.');

        // --- 2. Create Categories ---
        const categoryMap = {};
        for (const cat of categoriesStub) {
            const created = await Category.create(cat);
            categoryMap[cat.slug] = created._id;
        }
        console.log('📂 Categories created.');

        // --- 3. PRODUCTS: Physical Art (Vendor A) ---
        const physicalProducts = [
            {
                title: 'Sunset at Dashashwamedh Ghat',
                description: 'A vibrant oil painting capturing the spiritual energy of Varanasi at dusk. 24x36 inches.',
                price: 25000,
                category: categoryMap['physical-art'],
                type: 'physical',
                productType: 'physical_art',
                physicalArtType: 'original_artwork',
                images: [IMAGES.varanasi],
                stock: 1,
                isSigned: true,
                certification: 'Certified Original by Amit Verma'
            },
            {
                title: 'Abstract Thoughts #4',
                description: 'Mixed media on canvas. A visual representation of modern chaos.',
                price: 12000,
                category: categoryMap['physical-art'],
                type: 'physical',
                productType: 'physical_art',
                physicalArtType: 'original_artwork',
                images: [IMAGES.abstract_paint],
                stock: 1,
                isSigned: true
            },
            {
                title: 'The Silent Gaze - Charcoal',
                description: 'Hyper-realistic charcoal study of an elderly face. Framed.',
                price: 4500,
                category: categoryMap['physical-art'],
                type: 'physical',
                productType: 'physical_art',
                physicalArtType: 'original_artwork',
                images: [IMAGES.charcoal],
                stock: 3
            },
            {
                title: 'Bronze Horse Figurine',
                description: 'Hand-cast bronze sculpture, oxidized finish. Perfect for desk decor.',
                price: 8500,
                category: categoryMap['physical-art'],
                type: 'physical',
                productType: 'physical_art',
                physicalArtType: 'miniature',
                images: [IMAGES.sculpture],
                stock: 10
            },
            {
                title: 'Handcrafted Clay Vase',
                description: 'Terracotta vase with tribal motifs. Waterproof and glazed.',
                price: 1200,
                category: categoryMap['physical-art'],
                type: 'physical',
                productType: 'physical_art',
                physicalArtType: 'handcrafted',
                images: [IMAGES.pottery],
                stock: 15
            }
        ];
        
        // Add vendor and insert
        await Product.insertMany(physicalProducts.map(p => ({ ...p, vendor: vendorA._id })));
        console.log('🎨 Physical Products added (Vendor A).');

        // --- 4. PRODUCTS: Merchandise & Digital (Vendor B) ---
        const merchAndDigital = [
            // Merch
            {
                title: 'Glitch Art Hoodie',
                description: 'Heavyweight cotton hoodie with cyberpunk glitch print on back.',
                price: 1899,
                category: categoryMap['merchandise'],
                type: 'physical',
                productType: 'merchandise',
                merchandiseType: 'apparel',
                images: [IMAGES.tshirt_art],
                availableSizes: ['S', 'M', 'L', 'XL'],
                availableColors: ['Black', 'Navy'],
                stock: 50
            },
            {
                title: 'Geometric Tote Bag',
                description: 'Canvas tote bag with minimalist geometric design. Eco-friendly.',
                price: 599,
                category: categoryMap['merchandise'],
                type: 'physical',
                productType: 'merchandise',
                merchandiseType: 'accessories',
                images: [IMAGES.tote],
                stock: 100
            },
            {
                title: 'Artist Soul Coffee Mug',
                description: 'Ceramic mug with matte finish. Microwave safe.',
                price: 499,
                category: categoryMap['merchandise'],
                type: 'physical',
                productType: 'merchandise',
                merchandiseType: 'home_decor',
                images: [IMAGES.mug],
                stock: 30
            },
            // Digital
            {
                title: 'Cyberpunk Cityscapes 4K',
                description: 'A pack of 10 high-resolution wallpapers for desktop and mobile.',
                price: 499,
                category: categoryMap['digital-assets'],
                type: 'digital',
                productType: 'digital',
                digitalType: 'wallpaper',
                images: [IMAGES.cyberpunk],
                downloadUrl: 'https://example.com/dl/cyberpunk-pack.zip'
            },
            {
                title: 'Ultimate Procreate Brushes',
                description: '50+ custom brushes for digital painting: Oils, Charcoal, and Gouache.',
                price: 999,
                category: categoryMap['digital-assets'],
                type: 'digital',
                productType: 'digital',
                digitalType: 'font_icon_brush',
                images: [IMAGES.brushes],
                downloadUrl: 'https://example.com/dl/brushes.zip'
            },
            {
                title: 'Instagram Grid Templates',
                description: 'Editable PSD and Canva templates for artists to showcase work.',
                price: 299,
                category: categoryMap['digital-assets'],
                type: 'digital',
                productType: 'digital',
                digitalType: 'template',
                images: [IMAGES.templates],
                downloadUrl: 'https://example.com/dl/insta-grid.zip'
            }
        ];

        await Product.insertMany(merchAndDigital.map(p => ({ ...p, vendor: vendorB._id })));
        console.log('💻 Digital & Merch Products added (Vendor B).');

        // --- 5. SERVICES (Vendor A & B) ---
        const services = [
            {
                vendor: vendorA._id,
                title: 'Hyper-Realistic Pet Portrait',
                description: 'I will draw your pet from a reference photo using charcoal or graphite.',
                basePrice: 5000,
                coverImage: IMAGES.portrait_service,
                deliveryTime: '2 Weeks',
                category: categoryMap['commissions'],
                serviceType: 'commission',
                commissionSubType: 'portrait'
            },
            {
                vendor: vendorA._id,
                title: 'Large Scale Wall Mural',
                description: 'Custom wall painting for cafes, offices, or homes.',
                basePrice: 20000,
                coverImage: IMAGES.mural,
                deliveryTime: '1 Month',
                category: categoryMap['commissions'],
                serviceType: 'commission',
                commissionSubType: 'mural'
            },
            {
                vendor: vendorA._id,
                title: 'Oil Painting Masterclass',
                description: '2-day offline workshop learning the basics of oil mixing and layering.',
                basePrice: 2500,
                coverImage: IMAGES.workshop,
                deliveryTime: 'N/A',
                category: categoryMap['workshops'],
                serviceType: 'educational',
                educationalSubType: 'workshop',
                isPreBooking: true,
                scheduledStartDate: new Date(Date.now() + 864000000), // +10 days
                location: 'Vivid Strokes Studio, Bandra'
            },
            {
                vendor: vendorB._id,
                title: 'Brand Identity Design',
                description: 'Complete logo, color palette, and typography guide for new startups.',
                basePrice: 15000,
                coverImage: IMAGES.logo_design,
                deliveryTime: '3 Weeks',
                category: categoryMap['professional-services'],
                serviceType: 'pre_order',
                preOrderSubType: 'logo_branding'
            }
        ];
        await Service.insertMany(services);
        console.log('🛠 Services added.');

        // --- 6. OPERATIONAL DATA: Orders & Commissions ---
        
        // Find created products to link
        const painting = await Product.findOne({ title: 'Sunset at Dashashwamedh Ghat' });
        const hoodie = await Product.findOne({ title: 'Glitch Art Hoodie' });
        const petPortraitService = await Service.findOne({ title: 'Hyper-Realistic Pet Portrait' });

        // Order 1: Delivered Hoodie
        await Order.create({
            buyer: customer._id,
            totalAmount: hoodie.price,
            status: 'delivered',
            paymentStatus: 'paid',
            lineItems: [{
                itemType: 'product',
                product: hoodie._id,
                quantity: 1,
                unitPrice: hoodie.price
            }],
            products: [{ product: hoodie._id, quantity: 1 }],
            shippingAddress: {
                street: 'Flat 402, Sunset Towers',
                city: 'Pune',
                state: 'Maharashtra',
                pincode: '411001',
                phone: '9988776655'
            }
        });

        // Commission 1: In Progress Portrait
        await Commission.create({
            service: petPortraitService._id,
            customer: customer._id,
            vendor: vendorA._id,
            status: 'in_progress',
            description: 'A portrait of my Golden Retriever, Max. He is smiling in the photo.',
            budget: 5000,
            deadline: new Date(Date.now() + 1209600000), // +14 days
            paymentStatus: 'paid',
            messages: [
                {
                    sender: customer._id,
                    text: 'Hi, I just paid. Here is the reference photo of Max!',
                    timestamp: new Date()
                },
                {
                    sender: vendorA._id,
                    text: 'Got it! He looks adorable. I will start the sketch tomorrow.',
                    timestamp: new Date()
                }
            ]
        });

        console.log('✅ Operational Data (Orders/Commissions) seeded.');
        console.log('🚀 SEEDING COMPLETE! Press Ctrl+C to exit if it doesn\'t close automatically.');
        process.exit();

    } catch (error) {
        console.error(`❌ Seeding Failed: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
};

seedFullData();