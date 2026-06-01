const fs = require('fs');
function rep(file, search, replace) {
  if (fs.existsSync(file)) {
    let text = fs.readFileSync(file, 'utf8');
    text = text.replace(search, replace);
    fs.writeFileSync(file, text);
    console.log('Fixed ' + file);
  }
}

rep('lib/types/index.ts', /'free' \| 'pro' \| 'team'/g, "'free' | 'pro'");
rep('lib/types/index.ts', /'pro' \| 'team'/g, "'pro'");

rep('lib/services/razorpay/webhooks.ts', /const plan = planId\.includes\('team'\) \? 'team' : 'pro';/, "const plan = 'pro';");
rep('lib/services/razorpay/webhooks.ts', /as 'pro' \| 'team'/g, "as 'pro'");

rep('lib/services/razorpay/plans.ts', /plan: 'pro' \| 'team'/g, "plan: 'pro'");
rep('lib/services/razorpay/plans.ts', /Record<'pro' \| 'team', number>/g, "Record<'pro', number>");
rep('lib/services/razorpay/plans.ts', /\s*if \(plan === 'team'\) \{\s*return process\.env\.RAZORPAY_TEAM_PLAN_ID \?\? 'plan_team_placeholder';\s*\}/g, "");
rep('lib/services/razorpay/plans.ts', /\s*team: 7900_00,  \/\/ deprecated/g, "");

rep('lib/db/queries/users.ts', /'free' \| 'pro' \| 'team'/g, "'free' | 'pro'");
rep('lib/db/queries/billing.ts', /'pro' \| 'team'/g, "'pro'");

rep('app/api/billing/verify-payment/route.ts', /as 'pro' \| 'team'/g, "as 'pro'");
rep('app/api/admin/metrics/route.ts', /db\.from\('users'\)\.select\('\*', \{ count: 'exact', head: true \}\)\.eq\('plan', 'team'\),/, "Promise.resolve({ count: 0 }), // team users removed");
rep('app/(dashboard)/settings/notifications/page.tsx', /user\?\.plan === 'pro' \|\| user\?\.plan === 'team'/g, "user?.plan === 'pro'");
rep('app/(dashboard)/settings/billing/page.tsx', /as 'free' \| 'pro' \| 'team'/g, "=== 'pro' ? 'pro' : 'free'");

rep('__tests__/usage/proPlanLimits.test.ts', /'team'/g, "'pro'");
rep('__tests__/billing/planGuard.test.ts', /'team'/g, "'pro'");
rep('__tests__/action/apiAuth.test.ts', /'team'/g, "'pro'");
