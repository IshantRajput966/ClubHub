import fetch from 'node-fetch';

async function testHistoryCrash() {
  const payload = {
    username: 'ishant',
    messages: [
      { role: 'assistant', content: "Hi there! I'm AuraBot, the ClubHub Matchmaker..." },
      { role: 'user', content: 'i want to join the codecraft society' },
      { role: 'assistant', content: "It looks like there's already a pending join request for the CodeCraft Society..." },
      { role: 'user', content: 'no there are no pending requests' }
    ]
  };

  const res = await fetch('http://localhost:3000/api/matchmaker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) {
    console.log('Crash! HTTP', res.status);
    console.log(await res.text());
  } else {
    console.log('Success!', await res.json());
  }
}

testHistoryCrash();
