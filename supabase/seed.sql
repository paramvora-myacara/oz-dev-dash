-- Seed admin users
INSERT INTO admin_users (email, password, role) VALUES
  ('aryan@ozlistings.com', 'password', 'admin')
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role;
