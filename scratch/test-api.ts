async function testAPI() {
  console.log('--- TESTING BIRO API ---')
  
  // 1. Create a Biro
  console.log('Testing Biro Create...')
  const createRes = await fetch('http://localhost:3000/api/kepegawaian/biro.post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_biro: 'TEST-01', nama_biro: 'Biro Testing AI' })
  })
  const createData = await createRes.json()
  console.log('Create Response:', createData)

  if (createData.success) {
     // 2. Fetch all biros (using master api)
     console.log('Testing Master Biro List...')
     const listRes = await fetch('http://localhost:3000/api/kepegawaian/master/biro')
     const listData = await listRes.json()
     console.log('List Count:', listData.data?.length || 0)
     
     const testBiro = listData.data.find((b: any) => b.nama === 'Biro Testing AI')
     if (testBiro) {
       console.log('Found Test Biro ID:', testBiro.id)
       
       // 3. Update the Biro
       console.log('Testing Biro Update...')
       const updateRes = await fetch(`http://localhost:3000/api/kepegawaian/biro/${testBiro.id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id_biro: 'TEST-01-UPD', nama_biro: 'Biro Testing AI Updated' })
       })
       console.log('Update Response:', await updateRes.json())
       
       // 4. Delete the Biro
       console.log('Testing Biro Delete...')
       const deleteRes = await fetch(`http://localhost:3000/api/kepegawaian/biro/${testBiro.id}`, {
         method: 'DELETE'
       })
       console.log('Delete Response:', await deleteRes.json())
     }
  }
}

testAPI()
