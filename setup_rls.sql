-- Enable Row Level Security for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Service Role Policy for Profiles
-- This policy grants the service role (used by server-side API routes) full access
CREATE POLICY "Service role can do all operations on profiles" 
ON profiles FOR ALL 
TO authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow service_role to manage all records
CREATE POLICY "Service role can do everything" 
ON profiles 
FOR ALL 
TO service_role 
USING (true);

-- Allow service_role to create profiles for users
CREATE POLICY "Service role can create profiles" 
ON profiles 
FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Allow anonymous access to products for read
CREATE POLICY "Allow anonymous read access to products"
ON products FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to read their own orders
CREATE POLICY "Users can read their own orders"
ON orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow service_role to create orders
CREATE POLICY "Service role can create orders"
ON orders FOR INSERT
TO service_role
WITH CHECK (true);

-- Grant necessary permissions to the service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role; 