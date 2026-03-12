const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

console.log('URL:', supabaseUrl)

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFunction() {
  console.log("Invoking create-connect-account...")
  try {
    const { data, error } = await supabase.functions.invoke('create-connect-account', {
      body: { returnUrl: 'http://localhost:8080/dashboard', refreshUrl: 'http://localhost:8080/dashboard' }
    })
    
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
