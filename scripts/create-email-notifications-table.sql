-- Create email notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('welcome', 'hackathon_registration', 'course_enrollment', 'job_application', 'admin_notification', 'password_reset', 'hackathon_reminder', 'course_reminder')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_email ON email_notifications(email);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON email_notifications(type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON email_notifications(created_at);

-- Create email templates table for dynamic templates
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email campaigns table for bulk emails
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    target_audience JSONB DEFAULT '{}', -- criteria for selecting recipients
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    total_recipients INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_failed INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email preferences table for user email settings
CREATE TABLE IF NOT EXISTS email_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    welcome_emails BOOLEAN DEFAULT true,
    hackathon_notifications BOOLEAN DEFAULT true,
    course_notifications BOOLEAN DEFAULT true,
    job_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT true,
    reminder_emails BOOLEAN DEFAULT true,
    newsletter BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for email templates and campaigns
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_at ON email_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_email_notifications_updated_at 
    BEFORE UPDATE ON email_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON email_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at 
    BEFORE UPDATE ON email_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_preferences_updated_at 
    BEFORE UPDATE ON email_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default email templates
INSERT INTO email_templates (name, subject, html_content, variables) VALUES
('welcome', '🎉 Welcome to Apna Coding - Your Coding Journey Starts Here!', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
    <div style="padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0 0 20px 0; font-size: 28px;">Welcome to Apna Coding! 🚀</h1>
      <p style="font-size: 18px; margin: 0 0 30px 0;">Hi {{userName}},</p>
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Thank you for joining Apna Coding! We''re excited to have you as part of our community.
      </p>
      <a href="https://apnacoding.tech/dashboard" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
        Get Started Now 🎯
      </a>
    </div>
  </div>', 
 '{"userName": "User Name"}'),

('hackathon_registration', '🏆 Registration Confirmed: {{hackathonTitle}}', 
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; border-radius: 10px; overflow: hidden;">
    <div style="padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0 0 20px 0; font-size: 28px;">🎉 Registration Confirmed!</h1>
      <p style="font-size: 18px; margin: 0 0 20px 0;">Hi {{userName}},</p>
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        You''ve successfully registered for <strong>{{hackathonTitle}}</strong>.
      </p>
      <p><strong>Date:</strong> {{hackathonDate}}</p>
      <a href="https://apnacoding.tech/hackathons" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
        View Details 🏆
      </a>
    </div>
  </div>', 
 '{"userName": "User Name", "hackathonTitle": "Hackathon Title", "hackathonDate": "Event Date"}');

-- Enable Row Level Security
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_notifications
CREATE POLICY "Users can view their own email notifications" ON email_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all email notifications" ON email_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "System can insert email notifications" ON email_notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update email notifications" ON email_notifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Create RLS policies for email_templates
CREATE POLICY "Admins can manage email templates" ON email_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Create RLS policies for email_campaigns
CREATE POLICY "Admins can manage email campaigns" ON email_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Create RLS policies for email_preferences
CREATE POLICY "Users can manage their own email preferences" ON email_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Create function to automatically create email preferences for new users
CREATE OR REPLACE FUNCTION create_email_preferences_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO email_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create email preferences for new users
CREATE TRIGGER create_email_preferences_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_email_preferences_for_user();

-- Create function to send welcome email when user signs up
CREATE OR REPLACE FUNCTION send_welcome_email_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- This will be handled by the application layer
    -- Just log that a welcome email should be sent
    INSERT INTO email_notifications (user_id, email, subject, content, type, status)
    VALUES (
        NEW.id,
        NEW.email,
        '🎉 Welcome to Apna Coding - Your Coding Journey Starts Here!',
        'Welcome email content will be generated by the application',
        'welcome',
        'pending'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to queue welcome email for new users
CREATE TRIGGER send_welcome_email_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION send_welcome_email_trigger();
