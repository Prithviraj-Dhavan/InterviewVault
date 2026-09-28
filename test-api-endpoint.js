fetch('http://localhost:3000/api/interview/sessions/342e7c2a-619b-4dc3-a9e9-ce38ef54e1df/questions/next', { method: 'POST' })
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
