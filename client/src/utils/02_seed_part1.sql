SET NOCOUNT ON;

----------------------------------------------------
-- USERS
----------------------------------------------------

INSERT INTO users
(name,email,password,phone,location,role,bio,avatar)
VALUES

('Administrator',
'admin@travelportal.com',
'$2a$10$DemoHashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
'9999999999',
'Hyderabad',
'admin',
'System Administrator',
'https://randomuser.me/api/portraits/men/1.jpg'),

('Rahul Sharma',
'rahul@gmail.com',
'$2a$10$DemoHashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
'9876543210',
'Delhi',
'user',
'Adventure Traveler',
'https://randomuser.me/api/portraits/men/11.jpg'),

('Priya Verma',
'priya@gmail.com',
'$2a$10$DemoHashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
'9876543211',
'Mumbai',
'user',
'Travel Blogger',
'https://randomuser.me/api/portraits/women/21.jpg'),

('Arjun Reddy',
'arjun@gmail.com',
'$2a$10$DemoHashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
'9876543212',
'Hyderabad',
'user',
'Nature Lover',
'https://randomuser.me/api/portraits/men/31.jpg'),

('Ananya Rao',
'ananya@gmail.com',
'$2a$10$DemoHashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
'9876543213',
'Bangalore',
'user',
'Backpacker',
'https://randomuser.me/api/portraits/women/32.jpg'),

('Rohit Kumar',
'rohit@gmail.com',
'$2a$10$DemoHashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
'9876543214',
'Chennai',
'user',
'Photographer',
'https://randomuser.me/api/portraits/men/41.jpg'),

('Sneha Kapoor',
'sneha@gmail.com',
'$2a$10$DemoHashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
'9876543215',
'Pune',
'user',
'Luxury Traveler',
'https://randomuser.me/api/portraits/women/42.jpg'),

('Vikram Singh',
'vikram@gmail.com',
'$2a$10$DemoHashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
'9876543216',
'Jaipur',
'user',
'Mountain Explorer',
'https://randomuser.me/api/portraits/men/51.jpg'),

('Meera Nair',
'meera@gmail.com',
'$2a$10$DemoHashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
'9876543217',
'Kochi',
'user',
'Food Explorer',
'https://randomuser.me/api/portraits/women/52.jpg'),

('Karthik Iyer',
'karthik@gmail.com',
'$2a$10$DemoHashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
'9876543218',
'Coimbatore',
'user',
'Solo Traveler',
'https://randomuser.me/api/portraits/men/61.jpg'),

('Neha Joshi',
'neha@gmail.com',
'$2a$10$DemoHashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
'9876543219',
'Ahmedabad',
'user',
'Weekend Explorer',
'https://randomuser.me/api/portraits/women/62.jpg');

----------------------------------------------------
-- ADMIN
----------------------------------------------------

INSERT INTO admins(user_id)
SELECT id
FROM users
WHERE role='admin';

----------------------------------------------------
-- GUIDES
----------------------------------------------------

INSERT INTO guides
(
name,
avatar,
email,
phone,
bio,
experience,
languages,
specialties,
location,
price_per_day,
rating,
available
)
VALUES

('Amit Sharma',
'https://randomuser.me/api/portraits/men/70.jpg',
'amit@travel.com',
'9000000001',
'Professional Himalayan Guide',
12,
'["English","Hindi"]',
'["Mountain","Trekking"]',
'Manali',
3500,
4.9,
1),

('Ravi Kumar',
'https://randomuser.me/api/portraits/men/71.jpg',
'ravi@travel.com',
'9000000002',
'Adventure Expert',
9,
'["English","Hindi"]',
'["Adventure","Camping"]',
'Rishikesh',
3200,
4.8,
1),

('Sneha Thomas',
'https://randomuser.me/api/portraits/women/70.jpg',
'sneha@travel.com',
'9000000003',
'Kerala Tourism Specialist',
10,
'["English","Malayalam"]',
'["Backwaters","Culture"]',
'Kerala',
2800,
4.9,
1),

('David Wilson',
'https://randomuser.me/api/portraits/men/72.jpg',
'david@travel.com',
'9000000004',
'European Tour Guide',
15,
'["English","French"]',
'["Luxury","History"]',
'Paris',
6500,
5.0,
1),

('Maria Rossi',
'https://randomuser.me/api/portraits/women/71.jpg',
'maria@travel.com',
'9000000005',
'Italy Expert',
11,
'["English","Italian"]',
'["Culture","Food"]',
'Rome',
6000,
4.9,
1),

('Ken Sato',
'https://randomuser.me/api/portraits/men/73.jpg',
'ken@travel.com',
'9000000006',
'Japan Travel Expert',
14,
'["English","Japanese"]',
'["Culture","Technology"]',
'Tokyo',
7200,
5.0,
1),

('Fatima Noor',
'https://randomuser.me/api/portraits/women/72.jpg',
'fatima@travel.com',
'9000000007',
'Dubai Luxury Guide',
8,
'["English","Arabic"]',
'["Luxury","Shopping"]',
'Dubai',
7000,
4.8,
1),

('Kiran Das',
'https://randomuser.me/api/portraits/men/74.jpg',
'kiran@travel.com',
'9000000008',
'Darjeeling Expert',
7,
'["English","Hindi","Bengali"]',
'["Tea Gardens","Mountain"]',
'Darjeeling',
2600,
4.7,
1),

('Joseph Paul',
'https://randomuser.me/api/portraits/men/75.jpg',
'joseph@travel.com',
'9000000009',
'Island Guide',
9,
'["English"]',
'["Beach","Scuba"]',
'Andaman',
4500,
4.8,
1),

('Anjali Rao',
'https://randomuser.me/api/portraits/women/73.jpg',
'anjali@travel.com',
'9000000010',
'South India Expert',
10,
'["English","Kannada","Tamil"]',
'["Temple","Culture"]',
'Mysore',
2900,
4.9,
1);

----------------------------------------------------
-- WELCOME NOTIFICATIONS
----------------------------------------------------

INSERT INTO notifications
(user_id,title,message,type)
SELECT
id,
'Welcome',
'Welcome to Boutique Travel Planning Portal!',
'system'
FROM users;

INSERT INTO notifications
(user_id,title,message,type)
SELECT
id,
'Profile',
'Complete your travel profile to receive better recommendations.',
'system'
FROM users;

PRINT 'Seed Part 1 Completed Successfully';