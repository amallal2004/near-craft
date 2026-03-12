const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Assuming you have a test user with an email and password in your auth system
// Replace these with actual test credentials
const testEmail = "amallal2004@gmail.com" // Update this if needed
const testPassword = "password123" // Update this if needed

console.log('URL:', supabaseUrl)

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFunction() {
  console.log("Logging in to get JWT...")
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (authError || !authData.session) {
    console.error("Failed to login. Please create a user with email:", testEmail, "and password:", testPassword)
    // We'll try to invoke anyway just to see the error, but it expected a token
    console.log("Continuing without auth token...")
  } else {
      console.log("Got session token:", authData.session.access_token.substring(0, 10) + "...")
  }

  console.log("Invoking create-connect-account...")
  try {
    const options = {
      body: { returnUrl: 'http://localhost:8080/dashboard', refreshUrl: 'http://localhost:8080/dashboard' }
    }
    
    if (authData?.session?.access_token) {
        options.headers = {
            Authorization: `Bearer ${authData.session.access_token}`
        }
    }

    const { data, error } = await supabase.functions.invoke('create-connect-account', options)
    
    if (error) {
      console.error("Error invoking:", error)
    } else {
      console.log("Success:", data)
    }
  } catch (e) {
    console.error("Exception:", e)
  }
}

testFunction()
