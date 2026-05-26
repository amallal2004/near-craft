import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import readline from 'readline';

// ANSI Color codes for styled terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function printHeader(text) {
  console.log(`\n${COLORS.cyan}${COLORS.bright}=== ${text} ===${COLORS.reset}\n`);
}

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
};

async function runCommand(command, args, description) {
  console.log(`${COLORS.yellow}🔄 Running: ${description}...${COLORS.reset}`);
  
  // Resolve .cmd wrapper on Windows to avoid needing shell: true (which triggers Node.js DEP0190)
  const resolvedCommand = process.platform === 'win32' && command === 'npx' ? 'npx.cmd' : command;
  const result = spawnSync(resolvedCommand, args, { stdio: 'inherit' });
  
  if (result.status === 0) {
    console.log(`${COLORS.green}✅ Success: ${description}${COLORS.reset}\n`);
    return true;
  } else {
    console.log(`${COLORS.red}❌ Failed: ${description} (Exit code: ${result.status})${COLORS.reset}\n`);
    return false;
  }
}

async function main() {
  console.log(`\n${COLORS.magenta}${COLORS.bright}🚀 Welcome to the Near-Craft Supabase Setup Automation Script 🚀${COLORS.reset}`);
  console.log(`${COLORS.cyan}------------------------------------------------------------${COLORS.reset}`);

  const envPath = path.resolve(process.cwd(), '.env');
  const envExamplePath = path.resolve(process.cwd(), '.env.example');

  // Check if .env exists, if not copy from .env.example
  if (!fs.existsSync(envPath)) {
    console.log(`${COLORS.yellow}⚠️  No .env file found. Creating one from .env.example...${COLORS.reset}`);
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log(`${COLORS.green}✅ Created .env file.${COLORS.reset}`);
    } else {
      console.error(`${COLORS.red}❌ Error: Neither .env nor .env.example exists in the root directory!${COLORS.reset}`);
      process.exit(1);
    }
  }

  // Parse .env
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      // Remove wrapping quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  });

  const supabaseUrl = env['VITE_SUPABASE_URL'];
  const supabaseKey = env['VITE_SUPABASE_PUBLISHABLE_KEY'];
  const stripeSecret = env['STRIPE_SECRET_KEY'];
  const stripeWebhook = env['STRIPE_WEBHOOK_SECRET'];
  const geminiKey = env['GEMINI_API_KEY'];

  // Check URL validity and extract Project Ref
  if (!supabaseUrl || supabaseUrl.includes('your-project-ref') || supabaseUrl.includes('<your-project-ref>')) {
    console.error(`\n${COLORS.red}❌ Error: VITE_SUPABASE_URL in your .env file is missing or contains placeholder values.${COLORS.reset}`);
    console.log(`Please open your ${COLORS.bright}.env${COLORS.reset} file and set your real Supabase Project URL.`);
    process.exit(1);
  }

  const refMatch = supabaseUrl.match(/https:\/\/([a-z0-9]+)\.supabase\.(?:co|net)/i);
  if (!refMatch) {
    console.error(`\n${COLORS.red}❌ Error: Could not parse your Supabase Project Reference from VITE_SUPABASE_URL (${supabaseUrl})${COLORS.reset}`);
    process.exit(1);
  }
  const projectRef = refMatch[1];

  console.log(`\n${COLORS.green}✔ Configured Project Reference: ${COLORS.bright}${projectRef}${COLORS.reset}`);
  
  // Status check helper
  const getStatus = (val, isPlaceholderCheck) => {
    if (!val) return `${COLORS.red}Missing${COLORS.reset}`;
    if (isPlaceholderCheck && (val.includes('_your_') || val.startsWith('sk_test_...') || val.startsWith('whsec_...') || val.startsWith('AIza...'))) {
      return `${COLORS.yellow}Placeholder (Not Configured)${COLORS.reset}`;
    }
    return `${COLORS.green}Configured${COLORS.reset}`;
  };

  printHeader('Environment Config Status');
  console.log(`- Supabase URL:       ${getStatus(supabaseUrl, false)}`);
  console.log(`- Supabase Anon Key:  ${getStatus(supabaseKey, false)}`);
  console.log(`- Stripe Secret Key:  ${getStatus(stripeSecret, true)}`);
  console.log(`- Stripe Webhook:     ${getStatus(stripeWebhook, true)}`);
  console.log(`- Gemini API Key:     ${getStatus(geminiKey, true)}`);
  console.log(`${COLORS.cyan}------------------------------------------------------------${COLORS.reset}`);

  const startAnswer = await askQuestion('\nDo you want to run the automated setup now? (y/n): ');
  if (startAnswer.toLowerCase() !== 'y') {
    console.log(`\n${COLORS.yellow}Setup aborted. Have a great day!${COLORS.reset}\n`);
    process.exit(0);
  }

  // 1. Supabase Login
  printHeader('Step 1: Supabase Authentication');
  console.log(`If you are already logged in to the Supabase CLI, you can skip this step.`);
  const loginAnswer = await askQuestion('Do you want to run "supabase login" now? (y/n): ');
  if (loginAnswer.toLowerCase() === 'y') {
    await runCommand('npx', ['supabase', 'login'], 'supabase login');
  } else {
    console.log('Skipping login...\n');
  }

  // 2. Link Project
  printHeader('Step 2: Link Local Project to Remote');
  console.log(`We will link this local directory to your remote project ref: ${COLORS.bright}${projectRef}${COLORS.reset}`);
  console.log(`⚠️  Note: You will be asked for your ${COLORS.bright}database password${COLORS.reset} (the one you set when creating the Supabase project).`);
  const linkAnswer = await askQuestion('Do you want to link the project now? (y/n): ');
  if (linkAnswer.toLowerCase() === 'y') {
    await runCommand('npx', ['supabase', 'link', '--project-ref', projectRef], 'Linking remote project');
  } else {
    console.log('Skipping project link...\n');
  }

  // 3. Database Push
  printHeader('Step 3: Database Schema Push');
  console.log('This will push your local database migrations (tables, policies, schemas) to the remote Supabase project.');
  const pushAnswer = await askQuestion('Do you want to push the database schema now? (y/n): ');
  if (pushAnswer.toLowerCase() === 'y') {
    await runCommand('npx', ['supabase', 'db', 'push'], 'Pushing database migrations');
  } else {
    console.log('Skipping database push...\n');
  }

  // 4. Set Secrets
  printHeader('Step 4: Set Remote Deno Edge Function Secrets');
  console.log('Secrets will be set secure in Supabase so your Deno edge functions can access them.');
  
  const secretsToSet = [];
  
  const addSecretIfValid = (key, val) => {
    if (val && !val.includes('_your_') && !val.startsWith('sk_test_...') && !val.startsWith('whsec_...') && !val.startsWith('AIza...')) {
      secretsToSet.push(`${key}=${val}`);
    } else {
      console.log(`${COLORS.yellow}ℹ️ Skipping ${key} (unset or placeholder)${COLORS.reset}`);
    }
  };

  addSecretIfValid('GEMINI_API_KEY', geminiKey);
  addSecretIfValid('STRIPE_SECRET_KEY', stripeSecret);
  addSecretIfValid('STRIPE_WEBHOOK_SECRET', stripeWebhook);

  if (secretsToSet.length > 0) {
    const secretsAnswer = await askQuestion(`Do you want to upload these ${secretsToSet.length} secrets to Supabase? (y/n): `);
    if (secretsAnswer.toLowerCase() === 'y') {
      await runCommand('npx', ['supabase', 'secrets', 'set', ...secretsToSet], 'Uploading secrets to Supabase');
    } else {
      console.log('Skipping uploading secrets...\n');
    }
  } else {
    console.log('No configured secrets (Gemini or Stripe) found to upload. Skipping secrets set.\n');
  }

  // 5. Deploy Functions
  printHeader('Step 5: Deploy Deno Edge Functions');
  console.log('This will deploy your local edge functions to the Supabase cloud.');
  const deployAnswer = await askQuestion('Do you want to deploy all edge functions now? (y/n): ');
  if (deployAnswer.toLowerCase() === 'y') {
    await runCommand('npx', ['supabase', 'functions', 'deploy'], 'Deploying edge functions');
  } else {
    console.log('Skipping functions deployment...\n');
  }

  printHeader('All Done!');
  console.log(`${COLORS.green}✨ Setup steps completed!${COLORS.reset}`);
  console.log(`To start your local development frontend server:`);
  console.log(`   ${COLORS.bright}npm run dev${COLORS.reset}\n`);
}

main().catch(err => {
  console.error(`\n${COLORS.red}An unexpected error occurred during execution:${COLORS.reset}`);
  console.error(err);
  process.exit(1);
});
