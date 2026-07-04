const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Orphanage = require('./models/Orphanage');
const Child = require('./models/Child');
const Donation = require('./models/Donation');
const Volunteer = require('./models/Volunteer');
const Adoption = require('./models/Adoption');
const Impact = require('./models/Impact');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hopenest";

const seedDatabase = async () => {
  try {
    console.log("Connecting to database for seeding...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    // Clean existing database collections
    console.log("Purging existing data collections...");
    await User.deleteMany({});
    await Orphanage.deleteMany({});
    await Child.deleteMany({});
    await Donation.deleteMany({});
    await Volunteer.deleteMany({});
    await Adoption.deleteMany({});
    await Impact.deleteMany({});
    console.log("Database cleared.");

    // 1. Create Users
    console.log("Seeding users...");
    // Passwords will be pre-save hashed by the User model pre-save hook
    const donor = new User({
      name: "John Doe",
      email: "donor@hopenest.org",
      password: "password123",
      role: "public",
      phone: "+91 9876543210",
      address: "123 Hope Lane, Bandra, Mumbai",
      photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"
    });

    const admin1 = new User({
      name: "Meera Sen",
      email: "admin@hopenest.org",
      password: "password123",
      role: "orphanageAdmin",
      phone: "+91 9876543222",
      address: "456 Care Road, Mumbai",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200"
    });

    const admin2 = new User({
      name: "David K.",
      email: "admin2@hopenest.org",
      password: "password123",
      role: "orphanageAdmin",
      phone: "+91 9876543233",
      address: "789 Grace Blvd, Bengaluru",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
    });

    const superAdmin = new User({
      name: "Sarah Jenkins",
      email: "superadmin@hopenest.org",
      password: "password123",
      role: "superAdmin",
      phone: "+91 9999999999",
      address: "Super Admin HQ, Delhi",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200"
    });

    await donor.save();
    await admin1.save();
    await admin2.save();
    await superAdmin.save();
    console.log("Users seeded successfully.");

    // 2. Create Orphanages
    console.log("Seeding orphanages...");
    const sunshineHaven = new Orphanage({
      name: "Sunshine Haven",
      description: "Sunshine Haven provides shelter, education, and emotional rehabilitation to orphaned and abandoned children. Founded in 2012, we aim to build a warm and supportive home environment.",
      address: "Sunshine Lane, Carter Road, Bandra West",
      city: "Mumbai",
      location: { lat: 19.0664, lng: 72.8252 },
      photos: [
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
        "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800"
      ],
      needs: [
        { item: "Basmati Rice", quantity: "150 kg", priority: "high" },
        { item: "Woolen Blankets", quantity: "40 units", priority: "high" },
        { item: "Storybooks & Notebooks", quantity: "60 sets", priority: "medium" },
        { item: "Cricket kit & Footballs", quantity: "5 kits", priority: "low" }
      ],
      capacity: 60,
      currentChildren: 2,
      adminId: admin1._id,
      isApproved: true,
      contact: { phone: "+91 22 2640 1234", email: "sunshine@hopenest.org" }
    });

    const graceMeadows = new Orphanage({
      name: "Grace Meadows Home",
      description: "Grace Meadows Home is dedicated to nurturing infants and toddler growth. We focus heavily on nutrition, early childhood support, and community involvement.",
      address: "12, 100 Feet Rd, Indiranagar",
      city: "Bengaluru",
      location: { lat: 12.9716, lng: 77.6412 },
      photos: [
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800",
        "https://images.unsplash.com/photo-1482066006752-ee31e72e1d78?w=800"
      ],
      needs: [
        { item: "Infant Baby Formula", quantity: "30 tins", priority: "high" },
        { item: "Diapers (Medium size)", quantity: "100 packs", priority: "high" },
        { item: "Kindergarten Toys", quantity: "25 boxes", priority: "medium" }
      ],
      capacity: 40,
      currentChildren: 2,
      adminId: admin2._id,
      isApproved: true,
      contact: { phone: "+91 80 4125 5678", email: "grace.meadows@hopenest.org" }
    });

    // Create an unapproved orphanage for superAdmin demonstration
    const hopefulHearts = new Orphanage({
      name: "Hopeful Hearts Shelter",
      description: "A newly founded home seeking verification to receive donations for under-privileged teenagers.",
      address: "Sector 15, Vashi",
      city: "Navi Mumbai",
      location: { lat: 19.0330, lng: 73.0297 },
      photos: ["https://images.unsplash.com/photo-1464998857633-50e59fbf2fe6?w=800"],
      needs: [{ item: "Study desks", quantity: "10 units", priority: "high" }],
      capacity: 25,
      currentChildren: 0,
      adminId: admin1._id, // reuse admin1
      isApproved: false,
      contact: { phone: "+91 22 2789 9876", email: "vashi.hearts@hopenest.org" }
    });

    await sunshineHaven.save();
    await graceMeadows.save();
    await hopefulHearts.save();
    console.log("Orphanages seeded successfully.");

    // 3. Create Children
    console.log("Seeding children...");
    const child1 = new Child({
      firstName: "Aarav",
      age: 6,
      gender: "male",
      photo: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500",
      story: "Aarav is an artistic soul. He can spend hours with crayons and sketches. He was found at a train station in 2022 and has since blossomed into Sunshine Haven's resident little artist, wishing to design animated cartoon movies when he grows up.",
      orphanageId: sunshineHaven._id,
      sponsorStatus: "available",
      adoptionStatus: "available"
    });

    const child2 = new Child({
      firstName: "Diya",
      age: 8,
      gender: "female",
      photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500",
      story: "Diya has a charming smile and loves running track games. Her parents were lost in a natural disaster, but her resilient heart dreams of competing in the Olympics. She's incredibly outgoing and excels at math.",
      orphanageId: sunshineHaven._id,
      sponsorStatus: "sponsored",
      adoptionStatus: "available",
      sponsoredBy: donor._id
    });

    const child3 = new Child({
      firstName: "Liam",
      age: 4,
      gender: "male",
      photo: "https://images.unsplash.com/photo-1484862149534-1127a61e0971?w=500",
      story: "Liam is curious, gentle, and loves puzzles. He was brought to Grace Meadows as a toddler. He is fascinated by mechanical blocks and builds elaborate mini castles. He brings laughter to everyone in the home.",
      orphanageId: graceMeadows._id,
      sponsorStatus: "available",
      adoptionStatus: "available"
    });

    const child4 = new Child({
      firstName: "Ananya",
      age: 9,
      gender: "female",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500",
      story: "Ananya is a reading enthusiast. She reads everything from science fiction to encyclopedias. Her dream is to become an astrophysicist and fly into outer space. She hopes to find a loving family who supports her reading passions.",
      orphanageId: graceMeadows._id,
      sponsorStatus: "available",
      adoptionStatus: "inquired"
    });

    await child1.save();
    await child2.save();
    await child3.save();
    await child4.save();
    console.log("Children seeded successfully.");

    // 4. Create Impact Stats
    console.log("Seeding platform impact records...");
    const impact = new Impact({
      totalMeals: 3450,
      totalVolunteers: 184,
      totalFunds: 87900,
      totalSponsored: 12,
      lastUpdated: new Date()
    });
    await impact.save();
    console.log("Impact metrics seeded.");

    // 5. Seed some initial donations
    console.log("Seeding sample donation logs...");
    const donation1 = new Donation({
      donorId: donor._id,
      orphanageId: sunshineHaven._id,
      type: "money",
      amount: 5000,
      message: "Keep up the amazing work! For books and painting items.",
      status: "received",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
    });

    const donation2 = new Donation({
      donorId: donor._id,
      orphanageId: graceMeadows._id,
      type: "food",
      quantity: "15 tins of infant formula",
      message: "Hope this helps the toddlers.",
      status: "received",
      date: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
    });

    await donation1.save();
    await donation2.save();

    // 6. Seed sample volunteer schedules
    console.log("Seeding sample volunteer bookings...");
    const volunteer1 = new Volunteer({
      userId: donor._id,
      orphanageId: sunshineHaven._id,
      visitDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // in 5 days
      reason: "I would love to teach drawing classes to the children on the weekend.",
      status: "approved",
      adminNote: "We welcome drawing instructors. See you this Saturday!"
    });

    const volunteer2 = new Volunteer({
      userId: donor._id,
      orphanageId: graceMeadows._id,
      visitDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9), // in 9 days
      reason: "Looking to spend my afternoon playing toddler games with the kids.",
      status: "pending"
    });

    await volunteer1.save();
    await volunteer2.save();

    console.log("Adoption inquiry seed...");
    const adoption1 = new Adoption({
      familyId: donor._id,
      childId: child4._id,
      familyDetails: {
        maritalStatus: "married",
        annualIncome: 1500000,
        employment: "Software Engineer & Designer",
        homeType: "Own Apartment (3BHK)",
        hasChildren: false,
        motivation: "We have been married for 5 years and are eager to open our hearts and provide a loving home to a child who loves education and space science."
      },
      familyPhoto: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800",
      status: "applied",
      notes: "Initial review pending check on references."
    });
    await adoption1.save();

    console.log("=========================================");
    console.log("HopeNest Database Seed Completed Successfully!");
    console.log("=========================================");
    console.log("LOGINS FOR TESTING:");
    console.log("1. PUBLIC DONOR:");
    console.log("   Email:    donor@hopenest.org");
    console.log("   Password: password123");
    console.log("2. ORPHANAGE ADMIN:");
    console.log("   Email:    admin@hopenest.org");
    console.log("   Password: password123");
    console.log("3. SUPER ADMIN:");
    console.log("   Email:    superadmin@hopenest.org");
    console.log("   Password: password123");
    console.log("=========================================");
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding failed with error:", error);
    process.exit(1);
  }
};

seedDatabase();
