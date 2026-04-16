import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with Hanoi Old Quarter Food Street data...');

  // Clean existing data
  await prisma.visit.deleteMany();
  await prisma.audioGuide.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.pOI.deleteMany();
  await prisma.restaurantOwner.deleteMany();
  await prisma.admin.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.create({
    data: {
      username: 'admin',
      email: 'admin@foodtour.vn',
      passwordHash: adminPassword,
      displayName: 'System Administrator',
      role: 'super_admin',
    },
  });
  console.log('Created admin: admin / admin123');

  // Create content editor
  const editorPassword = await bcrypt.hash('editor123', 10);
  await prisma.admin.create({
    data: {
      username: 'editor',
      email: 'editor@foodtour.vn',
      passwordHash: editorPassword,
      displayName: 'Content Editor',
      role: 'content_editor',
    },
  });
  console.log('Created admin: editor / editor123');

  // Create POIs (Hanoi Old Quarter area)
  const pois = await Promise.all([
    prisma.pOI.create({
      data: {
        id: 'poi-001',
        name: 'Bún Chả Hàng Mành',
        category: 'restaurant',
        lat: 21.0315,
        lng: 105.8485,
      },
    }),
    prisma.pOI.create({
      data: {
        id: 'poi-002',
        name: 'Phở Gia Truyền Bát Đàn',
        category: 'restaurant',
        lat: 21.0330,
        lng: 105.8470,
      },
    }),
    prisma.pOI.create({
      data: {
        id: 'poi-003',
        name: 'Bánh Mì Hội An',
        category: 'restaurant',
        lat: 21.0300,
        lng: 105.8500,
      },
    }),
    prisma.pOI.create({
      data: {
        id: 'poi-004',
        name: 'Chả Cá Lã Vọng',
        category: 'restaurant',
        lat: 21.0320,
        lng: 105.8495,
      },
    }),
    prisma.pOI.create({
      data: {
        id: 'poi-005',
        name: 'Bún Bò Huế Hàm Long',
        category: 'restaurant',
        lat: 21.0310,
        lng: 105.8478,
      },
    }),
    prisma.pOI.create({
      data: {
        id: 'poi-006',
        name: 'Xôi Xéo Giò Hà Nội',
        category: 'restaurant',
        lat: 21.0335,
        lng: 105.8488,
      },
    }),
    prisma.pOI.create({
      data: {
        id: 'poi-007',
        name: 'Bếp Thái Siêu',
        category: 'restaurant',
        lat: 21.0298,
        lng: 105.8492,
      },
    }),
    prisma.pOI.create({
      data: {
        id: 'poi-008',
        name: 'Cốm Mềm Hà Nội',
        category: 'restaurant',
        lat: 21.0340,
        lng: 105.8465,
      },
    }),
    prisma.pOI.create({
      data: {
        id: 'poi-wc-001',
        name: 'Nhà vệ sinh công cộng Đồng Xuân',
        category: 'wc',
        lat: 21.0325,
        lng: 105.8480,
      },
    }),
    prisma.pOI.create({
      data: {
        id: 'poi-wc-002',
        name: 'Nhà vệ sinh công cộng Hàng Da',
        category: 'wc',
        lat: 21.0305,
        lng: 105.8505,
      },
    }),
  ]);
  console.log(`Created ${pois.length} POIs`);

  // Create restaurants
  const restaurants = await Promise.all([
    prisma.restaurant.create({
      data: {
        id: 'res-001',
        poiId: 'poi-001',
        name: 'Bún Chả Hàng Mành',
        description: 'Quán bún chả gia truyền nổi tiếng nhất khu phố cổ với hương vị nước dùng đậm đà và thịt nướng than hoa. Được nhiều du khách quốc tế yêu thích.',
        cuisine: 'Hà Nội',
        openingHours: '08:00 - 21:00',
        status: 'approved',
        views: 2450,
        imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400',
      },
    }),
    prisma.restaurant.create({
      data: {
        id: 'res-002',
        poiId: 'poi-002',
        name: 'Phở Gia Truyền Bát Đàn',
        description: 'Nổi tiếng với hàng dài người xếp hàng mỗi sáng. Nước dùng trong, ngọt thanh từ xương bò hầm trong 24 giờ.',
        cuisine: 'Hà Nội',
        openingHours: '06:00 - 10:00, 18:00 - 20:30',
        status: 'approved',
        views: 3200,
        imageUrl: 'https://images.unsplash.com/photo-1583224964978-2257b960c3d3?w=400',
      },
    }),
    prisma.restaurant.create({
      data: {
        id: 'res-003',
        poiId: 'poi-003',
        name: 'Bánh Mì Hội An - Hà Nội',
        description: 'Bánh mì giòn tan với pate béo ngậy và các loại nhân đặc trưng miền Trung. Có cả phiên bản chay.',
        cuisine: 'Miền Trung',
        openingHours: '07:00 - 22:00',
        status: 'approved',
        views: 1850,
        imageUrl: 'https://images.unsplash.com/photo-1600688640154-9619e002df30?w=400',
      },
    }),
    prisma.restaurant.create({
      data: {
        id: 'res-004',
        poiId: 'poi-004',
        name: 'Chả Cá Lã Vọng',
        description: 'Món ăn trứ danh Hà Nội với cá lăng tươi nướng vàng, thơm phức. Ăn kèm cà tím chiên giòn và bún.',
        cuisine: 'Hà Nội',
        openingHours: '11:00 - 14:00, 17:30 - 21:00',
        status: 'approved',
        views: 1200,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
      },
    }),
    prisma.restaurant.create({
      data: {
        id: 'res-005',
        poiId: 'poi-005',
        name: 'Bún Bò Huế Hàm Long',
        description: 'Hương vị Huế đậm đà với nước dùng cay nồng, bún to, và thịt bò thơm ngon.',
        cuisine: 'Huế',
        openingHours: '06:00 - 21:00',
        status: 'approved',
        views: 980,
        imageUrl: 'https://images.unsplash.com/photo-1576577445504-6af96477db52?w=400',
      },
    }),
    prisma.restaurant.create({
      data: {
        id: 'res-006',
        poiId: 'poi-006',
        name: 'Xôi Xéo Giò Hà Nội',
        description: 'Xôi xéo mềm dẻo, topping giò chả truyền thống. Quán nhỏ nhưng luôn đông khách.',
        cuisine: 'Hà Nội',
        openingHours: '06:00 - 10:00',
        status: 'approved',
        views: 750,
        imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
      },
    }),
    prisma.restaurant.create({
      data: {
        id: 'res-007',
        poiId: 'poi-007',
        name: 'Bếp Thái Siêu - Ẩm Thực Thái',
        description: 'Mang hương vị Thái Lan chính hiệu đến Hà Nội với Tom Yum, Pad Thai và các món cay đặc trưng.',
        cuisine: 'Thái Lan',
        openingHours: '10:00 - 22:00',
        status: 'approved',
        views: 1100,
        imageUrl: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400',
      },
    }),
    prisma.restaurant.create({
      data: {
        id: 'res-008',
        poiId: 'poi-008',
        name: 'Cốm Mềm Hà Nội',
        description: 'Chuyên cốm truyền thống Hà Nội, bánh đúc, và các món ăn vặt dân dã. Địa điểm lý tưởng cho du khách muốn khám phá ẩm thực đường phố.',
        cuisine: 'Hà Nội',
        openingHours: '08:00 - 20:00',
        status: 'approved',
        views: 620,
        imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400',
      },
    }),
  ]);
  console.log(`Created ${restaurants.length} restaurants`);

  // Create menu items
  const menuItems = [
    // Bún Chả Hàng Mành
    { restaurantId: 'res-001', dishName: 'Bún Chả Quán', price: 45000, category: 'Món chính', isAvailable: true },
    { restaurantId: 'res-001', dishName: 'Bún Chả Đặc Biệt', price: 65000, category: 'Món đặc biệt', isAvailable: true },
    { restaurantId: 'res-001', dishName: 'Bún Chả Nem Cua', price: 55000, category: 'Món chính', isAvailable: true },
    { restaurantId: 'res-001', dishName: 'Chả Luộc', price: 25000, category: 'Món phụ', isAvailable: true },
    // Phở Bát Đàn
    { restaurantId: 'res-002', dishName: 'Phở Bò Tái', price: 55000, category: 'Phở', isAvailable: true },
    { restaurantId: 'res-002', dishName: 'Phở Bò Chín', price: 50000, category: 'Phở', isAvailable: true },
    { restaurantId: 'res-002', dishName: 'Phở Gà', price: 45000, category: 'Phở', isAvailable: true },
    { restaurantId: 'res-002', dishName: 'Phở Tái Nạm', price: 60000, category: 'Phở', isAvailable: true },
    // Bánh Mì
    { restaurantId: 'res-003', dishName: 'Bánh Mì Thập Cẩm', price: 35000, category: 'Bánh Mì', isAvailable: true },
    { restaurantId: 'res-003', dishName: 'Bánh Mì Pate', price: 30000, category: 'Bánh Mì', isAvailable: true },
    { restaurantId: 'res-003', dishName: 'Bánh Mì Xíu Mại', price: 32000, category: 'Bánh Mì', isAvailable: true },
    { restaurantId: 'res-003', dishName: 'Bánh Mì Chay', price: 28000, category: 'Bánh Mì', isAvailable: false },
    // Chả Cá
    { restaurantId: 'res-004', dishName: 'Chả Cá Lã Vọng Đặc Biệt', price: 120000, category: 'Món đặc biệt', isAvailable: true },
    { restaurantId: 'res-004', dishName: 'Chả Cá Lã Vọng Thường', price: 90000, category: 'Món chính', isAvailable: true },
    { restaurantId: 'res-004', dishName: 'Cà Chum Chiên Giòn', price: 35000, category: 'Món phụ', isAvailable: true },
    // Bún Bò Huế
    { restaurantId: 'res-005', dishName: 'Bún Bò Huế Giò Heo', price: 50000, category: 'Món chính', isAvailable: true },
    { restaurantId: 'res-005', dishName: 'Bún Bò Huế Chả Bò', price: 55000, category: 'Món chính', isAvailable: true },
    { restaurantId: 'res-005', dishName: 'Bún Bò Huế Đặc Biệt', price: 70000, category: 'Món đặc biệt', isAvailable: true },
    // Xôi
    { restaurantId: 'res-006', dishName: 'Xôi Lạc', price: 15000, category: 'Xôi', isAvailable: true },
    { restaurantId: 'res-006', dishName: 'Xôi Đỗ Xanh', price: 20000, category: 'Xôi', isAvailable: true },
    { restaurantId: 'res-006', dishName: 'Xôi Giò Chả', price: 35000, category: 'Xôi', isAvailable: true },
    { restaurantId: 'res-006', dishName: 'Xôi Gà Ta', price: 45000, category: 'Xôi', isAvailable: true },
    // Bếp Thái
    { restaurantId: 'res-007', dishName: 'Tom Yum Goong', price: 85000, category: 'Món nước', isAvailable: true },
    { restaurantId: 'res-007', dishName: 'Pad Thai', price: 65000, category: 'Món khô', isAvailable: true },
    { restaurantId: 'res-007', dishName: 'Green Curry', price: 75000, category: 'Món cà ri', isAvailable: true },
    { restaurantId: 'res-007', dishName: 'Mango Sticky Rice', price: 45000, category: 'Tráng miệng', isAvailable: true },
    // Cốm
    { restaurantId: 'res-008', dishName: 'Cốm Mềm', price: 25000, category: 'Đặc sản', isAvailable: true },
    { restaurantId: 'res-008', dishName: 'Bánh Đúc Nóng', price: 20000, category: 'Đặc sản', isAvailable: true },
    { restaurantId: 'res-008', dishName: 'Bánh Giò', price: 15000, category: 'Đặc sản', isAvailable: true },
  ];

  await prisma.menuItem.createMany({ data: menuItems });
  console.log(`Created ${menuItems.length} menu items`);

  // Create audio guides (2 languages for each restaurant)
  const audioGuides = [
    // Vietnamese
    { restaurantId: 'res-001', language: 'vi', content: 'Chào mừng bạn đến với Bún Chả Hàng Mành - một trong những quán bún chả nổi tiếng nhất Hà Nội. Quán được thành lập từ những năm 1950, nổi tiếng với hương vị nước dùng đậm đà, thịt nướng than hoa thơm lừng. Bún chả gồm bún tươi, thịt heo nướng và nem cua giòn tan, chan với nước dùng béo ngậy. Đây là món ăn không thể bỏ qua khi đến Hà Nội.', duration: 45 },
    { restaurantId: 'res-002', language: 'vi', content: 'Phở Gia Truyền Bát Đàn là một trong những quán phở lâu đời nhất Hà Nội. Nước dùng được nấu từ xương bò trong 24 giờ, cho ra vị ngọt thanh đậm đà. Đặc biệt, quán chỉ mở buổi sáng và chiều tối, luôn đông khách xếp hàng. Phở tại đây có sợi bún mềm mại, thịt bò tươi ngon và các loại rau thơm đặc trưng.', duration: 42 },
    { restaurantId: 'res-003', language: 'vi', content: 'Bánh Mì Hội An mang hương vị miền Trung với vỏ bánh mì giòn tan, pate béo ngậy và nhân đa dạng từ thịt, chả đến rau củ. Đây là sự kết hợp hoàn hảo giữa ẩm thực Pháp và Việt Nam. Mỗi chiếc bánh mì được làm fresh từ lò nướng và nhồi nhân ngay trước mặt khách.', duration: 38 },
    { restaurantId: 'res-004', language: 'vi', content: 'Chả Cá Lã Vọng - món ăn mang tên một phố cổ Hà Nội. Cá lăng được tẩm ướp gia vị và nướng vàng ươm trên chảo nóng hổi. Khi ăn, bạn sẽ được phục vụ cá nóng, bún, đậu phộng rang, mỡ hành và các loại rau thơm. Đây là trải nghiệm ẩm thực độc đáo không thể tìm thấy ở nơi khác.', duration: 40 },
    { restaurantId: 'res-005', language: 'vi', content: 'Bún Bò Huế Hàm Long mang đậm hương vị cố đô Huế với nước dùng cay nồng đặc trưng. Sợi bún to, dai mềm, hòa quyện với thịt bò thơm ngon, giò heo béo ngậy. Mỗi tô bún được nêm nếm vừa miệng với vị cay vừa phải, phù hợp với khẩu vị người Hà Nội.', duration: 36 },
    { restaurantId: 'res-006', language: 'vi', content: 'Xôi Xéo Giò Hà Nội là điểm đến lý tưởng cho bữa sáng nhanh. Xôi được nấu mềm dẻo từ gạo nếp thơm, topped với giò chả truyền thống và hành phi giòn tan. Quán nhỏ xinh luôn đông khách từ sáng sớm, phục vụ những người yêu ẩm thực Hà Nội đích thực.', duration: 32 },
    { restaurantId: 'res-007', language: 'vi', content: 'Bếp Thái Siêu mang đến trải nghiệm ẩm thực Thái Lan chính hiệu giữa lòng Hà Nội. Tom Yum với vị chua cay đặc trưng, Pad Thai sợi mì giòn dai hoàn hảo, hay Green Curry béo ngậy đều được chế biến bởi đầu bếp người Thái. Đây là lựa chọn tuyệt vời cho những ai muốn đổi vị.', duration: 44 },
    { restaurantId: 'res-008', language: 'vi', content: 'Cốm Mềm Hà Nội là món quà đặc biệt từ xứ Hà Nội. Cốm xanh non được làm từ lúa nếp non, rang giòn và trộn với đậu xanh, dừa nạo. Ăn kèm với chả thơm lừng, đây là món ăn vặt yêu thích của người Hà Nội từ bao đời nay. Quán còn có bánh đúc nóng hổi, bánh giò thơm phức.', duration: 35 },

    // English
    { restaurantId: 'res-001', language: 'en', content: 'Welcome to Bun Cha Hang Manh - one of the most famous bun cha restaurants in Hanoi. Established in the 1950s, this restaurant is renowned for its rich, flavorful broth and charcoal-grilled pork. Bun cha consists of fresh rice noodles, grilled pork patties, and crispy spring rolls, served with a savory dipping broth. A must-try when visiting Hanoi.', duration: 40 },
    { restaurantId: 'res-002', language: 'en', content: 'Pho Bat Dan is one of Hanois oldest and most beloved pho establishments. The broth is simmered from beef bones for 24 hours, creating a sweet and rich flavor. Open only for breakfast and dinner, the restaurant always has long queues. The pho features soft noodles, fresh beef, and aromatic herbs unique to this establishment.', duration: 38 },
    { restaurantId: 'res-003', language: 'en', content: 'Banh Mi Hoi An brings Central Vietnamese flavors with crispy bread, rich pate, and diverse fillings from meat to vegetables. This is a perfect blend of French and Vietnamese cuisine. Each banh mi is made fresh from the oven and stuffed with fillings right in front of you.', duration: 35 },
    { restaurantId: 'res-004', language: 'en', content: 'Cha Ca La Vong - the dish named after an Old Quarter street. Marinated snakehead fish is grilled to golden perfection on a sizzling pan. Diners are served hot fish with rice noodles, roasted peanuts, green onions, and various aromatic herbs. A unique culinary experience found nowhere else.', duration: 37 },
    { restaurantId: 'res-005', language: 'en', content: 'Bun Bo Hue Ham Long brings authentic Hue flavors with its signature spicy broth. The thick rice noodles are chewy and tender, perfectly paired with aromatic beef and fatty pork leg. Each bowl is seasoned with just the right amount of spice, suitable for Hanoian palates.', duration: 33 },
    { restaurantId: 'res-006', language: 'en', content: 'Xoi Xeo Gio Ha Noi is the perfect spot for a quick breakfast. Sticky rice is cooked until soft and chewy, topped with traditional pork sausage and crispy fried shallots. This cozy shop attracts hungry customers from early morning, serving true Hanoian food lovers.', duration: 28 },
    { restaurantId: 'res-007', language: 'en', content: 'Bep Thai Siu brings authentic Thai cuisine to the heart of Hanoi. From sour and spicy Tom Yum to perfectly crispy Pad Thai noodles and rich Green Curry, all dishes are prepared by Thai chefs. An excellent choice for those seeking a change of taste.', duration: 40 },
    { restaurantId: 'res-008', language: 'en', content: 'Com Mem Ha Noi is a special gift from old Hanoi. Young green sticky rice is made from fresh glutinous rice, toasted and mixed with mung beans and shredded coconut. Paired with aromatic sausage, this is a beloved street snack of Hanoi people for generations. The shop also serves hot banh duc and fragrant banh gio.', duration: 32 },

    // Japanese
    { restaurantId: 'res-001', language: 'ja', content: 'ハノイで最も有名なブンチャー店、ブンチャー・Hang Manhへようこそ。1950年代に創業し、豊かなの出しと炭火焼き豚で知られています。フライド米粉麺、烤肉、春の巻きを特製のだしでどうぞ。ハノイ訪問시에 필수 요리입니다.', duration: 35 },
    { restaurantId: 'res-002', language: 'ja', content: 'フォー・Bat Danはハノイで最も古く愛されるフォー店の一つです。牛肉骨を24時間煮込んだ、透明でいながら深い味のスープが特徴です。朝と夜だけ営業し、いつも行列ができます。柔らかな米粉麺、新鮮な牛肉、特有の香草をご堪能ください。', duration: 33 },

    // Chinese
    { restaurantId: 'res-001', language: 'zh', content: '欢迎来到河内最著名的烤肉粉餐厅 - 顺化行。这个餐厅始于1950年代，以浓郁的汤底和炭火烤肉闻名。配合新鲜米线、烤肉和脆皮春卷，淋上美味的汤汁。来河内必吃的美食！', duration: 38 },
    { restaurantId: 'res-002', language: 'zh', content: '巴丹传统河粉是河内最古老、最受喜爱的河粉店之一。汤底用牛骨熬制24小时，呈现出甜美浓郁的独特风味。这家店只在早晚餐时段营业，总是排着长队。河粉配上软滑的米粉、新鲜牛肉和独特的香草。', duration: 36 },
  ];

  await prisma.audioGuide.createMany({ data: audioGuides });
  console.log(`Created ${audioGuides.length} audio guides`);

  // Create sample visits (analytics)
  const actions = ['view', 'audio_play', 'navigation'];
  const visits = [];
  for (let i = 0; i < 50; i++) {
    const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    visits.push({
      restaurantId: restaurant.id,
      action: actions[Math.floor(Math.random() * actions.length)],
      metadata: { source: 'mobile' },
    });
  }
  await prisma.visit.createMany({ data: visits });
  console.log(`Created ${visits.length} sample visits`);

  console.log('\n✅ Seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   - 2 Admin users (admin/admin123, editor/editor123)`);
  console.log(`   - ${pois.length} POIs`);
  console.log(`   - ${restaurants.length} Restaurants`);
  console.log(`   - ${menuItems.length} Menu Items`);
  console.log(`   - ${audioGuides.length} Audio Guides`);
  console.log(`   - ${visits.length} Sample Visits`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
