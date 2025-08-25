-- Create email_notifications table for tracking email history
CREATE TABLE IF NOT EXISTS email_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'welcome',
        'hackathon_registration',
        'course_enrollment',
        'job_application',
        'admin_notification',
        'password_reset',
        'hackathon_reminder',
        'course_reminder'
    )),
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

-- Enable RLS (Row Level Security)
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admin users can see all email notifications
CREATE POLICY "Admin users can view all email notifications" ON email_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Admin users can insert email notifications
CREATE POLICY "Admin users can insert email notifications" ON email_notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Admin users can update email notifications
CREATE POLICY "Admin users can update email notifications" ON email_notifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Users can only see their own email notifications
CREATE POLICY "Users can view their own email notifications" ON email_notifications
    FOR SELECT USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_email_notifications_updated_at
    BEFORE UPDATE ON email_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_email_notifications_updated_at();

-- Grant necessary permissions
GRANT ALL ON email_notifications TO authenticated;
GRANT ALL ON email_notifications TO service_role;

-- Create email templates table for reusable templates
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for email templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Admin users can manage email templates
CREATE POLICY "Admin users can manage email templates" ON email_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Grant permissions for email templates
GRANT ALL ON email_templates TO authenticated;
GRANT ALL ON email_templates TO service_role;

-- Insert default email templates
INSERT INTO email_templates (name, subject, html_content, variables) VALUES
(
    'welcome',
    '🎉 Welcome to Apna Coding!',
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
    '{"userName": "User Name"}'
),
(
    'hackathon_registration',
    '🏆 Registration Confirmed: {{hackathonTitle}}',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; border-radius: 10px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0 0 20px 0; font-size: 28px;">🎉 Registration Confirmed!</h1>
            <p style="font-size: 18px; margin: 0 0 20px 0;">Hi {{userName}},</p>
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                You''ve successfully registered for <strong>{{hackathonTitle}}</strong>.
            </p>
            <a href="https://apnacoding.tech/hackathons" style="display: inline-block; background: #FFD700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                View Details 🏆
            </a>
        </div>
    </div>',
    '{"userName": "User Name", "hackathonTitle": "Hackathon Title", "hackathonDate": "Event Date"}'
)
ON CONFLICT (name) DO NOTHING;
