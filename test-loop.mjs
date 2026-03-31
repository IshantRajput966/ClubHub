import fetch from 'node-fetch';

async function testLoopCrash() {
  const payload = {
    username: 'Lakshya',
    messages: [
      { role: 'user', content: 'i like codeing and i am intrested in art ad crafts also' },
      { role: 'assistant', content: 'You have diverse interests. Would you like to join the CodeCraft Society?' },
      { role: 'user', content: 'yes please! submit a request for me.' },
      { role: 'assistant', content: "It looks like there's already a pending join request for the CodeCraft Society. Let's wait for the club leader. " },
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

testLoopCrash();
