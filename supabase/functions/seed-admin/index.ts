import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const adminEmail = "admin@lexpro.com";
    const adminPassword = "admin123";

    // Check if admin user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users?.find(u => u.email === adminEmail);

    if (existingAdmin) {
      // Ensure admin role exists
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", existingAdmin.id)
        .eq("role", "admin")
        .single();

      if (!existingRole) {
        await supabaseAdmin.from("user_roles").delete().eq("user_id", existingAdmin.id);
        await supabaseAdmin.from("user_roles").insert({ user_id: existingAdmin.id, role: "admin" });
      }

      return new Response(
        JSON.stringify({ success: true, message: "Admin account already exists", email: adminEmail }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (createError) {
      throw createError;
    }

    // Delete default role and set admin role
    await supabaseAdmin.from("user_roles").delete().eq("user_id", newUser.user.id);
    
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role: "admin" });

    if (roleError) {
      throw roleError;
    }

    // Update profile
    await supabaseAdmin
      .from("profiles")
      .update({ username: "admin", display_name: "System Admin" })
      .eq("user_id", newUser.user.id);

    console.log("Default admin account created successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Default admin account created",
        email: adminEmail,
        password: adminPassword
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
