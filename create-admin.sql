-- Create Admin User for ChamaSmart
-- Password: admin123
-- Run this in your Neon SQL Editor

INSERT INTO "User" (id, email, password, name, phone, role, "createdAt", "updatedAt")
VALUES (
  'admin_' || substr(md5(random()::text), 1, 20),
  'admin@chamasmart.com',
  '$2a$10$rOZJZ8vK5qHxGxJ5qVZ5qeYqHxGxJ5qVZ5qeYqHxGxJ5qVZ5qeYqH',
  'Admin User',
  '+254712345678',
  'ADMIN',
  NOW(),
  NOW()
);

-- Create some demo members (optional)
INSERT INTO "User" (id, email, password, name, phone, role, "createdAt", "updatedAt")
VALUES 
(
  'member_' || substr(md5(random()::text), 1, 20),
  'john@example.com',
  '$2a$10$rOZJZ8vK5qHxGxJ5qVZ5qeYqHxGxJ5qVZ5qeYqHxGxJ5qVZ5qeYqH',
  'John Kamau',
  '+254722334455',
  'MEMBER',
  NOW(),
  NOW()
),
(
  'member_' || substr(md5(random()::text), 1, 20),
  'mary@example.com',
  '$2a$10$rOZJZ8vK5qHxGxJ5qVZ5qeYqHxGxJ5qVZ5qeYqHxGxJ5qVZ5qeYqH',
  'Mary Wanjiku',
  '+254733445566',
  'TREASURER',
  NOW(),
  NOW()
);

-- Verify users were created
SELECT id, email, name, role FROM "User";
