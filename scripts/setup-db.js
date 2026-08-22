const { neon } = require('@neondatabase/serverless');

async function setupDatabase() {
  console.log('🔧 Setting up database...\n');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('Please set DATABASE_URL in your environment or .env.local file');
    process.exit(1);
  }
  
  const sql = neon(dbUrl);
  
  try {
    console.log('📋 Creating tables...');
    
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_users_email ON yar_users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_users_role ON yar_users(role)`;
    console.log('✓ Users table created');
    
    // Sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
        token VARCHAR(512) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_sessions_token ON yar_sessions(token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_sessions_user_id ON yar_sessions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_sessions_expires_at ON yar_sessions(expires_at)`;
    console.log('✓ Sessions table created');
    
    // Subscription links table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_subscription_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        max_redemptions INT NOT NULL,
        current_redemptions INT DEFAULT 0,
        subscription_days INT NOT NULL DEFAULT 180,
        created_by UUID REFERENCES yar_users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`ALTER TABLE yar_subscription_links ADD COLUMN IF NOT EXISTS subscription_days INT NOT NULL DEFAULT 180`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_subscription_links_code ON yar_subscription_links(code)`;
    console.log('✓ Subscription links table created');
    
    // Subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
        subscription_link_id UUID REFERENCES yar_subscription_links(id),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_subscriptions_user_id ON yar_subscriptions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_subscriptions_end_date ON yar_subscriptions(end_date)`;
    console.log('✓ Subscriptions table created');
    
    // Content items table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_content_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        title_en VARCHAR(500),
        description TEXT NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        tier_requirement VARCHAR(50) NOT NULL,
        age_tag VARCHAR(50),
        grade_level VARCHAR(50),
        category VARCHAR(100),
        genre VARCHAR(100),
        series_title VARCHAR(500),
        episode_number INT,
        duration_seconds INT,
        video_url VARCHAR(1000),
        pixeldrain_id VARCHAR(255),
        thumbnail_url VARCHAR(1000),
        file_size_bytes BIGINT,
        view_count INT DEFAULT 0,
        published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_content_type ON yar_content_items(content_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_content_tier ON yar_content_items(tier_requirement)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_content_grade ON yar_content_items(grade_level)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_content_category ON yar_content_items(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_content_genre ON yar_content_items(genre)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_content_series ON yar_content_items(series_title)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_content_published ON yar_content_items(published)`;
    console.log('✓ Content items table created');
    
    // PDF store items table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_pdf_store_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        price_cents INT NOT NULL,
        file_url VARCHAR(1000) NOT NULL,
        thumbnail_url VARCHAR(1000),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ PDF store items table created');
    
    // PDF purchases table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_pdf_purchases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
        pdf_item_id UUID NOT NULL REFERENCES yar_pdf_store_items(id),
        purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, pdf_item_id)
      )
    `;
    console.log('✓ PDF purchases table created');
    
    // Store items table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_store_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        price_cents INT NOT NULL,
        stock_quantity INT,
        is_digital BOOLEAN DEFAULT false,
        is_free BOOLEAN DEFAULT false,
        thumbnail_url VARCHAR(1000),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Store items table created');
    
    // Orders table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES yar_users(id),
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        shipping_address TEXT,
        total_cents INT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_gateway_ref VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Orders table created');
    
    // Order items table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES yar_orders(id) ON DELETE CASCADE,
        store_item_id UUID NOT NULL REFERENCES yar_store_items(id),
        quantity INT NOT NULL,
        price_cents INT NOT NULL
      )
    `;
    console.log('✓ Order items table created');
    
    // Teachers table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_teachers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        bio TEXT,
        photo_url VARCHAR(1000),
        sample_work_url VARCHAR(1000),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Teachers table created');
    
    // Teacher collaboration requests table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_teacher_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Teacher requests table created');
    
    // Blog posts table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_blog_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id UUID REFERENCES yar_users(id),
        thumbnail_url VARCHAR(1000),
        published BOOLEAN DEFAULT false,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_blog_slug ON yar_blog_posts(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_blog_published ON yar_blog_posts(published)`;
    console.log('✓ Blog posts table created');
    
    // Workshops table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_workshops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        date TIMESTAMP,
        location VARCHAR(500),
        thumbnail_url VARCHAR(1000),
        review_text TEXT,
        rating INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Workshops table created');
    
    // Viewing history table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_viewing_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
        content_id UUID NOT NULL REFERENCES yar_content_items(id) ON DELETE CASCADE,
        progress_seconds INT DEFAULT 0,
        completed BOOLEAN DEFAULT false,
        last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, content_id)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_viewing_history_user ON yar_viewing_history(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_viewing_history_content ON yar_viewing_history(content_id)`;
    console.log('✓ Viewing history table created');
    
    // Site settings table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_site_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'text',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_site_settings_key ON yar_site_settings(setting_key)`;
    console.log('✓ Site settings table created');
    
    // Homepage sections table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_homepage_sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section_type VARCHAR(100) NOT NULL,
        title VARCHAR(500),
        subtitle TEXT,
        display_order INT DEFAULT 0,
        is_visible BOOLEAN DEFAULT true,
        content_ids TEXT[],
        settings JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_homepage_sections_type ON yar_homepage_sections(section_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_homepage_sections_order ON yar_homepage_sections(display_order)`;
    console.log('✓ Homepage sections table created');
    
    // Add storage provider columns to content_items if not exists
    await sql`ALTER TABLE yar_content_items ADD COLUMN IF NOT EXISTS storage_provider VARCHAR(50) DEFAULT 'pixeldrain'`;
    await sql`ALTER TABLE yar_content_items ADD COLUMN IF NOT EXISTS r2_key VARCHAR(500)`;
    await sql`ALTER TABLE yar_content_items ADD COLUMN IF NOT EXISTS gdrive_id VARCHAR(255)`;
    console.log('✓ Content items storage columns added');
    
    // Support tickets table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
        reason VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_support_tickets_user ON yar_support_tickets(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_support_tickets_status ON yar_support_tickets(status)`;
    console.log('✓ Support tickets table created');
    
    // Support messages table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_support_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID NOT NULL REFERENCES yar_support_tickets(id) ON DELETE CASCADE,
        user_id UUID REFERENCES yar_users(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_support_messages_ticket ON yar_support_messages(ticket_id)`;
    console.log('✓ Support messages table created');
    
    // Video comments table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_video_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_id UUID NOT NULL REFERENCES yar_content_items(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES yar_users(id) ON DELETE CASCADE,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_video_comments_content ON yar_video_comments(content_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_video_comments_user ON yar_video_comments(user_id)`;
    console.log('✓ Video comments table created');
    
    // News posts table
    await sql`
      CREATE TABLE IF NOT EXISTS yar_news_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id UUID REFERENCES yar_users(id),
        thumbnail_url VARCHAR(1000),
        published BOOLEAN DEFAULT false,
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_news_posts_slug ON yar_news_posts(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_yar_news_posts_published ON yar_news_posts(published)`;
    console.log('✓ News posts table created');
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Create an admin user by registering and running: UPDATE yar_users SET role = \'admin\' WHERE email = \'your@email.com\'');
    console.log('2. Deploy to Vercel or run: npm run dev');
    console.log('3. Access admin panel at /admin to configure site settings and logo');
    console.log('4. Configure font, logo, and all site settings in /admin/settings');
    console.log('5. Add content with YouTube, Google Drive, Cloudflare R2, or direct links in /admin/content');
    console.log('\n✅  All tables use yar_ prefix for multi-project database compatibility');
    
  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupDatabase();
