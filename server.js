const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// X API search endpoint
app.get('/api/search', async (req, res) => {
  const bearerToken = process.env.X_BEARER_TOKEN;

  if (!bearerToken) {
    return res.status(503).json({
      error: 'X API not configured yet. Add your Bearer Token to environment variables.',
      demo: true
    });
  }

  const query = req.query.q || '($JIM OR #NakedJim OR #JIMshill) -is:retweet lang:en';
  const maxResults = Math.min(parseInt(req.query.max_results) || 20, 100);

  try {
    const url = new URL('https://api.twitter.com/2/tweets/search/recent');
    url.searchParams.set('query', query);
    url.searchParams.set('max_results', maxResults);
    url.searchParams.set('tweet.fields', 'created_at,public_metrics,author_id,text');
    url.searchParams.set('user.fields', 'name,username,public_metrics,profile_image_url,verified');
    url.searchParams.set('expansions', 'author_id');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'X API error', details: errText });
    }

    const data = await response.json();

    // Map users for easy lookup
    const usersMap = {};
    if (data.includes?.users) {
      data.includes.users.forEach(u => { usersMap[u.id] = u; });
    }

    // Format posts
    const posts = (data.data || []).map(tweet => {
      const user = usersMap[tweet.author_id] || {};
      const m = tweet.public_metrics || {};
      const totalEng = (m.like_count || 0) + (m.retweet_count || 0) + (m.reply_count || 0);
      return {
        id: tweet.id,
        handle: '@' + (user.username || 'unknown'),
        name: user.name || 'Unknown',
        text: tweet.text,
        created_at: tweet.created_at,
        views: m.impression_count || 0,
        likes: m.like_count || 0,
        rts: m.retweet_count || 0,
        replies: m.reply_count || 0,
        engagement: totalEng,
        followers: user.public_metrics?.followers_count || 0,
        verified: user.verified || false,
      };
    });

    // Aggregate accounts
    const accountsMap = {};
    posts.forEach(p => {
      if (!accountsMap[p.handle]) {
        accountsMap[p.handle] = {
          handle: p.handle,
          name: p.name,
          posts: 0,
          views: 0,
          likes: 0,
          rts: 0,
          replies: 0,
          followers: p.followers,
          verified: p.verified,
        };
      }
      const a = accountsMap[p.handle];
      a.posts++;
      a.views += p.views;
      a.likes += p.likes;
      a.rts += p.rts;
      a.replies += p.replies;
    });

    const accounts = Object.values(accountsMap).sort((a, b) => b.views - a.views);

    // Summary metrics
    const totalPosts = posts.length;
    const totalReach = posts.reduce((s, p) => s + p.views, 0);
    const totalEngagement = posts.reduce((s, p) => s + p.engagement, 0);
    const totalAccounts = accounts.length;

    res.json({ posts, accounts, meta: { totalPosts, totalReach, totalEngagement, totalAccounts } });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    apiConfigured: !!process.env.X_BEARER_TOKEN,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Naked Jim Tracker running on port ${PORT}`);
});
