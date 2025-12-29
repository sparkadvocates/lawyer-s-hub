import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RenewalEmailRequest {
  user_id: string;
  plan_name: string;
  end_date: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get email settings from database
    const { data: emailSettings, error: settingsError } = await supabase
      .from('email_settings')
      .select('*')
      .limit(1)
      .single();

    if (settingsError || !emailSettings?.resend_api_key) {
      console.log('Email settings not configured, skipping email');
      return new Response(
        JSON.stringify({ success: true, message: 'Email skipped - not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(emailSettings.resend_api_key);
    const fromEmail = emailSettings.from_email || 'noreply@example.com';
    const fromName = emailSettings.from_name || 'System';

    const { user_id, plan_name, end_date }: RenewalEmailRequest = await req.json();

    // Get user email from auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    
    if (userError || !userData.user?.email) {
      console.error('Error fetching user:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const email = userData.user.email;
    const formattedDate = new Date(end_date).toLocaleDateString('bn-BD');

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: 'আপনার সাবস্ক্রিপশন রিনিউ করুন',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a365d 0%, #2d4a6f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #1a365d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚖️ Legal Case Manager</h1>
            </div>
            <div class="content">
              <h2>সাবস্ক্রিপশন রিনিউ করুন</h2>
              
              <div class="alert">
                <strong>⚠️ গুরুত্বপূর্ণ:</strong> আপনার <strong>${plan_name}</strong> প্ল্যানের মেয়াদ <strong>${formattedDate}</strong> তারিখে শেষ হবে।
              </div>
              
              <p>মেয়াদ শেষ হয়ে গেলে আপনি স্বয়ংক্রিয়ভাবে বেসিক প্ল্যানে চলে যাবেন এবং নিম্নলিখিত সুবিধাগুলো হারাবেন:</p>
              
              <ul>
                <li>সীমাহীন কেস ম্যানেজমেন্ট</li>
                <li>প্রায়োরিটি সাপোর্ট</li>
                <li>এডভান্সড রিপোর্টিং</li>
              </ul>
              
              <p>এখনই রিনিউ করুন এবং আপনার প্রিমিয়াম সুবিধা বজায় রাখুন।</p>
              
              <p class="footer">
                যদি কোনো প্রশ্ন থাকে, আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।<br>
                Legal Case Manager Team
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
