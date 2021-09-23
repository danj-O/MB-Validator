const express = require('express')
const {google} = require('googleapis')

const app = express()
app.set('view engine','ejs');
app.use(express.static(__dirname + '/'));
app.use(express.urlencoded({extended: true}));

app.get('/', async (req, res) => { //load up url and get first UNVALIDATED lead
  const auth = new google.auth.GoogleAuth({
    // keyFile: "./creds.json", // file came from https://cloud.google.com/   DEVELOPMENT
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // file came from https://cloud.google.com/
    scopes: "https://www.googleapis.com/auth/spreadsheets", //this would change if we were using a diff google api
  })
  const client = await auth.getClient()  //create client instance for auth
  const googleSheets = google.sheets({version: "v4", auth: client }) //create instance of sheets api
  const spreadsheetId = "1noIh9Ax9J-TItGwMKL7HFuNPNZzIaiXmvSDIL1hUnUA"  //id from sheet URL
  const getRows = await googleSheets.spreadsheets.values.get({ //get all data
    auth, spreadsheetId,
    range: "testAPI"
  })

  //check if any need validating
  for (i=0 ; i < getRows.data.values.length; i++){
    getRows.data.values[i][22]
  }

  for (i=0 ; i < getRows.data.values.length; i++){  //DISPLAY RELATED - loop through all data and find 1 without validation
    if(getRows.data.values[i][22] == ""){
      console.log(getRows.data.values[i][1], 'row: ', [i+1])
      let displayLead = getRows.data.values[i]
      // res.send(displayLead)
      return res.render('index.ejs', { 
        dataArr: displayLead,
        index: i  //send this back through post request from ejs file for querying and updateing correct row
      })
      // break
    }
  } 
})

app.post('/validateAndAddNotes/:index', async (req, res) =>{
  console.log("POST BODY", req.body)
  let rowNumber = parseInt(req.params.index) + 1
  console.log("req params", rowNumber)

  const googs = await getAuth()
  await googs.googleSheets.spreadsheets.values.update({ //updates cells/rows
    auth: googs.auth, 
    spreadsheetId: googs.spreadsheetId,
    range: `testAPI!W${rowNumber}`,
    valueInputOption: "USER_ENTERED", //"RAW"
    resource: {
      values: [  //is an array because you can send multiple rows, NEED TO add orig data to array to not lose
        [req.body.validate]
      ]
    }
  })

  res.redirect(`/`)
})

app.listen(1337, (req, res) => console.log('running on leetzorz'))


async function getAuth(){
  const auth = new google.auth.GoogleAuth({
    keyFile: "./creds.json", // file came from https://cloud.google.com/
    scopes: "https://www.googleapis.com/auth/spreadsheets", //this would change if we were using a diff google api
  })

  const client = await auth.getClient()  //create client instance for auth
  const googleSheets = google.sheets({version: "v4", auth: client }) //create instance of sheets api
  const spreadsheetId = "1noIh9Ax9J-TItGwMKL7HFuNPNZzIaiXmvSDIL1hUnUA"  //id from sheet URL
  return {auth, googleSheets, spreadsheetId}
}










// const metaData = await googleSheets.spreadsheets.get({
//   auth,
//   spreadsheetId
// })